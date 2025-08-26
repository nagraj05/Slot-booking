-- Updated function to handle slot availability properly
create or replace function update_slot_availability()
returns trigger as $$
begin
  -- Handle INSERT (new booking)
  if TG_OP = 'INSERT' then
    if NEW.status = 'confirmed' then
      update public.slots 
      set is_available = false 
      where id = NEW.slot_id;
    end if;
    return NEW;
  end if;

  -- Handle UPDATE (status change)
  if TG_OP = 'UPDATE' then
    -- If booking is confirmed (regardless of payment status), mark slot as unavailable
    if NEW.status = 'confirmed' and OLD.status != 'confirmed' then
      update public.slots 
      set is_available = false 
      where id = NEW.slot_id;
    -- If booking is cancelled, mark slot as available
    elsif NEW.status = 'cancelled' and OLD.status != 'cancelled' then
      update public.slots 
      set is_available = true 
      where id = NEW.slot_id;
    end if;
    return NEW;
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Drop the old trigger and create a new one that handles both INSERT and UPDATE
drop trigger if exists on_booking_status_change on public.bookings;

create trigger on_booking_change
  after insert or update on public.bookings
  for each row execute procedure update_slot_availability();