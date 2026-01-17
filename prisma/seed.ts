import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Clean existing data (optional - comment out if you want to preserve existing data)
  console.log('Cleaning existing data...');
  await prisma.recommendation.deleteMany();
  await prisma.burnoutScore.deleteMany();
  await prisma.counselorSession.deleteMany();
  await prisma.dailyCheckIn.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.academicData.deleteMany();
  await prisma.privacySettings.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Students with different profiles
  const students = [
    {
      name: 'Alex Chen',
      email: 'alex@demo.com',
      role: 'STUDENT',
      profile: 'high-performer', // Low burnout, good habits
    },
    {
      name: 'Sarah Martinez',
      email: 'sarah@demo.com',
      role: 'STUDENT',
      profile: 'stressed', // High burnout, poor sleep
    },
    {
      name: 'Jordan Williams',
      email: 'jordan@demo.com',
      role: 'STUDENT',
      profile: 'moderate', // Moderate burnout
    },
    {
      name: 'Emily Brown',
      email: 'emily@demo.com',
      role: 'STUDENT',
      profile: 'improving', // Was stressed, now improving
    },
    {
      name: 'Demo Student',
      email: 'student@demo.com',
      role: 'STUDENT',
      profile: 'balanced', // Balanced wellness
    },
  ];

  const createdStudents = [];
  for (const studentData of students) {
    const student = await prisma.user.create({
      data: {
        name: studentData.name,
        email: studentData.email,
        password: hashedPassword,
        role: 'STUDENT',
      },
    });
    createdStudents.push({ ...student, profile: studentData.profile });
  }

  const mentor = await prisma.user.create({
    data: {
      name: 'Dr. Michael Johnson',
      email: 'mentor@demo.com',
      password: hashedPassword,
      role: 'MENTOR',
    },
  });

  const counselor = await prisma.user.create({
    data: {
      name: 'Dr. Lisa Anderson',
      email: 'counselor@demo.com',
      password: hashedPassword,
      role: 'COUNSELOR',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✓ Created users:', createdStudents.length, 'students, 1 mentor, 1 counselor, 1 admin');

  // Create privacy settings for all students
  for (const student of createdStudents) {
    await prisma.privacySettings.create({
      data: {
        userId: student.id,
        shareWithMentors: student.profile !== 'stressed', // Stressed student keeps privacy
        shareAcademicData: true,
        shareWellnessData: student.profile === 'improving',
        emailNotifications: true,
        pushNotifications: student.profile !== 'high-performer',
      },
    });
  }

  console.log('✓ Created privacy settings');

  // Helper function to generate check-in data based on profile
  function generateCheckInData(profile: string, daysAgo: number) {
    const patterns: Record<string, any> = {
      'high-performer': {
        mood: () => Math.floor(Math.random() * 2) + 7, // 7-8
        sleep: () => Math.random() * 1.5 + 7, // 7-8.5 hours
        stress: () => Math.floor(Math.random() * 3) + 2, // 2-4
        energy: () => Math.floor(Math.random() * 2) + 7, // 7-8
      },
      'stressed': {
        mood: () => Math.floor(Math.random() * 3) + 3, // 3-5
        sleep: () => Math.random() * 1.5 + 4.5, // 4.5-6 hours
        stress: () => Math.floor(Math.random() * 2) + 7, // 7-8
        energy: () => Math.floor(Math.random() * 3) + 3, // 3-5
      },
      'moderate': {
        mood: () => Math.floor(Math.random() * 3) + 5, // 5-7
        sleep: () => Math.random() * 2 + 6, // 6-8 hours
        stress: () => Math.floor(Math.random() * 3) + 4, // 4-6
        energy: () => Math.floor(Math.random() * 3) + 5, // 5-7
      },
      'improving': {
        // Improves over time
        mood: () => Math.floor(Math.random() * 2) + Math.max(4, 8 - Math.floor(daysAgo / 5)),
        sleep: () => Math.random() * 1 + Math.min(7.5, 5.5 + daysAgo / 10),
        stress: () => Math.floor(Math.random() * 2) + Math.min(7, Math.max(3, 8 - daysAgo / 5)),
        energy: () => Math.floor(Math.random() * 2) + Math.max(4, 8 - Math.floor(daysAgo / 5)),
      },
      'balanced': {
        mood: () => Math.floor(Math.random() * 3) + 6, // 6-8
        sleep: () => Math.random() * 2 + 6.5, // 6.5-8.5 hours
        stress: () => Math.floor(Math.random() * 4) + 3, // 3-6
        energy: () => Math.floor(Math.random() * 3) + 6, // 6-8
      },
    };

    const pattern = patterns[profile] || patterns['balanced'];
    return {
      mood: pattern.mood(),
      sleepHours: pattern.sleep(),
      stressLevel: pattern.stress(),
      energyLevel: pattern.energy(),
    };
  }

  // Create daily check-ins for the past 30 days for each student
  const today = new Date();
  for (const student of createdStudents) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(8, 0, 0, 0);

      const checkInData = generateCheckInData(student.profile, i);

      await prisma.dailyCheckIn.create({
        data: {
          userId: student.id,
          date: date,
          mood: checkInData.mood,
          sleepHours: checkInData.sleepHours,
          stressLevel: checkInData.stressLevel,
          energyLevel: checkInData.energyLevel,
          notes: i === 0 ? `${student.name.split(' ')[0]}'s check-in for today` : undefined,
        },
      });
    }
  }

  console.log('✓ Created 30 days of check-ins for each student');

  // Create assignments for each student
  const assignmentTemplates = [
    { title: 'Calculus Problem Set', description: 'Complete problems 1-25 from Chapter 7', priority: 'HIGH', daysUntilDue: 2 },
    { title: 'Literature Essay', description: 'Analyze themes in "To Kill a Mockingbird"', priority: 'MEDIUM', daysUntilDue: 5 },
    { title: 'Chemistry Lab Report', description: 'Submit findings from titration experiment', priority: 'HIGH', daysUntilDue: 3 },
    { title: 'History Presentation', description: 'Prepare 10-minute presentation on Cold War', priority: 'MEDIUM', daysUntilDue: 7 },
    { title: 'Programming Assignment', description: 'Implement binary search tree in Python', priority: 'HIGH', daysUntilDue: 4 },
    { title: 'Physics Homework', description: 'Solve mechanics problems', priority: 'LOW', daysUntilDue: 10 },
    { title: 'Biology Quiz Prep', description: 'Study chapters 5-7', priority: 'MEDIUM', daysUntilDue: 6 },
    { title: 'Economics Essay', description: 'Write about supply and demand', priority: 'MEDIUM', daysUntilDue: 8 },
  ];

  for (const student of createdStudents) {
    const numAssignments = student.profile === 'stressed' ? 8 : student.profile === 'high-performer' ? 5 : 6;
    for (let i = 0; i < numAssignments; i++) {
      const template = assignmentTemplates[i % assignmentTemplates.length];
      await prisma.assignment.create({
        data: {
          userId: student.id,
          title: template.title,
          description: template.description,
          dueDate: new Date(Date.now() + template.daysUntilDue * 24 * 60 * 60 * 1000),
          priority: template.priority as 'LOW' | 'MEDIUM' | 'HIGH',
          completed: Math.random() > 0.7 && template.daysUntilDue > 7, // Some older ones completed
        },
      });
    }
  }

  console.log('✓ Created assignments');

  // Create academic data for each student
  const academicProfiles = {
    'high-performer': { attendance: 98, submitted: 20, total: 20, grade: 94.5 },
    'stressed': { attendance: 78, submitted: 15, total: 20, grade: 72.3 },
    'moderate': { attendance: 88, submitted: 17, total: 20, grade: 82.7 },
    'improving': { attendance: 85, submitted: 18, total: 20, grade: 80.2 },
    'balanced': { attendance: 92, submitted: 19, total: 20, grade: 87.5 },
  };

  for (const student of createdStudents) {
    const profile = academicProfiles[student.profile as keyof typeof academicProfiles];
    await prisma.academicData.create({
      data: {
        userId: student.id,
        attendancePercent: profile.attendance,
        assignmentsSubmitted: profile.submitted,
        totalAssignments: profile.total,
        averageGrade: profile.grade,
      },
    });
  }

  console.log('✓ Created academic data');

  // Create burnout scores with historical data
  const burnoutProfiles = {
    'high-performer': { score: 25, risk: 'LOW', sleep: 15, stress: 20, deadline: 30, attendance: 5, activity: 10 },
    'stressed': { score: 75, risk: 'HIGH', sleep: 65, stress: 80, deadline: 70, attendance: 35, activity: 60 },
    'moderate': { score: 48, risk: 'MODERATE', sleep: 40, stress: 50, deadline: 45, attendance: 15, activity: 30 },
    'improving': { score: 42, risk: 'MODERATE', sleep: 35, stress: 45, deadline: 40, attendance: 20, activity: 25 },
    'balanced': { score: 35, risk: 'LOW', sleep: 25, stress: 35, deadline: 35, attendance: 10, activity: 20 },
  };

  for (const student of createdStudents) {
    const profile = burnoutProfiles[student.profile as keyof typeof burnoutProfiles];

    // Create current burnout score
    await prisma.burnoutScore.create({
      data: {
        userId: student.id,
        score: profile.score,
        riskLevel: profile.risk,
        sleepDeficit: profile.sleep,
        stressTrend: profile.stress,
        deadlineDensity: profile.deadline,
        attendanceDrop: profile.attendance,
        activityChange: profile.activity,
      },
    });

    // Create historical burnout scores (weekly for past 8 weeks)
    for (let week = 1; week <= 8; week++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (week * 7));

      let historicalScore = profile.score;
      if (student.profile === 'improving') {
        historicalScore = Math.min(85, profile.score + (week * 5)); // Was worse before
      } else if (student.profile === 'stressed') {
        historicalScore = Math.max(60, profile.score - (week * 2)); // Getting worse
      }

      await prisma.burnoutScore.create({
        data: {
          userId: student.id,
          score: historicalScore,
          riskLevel: historicalScore > 60 ? 'HIGH' : historicalScore > 40 ? 'MODERATE' : 'LOW',
          sleepDeficit: profile.sleep + (Math.random() * 10 - 5),
          stressTrend: profile.stress + (Math.random() * 10 - 5),
          deadlineDensity: profile.deadline + (Math.random() * 10 - 5),
          attendanceDrop: profile.attendance,
          activityChange: profile.activity,
          date: weekDate,
        },
      });
    }
  }

  console.log('✓ Created burnout scores with 8 weeks of historical data');

  // Create recommendations based on burnout levels
  const recommendationTemplates = [
    {
      condition: (score: number) => score > 60,
      type: 'REST_PLAN' as const,
      title: 'Take a Mental Health Break',
      description: 'Your burnout levels are critically high. Consider taking a day off to rest and recharge.',
    },
    {
      condition: (score: number) => score > 50,
      type: 'REST_PLAN' as const,
      title: 'Prioritize Sleep This Week',
      description: 'Your sleep deficit is affecting your performance. Aim for 8 hours of sleep each night.',
    },
    {
      condition: (score: number) => score > 45,
      type: 'STUDY_PACING' as const,
      title: 'Break Down Your Workload',
      description: 'You have multiple deadlines approaching. Create a study schedule to manage them effectively.',
    },
    {
      condition: (score: number) => score > 40,
      type: 'WELLNESS_TIP' as const,
      title: 'Consider Talking to a Counselor',
      description: 'Your stress levels are elevated. A counselor can help you develop coping strategies.',
    },
    {
      condition: (score: number) => score > 30,
      type: 'ACTIVITY_SUGGESTION' as const,
      title: 'Add Physical Activity',
      description: 'Regular exercise can help reduce stress and improve your mood.',
    },
    {
      condition: (score: number) => score <= 30,
      type: 'WELLNESS_TIP' as const,
      title: 'Keep Up the Good Work!',
      description: 'Your wellness habits are excellent. Continue with your current routine.',
    },
  ];

  for (const student of createdStudents) {
    const score = burnoutProfiles[student.profile as keyof typeof burnoutProfiles].score;
    const applicableRecs = recommendationTemplates.filter(r => r.condition(score)).slice(0, 3);

    for (const rec of applicableRecs) {
      await prisma.recommendation.create({
        data: {
          userId: student.id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
        },
      });
    }
  }

  console.log('✓ Created personalized recommendations');

  // Create counselor sessions
  const sessionTypes = ['ACADEMIC', 'PERSONAL', 'CAREER'] as const;
  const sessionStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

  for (const student of createdStudents) {
    if (student.profile === 'stressed' || student.profile === 'improving') {
      // Create 2-3 sessions for students who need support
      const numSessions = student.profile === 'stressed' ? 3 : 2;

      for (let i = 0; i < numSessions; i++) {
        const isPast = i < numSessions - 1;
        const sessionDate = new Date(today);

        if (isPast) {
          sessionDate.setDate(sessionDate.getDate() - ((numSessions - i) * 7)); // Past sessions
        } else {
          sessionDate.setDate(sessionDate.getDate() + 5); // Upcoming session
        }

        sessionDate.setHours(14 + i, 0, 0, 0);

        await prisma.counselorSession.create({
          data: {
            userId: student.id,
            sessionType: sessionTypes[i % sessionTypes.length],
            date: sessionDate,
            time: `${2 + i}:00 PM`,
            status: isPast ? 'COMPLETED' : 'CONFIRMED',
            anonymous: false,
            notes: i === 0 ? 'Feeling overwhelmed with coursework' : undefined,
          },
        });
      }
    }
  }

  console.log('✓ Created counselor sessions');

  console.log('\n✓ Seed completed successfully!');
  console.log('\n=================================');
  console.log('Demo Credentials:');
  console.log('=================================');
  console.log('\nStudents:');
  console.log('  • alex@demo.com / demo123 (High Performer)');
  console.log('  • sarah@demo.com / demo123 (Stressed)');
  console.log('  • jordan@demo.com / demo123 (Moderate)');
  console.log('  • emily@demo.com / demo123 (Improving)');
  console.log('  • student@demo.com / demo123 (Balanced)');
  console.log('\nStaff:');
  console.log('  • mentor@demo.com / demo123 (Mentor)');
  console.log('  • counselor@demo.com / demo123 (Counselor)');
  console.log('  • admin@demo.com / demo123 (Admin)');
  console.log('\n=================================');
  console.log('Generated Data Summary:');
  console.log('=================================');
  console.log(`  • ${createdStudents.length} students with varied wellness profiles`);
  console.log(`  • 30 days of daily check-ins per student`);
  console.log(`  • 5-8 assignments per student`);
  console.log(`  • 9 weeks of burnout score history per student`);
  console.log(`  • Personalized recommendations`);
  console.log(`  • Counselor sessions for students needing support`);
  console.log('=================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
