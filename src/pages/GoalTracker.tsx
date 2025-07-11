import "react-day-picker/dist/style.css";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type GoalType = "Daily" | "Weekly" | "Monthly";

interface Goal {
  id: string;
  type: GoalType;
  description: string;
  targetDate: string;
  status: "Pending" | "Completed";
}

const GOAL_TYPES: GoalType[] = ["Daily", "Weekly", "Monthly"];
const STATUS_OPTIONS = ["Pending", "Completed"];

import { useNavigate } from "react-router-dom";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const GoalTracker: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem("goals");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState<Omit<Goal, "id">>({
    type: "Daily",
    description: "",
    targetDate: "",
    status: "Pending",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Goal, "id"> | null>(null);
  const [filterType, setFilterType] = useState<GoalType | "All">("All");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...form,
      },
    ]);
    setForm({
      type: "Daily",
      description: "",
      targetDate: "",
      status: "Pending",
    });
  };

  const handleEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setEditId(id);
      setEditForm({
        type: goal.type,
        description: goal.description,
        targetDate: goal.targetDate,
        status: goal.status,
      });
    }
  };

  const handleEditSave = (id: string) => {
    if (!editForm) return;
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...editForm } : g))
    );
    setEditId(null);
    setEditForm(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (editId === id) {
      setEditId(null);
      setEditForm(null);
    }
  };

  const filteredGoals =
    filterType === "All"
      ? goals
      : goals.filter((g) => g.type === filterType);

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white/95 rounded-2xl shadow-2xl p-8 border border-border overflow-hidden relative z-50">
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            className="mr-4 font-segoe"
            onClick={() => navigate(-1)}
          >
            Close
          </Button>
          <h2 className="text-3xl font-extrabold flex-1 text-center text-green-800 font-segoe">
            Goal Tracker
          </h2>
        </div>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          onSubmit={handleAdd}
        >
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Goal Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
            >
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Target Date
            </label>
            <div className="relative" style={{overflow: "visible"}}>
              <div className="flex">
                <input
                  type="text"
                  name="targetDate"
                  value={form.targetDate}
                  readOnly
                  onClick={() => setShowDatePicker((v) => !v)}
                  className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition cursor-pointer bg-white"
                  required
                  placeholder="Select date"
                />
                <button
                  type="button"
                  className="ml-2 px-2 py-2 rounded bg-green-100 hover:bg-green-200 border border-green-200"
                  onClick={() => setShowDatePicker((v) => !v)}
                  tabIndex={-1}
                  aria-label="Pick date"
                >
                  📅
                </button>
              </div>
              {showDatePicker && (
                <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg" style={{minWidth: "260px"}}>
                  <DayPicker
                    mode="single"
                    selected={form.targetDate ? new Date(form.targetDate) : undefined}
                    onDayClick={(date) => {
                      setForm((prev) => ({
                        ...prev,
                        targetDate: formatDateInput(date),
                      }));
                      setShowDatePicker(false);
                    }}
                  />
                  <div className="text-xs text-gray-500 px-2 pb-2">Pick a date</div>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1 text-green-900">
              Description
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
              placeholder="Describe your goal"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
              required
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-blue-400 text-white shadow-md hover:scale-105 transition w-full"
            >
              Add Goal
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1 text-green-900">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as GoalType | "All")
              }
              className="border border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 transition"
            >
              <option value="All">All</option>
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-green-900">Goals</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                <th className="p-3 border-b font-semibold text-green-900">
                  Type
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Description
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Target Date
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Status
                </th>
                <th className="p-3 border-b font-semibold text-green-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No goals found.
                  </td>
                </tr>
              ) : (
                filteredGoals.map((goal) => {
                  const isEditing = editId === goal.id && editForm;
                  if (isEditing) {
                    return (
                      <tr key={goal.id} className="bg-yellow-50">
                        <td className="p-2 border-b">
                          <select
                            name="type"
                            value={editForm.type}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {GOAL_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <input
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <div className="relative" style={{overflow: "visible"}}>
                            <div className="flex">
                              <input
                                type="text"
                                name="targetDate"
                                value={editForm.targetDate}
                                readOnly
                                onClick={() => setShowEditDatePicker((v) => !v)}
                                className="w-full cursor-pointer bg-white"
                                placeholder="Select date"
                              />
                              <button
                                type="button"
                                className="ml-2 px-2 py-2 rounded bg-green-100 hover:bg-green-200 border border-green-200"
                                onClick={() => setShowEditDatePicker((v) => !v)}
                                tabIndex={-1}
                                aria-label="Pick date"
                              >
                                📅
                              </button>
                            </div>
                            {showEditDatePicker && (
                              <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg" style={{minWidth: "260px"}}>
                                <DayPicker
                                  mode="single"
                                  selected={editForm.targetDate ? new Date(editForm.targetDate) : undefined}
                                  onDayClick={(date) => {
                                    setEditForm((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            targetDate: formatDateInput(date),
                                          }
                                        : null
                                    );
                                    setShowEditDatePicker(false);
                                  }}
                                />
                                <div className="text-xs text-gray-500 px-2 pb-2">Pick a date</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2 border-b">
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <Button
                            size="sm"
                            variant="default"
                            className="mr-2"
                            onClick={() => handleEditSave(goal.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={goal.id} className="bg-white even:bg-green-50">
                      <td className="p-2 border-b">{goal.type}</td>
                      <td className="p-2 border-b">{goal.description}</td>
                      <td className="p-2 border-b">{goal.targetDate}</td>
                      <td className="p-2 border-b">{goal.status}</td>
                      <td className="p-2 border-b">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEdit(goal.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(goal.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;