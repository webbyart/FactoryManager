import React, { useState } from 'react';
import { 
  FileText, Plus, CheckSquare, Search, ChevronRight, 
  Check, Play, ArrowRight, DollarSign, RefreshCw, Layers
} from 'lucide-react';

interface AdminLTESalesProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTESales({ dbState, onRefresh, onNotify }: AdminLTESalesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'quotes' | 'jobs'>('quotes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated OEM quotations
  const [quotes, setQuotes] = useState<any[]>([
    { id: 'QT-2026-001', customerName: 'บริษัท คิงพาวเวอร์ บิวตี้ ดิสทริบิวชั่น จำกัด', productName: 'กลิ่น Chérie Rose EDP', qty: 500, pricePerPiece: 2450, total: 1225000, status: 'รอการอนุมัติผลิต' },
    { id: 'QT-2026-002', customerName: 'บริษัท มัทสึโมโตะ คิโยชิ โฮลดิ้ง จำกัด', productName: 'Midnight Oud Extrait 50ml', qty: 200, pricePerPiece: 4200, total: 840000, status: 'อนุมัติเรียบร้อย' },
    { id: 'QT-2026-003', customerName: 'กลุ่มธุรกิจสปารับจ้างผลิต แอนนิแมค', productName: 'Summer Citrus Body Mist', qty: 1000, pricePerPiece: 690, total: 690000, status: 'รอการอนุมัติผลิต' }
  ]);

  // Handle quote approval & automate job generation + MO creation
  const handleApproveQuote = async (quote: any) => {
    try {
      // 1. Create a job/MO in dbState via API
      const randomJobNum = `JO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const pObj = dbState.products?.find((p: any) => p.name.includes(quote.productName.substring(0, 10))) || dbState.products?.[0];
      
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'manufacturingOrders',
          item: {
            id: randomJobNum,
            productId: pObj ? pObj.id : 'prod-001',
            formulaId: 'form-001',
            quantityRequested: quote.qty,
            quantityProduced: 0,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Weighing', // Moves production straight to weighing step
            costSummary: {
              materialCost: quote.qty * 120,
              packagingCost: quote.qty * 35,
              laborCost: quote.qty * 15,
              overheadCost: quote.qty * 10,
              lossCost: quote.qty * 2,
              totalCost: quote.qty * 182,
              costPerPiece: 182
            }
          }
        })
      });

      if (!response.ok) throw new Error();

      // Update state
      setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'อนุมัติเรียบร้อย' } : q));
      onNotify(`อนุมัติใบเสนอราคา ${quote.id} สำเร็จ! รหัสจ๊อบผลิตสร้างอัตโนมัติ: ${randomJobNum}`, "success");
      onRefresh();
    } catch {
      onNotify("เกิดข้อผิดพลาดในการรันกระบวนการ", "error");
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="sales-order-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-5.5 w-5.5 text-primary" />
          ระบบสั่งจ้างขายและสั่งปล่อยผลิต (Quotations &amp; Sales Run)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">ประสานงานผู้ซื้อภายนอก, รันใบเสนอราคา (Quotations), อนุมัติสั่งทำแบรนด์ OEM ด่วน, และแปลงเปิด Job จ๊อบอัตโนมัติลงสู่อันดับผลิต</p>
      </div>

      {/* Primary tab switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('quotes')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'quotes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          📄 ใบเสนอราคาค้างทวนสอบคัดแบรนด์
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('jobs')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ⚙️ แผนประวัติสั่งปล่อยผลิต (Active Sales Jobs)
        </button>
      </div>

      {activeSubTab === 'quotes' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-150 dark:border-slate-850">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ร่วมเสนอแบรดน์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-2 pl-8 border dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="text-[10px] text-[#A1A1A6] font-mono tracking-wider font-bold">ยอดเงินจองวางระบบ: ฿3,200,000</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    <th className="p-3">เลขที่บัญชีใบสลัก</th>
                    <th className="p-3">คู่นิติบัญชีบริษัทผู้ซื้อ</th>
                    <th className="p-3">สินค้าเป้าหมาย</th>
                    <th className="p-3">ขนาดความจุ</th>
                    <th className="p-3 text-right">ยอดรวมมูลค่าใบคำ</th>
                    <th className="p-3 text-center">มิติของสเตตัส</th>
                    <th className="p-3 text-center">คำสั่งผลิตและอนุมัติ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                  {filteredQuotes.map((q: any) => (
                    <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950">
                      <td className="p-3 font-mono font-bold text-primary">{q.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{q.customerName}</td>
                      <td className="p-3">{q.productName}</td>
                      <td className="p-3 font-mono">{q.qty.toLocaleString()} ชิ้น</td>
                      <td className="p-3 font-mono text-right font-black text-rose-600 dark:text-pink-400">฿{q.total.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          q.status === 'อนุมัติเรียบร้อย' 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {q.status === 'รอการอนุมัติผลิต' ? (
                          <button
                            type="button"
                            onClick={() => handleApproveQuote(q)}
                            className="bg-primary hover:bg-opacity-95 text-white font-bold px-2.5 py-1 text-[10px] rounded-lg transition-all flex items-center gap-1 mx-auto shadow-xs"
                          >
                            <Play className="h-3 w-3" /> ยืนยันปล่อยสูตรกวน
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic flex items-center justify-center gap-1">✔ รัน Job ผลิตเรียบร้อย</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Action production job timeline logs */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wide">เส้นทางการปล่อยและคุมตารางจ๊อบ (Sales Job Control Panel)</strong>
          <p className="text-[11px] text-slate-400 leading-normal">สถานะจริงสะสมงานผลิตเพื่อเปรียบเทียบตารางความปลอดภัยในคลังสินค้าและเป้าประเมิน ISO 22716 ของผู้ซื้อหลัก</p>
          
          <div className="space-y-3.5 pt-2">
            {(dbState.manufacturingOrders || []).map((mo: any) => (
              <div key={mo.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold bg-[#6F42C1]/10 text-primary px-2 py-0.5 rounded">JOB: {mo.id}</span>
                    <strong className="text-xs text-slate-900 dark:text-white capitalize">โมเดลน้ำหอม SKU {mo.productId}</strong>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">วันที่ฝ่ายบัญชีคีย์เปิดตัว: {mo.startDate} | ปริมาตรรวม: {mo.quantityRequested} ขวด</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">ความคืบหน้าเฟส</span>
                    <span className="text-xs font-mono font-black text-slate-850 dark:text-white uppercase tracking-wider">{mo.status}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
