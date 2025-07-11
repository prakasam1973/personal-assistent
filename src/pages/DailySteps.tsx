import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type StepRecord = {
  date: string;
  steps: number;
};

function formatDateInput(date: Date) {
  // Use local time, not UTC, to avoid off-by-one errors
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DailySteps: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<StepRecord[]>(() => {
    try {
      const saved = localStorage.getItem("dailySteps");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [today, setToday] = useState(() => formatDateInput(new Date()));
  const [steps, setSteps] = useState<number | "">("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Trend period: week, month, year
  const [trendPeriod, setTrendPeriod] = useState<"week" | "month" | "year">("year");
  const [showTrendGraph, setShowTrendGraph] = useState(true);

  useEffect(() => {
    localStorage.setItem("dailySteps", JSON.stringify(records));
  }, [records]);

  const alreadyMarked = records.some(r => r.date === today);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyMarked || steps === "" || steps < 0) return;
    setRecords(prev => [
      { date: today, steps: Number(steps) },
      ...prev,
    ]);
    setSteps("");
  };

  const handleDelete = (idx: number) => {
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };

  // Prevent future dates
  const maxDate = formatDateInput(new Date());

  // Helper: get start of week/month/year for a date
  function getPeriodStart(date: Date, period: "week" | "month" | "year") {
    if (period === "week") {
      const d = new Date(date);
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === "month") {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    if (period === "year") {
      return new Date(date.getFullYear(), 0, 1);
    }
    return date;
  }

  // Filter records for the selected period
  const now = new Date();
  const periodStart = getPeriodStart(now, trendPeriod);
  const filteredTrendRecords = records.filter(r => {
    const d = new Date(r.date);
    return d >= periodStart && d <= now;
  });

  // Cumulative steps for the period
  const cumulativeSteps = filteredTrendRecords.reduce((sum, r) => sum + r.steps, 0);

  // For trend table: group by day (week), by week (month), by month (year)
  let trendTable: { label: string; steps: number }[] = [];
  if (trendPeriod === "week") {
    // Show each day of this week
    for (let i = 0; i < 7; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      const dateStr = formatDateInput(d);
      const rec = records.find(r => r.date === dateStr);
      trendTable.push({
        label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        steps: rec ? rec.steps : 0,
      });
    }
  } else if (trendPeriod === "month") {
    // Show each week of this month
    const weeks: { [week: string]: number } = {};
    records.forEach(r => {
      const d = new Date(r.date);
      if (d >= periodStart && d <= now) {
        // Week number in month
        const weekNum = Math.floor((d.getDate() - 1) / 7) + 1;
        const label = `Week ${weekNum}`;
        weeks[label] = (weeks[label] || 0) + r.steps;
      }
    });
    trendTable = Object.entries(weeks).map(([label, steps]) => ({ label, steps }));
  } else if (trendPeriod === "year") {
    // Show each month of this year
    const months: { [month: string]: number } = {};
    records.forEach(r => {
      const d = new Date(r.date);
      if (d >= periodStart && d <= now) {
        const label = d.toLocaleDateString(undefined, { month: "short" });
        months[label] = (months[label] || 0) + r.steps;
      }
    });
    trendTable = Object.entries(months).map(([label, steps]) => ({ label, steps }));
  }

  return (
    <div className="flex flex-col h-screen py-0 bg-gradient-to-br from-blue-100 via-cyan-100 to-pink-100">
      <div className="w-full h-full min-h-screen bg-white/90 rounded-2xl shadow-2xl p-0 border border-border flex flex-col relative">
        <button
          onClick={() => { navigate("/"); window.location.href = "/"; }}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-pink-600 text-2xl font-bold bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow transition"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex items-center justify-center px-4 py-4 bg-gradient-to-r from-blue-400 to-pink-300">
          <h2 className="text-2xl font-extrabold text-white drop-shadow tracking-tight">Track My Daily Steps</h2>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {/* Collapsible: Trend Section */}
          <details className="mb-2" open={false} style={{ maxHeight: 400, overflowY: "auto" }}>
            <summary className="cursor-pointer font-semibold text-blue-900 mb-2">Show Trends</summary>
            {/* Trend period selector */}
            <div className="mb-2 flex flex-wrap gap-2 items-center justify-between">
              <div>
                <label className="font-semibold text-blue-900 mr-2">Trend:</label>
                <select
                  value={trendPeriod}
                  onChange={e => setTrendPeriod(e.target.value as "week" | "month" | "year")}
                  className="border border-blue-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-300 transition"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="font-semibold text-blue-900 text-sm">
                Cumulative Steps: <span className="text-pink-700 font-bold">{cumulativeSteps}</span>
              </div>
            </div>
            {/* Trend graph toggle */}
            <div className="mb-2 flex items-center">
              <Button
                type="button"
                variant="outline"
                className="mr-2 px-2 py-1"
                onClick={() => setShowTrendGraph(v => !v)}
              >
                {showTrendGraph ? "Hide Trend Graph" : "Show Trend Graph"}
              </Button>
              <span className="text-xs text-gray-500">
                View your {trendPeriod} step trend as a graph
              </span>
            </div>
            {/* Trend graph */}
            {showTrendGraph && (
              <div className="mb-2 bg-white rounded-xl shadow p-2" style={{ maxHeight: 200 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendTable}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="steps" stroke="#ec4899" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Trend table */}
            <div className="mb-2" style={{ maxHeight: 180, overflowY: "auto" }}>
              <h3 className="text-base font-bold mb-1 text-blue-900">Trend ({trendPeriod.charAt(0).toUpperCase() + trendPeriod.slice(1)})</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-pink-100">
                      <th className="p-2 border-b font-semibold text-blue-900">{trendPeriod === "week" ? "Day" : trendPeriod === "month" ? "Week" : "Month"}</th>
                      <th className="p-2 border-b font-semibold text-blue-900">Steps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendTable.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-gray-500 py-2">
                          No data for this period.
                        </td>
                      </tr>
                    ) : (
                      trendTable.map((row, idx) => (
                        <tr key={row.label + idx} className="hover:bg-blue-50 transition">
                          <td className="p-2 border-b">{row.label}</td>
                          <td className="p-2 border-b">{row.steps}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
          {/* Add Steps Form */}
          <form className="mb-4" onSubmit={handleAdd}>
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block font-semibold mb-1 text-blue-900">
                  Date
                </label>
                <div className="flex gap-2 items-center relative">
                  <input
                    id="steps-date"
                    type="text"
                    className="w-full border rounded px-3 py-2 bg-white"
                    value={today}
                    readOnly
                    required
                    onClick={() => setShowDatePicker(v => !v)}
                    placeholder="Select date"
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
                  Steps
                </label>
                <input
                  type="number"
                  min={0}
                  value={steps}
                  onChange={e => setSteps(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
                  placeholder="Enter steps"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-pink-400 text-white shadow-md hover:scale-105 transition"
              disabled={alreadyMarked}
            >
              {alreadyMarked ? "Already Marked" : "Add Steps"}
            </Button>
          </form>
          <details className="mb-4">
            <summary className="cursor-pointer text-xl font-bold mb-4 text-blue-900 select-none">
              Step Records
            </summary>
            <div className="overflow-x-auto overflow-y-auto mt-2" style={{ maxHeight: 300 }}>
              <StepRecordsTable
                records={records}
                handleDelete={handleDelete}
                handleEdit={(date, newSteps) => {
                  setRecords(prev => {
                    const idx = prev.findIndex(r => r.date === date);
                    if (idx !== -1) {
                      // Update existing record
                      return prev.map(r => r.date === date ? { ...r, steps: newSteps } : r);
                    } else {
                      // Add new record for this date
                      return [{ date, steps: newSteps }, ...prev];
                    }
                  });
                }}
              />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

/**
 * StepRecordsTable: paginated, shows 1 week at a time by default
 */
const StepRecordsTable: React.FC<{
  records: { date: string; steps: number }[];
  handleDelete: (idx: number) => void;
  handleEdit: (date: string, newSteps: number) => void;
}> = ({ records, handleDelete, handleEdit }) => {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [editDate, setEditDate] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<number | "">("");

  // Get the start of the current week (Sunday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  // Get the 7 days for this week
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDates.push(formatDateInput(d));
  }

  // Filter records for this week, sorted descending by date
  const weekRecords = weekDates
    .map(date => records.find(r => r.date === date) || { date, steps: 0 })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100 to-pink-100">
            <th className="p-3 border-b font-semibold text-blue-900">Date</th>
            <th className="p-3 border-b font-semibold text-blue-900">Steps</th>
            <th className="p-3 border-b font-semibold text-blue-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {weekRecords.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 py-4">
                No step records yet.
              </td>
            </tr>
          ) : (
            weekRecords.map((r, idx) => (
              <tr key={r.date} className="hover:bg-blue-50 transition">
                <td className="p-3 border-b">{r.date}</td>
                <td className="p-3 border-b">
                  {editDate === r.date ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value === "" ? "" : Number(e.target.value))}
                        className="border rounded px-2 py-1 w-20"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="px-2"
                        onClick={() => {
                          if (editValue !== "" && editValue >= 0) {
                            handleEdit(r.date, Number(editValue));
                            setEditDate(null);
                            setEditValue("");
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2"
                        onClick={() => {
                          setEditDate(null);
                          setEditValue("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    r.steps
                  )}
                </td>
                <td className="p-3 border-b">
                  <div className="flex gap-2">
                    <Button
                      className="bg-blue-600 text-white px-2 py-1"
                      type="button"
                      onClick={() => {
                        setEditDate(r.date);
                        setEditValue(r.steps);
                      }}
                    >
                      Edit
                    </Button>
                    {r.steps > 0 ? (
                      <Button
                        className="bg-red-600 text-white px-2 py-1"
                        type="button"
                        onClick={() => handleDelete(records.findIndex(rec => rec.date === r.date))}
                      >
                        Delete
                      </Button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-2">
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1"
          onClick={() => setWeekOffset(weekOffset - 1)}
        >
          Previous Week
        </Button>
        <span className="text-sm text-gray-700">
          {weekDates[0]} to {weekDates[6]}
        </span>
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1"
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 0}
        >
          Next Week
        </Button>
      </div>
    </div>
  );
};

export default DailySteps;