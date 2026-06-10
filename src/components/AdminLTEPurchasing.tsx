import React, { useState } from 'react';
import { 
  ShoppingCart, Plus, CheckSquare, Search, Award, Star, 
  Trash2, Layers, CheckCircle, ArrowRight, ShieldCheck, FileCheck
} from 'lucide-react';

interface AdminLTEPurchasingProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTEPurchasing({ dbState, onRefresh, onNotify }: AdminLTEPurchasingProps) {
  const [activePurchTab, setActivePurchTab] = useState<'po' | 'supplier' | 'receive'>('po');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated PO Approval states
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([
    { id: 'PO-2026-004', supplierName: 'Robertet France Scent Co.', itemName: 'กุหลาบฝรั่งเศส Centric Oil', qty: 200, status: 'รอการอนุมัติใบสั่งซื้อ' },
    { id: 'PO-2026-005', supplierName: 'ไทยแพคเกจจิ้ง แอนด์ ลักซูรี่ บ็อกซ์', itemName: 'กล่องพิมพ์ฟอยล์ทองพรีเมียม', qty: 1500, status: 'อนุมัติสั่งซื้อแล้ว' },
    { id: 'PO-2026-006', supplierName: 'ศิริมงคล เคมีคอล แอดดิทิฟส์', itemName: 'เอทานอลแปลงสภาพ 99.9%', qty: 2500, status: 'รอการอนุมัติใบสั่งซื้อ' }
  ]);

  // Supplier list with ratings
  const suppliers = [
    { id: 'sup-1', name: 'Robertet Fragrance Distillery (France)', code: 'SUPP-ROB-FR', ratings: 5, cert: 'GMP Certified' },
    { id: 'sup-2', name: 'บริษัท ไทยแพคเกจจิ้ง แอนด์ ลักซูรี่ บ็อกซ์ จำกัด', code: 'SUPP-THAI-PACK', ratings: 4, cert: 'ISO 9001' },
    { id: 'sup-3', name: 'ศิริมงคล เคมีคอล แอดดิทิฟส์', code: 'SUPP-SIRI-CHEM', ratings: 4, cert: 'GMP Cosmetics Standard' }
  ];

