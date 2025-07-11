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

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const FINANCIAL_YEARS = ["21-22", "22-23", "23-24", "24-25", "25-26"];
const NGO_NAMES = ["IndiaSudar", "OSSAT", "Diyaghar", "Sapno ke"];
const PHASES = ["Phase 1", "Phase 2", "Phase 3"];
const PROJECTS = [
  "Infrastructure",
  "Painting",
  "Toilet construction",
  "Notebook distribution",
];
const STATUSES = ["Not started", "In Progress", "Completed"];

type CSREvent = {
  financialYear: string;
  ngoName: string;
  phase: string;
  project: string;
  location: string;
  startDate: string;
  endDate: string;
  inaugurationDate: string;
  participants: number;
  totalCost: number;
  googleLocation: string;
  status: string;
};

const CSRPage: React.FC = () => {
  const [form, setForm] = useState<CSREvent>({
    financialYear: "25-26",
    ngoName: NGO_NAMES[0],
    phase: PHASES[0],
    project: PROJECTS[0],
    location: "",
    startDate: "",
    endDate: "",
    inaugurationDate: "",
    participants: 0,
    totalCost: 0,
    googleLocation: "",
    status: STATUSES[0],
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showInaugDatePicker, setShowInaugDatePicker] = useState(false);
  const [events, setEvents] = useState<CSREvent[]>(() => {
    try {
      const saved = localStorage.getItem("csrEvents");
      if (!saved) return [];
      // Migrate old records to include new fields with defaults
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({
        financialYear: typeof e.financialYear === "string" ? e.financialYear : FINANCIAL_YEARS[0],
        ngoName: typeof e.ngoName === "string" ? e.ngoName : NGO_NAMES[0],
        phase: e.phase || PHASES[0],
        project: e.project || PROJECTS[0],
        location: e.location || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        inaugurationDate: e.inaugurationDate || "",
        participants: typeof e.participants === "number" ? e.participants : 0,
        totalCost: typeof e.totalCost === "number" ? e.totalCost : 0,
        googleLocation: typeof e.googleLocation === "string" ? e.googleLocation : "",
        status: typeof e.status === "string" ? e.status : STATUSES[0],
      }));
    } catch {
      return [];
    }
  });

  // For editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CSREvent | null>(null);

  // For delete confirmation
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // Filters
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterNGO, setFilterNGO] = useState<string>("all");

  useEffect(() => {
    localStorage.setItem("csrEvents", JSON.stringify(events));
  }, [events]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "participants" || name === "totalCost" ? Number(value) : value,
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
            [name]: name === "participants" || name === "totalCost" ? Number(value) : value,
          }
        : null
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setEvents((prev) => [...prev, form]);
    setForm({
      financialYear: "25-26",
      ngoName: NGO_NAMES[0],
      phase: PHASES[0],
      project: PROJECTS[0],
      location: "",
      startDate: "",
      endDate: "",
      inaugurationDate: "",
      participants: 0,
      totalCost: 0,
      googleLocation: "",
      status: STATUSES[0],
    });
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditForm({ ...events[idx] });
  };

  const handleEditSave = (idx: number) => {
    if (!editForm) return;
    setEvents((prev) =>
      prev.map((e, i) => (i === idx ? editForm : e))
    );
    setEditIdx(null);
    setEditForm(null);
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditForm(null);
  };

  const handleDelete = (idx: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) {
      setEditIdx(null);
      setEditForm(null);
    }
    setDeleteIdx(null);
  };

  const navigate = useNavigate();

  // Filtering logic
  const filteredEvents = events.filter(e =>
    (filterYear === "all" || e.financialYear === filterYear) &&
    (filterNGO === "all" || e.ngoName === filterNGO)
  );

  // Prevent future dates
  const maxDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col items-center min-h-screen pt-16 bg-gray-100 font-[Segoe UI]">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-0 border border-gray-200 flex-1 flex flex-col overflow-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">CSR Events</h2>
            <p className="text-sm text-gray-500">Corporate Social Responsibility - Event Management</p>
          </div>
          <Button
            variant="outline"
            className="ml-4"
            onClick={() => navigate("/")}
          >
            Back
          </Button>
        </div>
        <div className="p-8">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
          onSubmit={handleAdd}
        >
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Financial Year
            </label>
            <select
              name="financialYear"
              value={form.financialYear}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            >
              {FINANCIAL_YEARS.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              NGO Name
            </label>
            <select
              name="ngoName"
              value={form.ngoName}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            >
              {NGO_NAMES.map((ngo) => (
                <option key={ngo} value={ngo}>
                  {ngo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Phase
            </label>
            <select
              name="phase"
              value={form.phase}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Project
            </label>
            <select
              name="project"
              value={form.project}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Project Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Google Location (URL)
            </label>
            <input
              name="googleLocation"
              value={form.googleLocation}
              onChange={handleChange}
              type="text"
              placeholder="https://maps.google.com/..."
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Start Date
            </label>
            <div className="relative">
              <input
                type="text"
                name="startDate"
                value={form.startDate}
                readOnly
                onClick={() => setShowStartDatePicker((v) => !v)}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe cursor-pointer bg-white"
                required
                placeholder="Select date"
              />
              <button
                type="button"
                className="absolute right-2 top-2 bg-blue-100 text-blue-700 rounded p-1"
                onClick={() => setShowStartDatePicker((v) => !v)}
                tabIndex={-1}
                aria-label="Pick date"
              >
                📅
              </button>
              {showStartDatePicker && (
                <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg" style={{minWidth: "260px"}}>
                  <DayPicker
                    mode="single"
                    selected={form.startDate ? new Date(form.startDate) : undefined}
                    onDayClick={(date) => {
                      setForm((prev) => ({
                        ...prev,
                        startDate: formatDateInput(date),
                      }));
                      setShowStartDatePicker(false);
                    }}
                  />
                  <div className="text-xs text-gray-500 px-2 pb-2">Pick a date</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              End Date
            </label>
            <div className="relative">
              <input
                type="text"
                name="endDate"
                value={form.endDate}
                readOnly
                onClick={() => setShowEndDatePicker((v) => !v)}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe cursor-pointer bg-white"
                required
                placeholder="Select date"
              />
              <button
                type="button"
                className="absolute right-2 top-2 bg-blue-100 text-blue-700 rounded p-1"
                onClick={() => setShowEndDatePicker((v) => !v)}
                tabIndex={-1}
                aria-label="Pick date"
              >
                📅
              </button>
              {showEndDatePicker && (
                <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg" style={{minWidth: "260px"}}>
                  <DayPicker
                    mode="single"
                    selected={form.endDate ? new Date(form.endDate) : undefined}
                    onDayClick={(date) => {
                      setForm((prev) => ({
                        ...prev,
                        endDate: formatDateInput(date),
                      }));
                      setShowEndDatePicker(false);
                    }}
                  />
                  <div className="text-xs text-gray-500 px-2 pb-2">Pick a date</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Inauguration Date
            </label>
            <div className="relative">
              <input
                type="text"
                name="inaugurationDate"
                value={form.inaugurationDate}
                readOnly
                onClick={() => setShowInaugDatePicker((v) => !v)}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe cursor-pointer bg-white"
                required
                placeholder="Select date"
              />
              <button
                type="button"
                className="absolute right-2 top-2 bg-blue-100 text-blue-700 rounded p-1"
                onClick={() => setShowInaugDatePicker((v) => !v)}
                tabIndex={-1}
                aria-label="Pick date"
              >
                📅
              </button>
              {showInaugDatePicker && (
                <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-lg" style={{minWidth: "260px"}}>
                  <DayPicker
                    mode="single"
                    selected={form.inaugurationDate ? new Date(form.inaugurationDate) : undefined}
                    onDayClick={(date) => {
                      setForm((prev) => ({
                        ...prev,
                        inaugurationDate: formatDateInput(date),
                      }));
                      setShowInaugDatePicker(false);
                    }}
                  />
                  <div className="text-xs text-gray-500 px-2 pb-2">Pick a date</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Number of Participants
            </label>
            <input
              type="number"
              name="participants"
              value={form.participants}
              min={0}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Total Project Cost
            </label>
            <input
              type="number"
              name="totalCost"
              value={form.totalCost}
              min={0}
              step="0.01"
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Project Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition font-segoe"
              required
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md hover:scale-105 transition w-full font-segoe"
            >
              Add Event
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Filter by Financial Year
            </label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="all">All</option>
              {FINANCIAL_YEARS.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">
              Filter by NGO Name
            </label>
            <select
              value={filterNGO}
              onChange={e => setFilterNGO(e.target.value)}
              className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="all">All</option>
              {NGO_NAMES.map(ngo => (
                <option key={ngo} value={ngo}>{ngo}</option>
              ))}
            </select>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-blue-900">Event Records</h3>
        <div className="overflow-x-auto overflow-y-scroll max-h-[60vh]">
          <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <th className="p-3 border-b font-semibold text-blue-900">Financial Year</th>
                <th className="p-3 border-b font-semibold text-blue-900">NGO Name</th>
                <th className="p-3 border-b font-semibold text-blue-900">Phase</th>
                <th className="p-3 border-b font-semibold text-blue-900">Project</th>
                <th className="p-3 border-b font-semibold text-blue-900">Location</th>
                <th className="p-3 border-b font-semibold text-blue-900">Google Location</th>
                <th className="p-3 border-b font-semibold text-blue-900">Start Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">End Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">Inauguration Date</th>
                <th className="p-3 border-b font-semibold text-blue-900">Participants</th>
                <th className="p-3 border-b font-semibold text-blue-900">Total Cost</th>
                <th className="p-3 border-b font-semibold text-blue-900">Status</th>
                <th className="p-3 border-b font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-gray-500">
                    No event records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, idx) => {
                  const isEditing = editIdx === idx;
                  if (isEditing && editForm) {
                    return (
                      <tr key={idx} className="bg-yellow-50">
                        <td className="p-2 border-b">
                          <select
                            name="financialYear"
                            value={editForm.financialYear}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {FINANCIAL_YEARS.map(fy => (
                              <option key={fy} value={fy}>{fy}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <select
                            name="ngoName"
                            value={editForm.ngoName}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {NGO_NAMES.map(ngo => (
                              <option key={ngo} value={ngo}>{ngo}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <select
                            name="phase"
                            value={editForm.phase}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {PHASES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <select
                            name="project"
                            value={editForm.project}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {PROJECTS.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <input
                            name="location"
                            value={editForm.location}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            name="googleLocation"
                            value={editForm.googleLocation}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            type="date"
                            name="startDate"
                            value={editForm.startDate}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            type="date"
                            name="endDate"
                            value={editForm.endDate}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            type="date"
                            name="inaugurationDate"
                            value={editForm.inaugurationDate}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            type="number"
                            name="participants"
                            value={editForm.participants}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            type="number"
                            name="totalCost"
                            value={editForm.totalCost}
                            onChange={handleEditChange}
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="w-full"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <Button
                            size="sm"
                            variant="default"
                            className="mr-2"
                            onClick={() => handleEditSave(idx)}
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
                  // Normal display row
                  return (
                    <tr key={idx} className="bg-white even:bg-blue-50">
                      <td className="p-2 border-b">{event.financialYear}</td>
                      <td className="p-2 border-b">{event.ngoName}</td>
                      <td className="p-2 border-b">{event.phase}</td>
                      <td className="p-2 border-b">{event.project}</td>
                      <td className="p-2 border-b">{event.location}</td>
                      <td className="p-2 border-b">
                        {event.googleLocation ? (
                          <a
                            href={event.googleLocation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Map
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 border-b">{event.startDate}</td>
                      <td className="p-2 border-b">{event.endDate}</td>
                      <td className="p-2 border-b">{event.inaugurationDate}</td>
                      <td className="p-2 border-b">{event.participants}</td>
                      <td className="p-2 border-b">{event.totalCost}</td>
                      <td className="p-2 border-b">{event.status}</td>
                      <td className="p-2 border-b">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEdit(idx)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteIdx(idx)}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to delete this event?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setDeleteIdx(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(idx)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-blue-100 font-bold">
                <td className="p-2 border-t text-right" colSpan={10}>
                  Total Cost
                </td>
                <td className="p-2 border-t">
                  {filteredEvents.reduce((sum, e) => sum + (Number(e.totalCost) || 0), 0)}
                </td>
                <td className="p-2 border-t" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CSRPage;