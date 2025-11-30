import React from "react";
import { Link } from "react-router-dom";
import { FaUsersCog, FaUserClock, FaFileCsv, FaCode, FaDatabase, FaCheckCircle } from "react-icons/fa";

export default function About() {
  return (
    <div className="min-h-screen py-10 px-4 text-gray-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">About — Employee Attendance System</h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            A complete MERN-based attendance management solution built for the 
            Tap Academy evaluation — secure, fast, and easy to use for both employees 
            and managers.
          </p>
        </div>

        {/* Overview Card */}
        <div className="bg-gray-900/60 p-6 rounded-xl shadow-md border border-gray-700 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-[#10b981]">📌 Project Overview</h2>
          <p className="text-gray-300 leading-relaxed">
            This system allows employees to mark daily attendance, view their monthly 
            reports, and track their summary, while managers gain full visibility 
            into team attendance, late arrivals, absentees, and CSV exports.
          </p>
        </div>

        {/* Highlights */}
        <h2 className="text-xl font-semibold mb-4 text-[#10b981]">✨ Key Features</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <FeatureCard 
            icon={<FaUserClock size={26} />} 
            title="Employee Panel"
            items={[
              "Daily Check-in / Check-out",
              "Monthly summary",
              "Attendance history",
              "Calendar-based view",
              "Last 7 days report",
            ]}
          />

          <FeatureCard 
            icon={<FaUsersCog size={26} />} 
            title="Manager Panel"
            items={[
              "Team attendance dashboard",
              "Filter by employee/date/status",
              "Late arrivals list",
              "Absent list",
              "Weekly trend chart",
            ]}
          />

          <FeatureCard 
            icon={<FaFileCsv size={26} />} 
            title="Reports & Export"
            items={[
              "Preview attendance data",
              "Date range filter",
              "Employee-wise export",
              "CSV file download",
              "Clean formatted records",
            ]}
          />

          <FeatureCard 
            icon={<FaCode size={26} />} 
            title="Tech Stack"
            items={[
              "React + Redux (Frontend)",
              "Node.js + Express (Backend)",
              "MongoDB (Database)",
              "JWT Authentication",
              "Tailwind CSS + Chart.js",
            ]}
          />
        </div>

        {/* API Table */}
        <h2 className="text-xl font-semibold mb-4 text-[#10b981]">🔗 API Endpoints</h2>

        <div className="overflow-auto mb-10">
          <table className="w-full text-left bg-gray-900/50 rounded-xl border border-gray-700">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {[
                ["/api/auth/register", "Register employee / manager"],
                ["/api/auth/login", "Login user"],
                ["/api/attendance/checkin", "Employee check-in"],
                ["/api/attendance/checkout", "Employee check-out"],
                ["/api/attendance/my-summary", "Employee monthly summary"],
                ["/api/attendance/all", "Manager team attendance"],
                ["/api/attendance/export", "Manager CSV export"],
              ].map(([ep, desc]) => (
                <tr key={ep} className="border-t border-gray-700">
                  <td className="py-3 px-4">{ep}</td>
                  <td className="py-3 px-4">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Setup Instructions */}
        <h2 className="text-xl font-semibold mb-4 text-[#10b981]">⚙️ Setup Instructions</h2>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div>
            <h3 className="font-semibold text-lg mb-2">Backend</h3>
            <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
cd backend
npm install
npm run dev
            </pre>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Frontend</h3>
            <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
cd frontend
npm install
npm run dev
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between">
          <Link
            to="/"
            className="px-4 py-2 bg-[#10b981] text-black rounded-lg font-semibold hover:bg-[#0e9c6b]"
          >
            ⬅ Back to Home
          </Link>

          <div className="text-gray-500 text-sm">
            Developed by <span className="text-gray-300 font-medium">Arif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, items }) {
  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center gap-3 mb-3 text-[#10b981]">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <ul className="text-gray-400 text-sm space-y-1">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <FaCheckCircle size={12} className="text-green-500" /> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
