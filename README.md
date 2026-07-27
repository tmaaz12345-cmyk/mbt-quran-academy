# Maaz Bin Tariq Online Quran Academy

A full-stack learning management platform for an online Quran academy — public marketing
site with admissions, plus role-based portals for Students, Teachers, and Admins.

**Stack:** Next.js 14 (App Router, TypeScript) · PostgreSQL · Prisma ORM · JWT session auth ·
Tailwind CSS. Deployable on Vercel + Supabase/Neon/RDS Postgres, or any Node host.

---

## 1. Brand

| Token | Value |
|---|---|
| Deep Emerald Green | `#064E3B` |
| Gold | `#D97706` |
| Soft Ivory | `#FDFBF7` |
| Charcoal | `#1F2937` |

The logo (`src/components/Logo.tsx`) is a coded SVG — an 8-point Islamic geometric star (rub
el hizb construction) in gold over emerald, with a crescent/book motif and the academy
wordmark in a serif display face (Amiri) paired with Inter for UI text.

---

## 2. Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance, and a random JWT_SECRET

# 3. Create the database schema
npx prisma migrate dev --name init
# (equivalently, you can run prisma/migrations_sql/001_init.sql directly in
#  the Supabase SQL editor if you prefer raw SQL over `prisma migrate`)

# 4. Seed demo data (1 admin, 1 teacher, 1 active student, all 7 courses)
npm run db:seed

# 5. Run the dev server
npm run dev
```

App runs at `http://localhost:3000`.

### Demo credentials (after seeding)

| Role | Login | Password |
|---|---|---|
| Admin (real account) | `tmaaz12345@gmail.com` | `Pakistan@1122` |
| Teacher (demo) | `MBT-T-101` (or `qari.ahmed@maazbintariq.academy`) | `Teacher@12345` |
| Student (demo) | `MBT-1001` | `Student@12345` |

The login field accepts **Student ID / Teacher ID / email** interchangeably.

Teachers can also **apply themselves** from the homepage ("Apply as a Teacher" tab next to
"Join as a Student"). New self-registered teachers sit in a `pending` state — invisible to
public login — until the admin approves them from **Admin → Teachers**, at which point a
real Teacher ID (`MBT-T-10x`) is issued and they can log in.

---

## 3. Database schema

All 9 tables live in `prisma/schema.prisma`, mirrored as raw SQL in
`prisma/migrations_sql/001_init.sql` for teams not using the Prisma CLI.

```
users            — root identity: id, full_name, email, phone, role, password_hash
students         — student_id PK (MBT-1001), user_id FK, guardian_name, age, country,
                    roll_number, status(pending/active/suspended)
teachers         — teacher_id PK (MBT-T-101), user_id FK, qualification, assigned_subjects[]
courses          — id, title, description, category (Tajweed/Nazra/Qaida/Hifz/
                    Masnoon_Duaen/Namaz/Six_Kalmas)
enrollments      — student_id + course_id + teacher_id, status
classes          — class_title, course_id, teacher_id, student_id, meeting_link,
                    scheduled_at, status
tests_and_results— test_title, student_id, course_id, roll_number, marks_obtained,
                    total_marks, feedback
assignments      — student_id, title, file_url, submission_text, status, teacher_feedback
library_resources— title, category, file_url, uploaded_by_admin
```

Key relational rules enforced at the DB layer:

- `students.student_id` and `teachers.teacher_id` are human-readable primary keys
  (`MBT-1001`, `MBT-T-101`), generated server-side on approval/onboarding — never
  client-supplied.
- `enrollments` is the join table wiring student ↔ course ↔ teacher; a class or a result
  can only be created for a student the teacher is actually enrolled to teach (enforced in
  the API layer, see below).
- `tests_and_results.roll_number` is always taken from the student's own record — students
  can never query another student's results (see `/api/student/result`).

---

## 4. Authentication & authorization

- `src/lib/auth.ts` — bcrypt password hashing, JWT (jose) session signing/verification,
  httpOnly cookie helpers, `requireRole()` guard used inside every protected API route.
- `src/middleware.ts` — edge middleware that redirects unauthenticated or wrong-role users
  away from `/admin/*`, `/teacher/*`, `/student/*` before the page even renders.
- Every API route re-validates the session and role server-side (defense in depth beyond
  the middleware).

---

## 5. API reference

