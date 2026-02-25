
-- =============================================
-- MiniTeacher Database Schema
-- =============================================

-- 1. Roles table
CREATE TABLE public.roles (
  id int PRIMARY KEY,
  name varchar(45) NOT NULL
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read roles" ON public.roles FOR SELECT TO authenticated USING (true);

-- 2. Schools table
CREATE TABLE public.schools (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  address varchar(255),
  tlf varchar(45),
  "contactEmail" varchar(45),
  web varchar(255),
  "maxTeachers" int DEFAULT 10,
  "maxStudents" int DEFAULT 100
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read schools" ON public.schools FOR SELECT TO authenticated USING (true);

-- 3. User roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id int REFERENCES public.roles(id) NOT NULL DEFAULT 4,
  UNIQUE(user_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.get_user_role_id(_user_id uuid)
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);

-- 4. Profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email varchar(255) NOT NULL,
  name varchar(45),
  lastname varchar(100),
  nick varchar(45),
  schools_id int REFERENCES public.schools(id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 5. Trigger to auto-create profile + user_role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nick)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (NEW.id, 4);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Teachers table
CREATE TABLE public.teachers (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read teachers" ON public.teachers FOR SELECT TO authenticated USING (true);

-- 7. Students table
CREATE TABLE public.students (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  "allowShareContent" boolean NOT NULL DEFAULT true,
  "needTeacherPermissionToShare" boolean NOT NULL DEFAULT false,
  "classroomLetter" varchar(10) NOT NULL DEFAULT ''
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can read own record" ON public.students FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all students" ON public.students FOR SELECT TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);

-- 8. Grades table
CREATE TABLE public.grades (
  id serial PRIMARY KEY,
  name varchar(45) NOT NULL
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read grades" ON public.grades FOR SELECT TO authenticated USING (true);

-- 9. Subjects table
CREATE TABLE public.subjects (
  id serial PRIMARY KEY,
  name varchar(45) NOT NULL
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

-- 10. Schools have grades
CREATE TABLE public.schools_have_grades (
  id serial PRIMARY KEY,
  school_id int REFERENCES public.schools(id) NOT NULL,
  grade_id int REFERENCES public.grades(id) NOT NULL
);
ALTER TABLE public.schools_have_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read" ON public.schools_have_grades FOR SELECT TO authenticated USING (true);

-- 11. Schools have subjects
CREATE TABLE public.schools_have_subjects (
  id serial PRIMARY KEY,
  school_id int REFERENCES public.schools(id) NOT NULL,
  subject_id int REFERENCES public.subjects(id) NOT NULL
);
ALTER TABLE public.schools_have_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read" ON public.schools_have_subjects FOR SELECT TO authenticated USING (true);

-- 12. Students enrollments
CREATE TABLE public.students_enrollments (
  id serial PRIMARY KEY,
  "classroomLetter" varchar(1) NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  grade_id int REFERENCES public.grades(id) NOT NULL,
  subject_id int REFERENCES public.subjects(id) NOT NULL
);
ALTER TABLE public.students_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own enrollments" ON public.students_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all enrollments" ON public.students_enrollments FOR SELECT TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);

-- 13. Chatbots table
CREATE TABLE public.chatbots (
  id serial PRIMARY KEY,
  "sessionId" varchar(45) NOT NULL UNIQUE DEFAULT gen_random_uuid()::varchar,
  "chatBotType" int NOT NULL DEFAULT 2,
  name varchar(255) NOT NULL,
  language varchar(255) NOT NULL DEFAULT 'ES',
  subject varchar(255) NOT NULL,
  grade varchar(255) NOT NULL,
  personality varchar(255),
  "learningStyle" varchar(255),
  prompt varchar(4000) NOT NULL DEFAULT '',
  "accessPermissions" int NOT NULL DEFAULT 0,
  "createDate" timestamptz NOT NULL DEFAULT now(),
  "lastUseDate" timestamptz NOT NULL DEFAULT now(),
  "isDeleted" boolean NOT NULL DEFAULT false,
  user_id uuid REFERENCES public.profiles(id) NOT NULL
);
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can CRUD chatbots" ON public.chatbots FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public chatbots readable" ON public.chatbots FOR SELECT TO authenticated USING ("accessPermissions" = 2 AND "isDeleted" = false);
CREATE POLICY "School chatbots readable" ON public.chatbots FOR SELECT TO authenticated USING (
  "accessPermissions" = 1 AND "isDeleted" = false AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() AND p2.id = chatbots.user_id
    AND p1.schools_id = p2.schools_id AND p1.schools_id IS NOT NULL
  )
);

-- 14. Chatbot sessions
CREATE TABLE public.chatbot_sessions (
  id serial PRIMARY KEY,
  "createDate" timestamptz NOT NULL DEFAULT now(),
  "lastUseDate" timestamptz NOT NULL DEFAULT now(),
  redis_id varchar(50) NOT NULL DEFAULT '',
  users_id uuid REFERENCES public.profiles(id) NOT NULL,
  "chatBot_id" varchar(45) NOT NULL
);
ALTER TABLE public.chatbot_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.chatbot_sessions FOR ALL TO authenticated USING (auth.uid() = users_id);

-- 15. Documents table
CREATE TABLE public.documents (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  description varchar(2500) NOT NULL DEFAULT '',
  url varchar(255) NOT NULL DEFAULT '',
  users_id uuid REFERENCES public.profiles(id) NOT NULL,
  chatbot_id int REFERENCES public.chatbots(id) NOT NULL,
  "chatbot_sessionId" varchar(45) NOT NULL
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.documents FOR ALL TO authenticated USING (auth.uid() = users_id);

-- 16. Challenges table
CREATE TABLE public.challenges (
  id serial PRIMARY KEY,
  name varchar(45) NOT NULL,
  language varchar(255) NOT NULL DEFAULT 'ES',
  topic varchar(1000),
  difficulty varchar(45) NOT NULL DEFAULT 'Fácil',
  "questionCount" int NOT NULL DEFAULT 5,
  "accessPermissions" int NOT NULL DEFAULT 0,
  "isValidated" int NOT NULL DEFAULT 0,
  subject_id int REFERENCES public.subjects(id) NOT NULL,
  grade_id int REFERENCES public.grades(id) NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  "createDate" timestamptz NOT NULL DEFAULT now(),
  "lastModificationDate" timestamptz NOT NULL DEFAULT now(),
  "lastUseDate" timestamptz NOT NULL DEFAULT now(),
  "isDeleted" boolean NOT NULL DEFAULT false
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can CRUD challenges" ON public.challenges FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public challenges readable" ON public.challenges FOR SELECT TO authenticated USING ("accessPermissions" = 2 AND "isDeleted" = false);
CREATE POLICY "School challenges readable" ON public.challenges FOR SELECT TO authenticated USING (
  "accessPermissions" = 1 AND "isDeleted" = false AND
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() AND p2.id = challenges.user_id
    AND p1.schools_id = p2.schools_id AND p1.schools_id IS NOT NULL
  )
);

-- 17. Challenge questions
CREATE TABLE public.challenge_questions (
  id serial PRIMARY KEY,
  question varchar(2000) NOT NULL,
  answer1 varchar(1000) NOT NULL,
  answer2 varchar(1000) NOT NULL,
  answer3 varchar(1000) NOT NULL,
  answer4 varchar(1000) NOT NULL,
  explanation varchar(2000),
  "correctAnswer" int NOT NULL,
  challenge_id int REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  "isInvalidQuestion" boolean NOT NULL DEFAULT false
);
ALTER TABLE public.challenge_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Readable if challenge accessible" ON public.challenge_questions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND (
    c.user_id = auth.uid() OR 
    (c."accessPermissions" = 2 AND c."isDeleted" = false) OR
    (c."accessPermissions" = 1 AND c."isDeleted" = false AND EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() AND p2.id = c.user_id
      AND p1.schools_id = p2.schools_id AND p1.schools_id IS NOT NULL
    ))
  ))
);
CREATE POLICY "Owner can manage questions" ON public.challenge_questions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid())
);

