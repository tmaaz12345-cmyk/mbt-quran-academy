-- ============================================================================
-- Maaz Bin Tariq Online Quran Academy — Initial Schema
-- Run directly on PostgreSQL / Supabase SQL editor if not using `prisma migrate`
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------
CREATE TYPE role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE student_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE teacher_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE enrollment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE class_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE assignment_status AS ENUM ('submitted', 'reviewed');
CREATE TYPE course_category AS ENUM
  ('Tajweed', 'Nazra', 'Qaida', 'Hifz', 'Masnoon_Duaen', 'Namaz', 'Six_Kalmas');

-- ---------------------------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          role NOT NULL DEFAULT 'student',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. STUDENTS  (student_id is human-facing PK, e.g. MBT-1001)
-- ---------------------------------------------------------------------------
CREATE TABLE students (
  student_id     TEXT PRIMARY KEY,
  user_id        UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  guardian_name  TEXT,
  age            INTEGER,
  country        TEXT,
  roll_number    TEXT UNIQUE,
  status         student_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. TEACHERS
-- ---------------------------------------------------------------------------
CREATE TABLE teachers (
  teacher_id        TEXT PRIMARY KEY,
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  qualification     TEXT,
  assigned_subjects TEXT[] NOT NULL DEFAULT '{}',
  bio               TEXT,
  experience_years  INTEGER,
  status            teacher_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. COURSES
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  category    course_category NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 5. ENROLLMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id  TEXT REFERENCES teachers(teacher_id) ON DELETE SET NULL,
  status      enrollment_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- ---------------------------------------------------------------------------
-- 6. CLASSES
-- ---------------------------------------------------------------------------
CREATE TABLE classes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_title   TEXT NOT NULL,
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id    TEXT NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  student_id    TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  meeting_link  TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        class_status NOT NULL DEFAULT 'scheduled',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_classes_student ON classes(student_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);

-- ---------------------------------------------------------------------------
-- 7. TESTS AND RESULTS
-- ---------------------------------------------------------------------------
CREATE TABLE tests_and_results (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_title     TEXT NOT NULL,
  student_id     TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  roll_number    TEXT NOT NULL,
  marks_obtained INTEGER NOT NULL,
  total_marks    INTEGER NOT NULL,
  feedback       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_results_roll_number ON tests_and_results(roll_number);

-- ---------------------------------------------------------------------------
-- 8. ASSIGNMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE assignments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  file_url         TEXT,
  submission_text  TEXT,
  status           assignment_status NOT NULL DEFAULT 'submitted',
  teacher_feedback TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 9. LIBRARY RESOURCES
-- ---------------------------------------------------------------------------
CREATE TABLE library_resources (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title              TEXT NOT NULL,
  category           TEXT NOT NULL,
  file_url           TEXT NOT NULL,
  uploaded_by_admin  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY (Supabase) — students may only read their own records
-- ---------------------------------------------------------------------------
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests_and_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Example policy (adapt auth.uid() mapping to your users.id column if using Supabase Auth):
-- CREATE POLICY student_own_results ON tests_and_results
--   FOR SELECT USING (
--     student_id = (SELECT student_id FROM students WHERE user_id = auth.uid())
--   );
