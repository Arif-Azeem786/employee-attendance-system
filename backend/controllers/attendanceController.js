// attendanceController.js
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Parser } = require('json2csv'); // simple CSV generation

/**
 * Helpers
 */
const formatDateYMD = (d = new Date()) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const hoursBetween = (start, end) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100; // 2 decimal hours
};

/**
 * Employee endpoints
 */

const checkIn = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDateYMD();
    let att = await Attendance.findOne({ userId: user._id, date: today });
    const now = new Date();

    if (att && att.checkInTime) {
      return res.status(400).json({ success: false, message: 'Already checked in for today' });
    }

    const checkInHour = now.getHours();
    const checkInMin = now.getMinutes();
    const isLate = (checkInHour > 9) || (checkInHour === 9 && checkInMin > 30);
    const status = isLate ? 'late' : 'present';

    if (!att) {
      att = new Attendance({
        userId: user._id,
        date: today,
        checkInTime: now,
        status
      });
    } else {
      att.checkInTime = now;
      att.status = status;
    }

    await att.save();

    return res.status(201).json({
      success: true,
      data: att,
      message: isLate ? 'Checked in (late)' : 'Checked in'
    });
  } catch (error) {
    console.error('CheckIn error:', error);
    return res.status(500).json({ success: false, message: 'Server error on check-in' });
  }
};

const checkOut = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDateYMD();

    const att = await Attendance.findOne({ userId: user._id, date: today });
    if (!att || !att.checkInTime) {
      return res.status(400).json({ success: false, message: 'No check-in found for today' });
    }
    if (att.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out for today' });
    }

    const now = new Date();
    att.checkOutTime = now;
    att.totalHours = hoursBetween(att.checkInTime, att.checkOutTime);

    if (att.totalHours < 4) {
      att.status = 'half-day';
    } else if (att.status !== 'late') {
      att.status = 'present';
    }

    await att.save();

    return res.json({ success: true, data: att, message: 'Checked out' });
  } catch (error) {
    console.error('CheckOut error:', error);
    return res.status(500).json({ success: false, message: 'Server error on check-out' });
  }
};

const myHistory = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 50, month } = req.query;

    const filter = { userId: user._id };
    if (month) filter.date = { $regex: `^${month}` };

    const skip = (Number(page) - 1) * Number(limit);

    const items = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    return res.json({
      success: true,
      data: { items, total, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    console.error('MyHistory error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching history' });
  }
};

const mySummary = async (req, res) => {
  try {
    const user = req.user;
    const { month } = req.query;
    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const arr = await Attendance.find({ userId: user._id, date: { $regex: `^${targetMonth}` } });

    let present = 0, absent = 0, late = 0, halfDay = 0, totalHours = 0;
    arr.forEach(a => {
      if (a.status === 'present') present++;
      else if (a.status === 'late') late++;
      else if (a.status === 'half-day') halfDay++;
      else if (a.status === 'absent') absent++;
      totalHours += (a.totalHours || 0);
    });

    return res.json({
      success: true,
      data: {
        month: targetMonth,
        present, absent, late, halfDay,
        totalDaysRecorded: arr.length,
        totalHours: Math.round(totalHours * 100) / 100
      }
    });
  } catch (error) {
    console.error('MySummary error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching summary' });
  }
};

const todayStatus = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDateYMD();

    const att = await Attendance.findOne({ userId: user._id, date: today });

    if (!att) {
      return res.json({ success: true, data: { status: 'not_checked_in' } });
    }

    return res.json({
      success: true,
      data: {
        status: att.status || 'present',
        checkInTime: att.checkInTime || null,
        checkOutTime: att.checkOutTime || null,
        totalHours: att.totalHours || 0
      }
    });
  } catch (error) {
    console.error('TodayStatus error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching today status' });
  }
};

/**
 * Manager endpoints
 */

// GET /api/attendance/all
// supports filters: employeeId (EMP###) or userId, date (YYYY-MM-DD), status, page, limit
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, employeeId, userId, date, status } = req.query;
    const filter = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
      filter.userId = user._id;
    }
    if (userId) filter.userId = userId;
    if (date) filter.date = date;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const items = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email employeeId department');

    const total = await Attendance.countDocuments(filter);

    return res.json({
      success: true,
      data: { items, total, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    console.error('GetAll error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching all attendance' });
  }
};