-- 18. Challenge results
CREATE TABLE public.challenge_results (
  id serial PRIMARY KEY,
  challenge_id int REFERENCES public.challenges(id) NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  "totalQuestions" int NOT NULL,
  "correctAnswers" int NOT NULL,
  score decimal(5,2) NOT NULL,
  "isCompleted" boolean DEFAULT false,
  "answersLists" varchar(255) NOT NULL DEFAULT '',
  "createDate" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenge_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own results" ON public.challenge_results FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Teachers see results for own challenges" ON public.challenge_results FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid())
);

-- 19. Challenge result details
CREATE TABLE public.challenge_result_details (
  id serial PRIMARY KEY,
  "challengeResult_id" int REFERENCES public.challenge_results(id) ON DELETE CASCADE NOT NULL,
  question_id int REFERENCES public.challenge_questions(id) NOT NULL,
  "selectedAnswer" int NOT NULL,
  "isCorrect" boolean
);
ALTER TABLE public.challenge_result_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own result details" ON public.challenge_result_details FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.challenge_results cr WHERE cr.id = "challengeResult_id" AND cr.user_id = auth.uid())
);

-- 20. Share content
CREATE TABLE public.share_content (
  id serial PRIMARY KEY,
  "chatBot_id" int REFERENCES public.chatbots(id),
  challenge_id int REFERENCES public.challenges(id),
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  "shareContentType" int NOT NULL,
  "classroomLetter" varchar(45),
  "createDate" timestamptz NOT NULL DEFAULT now(),
  "lastModificationDate" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.share_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shares" ON public.share_content FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all shares" ON public.share_content FOR SELECT TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);

