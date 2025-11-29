// seed.js - run with: node seeder/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    // clear
    await User.deleteMany({});
    await Attendance.deleteMany({});

    // create users
    const hashed = await bcrypt.hash('password123', 10);

    const managers = [
      { name: 'Manager One', email: 'manager@example.com', password: hashed, role: 'manager', employeeId: 'MGR001', department: 'Admin' },
    ];

    const employees = [];
    for (let i = 1; i <= 8; i++) {
      employees.push({
        name: `Employee ${i}`,
        email: `employee${i}@example.com`,
        password: hashed,
        role: 'employee',
        employeeId: `EMP${String(1000 + i).slice(1)}`, // EMP1001...
        department: i % 2 === 0 ? 'Development' : 'HR'
      });
    }

    const createdManagers = await User.insertMany(managers);
    const createdEmployees = await User.insertMany(employees);

    // today's date, and previous 10 days
    const now = new Date();
    const dates = [];
    for (let d = 0; d < 14; d++) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - d);
      dates.push(dt.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    const attendanceRows = [];

    // create sample attendance for employees
    for (const emp of createdEmployees) {
      for (const date of dates) {
        // randomize checkin hour between 8:30 and 10:30
        const hour = 8 + Math.floor(Math.random() * 3); // 8,9,10
        const minute = Math.floor(Math.random() * 60);
        const checkIn = new Date(`${date}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00Z`);
        // checkout add 8 hours +/- 1 hour
        const checkout = new Date(checkIn.getTime() + (7 + Math.floor(Math.random() * 3)) * 3600 * 1000);

        // status rules (simplified)
        let status = 'present';
        const localHour = checkIn.getUTCHours(); // keep simple for seed
        if (localHour > 9 || (localHour === 9 && minute > 30)) status = 'late';
        // random absent
        if (Math.random() < 0.08) {
          attendanceRows.push({
            userId: emp._id,
            date,
            status: 'absent'
          });
          continue;
        }

        const totalHours = Math.round(((checkout.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) * 100) / 100;

        attendanceRows.push({
          userId: emp._id,
          date,
          checkInTime: checkIn,
          checkOutTime: checkout,
          status: totalHours < 4 ? 'half-day' : status,
          totalHours
        });
      }
    }

    await Attendance.insertMany(attendanceRows);

    console.log('Seeding completed: users and attendance inserted.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
