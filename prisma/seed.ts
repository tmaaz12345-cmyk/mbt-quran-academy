import { PrismaClient, CourseCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Maaz Bin Tariq Online Quran Academy database...");

  // --- Admin user -----------------------------------------------------------
  // This is the primary/owner admin account used to log in and manage the
  // whole academy (approve students & teachers, assign classes, publish
  // library resources, etc.)
  const adminPassword = await bcrypt.hash("Pakistan@1122", 10);
  const admin = await prisma.user.upsert({
    where: { email: "tmaaz12345@gmail.com" },
    update: { passwordHash: adminPassword, role: "admin" },
    create: {
      fullName: "Maaz (Academy Administrator)",
      email: "tmaaz12345@gmail.com",
      phone: "+92-300-0000000",
      passwordHash: adminPassword,
      role: "admin",
    },
  });

  // --- Courses ----------------------------------------------------------
  const courseData: { title: string; description: string; category: CourseCategory }[] = [
    { title: "Noorani Qaida", description: "Foundational Arabic letter recognition and pronunciation.", category: "Qaida" },
    { title: "Tajweed Mastery", description: "Rules of correct Quranic recitation.", category: "Tajweed" },
    { title: "Nazra Quran", description: "Fluent Quran reading with correct pronunciation.", category: "Nazra" },
    { title: "Hifz-ul-Quran", description: "Complete memorization of the Holy Quran.", category: "Hifz" },
    { title: "Masnoon Duaen", description: "Daily prophetic supplications for everyday life.", category: "Masnoon_Duaen" },
    { title: "Namaz (Salah) Training", description: "Step-by-step guide to performing prayer correctly.", category: "Namaz" },
    { title: "6 Kalmas", description: "The six fundamental declarations of Islamic faith.", category: "Six_Kalmas" },
  ];

  const courses = [];
  for (const c of courseData) {
    const existing = await prisma.course.findFirst({ where: { title: c.title } });
    courses.push(existing ?? (await prisma.course.create({ data: c })));
  }

  // --- Sample teacher -----------------------------------------------------
  const teacherPassword = await bcrypt.hash("Teacher@12345", 10);
  const teacherUser = await prisma.user.upsert({
    where: { email: "qari.ahmed@maazbintariq.academy" },
    update: {},
    create: {
      fullName: "Qari Ahmed Raza",
      email: "qari.ahmed@maazbintariq.academy",
      phone: "+92-301-1111111",
      passwordHash: teacherPassword,
      role: "teacher",
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { teacherId: "MBT-T-101" },
    update: {},
    create: {
      teacherId: "MBT-T-101",
      userId: teacherUser.id,
      qualification: "Ijazah in Qira'at, 12 years teaching experience",
      experienceYears: 12,
      assignedSubjects: ["Tajweed", "Nazra", "Hifz"],
      status: "active",
    },
  });

  // --- Sample student (approved) ------------------------------------------
  const studentPassword = await bcrypt.hash("Student@12345", 10);
  const studentUser = await prisma.user.upsert({
    where: { email: "student.demo@maazbintariq.academy" },
    update: {},
    create: {
      fullName: "Ali Hassan",
      email: "student.demo@maazbintariq.academy",
      phone: "+92-302-2222222",
      passwordHash: studentPassword,
      role: "student",
    },
  });

  const student = await prisma.student.upsert({
    where: { studentId: "MBT-1001" },
    update: {},
    create: {
      studentId: "MBT-1001",
      userId: studentUser.id,
      guardianName: "Tariq Hassan",
      age: 12,
      country: "Pakistan",
      rollNumber: "MBT-ROLL-1001",
      status: "active",
    },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.studentId, courseId: courses[1].id } },
    update: {},
    create: {
      studentId: student.studentId,
      courseId: courses[1].id,
      teacherId: teacher.teacherId,
      status: "active",
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:   tmaaz12345@gmail.com / Pakistan@1122");
  console.log("Teacher login: qari.ahmed@maazbintariq.academy / Teacher@12345 (ID: MBT-T-101)");
  console.log("Student login: MBT-1001 / Student@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
