import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type AttendanceRecord = {
  date: string;
  checkIn: string;
  checkOut: string;
  totalTime: string;
  status: "Present" | "Absent" | "WFH";
  // notes: string; // Removed notes field
};

function formatDateInput(date: Date) {
  // Use local time, not UTC, to avoid off-by-one errors
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function calculateTotalTime(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return "";
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  let start = new Date(0, 0, 0, inH, inM);
  let end = new Date(0, 0, 0, outH, outM);
  let diff = (end.getTime() - start.getTime()) / 1000 / 60; // minutes
  if (diff < 0) diff += 24 * 60; // handle overnight
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);
  return `${hours}h ${minutes}m`;
}

function getMonthYear(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthOptions(records: AttendanceRecord[]) {
  const months = new Set(records.map(r => getMonthYear(r.date)));
  return Array.from(months).sort().reverse();
}

function sumTotalMinutes(records: AttendanceRecord[]) {
  let total = 0;
  for (const r of records) {
    if (r.totalTime) {
      const match = r.totalTime.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        total += parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      }
    }
  }
  return total;
}

function formatMinutesToHhMm(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
}

const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("attendanceRecords");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState<"Present" | "Absent" | "WFH">("Present");
  // const [notes, setNotes] = useState(""); // Removed notes state
  const [today, setToday] = useState(() => {
    const d = new Date();
    return formatDateInput(d);
  });
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Present" | "Absent" | "WFH">("all");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (status === "Absent") {
      setCheckIn("");
      setCheckOut("");
    }
  }, [status]);

  const alreadyMarked = records.some(r => r.date === today);

  const totalTime = calculateTotalTime(checkIn, checkOut);

  const monthOptions = getMonthOptions(records.length > 0 ? records : [{ date: today, checkIn: "", checkOut: "", totalTime: "", status: "Present" }]);

  const filteredRecords = records.filter(r =>
    (selectedMonth === "all" || getMonthYear(r.date) === selectedMonth) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

  const totalMinutes = sumTotalMinutes(filteredRecords);
  const totalTimeFormatted = formatMinutesToHhMm(totalMinutes);

  // Prevent future dates
  const maxDate = formatDateInput(new Date());

  const handleDelete = (idx: number) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
    setDeleteIdx(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <div className="w-full max-w-full bg-white/90 rounded-2xl shadow-2xl p-0 border border-border min-h-[80vh] overflow-hidden flex flex-col">
        {/* Header bar */}
        <div className="flex items-center px-6 py-4 bg-gradient-to-r from-blue-700 to-cyan-500">
          <Button
            variant="outline"
            className="mr-4"
            onClick={() => navigate("/")}
          >
            Back
          </Button>
          <h2 className="text-2xl font-extrabold flex-1 text-center text-white drop-shadow tracking-tight">
            Daily Attendance
          </h2>
        </div>
        <div className="flex-1 overflow-auto m-0 p-0">
        <form className="mb-8" onSubmit={e => {
          e.preventDefault();
          if (alreadyMarked) return;
          setRecords(prev => [
            { date: today, checkIn, checkOut, totalTime, status },
            ...prev,
          ]);
          // setNotes(""); // removed
          setStatus("Present");
          setCheckIn("");
          setCheckOut("");
          setToday(formatDateInput(new Date()));
        }}>
          <div className="mb-4 flex flex-wrap gap-4">
            {/* First line: Date and Status */}
            <div className="flex-1 min-w-[220px]">
              <label className="block font-semibold mb-1 text-blue-900">
                Date
              </label>
              <div className="flex gap-2 items-center relative">
                <input
                  id="attendance-date"
                  type="text"
                  className="w-full border rounded px-3 py-2 font-segoe"
                  value={today}
                  onChange={e => setToday(e.target.value)}
                  readOnly
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setShowDatePicker(v => !v)}
                >
                  📅
                </Button>
                {showDatePicker && (
                  <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={today ? new Date(today) : undefined}
                      onDayClick={date => {
                        const selected = formatDateInput(date);
                        if (selected <= maxDate) setToday(selected);
                        setShowDatePicker(false);
                      }}
                      disabled={date => date > new Date()}
                    />
                    <div className="text-xs text-gray-500 px-2 pb-2">No future dates allowed</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block font-semibold mb-1 text-blue-900">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as "Present" | "Absent" | "WFH")}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 font-segoe"
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="WFH">WFH</option>
              </select>
            </div>
          </div>
          {/* Second line: Check In, Check Out, Total Time */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block font-semibold mb-1 text-blue-900">
                Check In Time
              </label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckIn(getCurrentTime())}
                  disabled={status === "Absent"}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckIn("09:00")}
                  disabled={status === "Absent"}
                >
                  9:00 AM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckIn("")}
                  disabled={status === "Absent"}
                >
                  Clear
                </Button>
                <select
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 font-segoe"
                  required={status === "Present"}
                  disabled={status === "Absent"}
                >
                  <option value="">Select</option>
                  {Array.from({ length: 24 * 4 }, (_, i) => {
                    const h = String(Math.floor(i / 4)).padStart(2, "0");
                    const m = String((i % 4) * 15).padStart(2, "0");
                    return (
                      <option key={h + m} value={`${h}:${m}`}>{`${h}:${m}`}</option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block font-semibold mb-1 text-blue-900">
                Check Out Time
              </label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckOut(getCurrentTime())}
                  disabled={status === "Absent"}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckOut("18:00")}
                  disabled={status === "Absent"}
                >
                  6:00 PM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() => setCheckOut("")}
                  disabled={status === "Absent"}
                >
                  Clear
                </Button>
                <select
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 font-segoe"
                  required={status === "Present"}
                  disabled={status === "Absent"}
                >
                  <option value="">Select</option>
                  {Array.from({ length: 24 * 4 }, (_, i) => {
                    const h = String(Math.floor(i / 4)).padStart(2, "0");
                    const m = String((i % 4) * 15).padStart(2, "0");
                    return (
                      <option key={h + m} value={`${h}:${m}`}>{`${h}:${m}`}</option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block font-semibold mb-1 text-blue-900">
                Total Time
              </label>
              <input
                type="text"
                value={totalTime}
                readOnly
                className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-gray-100 font-segoe"
                placeholder="Total time will be calculated"
              />
            </div>
          </div>
          {/* Notes (optional) field fully removed */}
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md hover:scale-105 transition w-full font-segoe"
            disabled={alreadyMarked}
          >
            {alreadyMarked ? "Already Marked" : "Mark Attendance"}
          </Button>
        </form>
        <div className="mb-6 flex gap-4 items-center">
          <label className="font-semibold text-blue-900">Month:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
          >
            <option value="all">All</option>
            {monthOptions.map(month => (
              <option key={month} value={month}>
                {new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
          <label className="font-semibold text-blue-900">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as "all" | "Present" | "Absent" | "WFH")}
            className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
          >
            <option value="all">All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="WFH">WFH</option>
          </select>
        </div>
        <h3 className="text-xl font-bold mb-4 text-blue-900">Attendance Records</h3>
        <AttendanceRecordsTable
          records={records}
          selectedMonth={selectedMonth}
          statusFilter={statusFilter}
          handleDelete={handleDelete}
          deleteIdx={deleteIdx}
          setDeleteIdx={setDeleteIdx}
          totalTimeFormatted={totalTimeFormatted}
        />
        </div>
      </div>
    </div>
  );
};

/**
 * AttendanceRecordsTable: paginated, shows 1 week at a time by default
 */
const AttendanceRecordsTable: React.FC<{
  records: AttendanceRecord[];
  selectedMonth: string;
  statusFilter: "all" | "Present" | "Absent" | "WFH";
  handleDelete: (idx: number) => void;
  deleteIdx: number | null;
  setDeleteIdx: React.Dispatch<React.SetStateAction<number | null>>;
  totalTimeFormatted: string;
}> = ({
  records,
  selectedMonth,
  statusFilter,
  handleDelete,
  deleteIdx,
  setDeleteIdx,
  totalTimeFormatted,
}) => {
  // Filter records by month and status
  const filteredRecords = records.filter(r =>
    (selectedMonth === "all" || getMonthYear(r.date) === selectedMonth) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

  // Helper to get week start (Sunday) for a date
  function getWeekStart(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  // Get all unique week starts in filtered records
  const weekStartSet = new Set<string>();
  filteredRecords.forEach(r => {
    const ws = getWeekStart(new Date(r.date));
    weekStartSet.add(ws.toISOString().slice(0, 10));
  });
  const weekStartList = Array.from(weekStartSet)
    .sort((a, b) => b.localeCompare(a)); // latest week first

  const [weekIndex, setWeekIndex] = React.useState(0);

  // Reset weekIndex to 0 when filters change
  React.useEffect(() => {
    setWeekIndex(0);
  }, [selectedMonth, statusFilter, records.length]);

  // Get the week start for the current page
  const currentWeekStartStr = weekStartList[weekIndex] || "";
  const currentWeekStart = currentWeekStartStr ? new Date(currentWeekStartStr) : null;

  // Get the 7 days for this week
  const weekDates: string[] = [];
  if (currentWeekStart) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      weekDates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }
  }

  // Filter records for this week, sorted descending by date
  const weekRecords = weekDates
    .map(date => filteredRecords.find(r => r.date === date) || null)
    .filter(Boolean) as AttendanceRecord[];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow font-segoe">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
            <th className="p-3 border-b font-semibold text-blue-900 text-left">Date</th>
            <th className="p-3 border-b font-semibold text-blue-900 text-left">Status</th>
            <th className="p-3 border-b font-semibold text-blue-900 text-left">Check In</th>
            <th className="p-3 border-b font-semibold text-blue-900 text-left">Check Out</th>
            <th className="p-3 border-b font-semibold text-blue-900 text-left">Total Time</th>
            <th className="p-3 border-b font-semibold text-blue-900 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {weekRecords.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-500 py-4">
                No attendance records for this week.
              </td>
            </tr>
          ) : (
            weekRecords.map((r, idx) => (
              <tr key={r.date} className="hover:bg-blue-50 transition">
                <td className="p-3 border-b">{r.date}</td>
                <td className="p-3 border-b">{r.status}</td>
                <td className="p-3 border-b">{r.checkIn}</td>
                <td className="p-3 border-b">{r.checkOut}</td>
                <td className="p-3 border-b">{r.totalTime}</td>
                <td className="p-3 border-b">
                  <AlertDialog open={deleteIdx === idx} onOpenChange={open => setDeleteIdx(open ? idx : null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-red-600 text-white px-3 py-1"
                        type="button"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this attendance record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(records.findIndex(rec => rec.date === r.date))}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right font-bold p-3 border-t border-blue-200">
              Total:
            </td>
            <td className="font-bold p-3 border-t border-blue-200">
              {totalTimeFormatted}
            </td>
            <td className="border-t border-blue-200"></td>
            <td className="border-t border-blue-200"></td>
          </tr>
        </tfoot>
      </table>
      <div className="flex justify-between items-center mt-2">
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1"
          onClick={() => setWeekIndex(i => Math.min(i + 1, weekStartList.length - 1))}
          disabled={weekIndex >= weekStartList.length - 1}
        >
          Previous Week
        </Button>
        <span className="text-sm text-gray-700">
          {weekDates[0] || ""} to {weekDates[6] || ""}
        </span>
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1"
          onClick={() => setWeekIndex(i => Math.max(i - 1, 0))}
          disabled={weekIndex <= 0}
        >
          Next Week
        </Button>
      </div>
    </div>
  );
};

export default AttendancePage;