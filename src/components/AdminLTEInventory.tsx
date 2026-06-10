import React, { useState } from 'react';
import { 
  Plus, Search, Archive, AlertTriangle, Layers, ArrowRight, 
  Trash2, ClipboardList, CheckCircle, RefreshCw, BarChart4, Bookmark, ShieldAlert
} from 'lucide-react';

interface AdminLTEInventoryProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTEInventory({ dbState, onRefresh, onNotify }: AdminLTEInventoryProps) {
  const [activeSegment, setActiveSegment] = useState<'all' | 'raw' | 'pkg' | 'finished' | 'cycle'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for Cycle Count simulation
  const [cycleCounts, setCycleCounts] = useState<any[]>([
    { id: 'CC-0013', materialCode: 'RAW-ESS-ROSE', materialName: 'น้ำมันกุหลาบฝรั่งเศส', systemStock: 450, physicalStock: 450, diff: 0, status: 'ตรวจสอบตรงถ้วน' },
    { id: 'CC-0014', materialCode: 'RAW-ESS-OUD', materialName: 'สารสกัดกฤษณาธรรมชาติ', systemStock: 15, physicalStock: 14.8, diff: -0.2, status: 'สูญหายระเหยก๊าซ' },
    { id: 'CC-0015', materialCode: 'RAW-SOLV-ETH', materialName: 'เอทานอลบริสุทธิ์สูง 99.9%', systemStock: 4500, physicalStock: 4510, diff: 10, status: 'ส่วนเกินประจุเทเบียง' }
  ]);

  const [newCC, setNewCC] = useState({
    code: 'RAW-ESS-ROSE',
    physical: ''
  });

