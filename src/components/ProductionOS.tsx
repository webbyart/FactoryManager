import React, { useState } from 'react';
import { 
  Plus, Check, Play, ShieldAlert, Package, Layers, FileSpreadsheet, 
  Settings, ShoppingCart, TrendingUp, HelpCircle, Archive, AlertTriangle, ArrowRight
} from 'lucide-react';
import GoogleSheetEditor from './GoogleSheetEditor';

interface ProductionOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function ProductionOS({ dbState, onRefresh, onNotify, userRole }: ProductionOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'boms' | 'mo' | 'procure' | 'qc' | 'inventory'>('mo');
  
  // States for forms
  const [newMO, setNewMO] = useState({ productId: '', formulaId: '', qtyRequested: 100 });
  const [newPR, setNewPR] = useState({ materialId: '', quantity: 200, urgency: 'Medium' as 'Low' | 'Medium' | 'High' });
  const [newPO, setNewPO] = useState({ prId: '', supplierId: '', materialId: '', quantity: 200 });
  const [newGRN, setNewGRN] = useState({ poId: '', lotNumber: 'LOT' + Date.now().toString().slice(-6), expiryDate: '', quantityReceived: 200 });
  
  const handleCreateMO = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newMO.productId || !newMO.formulaId || !newMO.qtyRequested) {
      onNotify("Please select product, recipe formula and target quantity.", "warning");
      return;
    }
    try {
      const response = await fetch('/api/mo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newMO.productId,
          formulaId: newMO.formulaId,
          quantityRequested: Number(newMO.qtyRequested)
        })
      });
      const data = await response.json();
      if (data.success) {
        onNotify(`Successfully logged Manufacturing Order ${data.mo.id}`, "info");
        onRefresh();
        setNewMO({ productId: '', formulaId: '', qtyRequested: 100 });
      } else {
        onNotify(data.error, "error");
      }
    } catch {
      onNotify("Network communication failed.", "error");
    }
  };

  const handleUpdateMOStatus = async (moId: string, nextStatus: string) => {
    try {
      const response = await fetch('/api/mo/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moId, status: nextStatus })
      });
      const data = await response.json();
      if (data.success) {
        onNotify(`Order ${moId} transitioned successfully to: ${nextStatus}.`, "info");
        onRefresh();
      } else {
        onNotify(data.error, "error");
      }
    } catch {
      onNotify("Failed to advance manufacturing gate.", "error");
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPR.materialId || !newPR.quantity) return;
    try {
      const res = await fetch('/api/procurement/pr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPR)
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`Purchase Request generated successfully. ID: ${data.pr.id}`, "info");
        onRefresh();
        setNewPR({ materialId: '', quantity: 200, urgency: 'Medium' });
      }
    } catch {
      onNotify("Communication failure.", "error");
    }
  };

  const handleCreatePOFromPR = async (prId: string, materialId: string, quantity: number, supplierId: string) => {
    try {
      const res = await fetch('/api/procurement/po/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prId, supplierId, materialId, quantity })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`PR escalated to official Purchase Order ID ${data.po.id}`, "info");
        onRefresh();
      }
    } catch {
      onNotify("Failed to escalate procurement slip.", "error");
    }
  };

  const handleReceiveGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newGRN.poId || !newGRN.lotNumber || !newGRN.expiryDate || !newGRN.quantityReceived) {
      onNotify("Please supply correct PO ref, lot marker and safety expiration date.", "warning");
      return;
    }
    try {
      const res = await fetch('/api/procurement/grn/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGRN)
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`Goods Receiving GRN loaded. IQC Inspection requested immediately for lot ${newGRN.lotNumber}.`, "warning");
        onRefresh();
        setNewGRN({ poId: '', lotNumber: 'LOT' + Date.now().toString().slice(-6), expiryDate: '', quantityReceived: 200 });
      }
    } catch {
      onNotify("Error recording GRN.", "error");
    }
  };

  const handleResolveQC = async (inspectionId: string, status: 'Passed' | 'Failed') => {
    try {
      const res = await fetch('/api/qc/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId, status })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`QC resolution recorded. Lot flagged as: ${status}`, status === 'Passed' ? "info" : "error");
        onRefresh();
      }
    } catch {
      onNotify("Failed to update QC ledger.", "error");
    }
  };

  // RBAC checks
  const canAccessBoms = ['Admin', 'Management', 'R&D', 'Production'].includes(userRole);
  const canModifyMO = ['Admin', 'Production', 'QC', 'Warehouse'].includes(userRole);
  const canProcure = ['Admin', 'Purchasing', 'Management'].includes(userRole);
  const canDoQC = ['Admin', 'QC', 'Management'].includes(userRole);

  const getWorkflowProgression = (status: string) => {
    const gates = ['Created', 'Material Reserved', 'Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'];
    const idx = gates.indexOf(status);
    if(idx === -1 || idx === gates.length - 1) return null;
    return gates[idx + 1];
  };

  return (
    <div className="space-y-6" id="production-os-panel">
      {/* Module Title */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">ระบบวางแผนและควบคุมคุณสมบัติการผลิตน้ำหอม</h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              ศูนย์ปรุงและบ่มน้ำหอมหรู (สูตร BOM), สั่งจ่าย-ชั่งสารบ่มน้ำหอม (MO), รายงานสมุดบันทึกรับ-เบิกสารตั้งต้น และการวิเคราะห์คุณภาพทางแล็บเรียลไทม์
            </p>
          </div>
        </div>
      </div>

      {/* Sub menu controls */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('mo')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeSubTab === 'mo' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ใบสั่งปรุงบ่มผสม (MO)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('boms')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeSubTab === 'boms' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          สูตรสารและตัวทำพรีเมียม (BOM)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('procure')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeSubTab === 'procure' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ระบบจัดซื้อคลังสารสกัด
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('qc')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeSubTab === 'qc' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ด่านควบคุมเคมีแล็บ (QC)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('inventory')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeSubTab === 'inventory' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          บันทึกเบิกรับสต็อกสาร
        </button>
      </div>

      {/* Main Section viewports */}
      <div className="min-h-[400px]">

        {/* 1. MO & DISPATCH SCREEN */}
        {activeSubTab === 'mo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Dispatch MO */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-4">
              <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" /> สร้างใบสั่งกลั่นบ่มผสมน้ำหอมใหม่ (MO)
              </h3>
              <p className="text-slate-500 text-xs">
                บันทึกกระบวนการต้มผสม สเกลความจุล็อต และดึงสีกรองสิ่งแปลกปลอมตามสูตร BOM โครงสร้างน้ำหอมหรู
              </p>
              
              {!canModifyMO ? (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-xs border border-amber-100">
                  บทบาทระดับสิทธิ์ [<strong>{userRole}</strong>] จำกัดให้อ่านรายชื่อเท่านั้น เฉพาะผู้จัดการผลิตคุมแล็บหรือแอดมินจึงสามารถสร้างใบสั่งผสมน้ำหอมได้
                </div>
              ) : (
                <form onSubmit={handleCreateMO} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">เลือกสูตรกลิ่นน้ำหอมสำเร็จรูป (Finished SKU)</label>
                    <select
                      className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-50"
                      value={newMO.productId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const fm = dbState.formulas.find((f: any) => f.productId === pid);
                        setNewMO({ ...newMO, productId: pid, formulaId: fm ? fm.id : '' });
                      }}
                      required
                    >
                      <option value="">-- เลือกสูตรกลิ่นน้ำหอม --</option>
                      {dbState.products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">รหัสสูตรวิเคราะห์ทางเคมี (Auto BOM)</label>
                    <select
                      className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-100"
                      value={newMO.formulaId}
                      readOnly
                      required
                    >
                      <option value="">-- ตรวจสอบเทียบเคียงกับผลิตภัณฑ์อัตโนมัติ --</option>
                      {dbState.formulas.map((f: any) => (
                        <option key={f.id} value={f.id}>สูตรบ่มรหัส {f.id} ({f.version})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">ปริมาณปริมาตรที่ต้องการผลิต (จำนวนขวดสำเร็จ)</label>
                    <input
                      type="number"
                      className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-50"
                      value={newMO.qtyRequested}
                      onChange={(e) => setNewMO({ ...newMO, qtyRequested: Number(e.target.value) })}
                      min={10}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    เริ่มคำนวณสัดส่วนสารเคมีและเปิดใบตัก (MO)
                  </button>
                </form>
              )}
            </div>

            {/* Active MO Grid Kanban */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 text-sm">สมุดรายวันควบคุมผลิตและขั้นตอนผสมน้ำหอมสะสม</h3>
                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">รวม {dbState.manufacturingOrders.length} รายการใบสั่ง</span>
              </div>

              <div className="space-y-4">
                {dbState.manufacturingOrders.map((mo: any) => {
                  const product = dbState.products.find((p: any) => p.id === mo.productId);
                  const nextStatus = getWorkflowProgression(mo.status);

                  return (
                    <div key={mo.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors shadow-sm space-y-4">
                      {/* Header bar */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold font-mono text-base text-slate-800">{mo.id}</span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              mo.status === 'Released' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              mo.status.includes('QC') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              mo.status === 'In Production' ? 'bg-amber-50 text-amber-700 border border-blue-100 animate-pulse' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {mo.status === 'Created' ? 'เพิ่งสร้างใบขอ' :
                               mo.status === 'Material Reserved' ? 'สำรองวัตถุดิบแล้ว' :
                               mo.status === 'In Production' ? 'กำลังผสม/บ่มกลั่น' :
                               mo.status === 'Released' ? 'ตรวจสอบผ่าน-เสร็จสิ้นล็อต' : mo.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 capitalize">{product ? product.name : 'ไม่ระบุชื่อสูตรน้ำหอม'}</p>
                          <p className="text-xs text-slate-400 font-mono">สูตรบ่มรหัส: {mo.formulaId} | เริ่มกระบวนการกลั่น: {mo.startDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium">ความจุขวดรวมที่สั่ง</p>
                          <p className="text-lg font-bold text-slate-800 font-mono">{mo.quantityRequested} ขวด</p>
                        </div>
                      </div>

                      {/* Timeline flow simulation */}
                      <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-[10px] text-slate-500 font-mono gap-1 select-none overflow-x-auto">
                        <span className={mo.status !== 'Created' ? 'text-blue-700 font-bold' : 'text-blue-500 underline'}>บันทึกขอ</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={['Material Reserved', 'Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(mo.status) ? 'text-blue-700 font-bold' : ''}>จองสารตั้งต้น</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={['Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(mo.status) ? 'text-blue-700 font-bold' : ''}>สั่งเบิก</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={['Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(mo.status) ? 'text-blue-700 font-bold' : ''}>ช่างตักชั่งตวง</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={['In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(mo.status) ? 'text-blue-700 font-bold' : ''}>ผสมต้มบ่มแช่ (PRD)</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={['Packaging', 'Finished Goods QC', 'Released'].includes(mo.status) ? 'text-blue-700 font-bold' : ''}>บรรจุขวดหัวสเปรย์ (PKG)</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={['Finished Goods QC', 'Released'].includes(mo.status) ? 'text-blue-700 font-bold' : ''}>แล็บสแกนคุณภาพ (FQC)</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={mo.status === 'Released' ? 'text-emerald-700 font-extrabold' : ''}>ส่งมอบเสร็จสมบูรณ์</span>
                      </div>

                      {/* Cost metrics if resolved */}
                      {mo.costSummary && (
                        <div className="p-3 bg-indigo-50/50 rounded-xl grid grid-cols-2 md:grid-cols-5 text-center text-xs gap-2 border border-indigo-100/40">
                          <div>
                            <p className="text-slate-500">ต้นทุนหัวน้ำหอมดิบ</p>
                            <p className="font-semibold text-slate-800">฿{mo.costSummary.materialCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">ค่าบรรจุภัณฑ์ขวดพรีเมียม</p>
                            <p className="font-semibold text-slate-800">฿{mo.costSummary.packagingCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">ค่าแรงทีมผสมแล็บ</p>
                            <p className="font-semibold text-slate-800">฿{mo.costSummary.laborCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">ค่าการจัดการ &amp; โสหุ้ยบ่ม</p>
                            <p className="font-semibold text-slate-800">฿{mo.costSummary.overheadCost.toLocaleString()}</p>
                          </div>
                          <div className="bg-emerald-50 px-2 py-1 rounded">
                            <p className="text-emerald-700 font-medium font-sans">ต้นทุนรวมต่อหนึ่งขวด</p>
                            <p className="font-bold text-emerald-800">฿{mo.costSummary.costPerPiece}</p>
                          </div>
                        </div>
                      )}

                      {/* Fast Action Buttons */}
                      {canModifyMO && nextStatus && (
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleUpdateMOStatus(mo.id, nextStatus)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 py-1.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Play className="h-4 w-4" />
                            อนุมัติข้ามขั้นตอนกระบวนการผลิตไปที่: {
                              nextStatus === 'Material Reserved' ? 'ขั้นตอนจองวัตถุดิบ' :
                              nextStatus === 'Material Issued' ? 'ขั้นตอนหยิบเบิกจ่าย' :
                              nextStatus === 'Weighing' ? 'ขั้นตอนทีมชั่งตวงตัก' :
                              nextStatus === 'In Production' ? 'ขั้นตอนบ่มบดหมุนเวียน (PRD)' :
                              nextStatus === 'Packaging' ? 'ขั้นตอนขันบรรจุสเปรย์ (PKG)' :
                              nextStatus === 'Finished Goods QC' ? 'ขั้นตอนส่งคิวสแกนสารปนเปื้อน (FQC)' :
                              nextStatus === 'Released' ? 'เสร็จสมบูรณ์เรียบร้อย' : nextStatus
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. BOM RECIPE MANAGER */}
        {activeSubTab === 'boms' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" /> โครงสร้างและบันทึกสูตรผสมสารสำหรับผลิตน้ำหอมพรีเมียม (BOM)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dbState.formulas.map((form: any) => {
                const associatedProduct = dbState.products.find((p: any) => p.id === form.productId);
                
                return (
                  <div key={form.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-colors">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 font-mono text-sm">{form.id}</span>
                        <p className="text-xs text-slate-500 font-semibold">{associatedProduct ? associatedProduct.name : 'ไม่มีชื่อสินค้าวัตถุโบราณ'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100">เวอร์ชันปรับตั้ง {form.version}</span>
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-100">{form.status === 'Approved' ? 'ได้รับการตรวจสอบและอนุมัติแล้ว' : form.status}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ส่วนประกอบวัตถุดิบและหัวเชื้อน้ำหอมสกัดเดี่ยว (สัดส่วนร้อยละต่อขวด 1 ขวด / unit)</p>
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-mono">
                            <th className="pb-1.5">ชื่อสารเคมี / บรรจุภัณฑ์</th>
                            <th className="pb-1.5 text-right">สัดส่วนที่ระบุต่อหนึ่งขวดสำเร็จ</th>
                            <th className="pb-1.5 text-right font-sans">ต้นทุนสแตนดาร์ด</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.map((item: any) => {
                            const mat = dbState.materials.find((m: any) => m.id === item.materialId);
                            return (
                              <tr key={item.materialId} className="border-b border-slate-100/50">
                                <td className="py-2">
                                  <p className="font-medium text-slate-800">{mat ? mat.name : 'สารเติมแต่งคุมจาง'}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{mat ? mat.code : 'RAW-MAT'}</p>
                                </td>
                                <td className="py-2 text-right font-mono text-slate-800">{item.quantity} {mat?.unit}</td>
                                <td className="py-2 text-right font-mono text-slate-400">
                                  ฿{mat ? (item.quantity * mat.costPerUnit).toFixed(2) : '0.00'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="text-right pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        ตราอนุมัติป้องกันความลับสูตรโดย: <strong className="text-slate-700">{form.approvedBy || 'หัวหน้าเชี่ยวชาญเครื่องสำอาง'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. PROCUREMENT DESK */}
        {activeSubTab === 'procure' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Manual PR Trigger */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">ออกใบขอจัดซื้อเติมวัตถุดิบเจือจางและสารหอมเดี่ยว (PR)</h4>
                <p className="text-xs text-slate-500">จัดส่งแบบคำขอใบจัดซื้อเพื่อเติมสต็อกวัตถุดิบและหัวเชื้อเพื่อป้องกันการขาดแคลน</p>
                <form onSubmit={handleCreatePR} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">เลือกหัวเชื้อมวลสารและบรรจุภัณฑ์หรู</label>
                    <select
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50"
                      value={newPR.materialId}
                      onChange={(e) => setNewPR({ ...newPR, materialId: e.target.value })}
                      required
                    >
                      <option value="">-- เลือกวัตถุดิบหรือสารหอม --</option>
                      {dbState.materials.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.code} | {m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">ปริมาณที่ต้องการจัดส่งจัดซื้อเพิ่มเติม</label>
                    <input
                      type="number"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50"
                      value={newPR.quantity}
                      onChange={(e) => setNewPR({ ...newPR, quantity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">ระดับความสำคัญทางเคมี</label>
                    <select
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50"
                      value={newPR.urgency}
                      onChange={(e) => setNewPR({ ...newPR, urgency: e.target.value as any })}
                    >
                      <option value="Low">ลำดับปกติ (Low)</option>
                      <option value="Medium">ลำดับเร่งรัด (Medium)</option>
                      <option value="High">ลำดับฉุกเฉินขาดสต็อกสาย (High)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 font-semibold text-xs transition-colors shadow-xs"
                  >
                    บันทึกร่างคำเจตจำนงใบจัดซื้อ
                  </button>
                </form>
              </div>

              {/* GRN receiving dock */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">ด่านรับสต็อกสินค้าเข้าและออกใบรับของ (GRN)</h4>
                <p className="text-xs text-slate-500">บันทึกการขับรถจัดจ่ายขนสารตั้งต้นจากต่างจังหวัดหรือท่าเรือ ระบบจะส่งวิเคราะห์แล็บ IQC ทันที</p>
                <form onSubmit={handleReceiveGRN} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">จับระบุเทียบกับคู่ใบสั่งซื้อ (PO Match)</label>
                    <select
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50"
                      value={newGRN.poId}
                      onChange={(e) => setNewGRN({ ...newGRN, poId: e.target.value })}
                      required
                    >
                      <option value="">-- เลือกใบ PO ที่พร้อมเปิดรับสินค้า --</option>
                      {dbState.purchaseOrders.filter((po: any)=> po.status === 'Issued').map((po: any) => (
                        <option key={po.id} value={po.id}>{po.id} | จำนวน {po.quantity} (เจ้าจำหน่าย: {po.supplierId})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">ระบุเลล็อตวิเคราะห์เคมี (Manufacture Lot Number)</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50 font-mono"
                      value={newGRN.lotNumber}
                      onChange={(e) => setNewGRN({ ...newGRN, lotNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">วันหมดอายุหรือคุมความหอมเสื่อม (BOM Expiry Date)</label>
                    <input
                      type="date"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50"
                      value={newGRN.expiryDate}
                      onChange={(e) => setNewGRN({ ...newGRN, expiryDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">จำนวนรวมปริมาณจริงที่ยกขึ้นชั้นวาง</label>
                    <input
                      type="number"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50"
                      value={newGRN.quantityReceived}
                      onChange={(e) => setNewGRN({ ...newGRN, quantityReceived: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white rounded-xl py-2 font-semibold text-xs"
                  >
                    สร้างใบรับส่วนผสม (GRN) และเปิดทดสอบคุณภาพแล็บ
                  </button>
                </form>
              </div>
            </div>

            {/* active PR/PO/GRN pipeline list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Purchase Requests */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm">ท่อส่งขบวนการจัดซื้อวัตถุดิบ (Purchase Requests Pipeline)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 font-mono text-slate-400 text-left">
                        <th className="pb-2">รหัสอ้างอิง PR</th>
                        <th className="pb-2">ชื่อสารดิบ / ขวด</th>
                        <th className="pb-2 text-right">ปริมาตรความจุ</th>
                        <th className="pb-2 text-center">ลำดับความเร็ว</th>
                        <th className="pb-2">สถานะใบงาน</th>
                        <th className="pb-2 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbState.purchaseRequests.map((pr: any) => {
                        const mat = dbState.materials.find((m: any) => m.id === pr.materialId);
                        
                        return (
                          <tr key={pr.id} className="border-b border-slate-100">
                            <td className="py-2.5 font-bold font-mono text-slate-800">{pr.id}</td>
                            <td className="py-2.5">{mat ? mat.name : pr.materialId}</td>
                            <td className="py-2.5 text-right font-mono">{pr.quantity} {mat?.unit}</td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pr.urgency === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                              }`}>{pr.urgency === 'High' ? 'ฉุกเฉินด่วนที่สุด' : pr.urgency === 'Medium' ? 'เร่งรัด' : 'ปกติ'}</span>
                            </td>
                            <td className="py-2.5 font-semibold text-slate-500">
                              {pr.status === 'Draft' ? 'รอดำเนินการจัดเก็บ' :
                               pr.status === 'Approved' ? 'ได้รับการอนุมัติคำขอ' :
                               pr.status === 'PO Issued' ? 'ออกใบจัดสั่งแล้ว' : pr.status}
                            </td>
                            <td className="py-2.5 text-right">
                              {pr.status === 'Draft' && canProcure && (
                                <button
                                  type="button"
                                  onClick={() => handleCreatePOFromPR(pr.id, pr.materialId, pr.quantity, 'supp-1')}
                                  className="bg-blue-600 text-white rounded px-2.5 py-1 text-[10px] font-semibold"
                                >
                                  ออกใบสั่งซื้อ (PO)
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase Orders Issued */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm">รายการใบกำกับราคาสั่งซื้อแก่คู่ค้า (Purchase Orders Issued)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 font-mono text-slate-400 text-left">
                        <th className="pb-2">รหัสอ้างอิง PO</th>
                        <th className="pb-2">ผู้จำหน่ายกลิ่น / ขวด</th>
                        <th className="pb-2 text-right">รหัสอ้างอิง PR</th>
                        <th className="pb-2 text-right font-mono">มูลค่าจัดหาภาระ</th>
                        <th className="pb-2 text-right">สถานะใบงาน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbState.purchaseOrders.map((po: any) => (
                        <tr key={po.id} className="border-b border-slate-100">
                          <td className="py-2.5 font-bold font-mono text-slate-800">{po.id}</td>
                          <td className="py-2.5 font-semibold">{po.supplierId === 'supp-1' ? 'เกราะแบรนด์สารหรู กราสเซ่ (ฝรั่งเศส)' : po.supplierId}</td>
                          <td className="py-2.5 text-right font-mono text-slate-400">{po.prId || 'จัดซื้อโดยตรง'}</td>
                          <td className="py-2.5 text-right font-semibold text-slate-700">฿{po.totalCost.toLocaleString()}</td>
                          <td className="py-2.5 text-right">
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {po.status === 'Issued' ? 'ส่งประเมินโรงกลั่น' : po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. QUALITY CONTROL HUB (IQC & NCR) */}
        {activeSubTab === 'qc' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" /> ด่านประเมินผลควบคุมคุณภาพแล็บ (QC Inspection)
                </h3>
                <p className="text-slate-500 text-xs mt-1">วิเคราะห์ประเมินสูตรความคงทนและอนุมัติชุดล็อตสารหอม หากไม่ผ่านเกณฑ์ระบบจะทำการกักกันล็อตนั้น (Qurantine) เพื่อทำรายงานการไม่เป็นไปตามข้อกำหนด (NCR)</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">ผลรายการรอดำเนินการบวกจัดจองคิว รวม {dbState.qcInspections.length} รายการ</span>
            </div>

            <div className="space-y-4">
              {dbState.qcInspections.map((qc: any) => (
                <div key={qc.id} className="border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-sm text-slate-800">{qc.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          qc.sourceType === 'Incoming' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>{qc.sourceType === 'Incoming' ? 'รับเข้าผลิตชั้นนอก (Incoming)' : qc.sourceType} ตรวจสอบ</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">ฉลากรหัสล็อตติดตาม / เลขอัญประกาศ: <strong className="text-slate-700">{qc.referenceId}</strong> | วันเริ่มนัดแล็บ: {qc.createdAt}</p>
                    </div>

                    <div>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase ${
                        qc.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        qc.status === 'Failed' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-bounce' :
                        'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {qc.status === 'Pending' ? 'อยู่ระหว่างการทดสอบในท่อกลั่น' :
                         qc.status === 'Passed' ? 'มีเสถียรภาพกลิ่นผ่านเกณฑ์' :
                         qc.status === 'Failed' ? 'ล้มเหลว ตกตะกอน/กักกันล็อต' : qc.status}
                      </span>
                    </div>
                  </div>

                  {/* Checklist and technical parameters */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">บันทึกการตรวจสอบมาตรฐานสกัดและส่วนผสมน้ำหอมชีวเคมี</h4>
                    <div className="space-y-2 text-xs">
                      {qc.parameters.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-slate-700 border-b border-dashed border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                          <div>
                            <span className="font-medium">{p.name === 'Water Activity (aw)' ? 'สัดส่วนเจือปนน้ำบ่ม' :
                                                      p.name === 'PH Value' ? 'ค่าความกรดด่างสัมผัสสัมผัส (pH)' :
                                                      p.name === 'Purity Level' ? 'ค่าความบริสุทธิ์ของหัวหอมหลัก' :
                                                      p.name === 'Spectroscopy Match' ? 'ความเข้ากันได้ของการวัดคลื่นแสง (Spectroscopy)' :
                                                      p.name === 'Sealing Integrity' ? 'คุณภาพกระบอกเกลียวกด' : p.name}</span>
                            <p className="text-[10px] text-slate-400 font-mono">ขีดจำกัดค่าจำเพาะมาตรฐานที่ควรจะเป็น: {p.expected}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-slate-800 font-semibold">{p.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resolve parameters controls */}
                  {qc.status === 'Pending' && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] text-slate-400">นักเคมีผู้ทดสอบความหอมเสถียร: <strong className="text-slate-600">{qc.inspector}</strong></span>
                      {canDoQC ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleResolveQC(qc.id, 'Failed')}
                            className="bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 py-1.5 px-4 rounded-xl text-xs font-semibold"
                          >
                            ปฏิเสธและกักสารเคมี (NCR)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveQC(qc.id, 'Passed')}
                            className="bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 py-1.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Check className="h-4 w-4" />
                            ลงตราวินิจฉัยผ่านคุณสมบัติ (CoA)
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-100 p-2 rounded-xl">จำกัดการบันทึกแก้ไขเฉพาะนักวิจัยแล็บหอม QC เท่านั้น</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FIFO FEFO WAREHOUSE STOCKS */}
        {activeSubTab === 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-600" /> บัญชีคลังวัตถุดิบและบรรจุภัณฑ์ขวดดีไซน์ (FIFO & FEFO)
                </h3>
                <p className="text-xs text-slate-500">ควบคุมติดตามป้องกันวิกฤตวัตถุดิบเคมีหอมขาดคลังแปรเปลี่ยนตามขั้นต่ำแบบเรียลไทม์ พร้อมเปิดสัญญาณเตือนเมื่อต่ำกว่าปริมาณสำรอง</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-600 text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">รหัสวัตถุดิบ/วัสดุ</th>
                    <th className="py-3 px-4">รายการวัตถุดิบน้ำหอม/สารเจือจาง</th>
                    <th className="py-3 px-4">ประเภทการจำแนก</th>
                    <th className="py-3 px-4 text-right">ระดับสำรองขั้นต่ำ (Safety Min)</th>
                    <th className="py-3 px-4 text-right">ยอดสต็อกคงเหลือพร้อมใช้</th>
                    <th className="py-3 px-4 text-center">หน่วยวัด</th>
                    <th className="py-3 px-4 text-right">ราคาทุนเฉลี่ยเคมีภัณฑ์</th>
                    <th className="py-3 px-4 text-right">เสถียรภาพคงคลัง</th>
                  </tr>
                </thead>
                <tbody>
                  {dbState.materials.map((m: any) => {
                    const pctSafety = m.stockLevel >= m.minStock ? 'ปกติวิสัยคงคลัง' : 'วิกฤตต่ำเกณฑ์เตือนเติม';
                    
                    return (
                      <tr key={m.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        m.stockLevel < m.minStock ? 'bg-rose-50/20' : ''
                      }`}>
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-800">{m.code}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{m.name}</td>
                        <td className="py-3.5 px-4">
                          {m.category === 'Raw Material' ? 'สารสกัด/หัวน้ำหอม (Raw Material)' : 
                           m.category === 'Packaging' ? 'ขวดแก้ว/ฝาพ่นพรีเมียม (Packaging)' : m.category}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500">{m.minStock}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-800">{m.stockLevel}</td>
                        <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{m.unit}</td>
                        <td className="py-3.5 px-4 text-right font-mono">฿{m.costPerUnit.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            m.stockLevel >= m.minStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>{pctSafety}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Google Sheet Simulator component bottom of page */}
      {(() => {
        const getSheetConfig = () => {
          switch (activeSubTab) {
            case 'mo':
              return {
                tableKey: 'manufacturingOrders',
                tableName: 'ใบสั่งผลิตผลิตภัณฑ์ (Manufacturing Orders)',
                columns: [
                  { key: 'id', label: 'รหัสสั่งผลิต (MO ID)', type: 'text', readOnly: true },
                  { key: 'productId', label: 'รหัสผลิตภัณฑ์', type: 'text' },
                  { key: 'formulaId', label: 'รหัสสูตรผลิต', type: 'text' },
                  { key: 'quantityRequested', label: 'จำนวนสั่งผลิต', type: 'number' },
                  { key: 'quantityProduced', label: 'จำนวนที่ผลิตแล้ว', type: 'number' },
                  { key: 'status', label: 'สถานะขั้นตอน', type: 'select', options: ['Created', 'Material Reserved', 'Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'] }
                ] as any,
                data: dbState.manufacturingOrders || []
              };
            case 'inventory':
              return {
                tableKey: 'materials',
                tableName: 'คลังวัตถุดิบและวัสดุอุปกรณ์ (Materials)',
                columns: [
                  { key: 'id', label: 'รหัสวัตถุดิบ (ID)', type: 'text', readOnly: true },
                  { key: 'code', label: 'รหัสโค้ด', type: 'text' },
                  { key: 'name', label: 'ชื่อวัตถุดิบ / วัสดุชิ้นส่วน', type: 'text' },
                  { key: 'category', label: 'หมวดหมู่สินค้า', type: 'text' },
                  { key: 'stockLevel', label: 'คลังสะสมคงเหลือ', type: 'number' },
                  { key: 'minStock', label: 'ระดับเกณฑ์ขั้นต่ำ', type: 'number' },
                  { key: 'unit', label: 'หน่วยวัด', type: 'text' },
                  { key: 'costPerUnit', label: 'ต้นทุนต่อหน่วย (บาท)', type: 'number' }
                ] as any,
                data: dbState.materials || []
              };
            case 'procure':
              return {
                tableKey: 'purchaseRequests',
                tableName: 'แบบคำขอซื้อวัตถุดิบจัดซื้อ (Purchase Requests)',
                columns: [
                  { key: 'id', label: 'รหัสขอซื้อ(PR ID)', type: 'text', readOnly: true },
                  { key: 'materialId', label: 'รหัสวัตถุดิบ', type: 'text' },
                  { key: 'quantity', label: 'จำนวนสั่งซื้อ', type: 'number' },
                  { key: 'urgency', label: 'ระดับความเร็ว', type: 'select', options: ['Low', 'Medium', 'High'] },
                  { key: 'status', label: 'สถานะของเอกสาร', type: 'select', options: ['Draft', 'Approved', 'PO Issued', 'Rejected'] },
                  { key: 'requestedBy', label: 'เจ้าหน้าที่ขอซื้อ', type: 'text' }
                ] as any,
                data: dbState.purchaseRequests || []
              };
            case 'qc':
              return {
                tableKey: 'qcInspections',
                tableName: 'การส่งตรวจควบคุมคุณภาพสินค้า (QC Inspections)',
                columns: [
                  { key: 'id', label: 'รหัสบันทึก QC', type: 'text', readOnly: true },
                  { key: 'lotNumber', label: 'ล็อตสลากกำกับสินค้า', type: 'text' },
                  { key: 'inspector', label: 'ผู้ตรวจสอบและเซ็นรับ', type: 'text' },
                  { key: 'status', label: 'ผลสรุปคุณภาพ', type: 'select', options: ['Pending', 'Passed', 'Failed'] },
                  { key: 'notes', label: 'บันทึกความปลอดภัยเพิ่ม', type: 'text' }
                ] as any,
                data: dbState.qcInspections || []
              };
            default:
              return null;
          }
        };

        const config = getSheetConfig();
        if (!config) return null;
        
        return (
          <GoogleSheetEditor
            tableKey={config.tableKey}
            tableName={config.tableName}
            columns={config.columns}
            data={config.data}
            onRefresh={onRefresh}
            onNotify={onNotify}
          />
        );
      })()}
    </div>
  );
}