// GET /api/attendance/employee/:id  (id can be userId or employeeId e.g., EMP0001)
const getEmployee = async (req, res) => {
  try {
    const param = req.params.id;
    let user;
    if (param && param.startsWith && param.startsWith('EMP')) {
      user = await User.findOne({ employeeId: param });
    } else {
      user = await User.findById(param);
    }
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });

    const items = await Attendance.find({ userId: user._id }).sort({ date: -1 });
    return res.json({ success: true, data: { user: { id: user._id, name: user.name, employeeId: user.employeeId, email: user.email, department: user.department }, items } });
  } catch (error) {
    console.error('GetEmployee error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching employee attendance' });
  }
};

// GET /api/attendance/summary  => team summary
const teamSummary = async (req, res) => {
  try {
    // total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    const today = formatDateYMD();

    // today's attendance
    const todays = await Attendance.find({ date: today });
    const present = todays.filter(t => t.status === 'present' || t.status === 'late').length;
    const absent = totalEmployees - present; // rough (employees without a record considered absent)
    const late = todays.filter(t => t.status === 'late').length;

    // weekly attendance trend (last 7 days) - simple counts per date
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(formatDateYMD(d));
    }

    const trend = [];
    for (const d of days) {
      const arr = await Attendance.find({ date: d });
      const presentCount = arr.filter(a => a.status === 'present' || a.status === 'late').length;
      trend.push({ date: d, present: presentCount, totalRecorded: arr.length });
    }

    // department wise counts
    const deptAgg = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          present: {
            $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        totalEmployees,
        todays: { present, absent, late },
        weeklyTrend: trend,
        departmentWise: deptAgg
      }
    });
  } catch (error) {
    console.error('TeamSummary error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching team summary' });
  }
};

// GET /api/attendance/export?start=YYYY-MM-DD&end=YYYY-MM-DD&employeeId=EMP2002
const exportCSV = async (req, res) => {
  try {
    const { start, end, employeeId, userId } = req.query;
    const filter = {};

    if (employeeId) {
      const u = await User.findOne({ employeeId });
      if (!u) return res.status(404).json({ success: false, message: 'Employee not found for export' });
      filter.userId = u._id;
    }
    if (userId) filter.userId = userId;
    if (start && end) {
      // date stored as YYYY-MM-DD strings
      filter.date = { $gte: start, $lte: end };
    } else if (start) {
      filter.date = { $gte: start };
    } else if (end) {
      filter.date = { $lte: end };
    }

    const rows = await Attendance.find(filter).populate('userId', 'name email employeeId department').sort({ date: 1 });

    // build CSV
    const data = rows.map(r => ({
      date: r.date,
      employeeId: r.userId ? r.userId.employeeId : '',
      name: r.userId ? r.userId.name : '',
      email: r.userId ? r.userId.email : '',
      department: r.userId ? r.userId.department : '',
      checkInTime: r.checkInTime ? new Date(r.checkInTime).toISOString() : '',
      checkOutTime: r.checkOutTime ? new Date(r.checkOutTime).toISOString() : '',
      status: r.status,
      totalHours: r.totalHours || 0
    }));

    const fields = ['date', 'employeeId', 'name', 'email', 'department', 'checkInTime', 'checkOutTime', 'status', 'totalHours'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const filename = `attendance_export_${Date.now()}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.send(csv);
  } catch (error) {
    console.error('ExportCSV error:', error);
    return res.status(500).json({ success: false, message: 'Server error exporting CSV' });
  }
};

// GET /api/attendance/today-status  => who is present today
const todayTeamStatus = async (req, res) => {
  try {
    const today = formatDateYMD();
    const arr = await Attendance.find({ date: today }).populate('userId', 'name email employeeId department');
    const present = arr.filter(a => ['present', 'late'].includes(a.status)).map(a => ({
      userId: a.userId._id,
      name: a.userId.name,
      employeeId: a.userId.employeeId,
      checkInTime: a.checkInTime,
      status: a.status
    }));

    // absent employees calculation: all employees not in arr
    const presentUserIds = arr.map(a => a.userId._id.toString());
    const allEmployees = await User.find({ role: 'employee' }).select('name employeeId _id');
    const absent = allEmployees.filter(e => !presentUserIds.includes(e._id.toString())).map(e => ({ userId: e._id, name: e.name, employeeId: e.employeeId }));

    return res.json({
      success: true,
      data: {
        present,
        absent
      }
    });
  } catch (error) {
    console.error('TodayTeamStatus error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching today team status' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  myHistory,
  mySummary,
  todayStatus,
  // manager
  getAll,
  getEmployee,
  teamSummary,
  exportCSV,
  todayTeamStatus
};
