-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. EXAMS TABLE
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT,
  subject TEXT,
  year TEXT,
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  marks_per_question NUMERIC NOT NULL DEFAULT 1,
  negative_marks NUMERIC NOT NULL DEFAULT 0,
  passing_marks NUMERIC,
  duration_minutes INTEGER NOT NULL,
  instructions TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'scheduled', 'live', 'completed', 'archived')) DEFAULT 'draft',
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('immediate', 'scheduled')) DEFAULT 'immediate',
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);


-- 3. QUESTION PAPERS TABLE
CREATE TABLE public.question_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  processing_status TEXT NOT NULL CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed')) DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. ANSWER KEYS TABLE
CREATE TABLE public.answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  processing_status TEXT NOT NULL CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed')) DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 5. QUESTIONS TABLE
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  marks NUMERIC NOT NULL DEFAULT 1,
  negative_marks NUMERIC NOT NULL DEFAULT 0,
  subject TEXT,
  topic TEXT,
  difficulty TEXT,
  question_image_url TEXT,
  source_page INTEGER,
  extraction_confidence NUMERIC,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, question_number)
);


-- 6. EXAM ATTEMPTS TABLE
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'auto_submitted', 'abandoned')) DEFAULT 'in_progress',
  total_questions INTEGER NOT NULL DEFAULT 0,
  answered_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  score NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, student_id)
);


-- 7. ATTEMPT ANSWERS TABLE
CREATE TABLE public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT CHECK (selected_answer IN ('A', 'B', 'C', 'D', NULL)),
  is_correct BOOLEAN,
  marks_awarded NUMERIC,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);


-- ROW LEVEL SECURITY (RLS) SETUP --

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read their own profile, admins can read all.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

-- Exams: Anyone can view published/scheduled exams. Admins can do everything.
CREATE POLICY "Anyone can view live/scheduled exams" ON public.exams FOR SELECT USING (status IN ('scheduled', 'live', 'completed'));
CREATE POLICY "Admins have full access to exams" ON public.exams FOR ALL USING (public.is_admin());

-- Question Papers & Answer Keys: Admins only
CREATE POLICY "Admins have full access to question papers" ON public.question_papers FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to answer keys" ON public.answer_keys FOR ALL USING (public.is_admin());

-- Questions: Students can view verified questions for live/completed exams (controlled via API/server anyway, but base policy here). Admins full access.
CREATE POLICY "Admins have full access to questions" ON public.questions FOR ALL USING (public.is_admin());
CREATE POLICY "Students can view questions for live exams" ON public.questions FOR SELECT USING (
  verification_status = 'verified' AND 
  EXISTS (
    SELECT 1 FROM public.exams e 
    WHERE e.id = exam_id AND e.status IN ('live', 'completed')
  )
);

-- Attempts: Students can view/insert/update their own attempts. Admins can view all.
CREATE POLICY "Students can view own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all attempts" ON public.exam_attempts FOR SELECT USING (public.is_admin());

-- Attempt Answers: Students can manage their own attempt answers.
CREATE POLICY "Students can manage own attempt answers" ON public.attempt_answers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea 
    WHERE ea.id = attempt_id AND ea.student_id = auth.uid()
  )
);
CREATE POLICY "Admins can view all attempt answers" ON public.attempt_answers FOR SELECT USING (public.is_admin());


-- STORAGE BUCKETS SETUP --
-- Insert into storage.buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('question-papers', 'question-papers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('answer-keys', 'answer-keys', false) ON CONFLICT DO NOTHING;

-- Storage Policies: Question Papers (Public read, admin write)
CREATE POLICY "Public read question papers" ON storage.objects FOR SELECT USING (bucket_id = 'question-papers');
CREATE POLICY "Admin full access question papers" ON storage.objects FOR ALL USING (bucket_id = 'question-papers' AND public.is_admin());

-- Storage Policies: Answer Keys (Admin only)
CREATE POLICY "Admin full access answer keys" ON storage.objects FOR ALL USING (bucket_id = 'answer-keys' AND public.is_admin());
