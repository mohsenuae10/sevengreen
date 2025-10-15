-- Insert first admin user
-- Note: You need to create a user account first through the authentication system
-- Then run this query with the actual user_id from auth.users table
-- This is a template that needs to be executed after user creation

-- Example: To add admin role to a user, replace 'USER_ID_HERE' with actual UUID
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_ID_HERE', 'admin');

-- Function to easily add admin role to a user by email
CREATE OR REPLACE FUNCTION public.add_admin_role_by_email(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role added to user %', user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_admin_role_by_email(TEXT) TO authenticated;

COMMENT ON FUNCTION public.add_admin_role_by_email IS 'Helper function to add admin role to a user by their email address';
