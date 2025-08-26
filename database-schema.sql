-- Enable Row Level Security (RLS)
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  user_type text check (user_type in ('admin', 'customer')) default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stadiums table
create table public.stadiums (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text not null,
  facilities text[],
  images text[],
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Slots table
create table public.slots (
  id uuid default uuid_generate_v4() primary key,
  stadium_id uuid references public.stadiums(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  day_price decimal(10,2) not null,
  night_price decimal(10,2) not null,
  is_available boolean default true,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(stadium_id, date, start_time)
);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references public.slots(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  booking_date timestamp with time zone default timezone('utc'::text, now()) not null,
  total_amount decimal(10,2) not null,
  payment_status text check (payment_status in ('pending', 'paid', 'failed', 'refunded')) default 'pending',
  payment_id text,
  status text check (status in ('confirmed', 'cancelled', 'completed')) default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security Policies

-- Profiles policies
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Stadiums policies
alter table public.stadiums enable row level security;

create policy "Stadiums are viewable by everyone." on public.stadiums
  for select using (true);

create policy "Admins can insert stadiums." on public.stadiums
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "Admins can update their own stadiums." on public.stadiums
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
    and created_by = auth.uid()
  );

create policy "Admins can delete their own stadiums." on public.stadiums
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
    and created_by = auth.uid()
  );

-- Slots policies
alter table public.slots enable row level security;

create policy "Slots are viewable by everyone." on public.slots
  for select using (true);

create policy "Admins can insert slots." on public.slots
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "Admins can update their own slots." on public.slots
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
    and created_by = auth.uid()
  );

create policy "Admins can delete their own slots." on public.slots
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
    and created_by = auth.uid()
  );

-- Bookings policies
alter table public.bookings enable row level security;

create policy "Users can view their own bookings." on public.bookings
  for select using (auth.uid() = user_id);

create policy "Admins can view all bookings." on public.bookings
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "Users can insert their own bookings." on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookings." on public.bookings
  for update using (auth.uid() = user_id);

-- Functions

-- Function to handle user signup and profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update slot availability after booking
create or replace function update_slot_availability()
returns trigger as $$
begin
  if NEW.status = 'confirmed' and NEW.payment_status = 'paid' then
    update public.slots 
    set is_available = false 
    where id = NEW.slot_id;
  elsif OLD.status = 'confirmed' and NEW.status = 'cancelled' then
    update public.slots 
    set is_available = true 
    where id = NEW.slot_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger for slot availability updates
create trigger on_booking_status_change
  after insert or update on public.bookings
  for each row execute procedure update_slot_availability();

-- Function to get available slots with pricing
create or replace function get_available_slots_with_pricing(
  stadium_uuid uuid,
  slot_date date
)
returns table (
  id uuid,
  stadium_id uuid,
  date date,
  start_time time,
  end_time time,
  current_price decimal,
  is_day_time boolean,
  is_available boolean
) as $$
begin
  return query
  select 
    s.id,
    s.stadium_id,
    s.date,
    s.start_time,
    s.end_time,
    case 
      when s.start_time >= '06:00:00' and s.start_time < '18:00:00' 
      then s.day_price 
      else s.night_price 
    end as current_price,
    case 
      when s.start_time >= '06:00:00' and s.start_time < '18:00:00' 
      then true 
      else false 
    end as is_day_time,
    s.is_available
  from public.slots s
  where s.stadium_id = stadium_uuid 
    and s.date = slot_date
    and s.is_available = true
  order by s.start_time;
end;
$$ language plpgsql;