-- 21. Trackings
CREATE TABLE public.trackings (
  id serial PRIMARY KEY,
  "userCreateDate" timestamptz NOT NULL,
  "databaseCreateDate" timestamptz NOT NULL DEFAULT now(),
  duration float NOT NULL DEFAULT 0,
  info1 varchar(45) NOT NULL DEFAULT '',
  info2 varchar(45),
  info3 varchar(45),
  info4 varchar(45),
  info5 varchar(45),
  "deviceId" varchar(250) NOT NULL DEFAULT '',
  users_id uuid REFERENCES public.profiles(id)
);
ALTER TABLE public.trackings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trackings" ON public.trackings FOR ALL TO authenticated USING (auth.uid() = users_id);

-- 22. Configuration
CREATE TABLE public.configuration (
  id serial PRIMARY KEY,
  "allowAppAccess" int NOT NULL DEFAULT 1,
  "currentDatabaseVersion" int NOT NULL DEFAULT 1,
  "lastSupportedAppVersion" int NOT NULL DEFAULT 1,
  "loginWithDoubleAuthen" int NOT NULL DEFAULT 0,
  "allowUserRememberAccess" int NOT NULL DEFAULT 0
);
ALTER TABLE public.configuration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read config" ON public.configuration FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update config" ON public.configuration FOR UPDATE TO authenticated USING (public.get_user_role_id(auth.uid()) <= 1);

-- 23. Curriculum summaries
CREATE TABLE public.curriculum_summaries (
  id serial PRIMARY KEY,
  stage varchar(50),
  subject_id varchar(100),
  grade_id int,
  cycle varchar(50),
  content text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
ALTER TABLE public.curriculum_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read curriculum" ON public.curriculum_summaries FOR SELECT TO authenticated USING (true);

-- =============================================
-- Seed data
-- =============================================
INSERT INTO public.roles (id, name) VALUES (1, 'School Admin'), (2, 'Teacher'), (3, 'Student'), (4, 'Independent');

INSERT INTO public.grades (id, name) VALUES 
  (1, '1º Primaria'), (2, '2º Primaria'), (3, '3º Primaria'), (4, '4º Primaria'),
  (5, '5º Primaria'), (6, '6º Primaria'), (7, '1º ESO'), (8, '2º ESO'),
  (9, '3º ESO'), (10, '4º ESO'), (11, '1º Bachillerato'), (12, '2º Bachillerato'),
  (13, 'FP Básica'), (14, 'Otro');

INSERT INTO public.configuration ("allowAppAccess") VALUES (1);

-- Admin policies for schools management
CREATE POLICY "Admins can manage schools" ON public.schools FOR ALL TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);

-- Admin policies for subjects management
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);

-- Admin policies for grades management  
CREATE POLICY "Admins can manage grades" ON public.grades FOR ALL TO authenticated USING (public.get_user_role_id(auth.uid()) <= 2);
