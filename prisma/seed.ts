import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Bennett Campus ERP database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.messScan.deleteMany();
  await prisma.messMenu.deleteMany();
  await prisma.laundryOrder.deleteMany();
  await prisma.groundBooking.deleteMany();
  await prisma.ground.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.issuedBook.deleteMany();
  await prisma.roomBooking.deleteMany();
  await prisma.discussionRoom.deleteMany();
  await prisma.scanEvent.deleteMany();
  await prisma.student.deleteMany();

  // 2. Create Student
  // Enrollment Number: s26cseu2109, Password: Aditya@123
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Aditya@123', salt);

  const student = await prisma.student.create({
    data: {
      enrollmentNo: 's26cseu2109',
      name: 'Aditya Sharma',
      passwordHash: passwordHash,
      program: 'B.Tech Computer Science & Engineering',
      semester: 3,
    },
  });
  console.log(`✓ Created student: ${student.name} (${student.enrollmentNo})`);

  // 3. Discussion Rooms & Bookings
  const roomA = await prisma.discussionRoom.create({ data: { name: 'Discussion Room A (Audiovisual)', capacity: 6 } });
  const roomB = await prisma.discussionRoom.create({ data: { name: 'Discussion Room B (Collab Hub)', capacity: 8 } });
  const roomC = await prisma.discussionRoom.create({ data: { name: 'Discussion Room C (Quiet Study)', capacity: 4 } });
  const roomD = await prisma.discussionRoom.create({ data: { name: 'Discussion Room D (Project Lab)', capacity: 10 } });

  // Bookings
  await prisma.roomBooking.create({
    data: {
      roomId: roomA.id,
      studentId: student.id,
      date: new Date('2026-10-06T00:00:00.000Z'),
      slotStart: '14:00',
      slotEnd: '15:00',
      status: 'ACTIVE',
    },
  });

  await prisma.roomBooking.create({
    data: {
      roomId: roomB.id,
      studentId: student.id,
      date: new Date('2026-10-10T00:00:00.000Z'),
      slotStart: '11:00',
      slotEnd: '12:00',
      status: 'ACTIVE',
    },
  });

  await prisma.roomBooking.create({
    data: {
      roomId: roomA.id,
      studentId: student.id,
      date: new Date('2026-10-16T00:00:00.000Z'),
      slotStart: '10:00',
      slotEnd: '11:00',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Discussion rooms and bookings created');

  // 4. Issued Books
  await prisma.issuedBook.create({
    data: {
      studentId: student.id,
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      issueDate: new Date('2026-10-02T10:00:00.000Z'),
      dueDate: new Date('2026-10-16T23:59:59.000Z'),
      finePerDay: 2.0,
      loanDays: 14,
    },
  });

  await prisma.issuedBook.create({
    data: {
      studentId: student.id,
      title: 'Discrete Mathematics and Its Applications',
      author: 'Kenneth H. Rosen',
      issueDate: new Date('2026-09-24T11:30:00.000Z'),
      dueDate: new Date('2026-10-08T23:59:59.000Z'), // OVERDUE 7 days as of 15 Oct -> ₹14
      finePerDay: 2.0,
      loanDays: 14,
    },
  });

  await prisma.issuedBook.create({
    data: {
      studentId: student.id,
      title: 'Computer Organization and Design: The Hardware/Software Interface',
      author: 'David A. Patterson, John L. Hennessy',
      issueDate: new Date('2026-10-09T14:15:00.000Z'),
      dueDate: new Date('2026-10-23T23:59:59.000Z'),
      finePerDay: 2.0,
      loanDays: 14,
    },
  });
  console.log('✓ Library issued books created');

  // 5. Library Scan Events (Total: 28h 20m in Oct 2026; 5h 50m this week; 2h 20m today)
  const librarySessions = [
    { in: '2026-10-01T09:30:00.000Z', out: '2026-10-01T12:00:00.000Z' }, // 2h 30m
    { in: '2026-10-02T14:00:00.000Z', out: '2026-10-02T17:30:00.000Z' }, // 3h 30m
    { in: '2026-10-03T10:00:00.000Z', out: '2026-10-03T14:30:00.000Z' }, // 4h 30m
    { in: '2026-10-06T11:00:00.000Z', out: '2026-10-06T13:30:00.000Z' }, // 2h 30m
    { in: '2026-10-07T09:00:00.000Z', out: '2026-10-07T11:00:00.000Z' }, // 2h 00m
    { in: '2026-10-08T15:00:00.000Z', out: '2026-10-08T18:00:00.000Z' }, // 3h 00m
    { in: '2026-10-09T10:30:00.000Z', out: '2026-10-09T12:00:00.000Z' }, // 1h 30m
    { in: '2026-10-10T13:00:00.000Z', out: '2026-10-10T16:00:00.000Z' }, // 3h 00m
    { in: '2026-10-13T09:00:00.000Z', out: '2026-10-13T12:30:00.000Z' }, // 3h 30m
    { in: '2026-10-15T10:40:00.000Z', out: '2026-10-15T13:00:00.000Z' }, // 2h 20m (Today)
  ];

  for (const s of librarySessions) {
    await prisma.scanEvent.create({
      data: {
        studentId: student.id,
        location: 'LIBRARY',
        direction: 'IN',
        timestamp: new Date(s.in),
      },
    });
    await prisma.scanEvent.create({
      data: {
        studentId: student.id,
        location: 'LIBRARY',
        direction: 'OUT',
        timestamp: new Date(s.out),
      },
    });
  }
  console.log('✓ 10 Library scan sessions seeded (Total: 28h 20m)');

  // 6. Sports & Grounds (9 sports confirmed from Bennett website)
  const sportsData = [
    { name: 'Cricket', grounds: ['Cricket Ground (Floodlit)', 'Practice Nets Area A', 'Practice Nets Area B'] },
    { name: 'Football', grounds: ['Main Football Field (Floodlit)', 'Turf Practice Pitch'] },
    { name: 'Basketball', grounds: ['Outdoor Basketball Court 1', 'Indoor Wooden Basketball Court'] },
    { name: 'Tennis', grounds: ['Lawn Tennis Synthetic Court 1', 'Lawn Tennis Synthetic Court 2'] },
    { name: 'Badminton', grounds: ['Indoor AC Badminton Court 1', 'Indoor AC Badminton Court 2'] },
    { name: 'Squash', grounds: ['Glass Squash Court A', 'Glass Squash Court B'] },
    { name: 'Volleyball', grounds: ['Volleyball Court (Floodlit)'] },
    { name: 'Table Tennis', grounds: ['Indoor TT Hall Table 1', 'Indoor TT Hall Table 2'] },
    { name: 'Swimming', grounds: ['Olympic Size Swimming Pool'] },
  ];

  const groundRecordMap: Record<string, string> = {};

  for (const sp of sportsData) {
    const sportRec = await prisma.sport.create({
      data: { name: sp.name },
    });
    for (const gName of sp.grounds) {
      const gRec = await prisma.ground.create({
        data: { name: gName, sportId: sportRec.id },
      });
      groundRecordMap[gName] = gRec.id;
    }
  }
  console.log('✓ 9 Bennett sports and grounds created');

  // Sports Bookings
  const bbGroundId = groundRecordMap['Outdoor Basketball Court 1'];
  const fbGroundId = groundRecordMap['Main Football Field (Floodlit)'];

  if (bbGroundId) {
    await prisma.groundBooking.create({
      data: {
        groundId: bbGroundId,
        studentId: student.id,
        date: new Date('2026-10-08T00:00:00.000Z'),
        slotStart: '16:00',
        slotEnd: '17:00',
        status: 'ACTIVE',
      },
    });
  }

  if (fbGroundId) {
    await prisma.groundBooking.create({
      data: {
        groundId: fbGroundId,
        studentId: student.id,
        date: new Date('2026-10-16T00:00:00.000Z'),
        slotStart: '17:00',
        slotEnd: '18:00',
        status: 'ACTIVE',
      },
    });
  }

  // Sports Scan Sessions (Total: 8h 00m in Oct 2026; 2h 00m this week; 1h 00m today)
  const sportsSessions = [
    { in: '2026-10-02T17:00:00.000Z', out: '2026-10-02T18:30:00.000Z' }, // 1h 30m (Football)
    { in: '2026-10-05T07:00:00.000Z', out: '2026-10-05T08:30:00.000Z' }, // 1h 30m (Swimming)
    { in: '2026-10-07T16:00:00.000Z', out: '2026-10-07T17:30:00.000Z' }, // 1h 30m (Basketball)
    { in: '2026-10-10T08:00:00.000Z', out: '2026-10-10T09:30:00.000Z' }, // 1h 30m (Tennis)
    { in: '2026-10-13T17:00:00.000Z', out: '2026-10-13T18:00:00.000Z' }, // 1h 00m (Badminton)
    { in: '2026-10-15T17:30:00.000Z', out: '2026-10-15T18:30:00.000Z' }, // 1h 00m (Cricket, today)
  ];

  for (const s of sportsSessions) {
    await prisma.scanEvent.create({
      data: {
        studentId: student.id,
        location: 'SPORTS',
        direction: 'IN',
        timestamp: new Date(s.in),
      },
    });
    await prisma.scanEvent.create({
      data: {
        studentId: student.id,
        location: 'SPORTS',
        direction: 'OUT',
        timestamp: new Date(s.out),
      },
    });
  }
  console.log('✓ 6 Sports scan sessions seeded (Total: 8h 00m)');

  // 7. Laundry Orders
  await prisma.laundryOrder.create({
    data: {
      studentId: student.id,
      clothesCount: 12,
      givenDate: new Date('2026-10-03T11:00:00.000Z'),
      dueDate: new Date('2026-10-06T18:00:00.000Z'),
      status: 'COLLECTED',
      collectedAt: new Date('2026-10-06T18:30:00.000Z'),
    },
  });

  await prisma.laundryOrder.create({
    data: {
      studentId: student.id,
      clothesCount: 9,
      givenDate: new Date('2026-10-10T10:30:00.000Z'),
      dueDate: new Date('2026-10-13T18:00:00.000Z'), // OVERDUE pickup (due 13 Oct, today 15 Oct)
      status: 'READY',
      collectedAt: null,
    },
  });

  await prisma.laundryOrder.create({
    data: {
      studentId: student.id,
      clothesCount: 14,
      givenDate: new Date('2026-10-14T09:45:00.000Z'),
      dueDate: new Date('2026-10-17T18:00:00.000Z'),
      status: 'WASHING',
      collectedAt: null,
    },
  });
  console.log('✓ Laundry orders seeded');

  // 8. Mess Menu (Weekly Indian menu)
  const weeklyMenu = [
    {
      dayOfWeek: 1, // Monday
      meals: {
        BREAKFAST: 'Poha, Boiled Eggs, Butter Toast, Tea & Milk',
        LUNCH: 'Rajma Chawal, Tawa Roti, Boondi Raita, Green Salad',
        SNACKS: 'Crispy Samosa with Mint Chutney, Masala Chai',
        DINNER: 'Paneer Butter Masala, Dal Tadka, Steamed Rice, Roti, Gulab Jamun',
      },
    },
    {
      dayOfWeek: 2, // Tuesday
      meals: {
        BREAKFAST: 'Aloo Paratha with Curd & Pickle, Tea & Coffee',
        LUNCH: 'Chole Kulche / Jeera Rice, Kachumber Salad, Buttermilk',
        SNACKS: 'Bread Pakora with Sweet Chutney, Ginger Tea',
        DINNER: 'Egg Curry / Kadhai Paneer, Dal Makhani, Rice, Roti',
      },
    },
    {
      dayOfWeek: 3, // Wednesday
      meals: {
        BREAKFAST: 'Rava Upma with Coconut Chutney, Banana, Bread & Jam',
        LUNCH: 'Yellow Moong Dal, Jeera Aloo, Roti, Rice, Cucumber Raita',
        SNACKS: 'Veg Cutlet, Tomato Sauce, Hot Tea',
        DINNER: 'Chicken Curry / Paneer Do Pyaza, Dal Fry, Pulao, Roti',
      },
    },
    {
      dayOfWeek: 4, // Thursday (Today!)
      meals: {
        BREAKFAST: 'Idli Sambar with Coconut & Tomato Chutney, Filter Coffee & Tea',
        LUNCH: 'Kadhi Pakora with Steamed Rice, Aloo Bhindi, Roti, Papad',
        SNACKS: 'Steamed Veg Momos with Spicy Red Dip, Lemon Ice Tea',
        DINNER: 'Mushroom Matar Masala, Chana Dal, Jeera Rice, Tandoori Roti, Kheer',
      },
    },
    {
      dayOfWeek: 5, // Friday
      meals: {
        BREAKFAST: 'Chole Bhature with Pickled Onions, Sweet Lassi',
        LUNCH: 'Hyderabadi Veg Dum Biryani, Mixed Veg Raita, Salan',
        SNACKS: 'Pav Bhaji with Buttered Pav, Masala Chai',
        DINNER: 'Palak Paneer, Dal Palak, Steamed Rice, Roti, Moong Dal Halwa',
      },
    },
    {
      dayOfWeek: 6, // Saturday
      meals: {
        BREAKFAST: 'Masala Dosa with Sambar & Coconut Chutney, Tea',
        LUNCH: 'Aloo Gobi Matar, Panchmel Dal, Roti, Steamed Rice, Curd',
        SNACKS: 'White Sauce Pasta, Mix Fruit Juice',
        DINNER: 'Paneer Lababdar, Dal Tadka, Veg Pulao, Roti, Ice Cream',
      },
    },
    {
      dayOfWeek: 0, // Sunday
      meals: {
        BREAKFAST: 'Puri Aloo Bhaji with Suji Halwa, Masala Tea',
        LUNCH: 'Special Sunday Thali: Paneer Tikka Masala, Dum Aloo, Dal Makhani, Naan, Pulao',
        SNACKS: 'Cheese Maggi, Cold Coffee',
        DINNER: 'Mix Vegetable Jalfrezi, Dal Fry, Steamed Rice, Roti, Rasgulla',
      },
    },
  ];

  for (const day of weeklyMenu) {
    for (const [meal, items] of Object.entries(day.meals)) {
      await prisma.messMenu.create({
        data: {
          dayOfWeek: day.dayOfWeek,
          meal,
          items,
        },
      });
    }
  }
  console.log('✓ Weekly Indian mess menu seeded');

  // 9. Mess Scans
  // Today = 15 Oct 2026. Exactly 3 meals taken: Breakfast (08:15), Lunch (12:45), Snacks (17:05). Dinner not yet taken!
  const todayDate = new Date('2026-10-15T00:00:00.000Z');

  await prisma.messScan.create({
    data: {
      studentId: student.id,
      meal: 'BREAKFAST',
      date: todayDate,
      timestamp: new Date('2026-10-15T08:15:00.000Z'),
      flagged: false,
    },
  });

  await prisma.messScan.create({
    data: {
      studentId: student.id,
      meal: 'LUNCH',
      date: todayDate,
      timestamp: new Date('2026-10-15T12:45:00.000Z'),
      flagged: false,
    },
  });

  await prisma.messScan.create({
    data: {
      studentId: student.id,
      meal: 'SNACKS',
      date: todayDate,
      timestamp: new Date('2026-10-15T17:05:00.000Z'),
      flagged: false,
    },
  });

  // Prior 6 days history (9 Oct to 14 Oct)
  const priorHistory = [
    { date: '2026-10-09', meals: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'] },
    { date: '2026-10-10', meals: ['BREAKFAST', 'LUNCH', 'DINNER'] },
    { date: '2026-10-11', meals: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'] },
    { date: '2026-10-12', meals: ['BREAKFAST', 'LUNCH', 'DINNER'] },
    { date: '2026-10-13', meals: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'] },
    { date: '2026-10-14', meals: ['BREAKFAST', 'LUNCH', 'DINNER'] },
  ];

  for (const day of priorHistory) {
    const d = new Date(`${day.date}T00:00:00.000Z`);
    for (const m of day.meals) {
      const scanHour = m === 'BREAKFAST' ? '08:20' : m === 'LUNCH' ? '13:00' : m === 'SNACKS' ? '17:15' : '20:10';
      await prisma.messScan.create({
        data: {
          studentId: student.id,
          meal: m,
          date: d,
          timestamp: new Date(`${day.date}T${scanHour}:00.000Z`),
          flagged: false,
        },
      });
    }
  }
  console.log('✓ Mess scans seeded (3 meals taken today, 6 prior days history)');

  console.log('🎉 Bennett Campus ERP database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
