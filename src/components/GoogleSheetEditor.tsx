import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Save, Trash2, Plus, ArrowDownWideNarrow, Search, 
  CheckCircle, AlertCircle, RefreshCw, Undo2, Ban
} from 'lucide-react';

interface ColumnConfig {
  key: string;
  label: string; // Thai column label
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[]; // for select dropdowns
  readOnly?: boolean;
}

interface GoogleSheetEditorProps {
  tableKey: string; // e.g. 'materials', 'manufacturingOrders'
  tableName: string; // e.g. 'วัตถุดิบในคลัง', 'ใบสั่งผลิต (MO)'
  columns: ColumnConfig[];
  data: any[];
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function GoogleSheetEditor({ 
  tableKey, 
  tableName, 
  columns, 
  data = [], 
  onRefresh, 
  onNotify 
}: GoogleSheetEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [editedCells, setEditedCells] = useState<{ [rowAndCol: string]: boolean }>({});
  const [pendingChanges, setPendingChanges] = useState<{ [rowId: string]: any }>({});
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  // Sync rows when props data change
  useEffect(() => {
    setSheetRows(JSON.parse(JSON.stringify(data || [])));
    setEditedCells({});
    setPendingChanges({});
  }, [data]);

  // Handle cell edit
  const handleCellChange = (rowId: string, colKey: string, value: any, type: 'text' | 'number' | 'select' | 'date') => {
    let finalVal = value;
    if (type === 'number') {
      finalVal = value === '' ? 0 : Number(value);
    }

    // Update row state
    setSheetRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, [colKey]: finalVal };
      }
      return row;
    }));

    // Record edited cell visual indicator
    setEditedCells(prev => ({
      ...prev,
      [`${rowId}-${colKey}`]: true
    }));

    // Mark pending changes to be saved for this row
    setPendingChanges(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || { id: rowId }),
        [colKey]: finalVal
      }
    }));
  };

  // Save specific row to backend
  const handleSaveRow = async (rowId: string) => {
    const rowChanges = pendingChanges[rowId];
    if (!rowChanges) {
      onNotify("ไม่มีการเปลี่ยนแปลงใดๆ ในแถวนี้", "info");
      return;
    }

    setLoadingRowId(rowId);
    try {
      const response = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableKey,
          item: { id: rowId, ...rowChanges }
        })
      });
      const resData = await response.json();
      
      if (resData.success) {
        onNotify(`บันทึกข้อมูลแถวในฐานข้อมูล ${tableName} เรียบร้อยแล้ว (ID: ${rowId})`, "info");
        // Clear pending changes and cell markers for this row
        setPendingChanges(prev => {
          const clone = { ...prev };
          delete clone[rowId];
          return clone;
        });
        setEditedCells(prev => {
          const clone = { ...prev };
          Object.keys(clone).forEach(key => {
            if (key.startsWith(`${rowId}-`)) {
              delete clone[key];
            }
          });
          return clone;
        });
        onRefresh();
      } else {
        onNotify(resData.error || "เกิดข้อผิดพลาดในการบันทึก", "error");
      }
    } catch (e) {
      onNotify("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อบันทึกข้อมูล", "error");
    } finally {
      setLoadingRowId(null);
    }
  };

  // Cancel edits for specific row
  const handleCancelEdits = (rowId: string) => {
    const originalRow = data.find(x => x.id === rowId);
    if (!originalRow) return;

    setSheetRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return JSON.parse(JSON.stringify(originalRow));
      }
      return row;
    }));

    setPendingChanges(prev => {
      const clone = { ...prev };
      delete clone[rowId];
      return clone;
    });

    setEditedCells(prev => {
      const clone = { ...prev };
      Object.keys(clone).forEach(key => {
        if (key.startsWith(`${rowId}-`)) {
          delete clone[key];
        }
      });
      return clone;
    });
    
    onNotify("ยกเลิกการแก้ไขทั้งหมดของแถวนี้แล้ว", "info");
  };

  // Delete specific row from backend
  const handleDeleteRow = async (rowId: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการแถวนี้? (${rowId})`)) {
      return;
    }

    setLoadingRowId(rowId);
    try {
      const response = await fetch('/api/generic/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableKey,
          id: rowId
        })
      });
      const resData = await response.json();
      
      if (resData.success) {
        onNotify(`ลบแถวออกจาก ${tableName} หรือฐานข้อมูลสําเร็จ`, "warning");
        onRefresh();
      } else {
        onNotify(resData.error || "ลบไม่สำเร็จ", "error");
      }
    } catch {
      onNotify("ข้อผิดพลาดในการติดต่อฐานข้อมูล", "error");
    } finally {
      setLoadingRowId(null);
    }
  };

  // Add a new blank/default row
  const handleAddNewRow = async () => {
    const tempId = `new-${Date.now().toString().slice(-4)}`;
    
    // Build default object from columns
    const newItem: any = { id: tempId };
    columns.forEach(col => {
      if (col.key === 'id') return;
      if (col.type === 'number') {
        newItem[col.key] = 0;
      } else if (col.type === 'select') {
        newItem[col.key] = col.options ? col.options[0] : '';
      } else if (col.type === 'date') {
        newItem[col.key] = new Date().toISOString().split('T')[0];
      } else {
        newItem[col.key] = 'ระบุข้อมูล';
      }
    });

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableKey,
          item: newItem
        })
      });
      const resData = await response.json();
      if (resData.success) {
        onNotify(`เพิ่มแถวใหม่ในเว็บแอปสำเร็จ (ID: ${resData.item.id})`, "info");
        onRefresh();
      } else {
        onNotify(resData.error || "เกิดข้อผิดพลาดในการสร้างแถวใหม่", "error");
      }
    } catch {
      onNotify("ไม่สามารถสร้างแถวใหม่ได้ในเซิร์ฟเวอร์", "error");
    }
  };

  // Filter based on search term
  const filteredRows = sheetRows.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Helper for excel-style letters
  const getColLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C...
  };

  return (
    <div className="bg-white border border-[#E5E5EA] rounded-2xl shadow-sm overflow-hidden animate-fade-in mt-10">
      {/* Numbers Web Simulator Toolbar Header */}
      <div className="bg-[#F5F5F7] border-b border-[#E5E5EA] text-[#1D1D1F] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border border-[#E5E5EA] text-[#1D1D1F] rounded-xl shadow-xs">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base tracking-tight flex items-center gap-2 text-[#1D1D1F]">
              <span>ตารางจัดการข้อมูลอเนกประสงค์ (Interactive Ledger)</span>
              <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-[#1D1D1F] border border-[#D1D1D6] font-mono">
                {tableKey}
              </span>
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              กลุ่มบันทึก: <strong className="text-[#1D1D1F]">{tableName}</strong> • สามารถพิมแก้ข้อมูลในแต่ละช่องได้ทันที ท้ายแถวมีปุ่มบันทึกและปุ่มลบ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 md:flex-initial min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B]" />
            <input 
              type="text"
              className="w-full bg-white border border-[#E5E5EA] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
              placeholder="ค้นหาข้อมูลแถว..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleAddNewRow}
            className="px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#147ce5] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" /> เพิ่มแถวใหม่ (Add Row)
          </button>
          
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 bg-white border border-[#E5E5EA] hover:bg-neutral-100 transition-colors text-[#1D1D1F] rounded-xl"
            title="รีเฟรชข้อมูลคอลัมน์"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Status Bar indicator */}
      <div className="bg-white border-b border-[#E5E5EA] px-4 py-2 text-[11px] text-[#86868B] flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#34C759] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
            ระบบพร้อมรับค่าและเชื่อมตารางเชิงรุก
          </span>
          {Object.keys(pendingChanges).length > 0 && (
            <span className="bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20 rounded px-2 py-0.5 font-semibold flex items-center gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" /> มีข้อมูลรอการบันทึก {Object.keys(pendingChanges).length} แถว (กดปุ่ม "บันทึก" ท้ายแถว)
            </span>
          )}
        </div>
        <div className="font-mono text-[#86868B]">
          แสดงยอด {filteredRows.length} จากทั้งหมด {sheetRows.length} รายการ
        </div>
      </div>

      {/* Excel Layout Container */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full border-collapse text-xs select-text">
          {/* Top Label Alphabet Index row like Excel (A, B, C...) */}
          <thead>
            <tr className="bg-neutral-50 divide-x divide-[#E5E5EA] border-b border-[#E5E5EA]">
              <th className="w-12 bg-neutral-100 text-center text-[#86868B] font-mono py-1.5 font-bold select-none">
                #
              </th>
              {columns.map((col, idx) => (
                <th key={col.key} className="px-3 min-w-[140px] text-center text-[#86868B] font-mono uppercase font-semibold py-1 tracking-wider">
                  {getColLetter(idx)}
                </th>
              ))}
              <th className="px-3 bg-neutral-100 text-[#86868B] font-semibold py-1 w-44 text-center select-none">
                การจัดการ (Actions)
              </th>
            </tr>

            {/* Logical Header labels */}
            <tr className="bg-white divide-x divide-[#E5E5EA] border-b border-[#E5E5EA] font-semibold text-[#1D1D1F] text-left">
              <th className="w-12 bg-neutral-50 text-center select-none text-[#86868B]">
                &nbsp;
              </th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 text-[11px] bg-neutral-50/20 text-[#1D1D1F] antialiased font-semibold">
                  <div>{col.label}</div>
                  <div className="text-[9px] text-[#86868B] font-mono font-medium">[{col.key}]</div>
                </th>
              ))}
              <th className="px-3 text-center text-[#86868B] select-none py-2 text-[11px]">
                ควบคุมแถว
              </th>
            </tr>
          </thead>

          {/* Table Data Rows */}
          <tbody className="divide-y divide-[#E5E5EA]">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center text-[#86868B] font-medium bg-white">
                  ไม่พบข้อมูลแถวในระบบคอลัมน์ของ {tableName} คล้าย Google Sheet
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rowIdx) => {
                const isRowPending = !!pendingChanges[row.id];
                return (
                  <tr 
                    key={row.id} 
                    className={`divide-x divide-[#E5E5EA] hover:bg-neutral-50/30 transition-colors ${
                      isRowPending ? 'bg-[#FF9500]/5' : ''
                    }`}
                  >
                    {/* Row Indicator like cell (1, 2, 3...) */}
                    <td className="bg-neutral-50 text-center font-mono font-bold select-none p-2 text-[#86868B] w-12 border-b border-[#E5E5EA]">
                      {rowIdx + 1}
                    </td>

                    {/* Columns dynamically rendered */}
                    {columns.map((col) => {
                      const cellValue = row[col.key] === undefined || row[col.key] === null ? '' : row[col.key];
                      const isCellEdited = editedCells[`${row.id}-${col.key}`];
                      const isReadOnly = col.readOnly || col.key === 'id';

                      return (
                        <td 
                          key={col.key} 
                          className={`p-1.5 max-w-sm transition-all relative ${
                            isCellEdited ? 'bg-[#FF9500]/10 ring-1 ring-[#FF9500]/30' : ''
                          } ${isReadOnly ? 'bg-neutral-50/50 text-[#86868B]' : ''}`}
                        >
                          {isReadOnly ? (
                            <div className="px-2 py-1 font-mono text-[#86868B] bg-[#F5F5F7] rounded overflow-hidden text-ellipsis whitespace-nowrap" title={cellValue}>
                              {cellValue}
                            </div>
                          ) : col.type === 'select' ? (
                            <select
                              className="w-full bg-transparent p-1 focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] rounded outline-none border border-transparent hover:border-[#D1D1D6] font-medium text-[#1D1D1F] transition-all"
                              value={cellValue}
                              onChange={(e) => handleCellChange(row.id, col.key, e.target.value, 'select')}
                            >
                              {(col.options || []).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : col.type === 'number' ? (
                            <input
                              type="number"
                              className="w-full bg-transparent p-1 text-right focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] rounded outline-none border border-transparent hover:border-[#D1D1D6] font-mono font-semibold text-[#1D1D1F] transition-all"
                              value={cellValue}
                              onChange={(e) => handleCellChange(row.id, col.key, e.target.value, 'number')}
                            />
                          ) : col.type === 'date' ? (
                            <input
                              type="date"
                              className="w-full bg-transparent p-1 focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] rounded outline-none border border-transparent hover:border-[#D1D1D6] font-mono text-[#1D1D1F] transition-all"
                              value={cellValue}
                              onChange={(e) => handleCellChange(row.id, col.key, e.target.value, 'date')}
                            />
                          ) : (
                            <input
                              type="text"
                              className="w-full bg-transparent p-1 focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] rounded outline-none border border-transparent hover:border-[#D1D1D6] font-medium text-[#1D1D1F] transition-all"
                              value={cellValue}
                              onChange={(e) => handleCellChange(row.id, col.key, e.target.value, 'text')}
                            />
                          )}

                          {/* Excel Corner edit mark */}
                          {isCellEdited && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF9500] rounded-bl-sm" title="แก้ไขแล้ว ยังไม่ได้บันทึก" />
                          )}
                        </td>
                      );
                    })}

                    {/* Controls row Action Button Cell */}
                    <td className="p-1 px-3 text-center border-b border-[#E5E5EA] w-44">
                      {loadingRowId === row.id ? (
                        <div className="flex items-center justify-center py-1">
                          <RefreshCw className="h-4 w-4 text-[#0071E3] animate-spin" />
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          {isRowPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveRow(row.id)}
                                className="p-1.5 bg-[#34C759] hover:bg-[#30b551] text-white rounded-lg shadow-xs text-xs transition-colors flex items-center justify-center"
                                title="บันทึกแถวนี้ลงในฐานข้อมูล"
                              >
                                <Save className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelEdits(row.id)}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] rounded-lg shadow-xs text-xs transition-colors flex items-center justify-center border border-[#E5E5EA]"
                                title="ยกเลิกการแก้ไขของแถวนี้"
                              >
                                <Undo2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="p-1.5 bg-neutral-100 text-[#86868B] rounded-lg cursor-not-allowed text-xs flex items-center justify-center border border-[#E5E5EA]"
                              disabled
                              title="ไม่มีการเปลี่ยนแปลง"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white rounded-lg text-xs transition-all flex items-center justify-center border border-[#FF3B30]/20"
                            title="ลบแถวนี้ถาวร"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
