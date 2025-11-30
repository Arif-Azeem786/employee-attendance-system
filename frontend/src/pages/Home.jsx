import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
<div className="p-4 bg-[#10b981] text-black"></div>

      {/* hero header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <div className="text-white font-bold text-lg">Employee Attendance System</div>
        <nav className="flex gap-4 items-center">
          <Link to="/" className="text-gray-200 hover:text-white">Home</Link>
          <Link to="/about" className="text-gray-200 hover:text-white">About</Link>
          <Link to="/login" className="text-white bg-brand px-4 py-2 rounded-md shadow-sm">Sign In</Link>
        </nav>
      </header>

      <main className="flex-1 flex items-start">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-12 w-full">
          {/* left hero content */}
          <div className="md:col-span-7">
            <div className="hero-wrap p-8 rounded-xl">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[0.95] text-white">
                Simple, reliable <span className="text-brand">attendance</span><br/> for every team.
              </h1>

              <p className="mt-6 text-gray-300 max-w-xl">
                Mark Check-In and Check-Out, view history and monthly summaries, and let managers export attendance reports as CSV — all in one lightweight app.
              </p>

              <div className="mt-8 flex gap-4">
                <Link to="/login" className="bg-brand hover:bg-brand-dark text-black font-semibold px-6 py-3 rounded-full shadow-lg">
                  Try Demo (Sign In)
                </Link>
                <Link to="/about" className="text-gray-300 px-4 py-3 rounded-md border border-gray-700 hover:border-gray-500">
                  About this project
                </Link>
              </div>
            </div>

            {/* product feature cards / stats */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card">
                <div className="text-2xl font-bold">Check In / Check Out</div>
                <div className="text-sm text-gray-300 mt-2">Quick, timestamped attendance marking with late/half-day rules.</div>
              </div>

              <div className="card">
                <div className="text-2xl font-bold">History & Summary</div>
                <div className="text-sm text-gray-300 mt-2">Per-user history, monthly summary and last-7-days overview.</div>
              </div>

              <div className="card">
                <div className="text-2xl font-bold">Manager Reports</div>
                <div className="text-sm text-gray-300 mt-2">Team dashboard, filters and CSV export for easy reporting.</div>
              </div>
            </div>
          </div>

          {/* right - demo credentials and quick links */}
          <aside className="md:col-span-5 hidden md:block">
            <div className="card h-full flex flex-col justify-center items-start p-8 space-y-4">
              <h3 className="text-xl font-semibold">Demo Access (seeded)</h3>
              <div className="text-sm text-gray-300">Use these sample accounts to explore Employee and Manager flows.</div>

              <div className="w-full bg-black/20 border border-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-400">Manager account</div>
                <div className="text-sm font-medium">email: manager@example.com</div>
                <div className="text-sm font-medium">password: password123</div>

                <div className="mt-3 text-xs text-gray-400">Employee account</div>
                <div className="text-sm font-medium">email: employee1@example.com</div>
                <div className="text-sm font-medium">password: password123</div>
              </div>

              <div className="w-full mt-3 flex gap-2">
                <Link to="/manager/dashboard" className="w-1/2 text-center bg-gray-700/40 hover:bg-gray-700 text-white px-3 py-2 rounded">Manager Demo</Link>
                <Link to="/employee/dashboard" className="w-1/2 text-center bg-gray-700/40 hover:bg-gray-700 text-white px-3 py-2 rounded">Employee Demo</Link>
              </div>

              <div className="text-xs text-gray-400 mt-2">Notes: Seeded users are created by running the seed script in the backend. See README for setup instructions.</div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">
        Employee Attendance System — Project by Arif — Final Year B.Tech
      </footer>
    </div>
  );
}
