import React, { useState } from 'react';
import { 
  Pencil, Trash2, Save, X, PlusCircle, Settings, ClipboardList, Package, Cpu, Check, AlertCircle 
} from 'lucide-react';

interface DashboardQuickTableProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function DashboardQuickTable({ dbState, onRefresh, onNotify }: DashboardQuickTableProps) {
  const [activeSubTab, setActiveSubTab] = useState<'machines' | 'materials'>('machines');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // States for inline editing
  const [editForm, setEditForm] = useState<any>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // States for adding a new item inline
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<any>({
    // machine defaults
    name: '',
    code: '',
    section: 'Chemical Synthesis A',
    status: 'Online',
    mtbfHours: 400,
    mttrHours: 3.5,
    installedDate: new Date().toISOString().split('T')[0],
    qrCodeUrl: 'MCH-VALID-QR',

    // material defaults
    matName: '',
    matCode: '',
    category: 'Raw Material',
    minStock: 100,
    stockLevel: 250,
    unit: 'Liters',
    costPerUnit: 5.0
  });

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (key: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateChange = (key: string, value: any) => {
    setAddForm((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // 1. UPDATE ROW
  const handleSaveRow = async (id: string) => {
    const tableKey = activeSubTab === 'machines' ? 'machines' : 'materials';
    
    // Core validations
    if (activeSubTab === 'machines') {
      if (!editForm.name?.trim() || !editForm.code?.trim()) {
        onNotify("กรุณากรอกข้อมูลชื่อเครื่องจักรและรหัสรหัสผ่านให้ครบถ้วน", "warning");
        return;
      }
    } else {
      if (!editForm.name?.trim() || !editForm.code?.trim()) {
        onNotify("กรุณากรอกข้อมูลชื่อวัตถุดิบและรหัสอ้างอิงของวัตถุดิบให้ครบถ้วน", "warning");
        return;
      }
    }

    setLoadingId(id);
    try {
      const response = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableKey,
          item: editForm
        })
      });
      const resData = await response.json();
      
      if (resData.success) {
        onNotify(`บันทึกข้อมูล ${activeSubTab === 'machines' ? 'เครื่องจักร' : 'วัตถุดิบ'} สำเร็จแล้ว!`, "info");
        setEditingId(null);
        setEditForm({});
        onRefresh();
      } else {
        onNotify(resData.error || "เกิดข้อผิดพลาดในการบันทึก", "error");
      }
    } catch {
      onNotify("ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    } finally {
      setLoadingId(null);
    }
  };

  // 2. DELETE ROW
  const handleDeleteRow = async (id: string) => {
    const tableKey = activeSubTab === 'machines' ? 'machines' : 'materials';
    const label = activeSubTab === 'machines' ? 'เครื่องจักร' : 'วัตถุดิบ';

    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายชื่อ ${label} รายการนี้? (รหัส: ${id})`)) {
      return;
    }

    setLoadingId(id);
    try {
      const response = await fetch('/api/generic/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableKey,
          id
        })
      });
      const resData = await response.json();
      
      if (resData.success) {
        onNotify(`ลบรายการ ${label} สำเร็จเรียบร้อยแล้ว`, "warning");
        if (editingId === id) {
          setEditingId(null);
          setEditForm({});
        }
        onRefresh();
      } else {
        onNotify(resData.error || "ไม่สามารถลบข้อมูลได้", "error");
      }
    } catch {
      onNotify("ข้อผิดพลาดทางเทคนิคของฐานข้อมูล", "error");
    } finally {
      setLoadingId(null);
    }
  };

  // 3. CREATE NEW ROW
  const handleCreateRow = async (e: React.FormEvent) => {
    e.preventDefault();
    const tableKey = activeSubTab === 'machines' ? 'machines' : 'materials';
    const label = activeSubTab === 'machines' ? 'เครื่องจักร' : 'วัตถุดิบ';

    let itemData: any = {};
    if (activeSubTab === 'machines') {
      if (!addForm.name.trim() || !addForm.code.trim()) {
        onNotify("กรุณากรอกชื่อและรหัสเครื่องจักร", "warning");
        return;
      }
      itemData = {
        name: addForm.name,
        code: addForm.code,
        section: addForm.section,
        status: addForm.status,
        mtbfHours: Number(addForm.mtbfHours) || 400,
        mttrHours: Number(addForm.mttrHours) || 3.5,
        installedDate: addForm.installedDate,
        qrCodeUrl: addForm.qrCodeUrl
      };
    } else {
      if (!addForm.matName.trim() || !addForm.matCode.trim()) {
        onNotify("กรุณากรอกชื่อวัตถุดิบและรหัสวัตถุดิบ", "warning");
        return;
      }
      itemData = {
        name: addForm.matName,
        code: addForm.matCode,
        category: addForm.category,
        minStock: Number(addForm.minStock) || 100,
        stockLevel: Number(addForm.stockLevel) || 250,
        unit: addForm.unit,
        costPerUnit: Number(addForm.costPerUnit) || 5.0
      };
    }

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableKey,
          item: itemData
        })
      });
      const resData = await response.json();
      
      if (resData.success) {
        onNotify(`เพิ่ม ${label} ใหม่ลงในฐานข้อมูลสำเร็จแล้ว!`, "info");
        setShowAddForm(false);
        // Reset name fields
        setAddForm((prev: any) => ({
          ...prev,
          name: '',
          code: '',
          matName: '',
          matCode: ''
        }));
        onRefresh();
      } else {
        onNotify(resData.error || "เกิดข้อผิดพลาดในการสร้างรายการใหม่", "error");
      }
    } catch {
      onNotify("ไม่สามารถสร้างรายการใหม่ได้สำเร็จ", "error");
    }
  };

  const machinesList = dbState.machines || [];
  const materialsList = dbState.materials || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-5" id="dashboard-quick-table-container">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0071E3]/10 text-[#0071E3] rounded-xl">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#1D1D1F] tracking-tight">ศูนย์ควบคุมฐานข้อมูลและการผลิตแบบทันที (Quick Ledger Desk)</h3>
            <p className="text-[11px] text-[#86868B]">แก้ไข ปรับค่า หรือลบข้อมูลหลักจากหน้า Dashboard สัมพันธ์กับภาพรวมคะแนน OEE และกำไรสุทธิโดยตรง</p>
          </div>
        </div>

        {/* Navigation Switch Tabs */}
        <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] select-none text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('machines');
              setEditingId(null);
              setShowAddForm(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${activeSubTab === 'machines' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
          >
            <Cpu className="h-3.5 w-3.5" /> เครื่องจักรโรงงาน ({machinesList.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('materials');
              setEditingId(null);
              setShowAddForm(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${activeSubTab === 'materials' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
          >
            <Package className="h-3.5 w-3.5" /> ทะเบียนหมวดวัตถุดิบ ({materialsList.length})
          </button>
        </div>
      </div>

      {/* Button Toolbars */}
      <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3 text-xs w-full">
        <div className="text-xs text-[#86868B]">
          หมวด: <strong className="text-[#1D1D1F]">{activeSubTab === 'machines' ? 'เครื่องจักรและกำลังเครื่องในโรงงาน' : 'วัตถุดิบรวมเคมีภัณฑ์ในสต็อก'}</strong>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
            showAddForm 
              ? 'bg-neutral-100 text-[#1D1D1F] border border-[#E5E5EA]' 
              : 'bg-[#0071E3] text-white hover:bg-[#147ce5] shadow-xs'
          }`}
        >
          {showAddForm ? 'ปิดแบบฟอร์มเพิ่มแถว' : 'เพิ่มรายการใหม่ด่วน +'}
        </button>
      </div>

      {/* Sub-form to Add New Row */}
      {showAddForm && (
        <form onSubmit={handleCreateRow} className="bg-neutral-50/70 p-4 rounded-xl border border-[#E5E5EA] space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-2">
            <span className="font-bold flex items-center gap-1 text-[#1D1D1F]">
              <PlusCircle className="h-4 w-4 text-[#0071E3]" /> 
              กรอกข้อมูลเพื่อสร้าง {activeSubTab === 'machines' ? 'เครื่องจักรประจำสายผลิตใหม่' : 'วัตถุดิบดิบที่ใช้ในคลังจัดซื้อใหม่คู่นำเข้า'}
            </span>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              🔒 ปิด
            </button>
          </div>

          {activeSubTab === 'machines' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">ชื่อเครื่องจักร / อุปกรณ์ประจำโรงงาน</label>
                <input 
                  type="text" 
                  value={addForm.name}
                  onChange={(e) => handleCreateChange('name', e.target.value)}
                  placeholder="เช่น Precision Chemical Reactor RX-3F"
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 focus:ring-1 focus:ring-[#0071E3]/30 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">รหัสประจำเครื่อง (Unique Code)</label>
                <input 
                  type="text" 
                  value={addForm.code}
                  onChange={(e) => handleCreateChange('code', e.target.value)}
                  placeholder="เช่น IDEVA-MCH-RX3F"
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 focus:ring-1 focus:ring-[#0071E3]/30 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">แผนกจัดกลุ่มประจำอุปกรณ์ (Section)</label>
                <select
                  value={addForm.section}
                  onChange={(e) => handleCreateChange('section', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none"
                >
                  <option value="Chemical Synthesis A">Chemical Synthesis A</option>
                  <option value="Mixing & Grinding">Mixing & Grinding</option>
                  <option value="Thermal Processing">Thermal Processing</option>
                  <option value="Final Packaging">Final Packaging</option>
                  <option value="Raw Materials Depot">Raw Materials Depot</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">สถานะเริ่มเดินเครื่อง (Status)</label>
                <select
                  value={addForm.status}
                  onChange={(e) => handleCreateChange('status', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none"
                >
                  <option value="Online">Online (พร้อมทำงานปกติ)</option>
                  <option value="Repairing">Repairing (รอซ่อมบำรุงตรวจงาน)</option>
                  <option value="Maintenance">Maintenance (กำลังบำรุงเชิงรุก PM)</option>
                  <option value="Offline">Offline (ขัดข้องตัดระบบชั่วคราว)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">รอบเสถียรเฉลี่ย MTBF (ชั่วโมง)</label>
                <input 
                  type="number" 
                  value={addForm.mtbfHours}
                  onChange={(e) => handleCreateChange('mtbfHours', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">เวลาเข้าซ่อมเฉลี่ย MTTR (ชั่วโมง)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={addForm.mttrHours}
                  onChange={(e) => handleCreateChange('mttrHours', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">วันที่เริ่มประเดิมติดตั้ง (Installed)</label>
                <input 
                  type="date" 
                  value={addForm.installedDate}
                  onChange={(e) => handleCreateChange('installedDate', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#34C759] hover:bg-[#2fb450] text-white py-2 px-4 rounded-lg font-bold transition-all shadow-xs"
                >
                  บันทึกข้อมูลและเพิ่มรายการเครื่องจักร ✓
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">ชื่อวัตถุดิบเคมี / อุปกรณ์บรรจุ</label>
                <input 
                  type="text" 
                  value={addForm.matName}
                  onChange={(e) => handleCreateChange('matName', e.target.value)}
                  placeholder="เช่น Pure Glycerin Concentrated 99.8%"
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 focus:ring-1 focus:ring-[#0071E3]/30 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">รหัสวัตถุดิบหลัก (Primary Code)</label>
                <input 
                  type="text" 
                  value={addForm.matCode}
                  onChange={(e) => handleCreateChange('matCode', e.target.value)}
                  placeholder="เช่น RAW-GLYC-01"
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 focus:ring-1 focus:ring-[#0071E3]/30 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">กลุ่มแยกประเภท (Category)</label>
                <select
                  value={addForm.category}
                  onChange={(e) => handleCreateChange('category', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none"
                >
                  <option value="Raw Material">Raw Material (วัตถุดิบกระบวนการผลิต)</option>
                  <option value="Packaging">Packaging (บรรจุภัณฑ์ฝาล็อค/กล่อง)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">หน่วยนับในระบบ (Unit)</label>
                <input 
                  type="text" 
                  value={addForm.unit}
                  onChange={(e) => handleCreateChange('unit', e.target.value)}
                  placeholder="เช่น Liters, Kilograms, Pieces"
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">ระดับสั่งซื้อขั้นต่ำ (Reorder Min Level)</label>
                <input 
                  type="number" 
                  value={addForm.minStock}
                  onChange={(e) => handleCreateChange('minStock', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">ยอดคงคลังตั้งต้นโรงงาน (Live Stock Level)</label>
                <input 
                  type="number" 
                  value={addForm.stockLevel}
                  onChange={(e) => handleCreateChange('stockLevel', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#86868B] font-semibold">ราคาทุนต่อหน่วย (บาท / Cost per Unit)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={addForm.costPerUnit}
                  onChange={(e) => handleCreateChange('costPerUnit', e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 outline-none font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#34C759] hover:bg-[#2fb450] text-white py-2 px-4 rounded-lg font-bold transition-all shadow-xs"
                >
                  บันทึกข้อมูลและนำเข้าสารเคมี ✓
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Main Table Structure */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E5EA] bg-white">
        <table className="w-full text-left border-collapse text-xs select-text">
          <thead>
            {activeSubTab === 'machines' ? (
              <tr className="bg-neutral-50 border-b border-[#E5E5EA] text-[#86868B] font-semibold">
                <th className="p-3 w-12 text-center font-mono">#</th>
                <th className="p-3 min-w-[130px]">รหัส (Code)</th>
                <th className="p-3 min-w-[200px]">ชื่อเฉพาะเครื่องจักรผสมและสายส่งกำลัง</th>
                <th className="p-3 min-w-[150px]">ฝ่ายกระบวนการ (Section)</th>
                <th className="p-3 text-right">MTBF (ชั่วโมง)</th>
                <th className="p-3 text-right">MTTR (ชั่วโมง)</th>
                <th className="p-3">วันที่ระดมติดตั้ง</th>
                <th className="p-3 text-center min-w-[120px]">สถานะดำเนินเครื่อง</th>
                <th className="p-3 text-center w-36">การสั่งการจัดการ (Actions)</th>
              </tr>
            ) : (
              <tr className="bg-neutral-50 border-b border-[#E5E5EA] text-[#86868B] font-semibold">
                <th className="p-3 w-12 text-center font-mono">#</th>
                <th className="p-3 min-w-[130px]">รหัสสะสมคู่เทียบ (Code)</th>
                <th className="p-3 min-w-[220px]">ชื่อกลุ่มสารสกัดเคมีดิบหรือบรรจุภัณฑ์</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3 text-right">ราคาซื้อกลางต่อหน่วย (บาท)</th>
                <th className="p-3 text-right">จำนวนคลาดต่ำสุด</th>
                <th className="p-3 text-right">ยอดคงคลังสด</th>
                <th className="p-3 text-center">หน่วยนับ</th>
                <th className="p-3 text-center w-36">การสั่งการจัดการ (Actions)</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
            {/* RENDER MACHINES LIST */}
            {activeSubTab === 'machines' && (
              machinesList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#86868B] font-semibold">ไม่พบข้อมูลทะเบียนกลุ่มเครื่องจักรในระบบ ณ ยามนี้</td>
                </tr>
              ) : (
                machinesList.map((mch: any, idx: number) => {
                  const isEditing = editingId === mch.id;

                  return (
                    <tr 
                      key={mch.id} 
                      className={`hover:bg-[#F5F5F7]/30 transition-colors ${
                        isEditing ? 'bg-[#0071E3]/5' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono font-semibold text-[#86868B]">
                        {idx + 1}
                      </td>

                      {/* CODE COLUMN */}
                      <td className="p-3">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 font-mono text-xs text-[#1D1D1F]"
                            value={editForm.code || ''} 
                            onChange={(e) => handleEditChange('code', e.target.value)} 
                          />
                        ) : (
                          <span className="font-mono text-xs font-semibold select-all text-[#1D1D1F] bg-neutral-100 border border-[#E5E5EA] px-1.5 py-0.5 rounded">
                            {mch.code}
                          </span>
                        )}
                      </td>

                      {/* NAME COLUMN */}
                      <td className="p-3 font-medium">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 text-xs text-[#1D1D1F]"
                            value={editForm.name || ''} 
                            onChange={(e) => handleEditChange('name', e.target.value)} 
                          />
                        ) : (
                          <span>{mch.name}</span>
                        )}
                      </td>

                      {/* SECTION COLUMN */}
                      <td className="p-3 text-[#515154]">
                        {isEditing ? (
                          <select 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 text-xs text-[#1D1D1F]"
                            value={editForm.section || ''} 
                            onChange={(e) => handleEditChange('section', e.target.value)}
                          >
                            <option value="Chemical Synthesis A">แผนกสังเคราะห์วิจัยเคมี A</option>
                            <option value="Mixing & Grinding">แผนกบดผสมมวลสาร</option>
                            <option value="Thermal Processing">กระบวนการควบคุมอุณหภูมิความร้อน</option>
                            <option value="Final Packaging">สายงานบรรจุภัณฑ์และฝาพ่น</option>
                            <option value="Raw Materials Depot">คลังวัตถุดิบต้นน้ำ</option>
                          </select>
                        ) : (
                          <span>
                            {mch.section === 'Chemical Synthesis A' ? 'แผนกสังเคราะห์วิจัยเคมี A' :
                             mch.section === 'Mixing & Grinding' ? 'แผนกบดผสมมวลสาร' :
                             mch.section === 'Thermal Processing' ? 'กระบวนการควบคุมอุณหภูมิความร้อน' :
                             mch.section === 'Final Packaging' ? 'สายงานบรรจุภัณฑ์และฝาพ่น' : 
                             mch.section === 'Raw Materials Depot' ? 'คลังวัตถุดิบต้นน้ำ' : mch.section}
                          </span>
                        )}
                      </td>

                      {/* MTBF COLUMN */}
                      <td className="p-3 text-right font-mono font-medium">
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="w-20 bg-white border border-[#E5E5EA] rounded p-1 text-right text-xs text-[#1D1D1F]"
                            value={editForm.mtbfHours || 0} 
                            onChange={(e) => handleEditChange('mtbfHours', Number(e.target.value))} 
                          />
                        ) : (
                          <span>{mch.mtbfHours} ชม.</span>
                        )}
                      </td>

                      {/* MTTR COLUMN */}
                      <td className="p-3 text-right font-mono font-medium">
                        {isEditing ? (
                          <input 
                            type="number" 
                            step="0.1"
                            className="w-16 bg-white border border-[#E5E5EA] rounded p-1 text-right text-xs text-[#1D1D1F]"
                            value={editForm.mttrHours || 0} 
                            onChange={(e) => handleEditChange('mttrHours', Number(e.target.value))} 
                          />
                        ) : (
                          <span>{mch.mttrHours} ชม.</span>
                        )}
                      </td>

                      {/* INSTALLED DATE COLUMN */}
                      <td className="p-3 font-mono text-[#86868B]">
                        {isEditing ? (
                          <input 
                            type="date" 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 text-xs text-[#1D1D1F]"
                            value={editForm.installedDate || ''} 
                            onChange={(e) => handleEditChange('installedDate', e.target.value)} 
                          />
                        ) : (
                          <span>{mch.installedDate}</span>
                        )}
                      </td>

                      {/* STATUS BADGE COLUMN */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <select 
                            className="bg-white border border-[#E5E5EA] rounded p-1 text-xs text-[#1D1D1F]"
                            value={editForm.status || ''} 
                            onChange={(e) => handleEditChange('status', e.target.value)}
                          >
                            <option value="Online">ใช้งานปกติ (Online)</option>
                            <option value="Offline">ปิดทำงานชั่วคราว (Offline)</option>
                            <option value="Repairing">กำลังซ่อมปรับปรุง (Repairing)</option>
                            <option value="Maintenance">บำรุงตามรอบ (Maintenance)</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            mch.status === 'Online' ? 'bg-[#34C759]/10 text-[#34C759]' :
                            mch.status === 'Offline' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' :
                            mch.status === 'Repairing' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                            'bg-[#5856D6]/10 text-[#5856D6]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              mch.status === 'Online' ? 'bg-[#34C759]' :
                              mch.status === 'Offline' ? 'bg-[#FF3B30]' :
                              mch.status === 'Repairing' ? 'bg-[#FF9500]' :
                              'bg-[#5856D6]'
                            }`}></span>
                            {mch.status === 'Online' ? 'ใช้งานปกติ (Online)' :
                             mch.status === 'Offline' ? 'ปิดระบบชั่วคราว (Offline)' :
                             mch.status === 'Repairing' ? 'กำลังปรับปรุง (Repairing)' :
                             mch.status === 'Maintenance' ? 'ซ่อมบำรุงตามรอบ (Maintenance)' : mch.status}
                          </span>
                        )}
                      </td>

                      {/* MASTER ACTIONS ROW COLUMN */}
                      <td className="p-3 text-center">
                        {loadingId === mch.id ? (
                          <div className="text-[#0071E3] font-semibold animate-pulse text-[10px]">Processing...</div>
                        ) : isEditing ? (
                          <div className="flex gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => handleSaveRow(mch.id)}
                              className="p-1 px-2.5 bg-[#34C759] hover:bg-[#2fb450] text-white rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="บันทึกข้อมูล (Save)"
                            >
                              <Save className="h-3.5 w-3.5" /> บันทึก
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="p-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] border border-[#E5E5EA] rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="ยกเลิกการแก้ไข (Cancel)"
                            >
                              <X className="h-3.5 w-3.5" /> เลิก
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => startEditing(mch)}
                              className="p-1.5 bg-neutral-100 hover:bg-[#0071E3] hover:text-white text-[#1D1D1F] border border-[#E5E5EA] rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="แก้ไขรายการ (Edit)"
                            >
                              <Pencil className="h-3.5 w-3.5" /> แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(mch.id)}
                              className="p-1.5 bg-[#FF3B30]/5 hover:bg-[#FF3B30] hover:text-white text-[#FF3B30] border border-[#FF3B30]/10 rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="ลบข้อมูลหลัก (Delete)"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> ลบ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )
            )}

            {/* RENDER MATERIALS LIST */}
            {activeSubTab === 'materials' && (
              materialsList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#86868B] font-semibold">ไม่พบทะเบียนดัชนีวัตถุดิบเคมีภัณฑ์ยามนี้</td>
                </tr>
              ) : (
                materialsList.map((mat: any, idx: number) => {
                  const isEditing = editingId === mat.id;
                  const isLowStock = mat.stockLevel < mat.minStock;

                  return (
                    <tr 
                      key={mat.id} 
                      className={`hover:bg-[#F5F5F7]/30 transition-colors ${
                        isEditing ? 'bg-[#0071E3]/5' : ''
                      } ${isLowStock ? 'bg-[#FF9500]/5' : ''}`}
                    >
                      <td className="p-3 text-center font-mono font-semibold text-[#86868B]">
                        {idx + 1}
                      </td>

                      {/* MAT CODE */}
                      <td className="p-3">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 font-mono text-xs text-[#1D1D1F]"
                            value={editForm.code || ''} 
                            onChange={(e) => handleEditChange('code', e.target.value)} 
                          />
                        ) : (
                          <span className="font-mono text-xs font-semibold select-all text-[#1D1D1F] bg-neutral-100 border border-[#E5E5EA] px-1.5 py-0.5 rounded">
                            {mat.code}
                          </span>
                        )}
                      </td>

                      {/* MAT NAME */}
                      <td className="p-3 font-medium">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 text-xs text-[#1D1D1F]"
                            value={editForm.name || ''} 
                            onChange={(e) => handleEditChange('name', e.target.value)} 
                          />
                        ) : (
                          <span>{mat.name}</span>
                        )}
                      </td>

                      {/* MAT CATEGORY */}
                      <td className="p-3 text-[#515154]">
                        {isEditing ? (
                          <select 
                            className="w-full bg-white border border-[#E5E5EA] rounded p-1 text-xs text-[#1D1D1F]"
                            value={editForm.category || ''} 
                            onChange={(e) => handleEditChange('category', e.target.value)}
                          >
                            <option value="Raw Material">สารสกัดวัตถุดิบหอม (Raw Material)</option>
                            <option value="Packaging">ขวดแก้ว/ฝาพ่นพรีเมียม (Packaging)</option>
                          </select>
                        ) : (
                          <span>
                            {mat.category === 'Raw Material' ? 'สารสกัดวัตถุดิบหอม (Raw Material)' : 
                             mat.category === 'Packaging' ? 'ขวดแก้ว/ฝาพ่นพรีเมียม (Packaging)' : mat.category}
                          </span>
                        )}
                      </td>

                      {/* COST PER UNIT */}
                      <td className="p-3 text-right font-mono font-semibold">
                        {isEditing ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-20 bg-white border border-[#E5E5EA] rounded p-1 text-right text-xs text-[#1D1D1F]"
                            value={editForm.costPerUnit || 0} 
                            onChange={(e) => handleEditChange('costPerUnit', Number(e.target.value))} 
                          />
                        ) : (
                          <span>฿{Number(mat.costPerUnit).toFixed(2)}</span>
                        )}
                      </td>

                      {/* MIN STOCK */}
                      <td className="p-3 text-right font-mono text-[#86868B]">
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="w-20 bg-white border border-[#E5E5EA] rounded p-1 text-right text-xs text-[#1D1D1F]"
                            value={editForm.minStock || 0} 
                            onChange={(e) => handleEditChange('minStock', Number(e.target.value))} 
                          />
                        ) : (
                          <span>{mat.minStock.toLocaleString()}</span>
                        )}
                      </td>

                      {/* STOCK LEVEL */}
                      <td className="p-3 text-right font-mono">
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="w-24 bg-white border border-[#E5E5EA] rounded p-1 text-right text-xs text-[#1D1D1F]"
                            value={editForm.stockLevel || 0} 
                            onChange={(e) => handleEditChange('stockLevel', Number(e.target.value))} 
                          />
                        ) : (
                          <span className={`font-bold ${isLowStock ? 'text-[#FF9500]' : 'text-[#1D1D1F]'}`}>
                            {mat.stockLevel.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* UNIT */}
                      <td className="p-3 text-center text-[#86868B] font-medium">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-16 bg-white border border-[#E5E5EA] rounded p-1 text-center text-xs text-[#1D1D1F]"
                            value={editForm.unit || ''} 
                            onChange={(e) => handleEditChange('unit', e.target.value)} 
                          />
                        ) : (
                          <span>{mat.unit}</span>
                        )}
                      </td>

                      {/* MASTER ACTIONS ROW COLUMN */}
                      <td className="p-3 text-center">
                        {loadingId === mat.id ? (
                          <div className="text-[#0071E3] font-semibold animate-pulse text-[10px]">Processing...</div>
                        ) : isEditing ? (
                          <div className="flex gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => handleSaveRow(mat.id)}
                              className="p-1 px-2.5 bg-[#34C759] hover:bg-[#2fb450] text-white rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="บันทึกข้อมูล (Save)"
                            >
                              <Save className="h-3.5 w-3.5" /> บันทึก
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="p-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] border border-[#E5E5EA] rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="ยกเลิกการแก้ไข (Cancel)"
                            >
                              <X className="h-3.5 w-3.5" /> เลิก
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => startEditing(mat)}
                              className="p-1.5 bg-neutral-100 hover:bg-[#0071E3] hover:text-white text-[#1D1D1F] border border-[#E5E5EA] rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="แก้ไขรายการ (Edit)"
                            >
                              <Pencil className="h-3.5 w-3.5" /> แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(mat.id)}
                              className="p-1.5 bg-[#FF3B30]/5 hover:bg-[#FF3B30] hover:text-white text-[#FF3B30] border border-[#FF3B30]/10 rounded-lg flex items-center gap-1 transition-all text-[10px] font-bold"
                              title="ลบข้อมูลหลัก (Delete)"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> ลบ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Information Tip Banner */}
      <div className="bg-neutral-50 border border-[#E5E5EA] px-4 py-2 text-[10px] text-[#86868B] flex items-center gap-2 rounded-xl">
        <AlertCircle className="h-3.5 w-3.5 text-[#0071E3] shrink-0" />
        <span>ปุ่มควบคุมแต่ละแถวนี้นำเทคนิคเชื่อมระบบมาช่วยตรวจสอบสถิติ OEE ประจำอุปกรณ์และการคำนวณ Raw Material Safety Threshold แบบ Real-Time</span>
      </div>
    </div>
  );
}
