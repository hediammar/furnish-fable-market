-- Update the handle_new_user function to include address and zip_code fields

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  insert into public.profiles (
    id, 
    email, 
    role, 
    full_name, 
    phone_number, 
    address,
    city, 
    zip_code,
    country
  )
  values (
    new.id, 
    new.email, 
    'user', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'zip_code',
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$$;

-- Make sure we have the right trigger in place
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 