-- 1. Add login_id to profiles
ALTER TABLE public.profiles ADD COLUMN login_id TEXT UNIQUE;

-- 2. Update the handle_new_user trigger to extract login_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url, login_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'login_id'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create RPC to look up email by login_id securely
CREATE OR REPLACE FUNCTION get_email_by_login_id(p_login_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM public.profiles WHERE login_id = p_login_id;
  RETURN v_email;
END;
$$;

-- Allow anonymous access to the RPC so the login form can call it
GRANT EXECUTE ON FUNCTION public.get_email_by_login_id(TEXT) TO anon;
