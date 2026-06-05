import React, { useState } from 'react';
import { 
  Plus, ArrowDownLeft, ArrowUpRight, Clipboard, Calendar, AlertTriangle, 
  Trash2, ShieldCheck, CheckCheck, Inbox, Search, Clock, RotateCcw 
} from 'lucide-react';

interface ChemicalStockOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function ChemicalStockOS({ dbState, onRefresh, onNotify, userRole }: ChemicalStockOSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Raw Material' | 'Packaging'>('All');
  
  // Forms states
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [lotNumber, setLotNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);

  // Filter materials that are chemicals / raw materials (or all materials based on user choice)
  const unfilteredMaterials = dbState.materials || [];
  const materials = unfilteredMaterials.filter((m: any) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' ? true : m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalStockItems = unfilteredMaterials.length;
  const lowStockItems = unfilteredMaterials.filter((m: any) => m.stockLevel < m.minStock).length;
  
  // Track chemical expiry dates based on existing goodsReceipts or simulated chemical batches
  const goodsReceipts = dbState.goodsReceipts || [];
  
  // Add a helper for receipts with nice calculations
  const totalReceipts = goodsReceipts.length;

  // Handle Receiving Raw Materials (รับเข้า)
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || quantity <= 0 || !lotNumber || !expiryDate) {
      onNotify("กรุณากรอกข้อมูลการรับเข้าสารเคมีให้ครบถ้วนและถูกต้อง", "warning");
      return;
    }

    const material = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
    if (!material) return;

    setLoading(true);
    try {
      // 1. Create goods receipt
      const newGR = {
        id: `grn-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
        poId: 'Direct-Procure',
        supplierId: 'supp-1', // Default premium Grass supplier
        materialId: selectedMaterialId,
        quantityReceived: Number(quantity),
        lotNumber,
        expiryDate,
        status: 'QC Approved', // Auto approve for simplicity or send to QC
        createdAt: new Date().toISOString().split('T')[0]
      };

      const grResponse = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'goodsReceipts', item: newGR })
      });

      // 2. Update stock level of Material
      const updatedMaterial = {
        ...material,
        stockLevel: material.stockLevel + Number(quantity)
      };

      const matResponse = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'materials', item: updatedMaterial })
      });

      const resGR = await grResponse.json();
      const resMat = await matResponse.json();

      if (resGR.success && resMat.success) {
        onNotify(`ทำรายการรับเข้าสารหอม ${material.name} จำนวน ${quantity} ${material.unit} พลัสล็อตเคมีสำเร็จ!`, "info");
        setShowReceiveModal(false);
        // Reset states
        setSelectedMaterialId('');
        setQuantity(0);
        setLotNumber('');
        setExpiryDate('');
        setNotes('');
        onRefresh();
      } else {
        onNotify("เกิดปัญหาในการปรับปรุงคลังสินค้าต้นน้ำ", "error");
      }
    } catch {
      onNotify("เชื่อมต่อเซิร์ฟเวอร์คลังสารเหลวไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Issuing / Deducting Stock (เบิกจ่าย)
  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || quantity <= 0) {
      onNotify("กรุณาระบุสารดิบและปริมาณการเบิกจ่ายให้ถูกต้อง", "warning");
      return;
    }

    const material = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
    if (!material) return;

    if (material.stockLevel < quantity) {
      onNotify(`ยอดคงคลังวัสดุไม่เพียงพอ! ปัจจุบันคงเหลือเพียง ${material.stockLevel} ${material.unit}`, "error");
      return;
    }

    setLoading(true);
    try {
      const updatedMaterial = {
        ...material,
        stockLevel: Math.max(0, material.stockLevel - Number(quantity))
      };

      const matResponse = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'materials', item: updatedMaterial })
      });

      const resMat = await matResponse.json();

      if (resMat.success) {
        onNotify(`ทำเบิกจ่ายส่วนผสมน้ำหอม ${material.name} จำนวน ${quantity} ${material.unit} ออกไปปรุงบ่มสำเร็จ!`, "info");
        setShowIssueModal(false);
        setSelectedMaterialId('');
        setQuantity(0);
        onRefresh();
      } else {
        onNotify("เกิดความผิดพลาดระหว่างปรับลดยอดสต็อกสารเคมี", "error");
      }
    } catch {
      onNotify("ไม่สามารถซิงค์การเบิกจ่ายกับเซิร์ฟเวอร์หลัก", "error");
    } finally {
      setLoading(false);
    }
  };

  // Check if ingredient lot is expired
  const isExpired = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    return expiry < today;
  };

  // Check if ingredient is nearing expiration (within 6 months)
  const isNearingExpiry = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 180; // Expiring in under 180 days
  };

  return (
    <div className="space-y-6 animate-fade-in" id="chemical-stock-os-view">
      {/* Visual Header Grid inspired by iOS / macOS design */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <Clipboard className="h-5 w-5" />
              </span>
              <h2 className="font-bold text-lg text-[#1D1D1F] tracking-tight">Chemical Stock OS (ระบบคลังส่วนผสมและมวลสารเคมี)</h2>
            </div>
            <p className="text-xs text-[#86868B]">
              ระบบบริหารจัดการกระบอกสูบ ถังแก้ว สารละลายบ่ม แอลกอฮอล์ และหัวเชื้อน้ำหอม คุมมาตรฐานความพร้อมในการกลั่นปรุงผสมสูตร
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setShowReceiveModal(true);
                setShowIssueModal(false);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <ArrowDownLeft className="h-4 w-4" /> รับเข้าคลังเคมีภัณฑ์ล็อตใหม่
            </button>
            <button
              onClick={() => {
                setShowIssueModal(true);
                setShowReceiveModal(false);
              }}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <ArrowUpRight className="h-4 w-4" /> เบิกจ่ายส่งปรุงสูตรแล็บ
            </button>
          </div>
        </div>

        {/* Dynamic Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-neutral-50 p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider">ส่วนผสมทั้งหมดในสารบบ</div>
            <div className="text-xl font-bold text-[#1D1D1F]">{totalStockItems} ชนิด</div>
            <p className="text-[10px] text-[#86868B]">หัวเชื้อน้ำหอมเข้มข้น และสารละลายเจือจาง</p>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-250 text-amber-900 space-y-1">
            <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">รายการที่ต่ำกว่าระดับสำรอง (Safety Min)</div>
            <div className="text-xl font-bold text-amber-600">{lowStockItems} รายการ</div>
            <p className="text-[10px] text-amber-700">ระบบสั่งขอจัดซื้อคำนวณ PR อัตโนมัติแล้ว</p>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-indigo-950 space-y-1">
            <div className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">ล๊อตประวัติรับเข้าสินค้า (GRN Batch)</div>
            <div className="text-xl font-bold text-indigo-700">{totalReceipts} ล็อต</div>
            <p className="text-[10px] text-indigo-600">มีบันทึกพร้อมตราประทับควบคุมความเสื่อมระเหย</p>
          </div>
        </div>
      </div>

      {/* MODAL / FORM RECEIVE (เมื่อกด รับเข้า) */}
      {showReceiveModal && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-md space-y-4 animate-slide-in">
          <div className="flex justify-between items-center border-b border-[#E5E5EA] pb-3">
            <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
              <ArrowDownLeft className="h-4.5 w-4.5 text-indigo-600" />
              ลงบันทึกรับสต็อกสารหอม / บรรจุภัณฑ์นำเข้า
            </h3>
            <button 
              onClick={() => setShowReceiveModal(false)} 
              className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-semibold"
            >
              ยกเลิก ✕
            </button>
          </div>

          <form onSubmit={handleReceiveStock} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#1D1D1F]">โปรดเลือกมวลสาร / ขวดแก้ว</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white"
                required
              >
                <option value="">-- กรุณาเลือกรายการ --</option>
                {unfilteredMaterials.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.code} | {m.name} (คงเหลือ: {m.stockLevel} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1D1D1F]">จำนวนรับเข้ารวมปริมาณจริง</label>
              <input
                type="number"
                min="1"
                placeholder="ระบุจำนวน"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1D1D1F]">ระบุรหัสล็อตรหัสจัดส่ง (Lot Number)</label>
              <input
                type="text"
                placeholder="เช่น LOT2026-A1"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1D1D1F]">วันหมดอายุ / วันควบคุมหมดคุณค่า</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#1D1D1F]">บันทึกเพิ่มเติม (Notes/Location)</label>
              <input
                type="text"
                placeholder="เช่น จัดพิกัดวางไว้ตู้เย็นควบคุมความชื้นตึก C ชั้น 1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] font-bold rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                {loading ? 'กำลังดำเนินรายการ...' : 'ยืนยันรับเข้าสต็อก ✓'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL / FORM ISSUE (เมื่อกด เบิกจ่าย) */}
      {showIssueModal && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-md space-y-4 animate-slide-in">
          <div className="flex justify-between items-center border-b border-[#E5E5EA] pb-3">
            <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
              <ArrowUpRight className="h-4.5 w-4.5 text-[#FF9500]" />
              ทำรายการเบิกจ่ายมวลสาร / บรรจุภัณฑ์ไปที่ห้องปฏิบัติการปรุงสูตร
            </h3>
            <button 
              onClick={() => setShowIssueModal(false)} 
              className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-semibold"
            >
              ยกเลิก ✕
            </button>
          </div>

          <form onSubmit={handleIssueStock} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#1D1D1F]">เลือกสารดิบที่ต้องการเบิกใช้</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white"
                required
              >
                <option value="">-- กรุณาเลือกรายการ --</option>
                {unfilteredMaterials.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.code} | {m.name} (ในคลังคงเหลือ: {m.stockLevel} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1D1D1F]">ระบุจำนวนสุทธิที่จะยกไปปรุงสูตร</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="ระบุจำนวน"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white font-mono"
                required
              />
            </div>

            <div className="space-y-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#FF9500] hover:bg-[#e08400] text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                {loading ? 'กำลังดำเนินรายการ...' : 'ยืนยันเบิกจ่ายมวลสาร ✓'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Material Stocks Table (Apple minimal Look) */}
      <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E5EA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex bg-[#E8E8ED] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'All' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
            >
              ทั้งหมด ({unfilteredMaterials.length})
            </button>
            <button
              onClick={() => setCategoryFilter('Raw Material')}
              className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'Raw Material' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
            >
              สารสกัด/หัวน้ำหอม ({unfilteredMaterials.filter((m: any) => m.category === 'Raw Material').length})
            </button>
            <button
              onClick={() => setCategoryFilter('Packaging')}
              className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'Packaging' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
            >
              ขวดแก้ว/ฝาพ่นพรีเมียม ({unfilteredMaterials.filter((m: any) => m.category === 'Packaging').length})
            </button>
          </div>

          {/* Search bar inputs */}
          <div className="relative w-full sm:w-64 text-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B]" />
            <input
              type="text"
              placeholder="ค้นหารหัส หรือ ชื่อ สารเคมีดิบ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl pl-9 pr-4 py-2 outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-[#E5E5EA]">
                <th className="p-3.5 pl-5">รหัสวัสดุ</th>
                <th className="p-3.5">ชื่อสารเคมี / ส่วนผสม / วัตถุดิบดิบ</th>
                <th className="p-3.5">หมวดหมู่</th>
                <th className="p-3.5 text-right">เกณฑ์ขั้นต่ำสำรอง (Safety Min)</th>
                <th className="p-3.5 text-right">ยอดคงเหลือพร้อมใช้</th>
                <th className="p-3.5 text-center">หน่วยวัด</th>
                <th className="p-3.5 text-center">เสถียรภาพคลัง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#86868B]">
                    ไม่พบรายการสารหอมในระบบตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                materials.map((m: any) => {
                  const isLow = m.stockLevel < m.minStock;
                  return (
                    <tr key={m.id} className="hover:bg-[#F5F5F7]/40 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-neutral-800 select-all">
                        {m.code}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {m.name}
                      </td>
                      <td className="p-3.5 text-[#515154]">
                        {m.category === 'Raw Material' ? (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            หัวเชื้อ/สารเจือจางหลัก
                          </span>
                        ) : (
                          <span className="bg-neutral-100 text-[#1D1D1F] border border-[#E5E5EA] px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ขวดแก้ว/วัสดุหรูพ่น
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono text-[#86868B]">
                        {m.minStock.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold">
                        <span className={isLow ? 'text-[#FF9500]' : 'text-[#1D1D1F]'}>
                          {m.stockLevel.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-[#86868B] font-medium">
                        {m.unit}
                      </td>
                      <td className="p-3.5 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[#FF9500] font-semibold text-[11px] bg-[#FF9500]/10 px-2 py-0.5 rounded-lg">
                            <AlertTriangle className="h-3 w-3" /> ยอดวิกฤต (Safety Low)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#34C759] font-semibold text-[11px] bg-[#34C759]/10 px-2 py-0.5 rounded-lg animate-pulse">
                            <ShieldCheck className="h-3 w-3" /> สต็อกปกติปลอดภัย
                          </span>
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

      {/* Expiry Tracking Sub-Module (ติดตามวันหมดอายุสารเคมีคลังย่อย) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-rose-600" />
            ติดตามวันหมดอายุและความหอมเสื่อมถอยของล็อตเคมีภัณฑ์ (Shelf-Life & Expiry Watch)
          </h3>
          <p className="text-xs text-[#86868B]">
            เฝ้าระวังกลุ่มล็อตเคมีน้ำหอมที่ใกล้ถึงกำหนดเสื่อมสลายของสารฟิกเซทีฟ และการฟุ้งกระจายตัวของกลิ่นหอม
          </p>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-[#E5E5EA]">
                <th className="p-3 pl-5">เลขอัญประกาศควบคุม</th>
                <th className="p-3">ชื่อสารที่บรรจุ</th>
                <th className="p-3 font-mono">Lot Number</th>
                <th className="p-3 text-right">จำนวนล็อตที่นำเข้า</th>
                <th className="p-3">วันเริ่มจัดเก็บ</th>
                <th className="p-3">วันที่ควรใช้ให้หมดก่อน</th>
                <th className="p-3 text-center">ดัชนีวันหมดอายุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
              {goodsReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#86868B]">
                    ยังไม่พบตารางประวัติ Lot รับเข้าเคมีตามขั้นตอนคลังสินค้าต้นน้ำ
                  </td>
                </tr>
              ) : (
                goodsReceipts.map((gr: any) => {
                  const material = unfilteredMaterials.find((m: any) => m.id === gr.materialId) || { name: gr.materialId, unit: 'Units' };
                  const bExpired = isExpired(gr.expiryDate);
                  const bNearing = isNearingExpiry(gr.expiryDate);

                  return (
                    <tr key={gr.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                      <td className="p-3 pl-5 font-mono font-bold text-slate-800">{gr.id}</td>
                      <td className="p-3 font-semibold text-slate-700">{material.name}</td>
                      <td className="p-3 font-mono text-[#515154]">{gr.lotNumber}</td>
                      <td className="p-3 text-right font-mono font-semibold">{gr.quantityReceived} {material.unit}</td>
                      <td className="p-3 font-mono text-[#86868B]">{gr.createdAt}</td>
                      <td className="p-3 font-mono text-[#86868B] font-bold">{gr.expiryDate}</td>
                      <td className="p-3 text-center">
                        {bExpired ? (
                          <span className="bg-rose-50 border border-rose-250 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            ⚠️ เสื่อมสภาพ/หมดอายุแล้ว
                          </span>
                        ) : bNearing ? (
                          <span className="bg-amber-50 border border-amber-250 text-amber-600 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            ⏳ ด่วน! กำลังหมดอายุเร็วๆนี้
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-150 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            ✓ พร้อมใช้ มีเสถียรภาพความหอมดีเยี่ยม
                          </span>
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
    </div>
  );
}