  // Handle manual stock adjustment (Physical Count & Cycle count)
  const handleRecordCycleCount = async (e: React.FormEvent) => {
    e.preventDefault();
    const matObj = dbState.materials?.find((m: any) => m.code === newCC.code);
    if (!matObj) {
      onNotify("ไม่พบสารเคมีที่เลือกในคลังข้อมูลร่วม", "warning");
      return;
    }

    const physicalVal = parseFloat(newCC.physical);
    if (isNaN(physicalVal)) {
      onNotify("กรุณากรอกปริมาตรจริงเป็นตัวเลข", "warning");
      return;
    }

    const diff = physicalVal - matObj.stockLevel;
    const countId = `CC-00${Math.floor(16 + Math.random() * 90)}`;

    try {
      // Execute generic update to store adjusted level in database
      const response = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'materials',
          item: {
            ...matObj,
            stockLevel: physicalVal
          }
        })
      });

      if (!response.ok) throw new Error();

      // Log in local counts table
      setCycleCounts(prev => [
        {
          id: countId,
          materialCode: matObj.code,
          materialName: matObj.name,
          systemStock: matObj.stockLevel,
          physicalStock: physicalVal,
          diff: diff,
          status: diff === 0 ? 'ตรงถ้วนสำเร็จ' : (diff < 0 ? 'เบี่ยงเบนขาดทุน' : 'บันทึกเกินบิล')
        },
        ...prev
      ]);

      onNotify(`ทำรายการ Cycle Count ${countId} สำเร็จ ปรับคลังวัตถุดิบ ${matObj.name} เป็น ${physicalVal} ${matObj.unit}`, "success");
      setNewCC({ code: 'RAW-ESS-ROSE', physical: '' });
      onRefresh();
    } catch {
      onNotify("ไม่สามารถดำเนินการอัปเดตสถิติคลังได้", "error");
    }
  };

  const filteredMaterials = (dbState.materials || []).filter((m: any) => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSegment === 'raw') return m.category === 'Raw Material' && matchSearch;
    if (activeSegment === 'pkg') return m.category === 'Packaging' && matchSearch;
    return matchSearch;
  });

  return (
    <div className="space-y-6" id="inventory-module-panel">
      
      {/* Header and overview */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-3xl shadow-sm">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Archive className="h-5.5 w-5.5 text-primary" />
            ระบบคุมคลังและ Lot Control (Enterprise Inventory Lot Center)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">สแกนเบิกจ่ายสาร, คุม FIFO/FEFO วันหมดอายุวัตถุดิบและกลิ่นบ่มปรุง, บันทึก Stock Card, รันรอบตรวจนับวงจร (Cycle Count) ตรงถ้วน</p>
        </div>
      </div>

      {/* Segment navigation row */}
      <div className="flex flex-wrap gap-2 items-center justify-between border-b dark:border-slate-850 pb-2">
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSegment('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSegment === 'all' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
            }`}
          >
            📋 ทั้งหมดในคลัง
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('raw')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSegment === 'raw' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
            }`}
          >
            🧪 วัตถุดิบเคมี (Raw Materials)
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('pkg')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSegment === 'pkg' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
            }`}
          >
            📦 ขวดแก้ว/กล่อง (Packaging)
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('cycle')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSegment === 'cycle' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
            }`}
          >
            🔍 ตรวจนับคลัง (Cycle Count)
          </button>
        </div>

        {activeSegment !== 'cycle' && (
          <div className="relative w-full max-w-xs mt-1 sm:mt-0">
            <input
              type="text"
              placeholder="ค้นหารหัสควัน/ชนิดสารดิบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-1.5 pl-7 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-lg"
            />
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
          </div>
        )}
      </div>

      {activeSegment !== 'cycle' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="p-3">รหัสสาร (Code)</th>
                  <th className="p-3">ชื่อสารเคมีและแพคเกจ</th>
                  <th className="p-3">หมวดของสาร</th>
                  <th className="p-3 text-right">ยอดคงคลัง</th>
                  <th className="p-3 text-right">เกณฑ์เตือนต่ำสุด</th>
                  <th className="p-3">หน่วยวัด</th>
                  <th className="p-3 text-center">มิติ FIFO / ล็อต</th>
                  <th className="p-3 text-center">สเปคสถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                {filteredMaterials.map((m: any) => {
                  const isLow = m.stockLevel < m.minStock;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950">
                      <td className="p-3 font-mono font-bold text-slate-650 dark:text-slate-300">{m.code}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="p-3">{m.category}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={isLow ? 'text-red-550 font-black animate-pulse' : 'text-emerald-550'}>
                          {m.stockLevel}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">{m.minStock}</td>
                      <td className="p-3">{m.unit}</td>
                      <td className="p-3 text-center font-mono text-[10px] text-primary font-bold">FEFO ACTIVE</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[9px] font-bold">สต็อกวิกฤต</span>
                        ) : (
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold">ปลอดภัย</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cycle Count Management Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">บันทึกตรวจนับสารรายวัน (Daily Physical count)</strong>
            
            <form onSubmit={handleRecordCycleCount} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">เลือกสารวัตถุดิบเป้าหมาย:</label>
                <select
                  value={newCC.code}
                  onChange={(e) => setNewCC({ ...newCC, code: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white cursor-pointer outline-none"
                >
                  {(dbState.materials || []).map((m: any) => (
                    <option key={m.id} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">ปริมาตรรวมที่มีอยู่จริงในถัง/คลัง (Physical Qty):</label>
                <input
                  type="number"
                  required
                  placeholder="เช่น 120"
                  value={newCC.physical}
                  onChange={(e) => setNewCC({ ...newCC, physical: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-opacity-95 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                ✔ อนุมัติล้างคริประบายสต๊อกจริง
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-3">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">รายการบันทึกผลต่างวงรอบล่าสุด (Discrepancy History Card)</strong>
            
            <div className="space-y-3 pt-2">
              {cycleCounts.map((cc) => {
                const isLoss = cc.diff < 0;
                return (
                  <div key={cc.id} className="p-3 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-wrap justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{cc.id}</span>
                        <strong className="font-bold text-slate-900 dark:text-white">{cc.materialName}</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">บาร์โค้ดสิทธิ์: {cc.materialCode} | สถานะความเหวี่ยง: {cc.status}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-mono">ผลต่างความคลาดลอย</p>
                      <span className={`font-mono font-black ${isLoss ? 'text-red-500' : (cc.diff > 0 ? 'text-emerald-500' : 'text-slate-500')}`}>
                        {cc.diff > 0 ? `+${cc.diff}` : cc.diff}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
