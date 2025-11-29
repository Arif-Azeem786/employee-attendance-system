import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function EmployeeCalendar() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [records, setRecords] = useState([]); // attendance items for the month
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get(`/api/attendance/my-history?month=${month}&limit=500`);
      setRecords(res.data.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // build a map by date
  const mapByDate = {};
  records.forEach(r => { mapByDate[r.date] = r; });

  // generate days in month
  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate(); // mon is 1-index
  const firstDay = new Date(year, mon - 1, 1).getDay(); // 0..6

  const cellFor = (d) => {
    const dateStr = `${year}-${String(mon).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const rec = mapByDate[dateStr];
    // color coding
    let color = '#fff';
    if (!rec) color = '#f8d7da'; // absent - red-ish
    else if (rec.status === 'present') color = '#d4edda'; // green
    else if (rec.status === 'late') color = '#fff3cd'; // yellow
    else if (rec.status === 'half-day') color = '#ffe5b4'; // orange
    return { rec, color, dateStr };
  };

  const handleClickDate = (d) => {
    const { rec, dateStr } = cellFor(d);
    setSelectedDate(dateStr);
    setSelectedRow(rec || null);
  };

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', fontFamily: 'Arial' }}>
      <h2>Attendance Calendar</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Choose month: </label>
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => <div key={h} style={{ fontWeight: 'bold', textAlign:'center' }}>{h}</div>)}
        {/* empty cells before first day */}
        {Array.from({length: firstDay}).map((_,i) => <div key={'e'+i}></div>)}
        {Array.from({length: daysInMonth}).map((_, idx) => {
          const d = idx + 1;
          const { color, dateStr } = cellFor(d);
          return (
            <div key={d}
              onClick={()=>handleClickDate(d)}
              style={{ padding: 10, borderRadius: 6, background: color, cursor: 'pointer', minHeight: 60 }}>
              <div style={{ fontWeight: 'bold' }}>{d}</div>
              <div style={{ fontSize:12, color:'#333' }}>{mapByDate[dateStr]?.status || 'absent'}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h3>Details for {selectedDate || '—'}</h3>
        {selectedRow ? (
          <div>
            <p><b>Status:</b> {selectedRow.status}</p>
            <p><b>Check In:</b> {selectedRow.checkInTime ? new Date(selectedRow.checkInTime).toLocaleString() : '--'}</p>
            <p><b>Check Out:</b> {selectedRow.checkOutTime ? new Date(selectedRow.checkOutTime).toLocaleString() : '--'}</p>
            <p><b>Total Hours:</b> {selectedRow.totalHours || 0}</p>
          </div>
        ) : (
          <p>No record for this date (Absent)</p>
        )}
      </div>
    </div>
  );
}
