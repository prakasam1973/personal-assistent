import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

type TableData = (string | number)[][];
type ModifiedCells = Set<string>;
type ColWidths = number[];

const DEFAULT_COL_WIDTH = 180;

const ExcelUploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tableData, setTableData] = useState<TableData>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [fsApiSupported, setFsApiSupported] = useState<boolean>(!!(window as any).showOpenFilePicker);
  const [modifiedCells, setModifiedCells] = useState<ModifiedCells>(new Set());
  const [colWidths, setColWidths] = useState<ColWidths>([]);

  // For resizing columns
  const resizingCol = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  // File System Access API
  const handleFilePicker = async () => {
    if (!(window as any).showOpenFilePicker) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: "Excel Files",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });
      setFileHandle(handle);
      setFileName(handle.name || "excel_file.xlsx");
      const file = await handle.getFile();
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (json.length > 0) {
        setHeaders(json[0]);
        setTableData(json.slice(1));
        setColWidths(new Array(json[0].length).fill(DEFAULT_COL_WIDTH));
        setModifiedCells(new Set());
      }
    } catch (err) {
      // User cancelled or error
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileHandle(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (json.length > 0) {
        setHeaders(json[0]);
        setTableData(json.slice(1));
        setColWidths(new Array(json[0].length).fill(DEFAULT_COL_WIDTH));
        setModifiedCells(new Set());
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCellChange = (
    rowIdx: number,
    colIdx: number,
    value: string
  ) => {
    setTableData((prev) => {
      const updated = prev.map((row, r) =>
        row.map((cell, c) => (r === rowIdx && c === colIdx ? value : cell))
      );
      return updated;
    });
    setModifiedCells((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${rowIdx},${colIdx}`);
      return newSet;
    });
  };

  const handleClear = () => {
    setHeaders([]);
    setTableData([]);
    setFileName("");
    setFileHandle(null);
    setColWidths([]);
    setModifiedCells(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save to the same file using File System Access API, or fallback to download
  const handleSave = async () => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    if (fileHandle && fileHandle.createWritable) {
      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const writable = await fileHandle.createWritable();
      await writable.write(wbout);
      await writable.close();
      alert("Changes saved to the original Excel file.");
      setModifiedCells(new Set());
    } else {
      XLSX.writeFile(wb, fileName ? `edited_${fileName}` : "edited_table.xlsx");
      alert("Your changes have been saved as a new Excel file (downloaded).");
      setModifiedCells(new Set());
    }
  };

  // Column resizing logic
  const handleResizeStart = (e: React.MouseEvent, colIdx: number) => {
    resizingCol.current = colIdx;
    startX.current = e.clientX;
    startWidth.current = colWidths[colIdx];
    document.addEventListener("mousemove", handleResizing);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizing = (e: MouseEvent) => {
    if (resizingCol.current === null) return;
    const delta = e.clientX - startX.current;
    setColWidths((prev) => {
      const updated = [...prev];
      updated[resizingCol.current!] = Math.max(60, startWidth.current + delta);
      return updated;
    });
  };

  const handleResizeEnd = () => {
    resizingCol.current = null;
    document.removeEventListener("mousemove", handleResizing);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  return (
    <div className="fixed left-0 top-0 w-screen min-h-screen py-8 overflow-x-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 z-0">
      <div className="max-w-[98vw] mx-auto">
        <h2 className="text-3xl font-extrabold mb-4 text-blue-900 drop-shadow">Excel Upload & Editable Table</h2>
        <div className="mb-4 p-4 bg-white/80 border border-blue-200 rounded-xl shadow">
          <ol className="list-decimal list-inside text-base text-blue-900">
            <li>
              Click <b>Choose File</b> to upload an Excel file (.xlsx or .xls).
              {fsApiSupported && (
                <span className="text-xs text-gray-500 ml-2">
                  (Modern browsers: changes can be saved to the same file)
                </span>
              )}
            </li>
            <li>The file will be converted to an editable table below.</li>
            <li>Edit any cell directly in the table. Changed cells are highlighted.</li>
            <li>
              Click <b>Save to Excel</b> to save your changes
              {fsApiSupported ? " to the same file." : " (downloads a new file)."}
            </li>
            <li>Click <b>Clear Table</b> to remove the current file and table.</li>
          </ol>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block"
            style={{ display: "none" }}
          />
          <button
            onClick={handleFilePicker}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold"
          >
            Choose File
          </button>
          {headers.length > 0 && (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-semibold"
              >
                Save to Excel
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
              >
                Clear Table
              </button>
            </>
          )}
        </div>
        {fileName && headers.length > 0 && (
          <div className="mb-2 text-xs text-gray-500">File: {fileName}</div>
        )}
        {headers.length > 0 && (
          <div className="overflow-x-auto w-full rounded-xl shadow-lg border border-gray-300 bg-white/90" style={{ maxHeight: 500, overflowY: "auto" }}>
            <table className="min-w-[1200px] w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      style={{ width: colWidths[idx], minWidth: 60, position: "relative" }}
                      className="border-b-2 border-blue-300 bg-blue-100 px-2 py-2 font-bold text-blue-900 text-base text-left select-none group"
                    >
                      <div className="flex items-center">
                        <span className="truncate">{header}</span>
                        <span
                          onMouseDown={e => handleResizeStart(e, idx)}
                          className="ml-2 cursor-col-resize select-none w-2 h-6 bg-blue-300 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                          style={{
                            display: "inline-block",
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 8,
                            height: 32,
                            zIndex: 10,
                          }}
                          title="Resize column"
                        ></span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? "bg-white/80" : "bg-blue-50/60"}
                  >
                    {headers.map((_, colIdx) => {
                      const isModified = modifiedCells.has(`${rowIdx},${colIdx}`);
                      return (
                        <td
                          key={colIdx}
                          className={`border-b border-r border-gray-200 px-2 py-1 align-middle transition-colors duration-200 whitespace-pre-wrap break-words ${
                            isModified
                              ? "bg-yellow-200/80 ring-2 ring-yellow-400"
                              : "hover:bg-blue-100/60"
                          }`}
                          style={{ width: colWidths[colIdx], minWidth: 60, verticalAlign: "top" }}
                        >
                          <textarea
                            value={row[colIdx] ?? ""}
                            onChange={e =>
                              handleCellChange(rowIdx, colIdx, e.target.value)
                            }
                            className="w-full bg-transparent outline-none font-medium text-gray-900 resize-none whitespace-pre-wrap break-words"
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              minHeight: 32,
                              maxHeight: 120,
                              overflow: "auto",
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {headers.length === 0 && (
          <div className="text-gray-500 text-center mt-8">
            No Excel file uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploadPage;