// dashboardController.js
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const formatDateYMD = (d = new Date()) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const employeeDashboard = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDateYMD();

    const todayAtt = await Attendance.findOne({ userId: user._id, date: today });
    const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const monthly = await Attendance.find({ userId: user._id, date: { $regex: `^${month}` } });

    let present=0, absent=0, late=0, halfDay=0, totalHours=0;
    monthly.forEach(a => {
      if (a.status==='present') present++;
      else if (a.status==='late') late++;
      else if (a.status==='half-day') halfDay++;
      else if (a.status==='absent') absent++;
      totalHours += (a.totalHours || 0);
    });

    return res.json({
      success: true,
      data: {
        today: todayAtt || null,
        monthly: {
          present, absent, late, halfDay, totalHours: Math.round(totalHours*100)/100
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message:'Server error' });
  }
};

const managerDashboard = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const today = formatDateYMD();
    const todays = await Attendance.find({ date: today }).populate('userId', 'name employeeId department');
    const present = todays.filter(t => ['present','late'].includes(t.status)).length;
    const late = todays.filter(t => t.status === 'late').length;
    const absent = Math.max(0, totalEmployees - present);

    // weekly trend (last 7 days) - counts per day
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(formatDateYMD(d));
    }

    const trend = [];
    for (const d of days) {
      const arr = await Attendance.find({ date: d });
      const presentCount = arr.filter(a => ['present','late'].includes(a.status)).length;
      trend.push({ date: d, present: presentCount, recorded: arr.length });
    }

    // department-wise (aggregation)
    const deptAgg = await Attendance.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: '$user.department', present: { $sum: { $cond: [{ $in: ['$status', ['present','late']] }, 1, 0] } }, total: { $sum: 1 } } }
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message:'Server error' });
  }
};

module.exports = { employeeDashboard, managerDashboard };