All routes are under `src/app/api/**/route.ts` (Next.js Route Handlers = REST endpoints).

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Public — submit admission application (creates `pending` student) |
| POST | `/api/auth/register-teacher` | Public — apply to teach (creates `pending` teacher) |
| POST | `/api/auth/login` | Login via Student ID / Teacher ID / email + password |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current session info |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/students` | List/filter students |
| DELETE | `/api/admin/students?studentId=` | Remove a student |
| POST | `/api/admin/approve-student` | Approve application → generates Student ID + Roll Number |
| GET/POST | `/api/admin/teachers` | List (optionally `?status=pending\|active`) / onboard teachers directly (auto-generates Teacher ID, status `active`) |
| DELETE | `/api/admin/teachers?teacherId=` | Remove/reject a teacher |
| POST | `/api/admin/approve-teacher` | Approve a self-registered teacher application → generates Teacher ID |
| POST | `/api/admin/enrollments/assign-teacher` | Assign a teacher to a student for a course |
| GET/DELETE | `/api/admin/library` | List / remove library resources |
| POST | `/api/admin/library/upload` | Publish a new PDF/audio resource |
| GET/PATCH | `/api/admin/profile` | View / update the logged-in admin's own account (name, phone, password) |

### Teacher
| Method | Route | Description |
|---|---|---|
| GET | `/api/teacher/students` | Students enrolled under this teacher |
| GET/POST | `/api/teacher/classes` / `/api/teacher/classes/create` | List / schedule live classes (auto-generates meeting link) |
| POST | `/api/teacher/results/add` | Record marks against a student's roll number |
| GET | `/api/teacher/assignments` | Homework submitted by this teacher's students |
| POST | `/api/teacher/assignments/review` | Attach feedback, mark reviewed |
| GET/PATCH | `/api/teacher/profile` | View / update own profile — name, phone, qualification, experience, subjects, bio, password |

### Student
| Method | Route | Description |
|---|---|---|
| GET | `/api/student/class-links` | This student's scheduled/active classes |
| GET | `/api/student/result?roll_number=` | Results — **hard-scoped server-side to the caller's own roll number**, regardless of the query param |
| GET/POST | `/api/student/assignments` / `/api/student/assignment/submit` | List / submit homework |
| GET | `/api/student/library` | Browse published study material |
| GET/PATCH | `/api/student/profile` | View own full record (incl. enrollments) / update contact + guardian details, password |

### Public
| Method | Route | Description |
|---|---|---|
| GET | `/api/courses` | Course catalog for the homepage |

---

## 6. Frontend pages

- `/` — public homepage: hero, course cards (from DB), tabbed admissions form (student
  application **or** teacher application).
- `/login` — unified login for all three roles.
- `/student/*` — dashboard, results (private, roll-number scoped), assignments, library,
  **My Profile** (edit contact/guardian info, change password).
- `/teacher/*` — dashboard, class scheduling, results entry, assignment review,
  **My Profile** (edit contact/qualification/subjects, change password).
- `/admin/*` — student CRUD/approval table with inline teacher assignment, teacher
  approval/onboarding (pending self-applied teachers show up here for a one-click
  approve, which issues their Teacher ID), library publishing, **My Profile**.

---

## 7. Deploying to Vercel (step by step)

This app needs a real Postgres database — Vercel itself doesn't run a database, so pair
it with **Neon** (free serverless Postgres, easiest to wire up).

1. **Push this project to GitHub** (create a new repo, e.g. `mbt-quran-academy`, and push
   all these files to it).
2. **Create a free Postgres database on Neon** — go to https://neon.tech, sign up, create
   a project. Copy the connection string it gives you (starts with `postgresql://...`,
   make sure it includes `?sslmode=require`).
3. **Import the project into Vercel** — go to https://vercel.com/new, "Import Git
   Repository", pick your repo. Framework preset auto-detects Next.js.
4. **Add environment variables** in Vercel's project settings → Environment Variables:
   - `DATABASE_URL` = the Neon connection string from step 2
   - `JWT_SECRET` = any long random string (e.g. run `openssl rand -base64 48` locally,
     or just mash the keyboard for 40+ characters)
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL, e.g. `https://mbt-quran-academy.vercel.app`
     (you can update this after the first deploy once you know the URL)
5. **Deploy.** Vercel runs `npm install` then `npm run build`, which itself runs
   `prisma generate && next build` — no extra config needed.
6. **Create the database tables** — the schema doesn't exist in Neon yet, only the
   `DATABASE_URL` connection. From your own machine (with the same `DATABASE_URL` in a
   local `.env`), run:
   ```bash
   npx prisma migrate deploy
   ```
   (or paste `prisma/migrations_sql/001_init.sql` straight into Neon's SQL editor if you'd
   rather not install anything locally).
7. **Seed the admin + course data** — still from your machine, same `.env`:
   ```bash
   npm run db:seed
   ```
   This creates your real admin account (`tmaaz12345@gmail.com` / `Pakistan@1122`), the
   7 courses, and one demo teacher + student so you can see the portals working end to
   end. Delete the demo teacher/student later from the Admin panel whenever you like.
8. **Log in** at `https://your-app.vercel.app/login` with the admin email/password above
   — every approval, onboarding, and assignment request from students/teachers will land
   in that account.

After this one-time setup, you don't need to touch the database again — admins approve
students and teachers, teachers schedule classes and post results, and students submit
work, all from the deployed site itself.

## 8. Production notes

- File uploads: this scaffold records **URLs** for library resources and assignment
  submissions (`file_url`). Wire up direct-to-storage uploads (Supabase Storage / S3
  presigned URLs) client-side, then POST the resulting URL to the existing endpoints.
- Video links: `/api/teacher/classes/create` auto-generates a placeholder meeting URL, or
  accepts a real Zoom/Google Meet link if the teacher supplies one. Swap in the Zoom/Meet
  API for fully automated room creation if needed.
- Add rate limiting and CSRF protection at your edge/CDN layer before going live.
- Rotate `JWT_SECRET` via your platform's secret manager — never commit `.env`.