  const handleApprovePO = (poId: string) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: 'อนุมัติสั่งซื้อแล้ว' } : po));
    onNotify(`อนุมัติใบสั่งซื้อรหัส ${poId} สำเร็จ ส่งต่อซัพพลายเออร์หลักแล้ว`, "success");
  };

  // Goods receiving states
  const [newGR, setNewGR] = useState({
    poId: 'PO-2026-004',
    lotNumber: 'LOT-ESS-ROSE-556',
    coaCode: 'COA-9812-ROSE',
    sealIntact: true,
    tempPass: true
  });

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matchPO = purchaseOrders.find(po => po.id === newGR.poId);
      const prdName = matchPO ? matchPO.itemName : "กุหลาบฝรั่งเศส Centric Oil";
      
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'goodsReceipts',
          item: {
            id: `GRN-${Date.now().toString().slice(-4)}`,
            poId: newGR.poId,
            supplierId: 'supp-1',
            materialId: 'mat-001',
            quantityReceived: 200,
            lotNumber: newGR.lotNumber,
            expiryDate: '2028-12-31',
            status: 'Pending QC',
            coaCode: newGR.coaCode,
            sealIntact: newGR.sealIntact ? "YES" : "NO",
            tempPass: newGR.tempPass ? "YES" : "NO"
          }
        })
      });

      if (!response.ok) throw new Error();

      onNotify(`ทำรับสินค้าล็อต ${newGR.lotNumber} (GMP QC Verified) สำเร็จแล้ว! ดำเนินการออกบันทึก COA: ${newGR.coaCode}`, "success");
      onRefresh();
    } catch {
      onNotify("เกิดข้อผิดพลาดในการลงทะเบียนรับสินค้า", "error");
    }
  };

  return (
    <div className="space-y-6" id="purchasing-module-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShoppingCart className="h-5.5 w-5.5 text-primary" />
          ระบบงานจัดซื้อสารเคมีดิบ (Cosmetic GMP Sourcing &amp; Procurement)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">บริหารใบขอซื้อ (PR), รันพิจารณาใบอนุมัติสั่งซื้อ (PO), ประเมินเรทซัพพลายเออร์, ลง GMP Goods Receivings พร้อมผูกใบ COA สากลชงสืบค้นย้อนหลัง</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActivePurchTab('po')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activePurchTab === 'po' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          📄 อนุมัติใบจัดซื้อ (PO Approve)
        </button>
        <button
          type="button"
          onClick={() => setActivePurchTab('supplier')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activePurchTab === 'supplier' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ⭐ ซัพพลายเออร์และเรทติ้ง
        </button>
        <button
          type="button"
          onClick={() => setActivePurchTab('receive')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activePurchTab === 'receive' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-705'
          }`}
        >
          📥 ทำตรวจรับสินค้า (GMP Goods Receiving &amp; COA)
        </button>
      </div>

      {activePurchTab === 'po' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-3">เลขที่ใบ PO</th>
                <th className="p-3">บริษัทขดจัดส่ง (Supplier)</th>
                <th className="p-3">รายการสั่งซื้อเคมีภัณฑ์</th>
                <th className="p-3 text-right">ปริมาณ</th>
                <th className="p-3 text-center">มิติของสถานะทวน</th>
                <th className="p-3 text-center">ดำเนินการด่วน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/65">
                  <td className="p-3 font-mono font-bold text-primary">{po.id}</td>
                  <td className="p-3 font-bold">{po.supplierName}</td>
                  <td className="p-3">{po.itemName}</td>
                  <td className="p-3 text-right font-mono font-bold">{po.qty.toLocaleString()} หน่วย</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      po.status === 'อนุมัติสั่งซื้อแล้ว' 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {po.status === 'รอการอนุมัติใบสั่งซื้อ' ? (
                      <button
                        type="button"
                        onClick={() => handleApprovePO(po.id)}
                        className="bg-primary text-white font-bold text-[10px] px-2 py-1 rounded-lg hover:bg-opacity-95 shadow-sm"
                      >
                        ✔ อนุมัติใบจัดซื้อ
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">✔ ส่งซัพพลายเออร์แล้ว</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activePurchTab === 'supplier' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
              <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{s.code}</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">{s.name}</strong>
              
              <div className="flex gap-1 text-amber-400" id="supplier-quality-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < s.ratings ? 'fill-current text-warning' : 'text-slate-300'}`} />
                ))}
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t dark:border-slate-850">
                <span>มาตรฐานตรวจสอบ:</span>
                <span className="text-emerald-500 font-bold">{s.cert}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activePurchTab === 'receive' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">บันทึกตรวจรับสินค้าหน้าด่าน (GMP Goods Receipt)</strong>
            
            <form onSubmit={handleReceiveGoods} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">เลือกใบจัดซื้อ PO รอของ:</label>
                <select
                  value={newGR.poId}
                  onChange={(e) => setNewGR({ ...newGR, poId: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg outline-none cursor-pointer"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>{po.id} - {po.itemName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">หมายเลขแบทช์/ซัพพลายเออร์ล็อต (Lot):</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น LOT-ESS-ROSE-556"
                  value={newGR.lotNumber}
                  onChange={(e) => setNewGR({ ...newGR, lotNumber: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">รหัสใบ COA ที่แนบมาสำเร็จ:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น COA-9812-ROSE"
                  value={newGR.coaCode}
                  onChange={(e) => setNewGR({ ...newGR, coaCode: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newGR.sealIntact}
                    onChange={(e) => setNewGR({ ...newGR, sealIntact: e.target.checked })}
                    className="h-4 w-4 rounded text-primary border-slate-300 focus:ring-primary"
                  />
                  ฝาปิดและสลักถังเคมีไม่เสียหาย (Seal Intact)
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newGR.tempPass}
                    onChange={(e) => setNewGR({ ...newGR, tempPass: e.target.checked })}
                    className="h-4 w-4 rounded text-primary border-slate-300 focus:ring-primary"
                  />
                  อุณหภูมิคุมแช่ถังผ่านปกติ (Temp Controlled)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-opacity-95 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-xs"
              >
                ✔ บันทึกปิดรับและออกรันนิ่งล็อต
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">คลังสืบค้นประวัติใบรับรอง COA ทวนสอบย้อนหลัง (COA Archiver)</strong>
            <p className="text-[11px] text-slate-400">ผู้ตรวจสอบความปลอดภัยสามารถย้อนเสาะหาวิเคราะห์ความบริสุทธิ์ของสารเคมีนำเข้าด้วยเลขใบวิเคราะห์แบน</p>
            
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {(dbState.goodsReceipts || []).map((gr: any) => (
                <div key={gr.id} className="p-3 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded font-bold">COA CERTIFIED</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">ล็อตรหัสจัดเก็บ: {gr.lotNumber}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ซัพพลายเออร์ล็อตอ้างอิง: {gr.id} | วันที่รับเข้า: {gr.createdAt}</p>
                  </div>

                  <span className="text-[10px] bg-primary/10 text-primary font-mono font-bold px-2 py-1 rounded-lg">
                    {gr.coaCode || 'COA-9812-ROSE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
