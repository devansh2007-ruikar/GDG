const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing records in correct order to avoid foreign key conflicts
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Salt rounds for bcrypt (10 is the industry standard balance of security & speed)
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
  const userPasswordHash = await bcrypt.hash('User@123', saltRounds);

  // 1. Create 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: 'GDG Admin',
      email: 'admin@gdg.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  // 2. Create 2 Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Devansh Ruikar',
      email: 'user1@gdg.com',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'user2@gdg.com',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });

  console.log('✅ Created users:');
  console.log(' - Admin: admin@gdg.com (Admin@123)');
  console.log(' - User 1: user1@gdg.com (User@123)');
  console.log(' - User 2: user2@gdg.com (User@123)');

  // Base date set in the near future (e.g., 7 days from today)
  const now = new Date();
  const futureDate = (daysAhead, hours = 10) => {
    const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    d.setHours(hours, 0, 0, 0);
    return d;
  };

  // 3. Create 8 realistic future events across categories
  const eventsData = [
    {
      title: 'Google Cloud & Applied AI Summit',
      description: 'Explore the frontiers of GenAI, Vertex AI, and enterprise cloud architecture with industry leaders.',
      dateTime: futureDate(5, 10),
      venue: 'Main Auditorium, Tech Block A',
      capacity: 150,
      category: 'Tech',
      createdById: admin.id,
    },
    {
      title: 'Full-Stack Modern Web with React & Vite',
      description: 'Hands-on workshop building high-performance modern web apps with state-of-the-art tooling.',
      dateTime: futureDate(8, 14),
      venue: 'Lab 304, Computer Center',
      capacity: 45,
      category: 'Workshop',
      createdById: admin.id,
    },
    {
      title: 'GDG Hackathon 2026: Build for Good',
      description: '36 hours of rapid ideation, coding, and pitching tech solutions for community impact.',
      dateTime: futureDate(12, 9),
      venue: 'Innovation & Design Center',
      capacity: 100,
      category: 'Hackathon',
      createdById: admin.id,
    },
    {
      title: 'Open Source & Dev Community Mixer',
      description: 'Network with local developers, open-source maintainers, and GDG organizers over coffee and lightning talks.',
      dateTime: futureDate(15, 17),
      venue: 'Student Activity Lounge',
      capacity: 60,
      category: 'Meetup',
      createdById: admin.id,
    },
    {
      title: 'Architecting Resilient Distributed Systems',
      description: 'Deep-dive into fault tolerance, message brokers, idempotency, and database concurrency patterns.',
      dateTime: futureDate(18, 11),
      venue: 'Seminar Hall 1',
      capacity: 80,
      category: 'Talk',
      createdById: admin.id,
    },
    {
      title: 'Exclusive Hands-on Agentic AI Masterclass',
      description: 'Intimate deep-dive lab for senior builders. Strictly capped at 1 seat to test concurrency and event full handling.',
      dateTime: futureDate(21, 15),
      venue: 'Advanced AI Research Suite 101',
      capacity: 1, // Single seat capacity to test EVENT_FULL rule
      category: 'Workshop',
      createdById: admin.id,
    },
    {
      title: 'Flutter Forward: Multiplatform Experiences',
      description: 'Create seamless native experiences across Mobile, Desktop, and Web with a single Dart codebase.',
      dateTime: futureDate(25, 10),
      venue: 'Seminar Hall 2',
      capacity: 70,
      category: 'Tech',
      createdById: admin.id,
    },
    {
      title: 'Navigating Tech Careers & Ace the Tech Interview',
      description: 'Panel discussion with engineering managers and senior engineers on portfolios, interviews, and growth.',
      dateTime: futureDate(30, 16),
      venue: 'Grand Convention Hall',
      capacity: 200,
      category: 'Talk',
      createdById: admin.id,
    },
  ];

  for (const eventData of eventsData) {
    await prisma.event.create({ data: eventData });
  }

  console.log(`✅ Seeded ${eventsData.length} events (including 1 single-capacity event)`);
  console.log('🌱 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
