import React, { useState } from 'react';
import { 
  Beaker, Play, Layers, DollarSign, Badge, RefreshCw, 
  Settings, ClipboardList, CheckSquare, Sparkles, Sliders
} from 'lucide-react';

interface AdminLTERDProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTERD({ dbState, onRefresh, onNotify }: AdminLTERDProps) {
  // Formulation list & active versions
  const formulas = [
    { id: 'FOR-CHRE-V10', name: 'Chérie Rose Parfum base', version: 'v1.0 (Legacy)', cost: 182, status: 'Active Production' },
    { id: 'FOR-CHRE-V11', name: 'Chérie Rose Premium formulation', version: 'v1.1 (Stable)', cost: 215, status: 'Approved for Batching' },
    { id: 'FOR-CHRE-V20', name: 'Chérie Rose Gold Intense luxury', version: 'v2.0 (New-Lab)', cost: 340, status: 'Stability Testing' }
  ];

  // Dynamic cost calculator states
  const [targetPerfume, setTargetPerfume] = useState('Chérie Rose Premium base');
  const [roseRatio, setRoseRatio] = useState<number>(15); // %
  const [oudRatio, setOudRatio] = useState<number>(8); // %
  const [solventRatio, setSolventRatio] = useState<number>(75); // %
  const [fixativeRatio, setFixativeRatio] = useState<number>(2); // %

  const sumRatios = roseRatio + oudRatio + solventRatio + fixativeRatio;

  // Cost estimates: Rose: 15B/g, Oud: 45B/g, Ethanol: 1B/g, Fixative: 8B/g. Unit bottle: 50g
  const bottleSizeGrams = 50; 
  const roseCost = (bottleSizeGrams * (roseRatio / 100)) * 15;
  const oudCost = (bottleSizeGrams * (oudRatio / 100)) * 45;
  const solventCost = (bottleSizeGrams * (solventRatio / 100)) * 1;
  const fixativeCost = (bottleSizeGrams * (fixativeRatio / 100)) * 8;
  const glassBottleBase = 35; 
  const totalCostEstimate = roseCost + oudCost + solventCost + fixativeCost + glassBottleBase;

  // Stability Chamber tests
  const [stabilityLogs, setStabilityLogs] = useState<any[]>([
    { id: 'STAB-014', formulaCode: 'FOR-CHRE-V11', condition: 'Chamber 45°C Bake (30 days)', result: 'No discoloration, Scent stability intact', status: 'Passed' },
    { id: 'STAB-015', formulaCode: 'FOR-CHRE-V20', condition: 'UV Exposure Lamp (48 hrs)', result: 'Slight yellowing, requesting UV blocker addition', status: 'Requires Adjustment' }
  ]);

  const [newStab, setNewStab] = useState({
    code: 'FOR-CHRE-V20',
    cond: 'Chamber 45°C Bake (15 days)',
    res: 'ไม่มีการแยกตระกอน ความเสถียรผ่านฉลุย'
  });

  const handleAddStabilityRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = `STAB-0${Math.floor(16 + Math.random() * 80)}`;
    setStabilityLogs(prev => [
      {
        id: mockId,
        formulaCode: newStab.code,
        condition: newStab.cond,
        result: newStab.res,
        status: 'Passed'
      },
      ...prev
    ]);
    onNotify(`บันทึกผลเสถียรภาพ R&D ใหม่สำเร็จ รหัสการทดสอบ: ${mockId}`, "success");
    setNewStab({ code: 'FOR-CHRE-V20', cond: '', res: '' });
  };

  return (
    <div className="space-y-6" id="rd-laboratory-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Beaker className="h-5.5 w-5.5 text-primary animate-pulse" />
          ห้องแล็บวิจัยและควบคุมสูตรสากล (Perfume R&amp;D Lab &amp; Costing)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">โมเลกุลน้ำหอมและครีมวิจัย, สอบคุมคู่ปรับเวอร์ชั่นสูตร (v1.0 - v2.0), ซิมูเลเตอร์ปรับส่วนผสมประจุกรัมประเมินต้นทุนขวดแก้วพรีเมียม และบันทึกคุมอุณหภูมิ 45°C</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Costing calculation simulator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b dark:border-slate-850 pb-2">
            <strong className="text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-primary" /> สไลเดอร์จำลองคุมต้นทุนสูตรต่อขวด (Cost Simulator)
            </strong>
            <span className="text-[10px] text-pink-500 font-bold">Est Size: 50ml / 50g Bottle</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">สัดส่วน French Rose Oil (%): {roseRatio}%</span>
              <input 
                type="range" min="0" max="30" value={roseRatio} 
                onChange={(e) => setRoseRatio(parseInt(e.target.value))} 
                className="w-full accent-primary cursor-pointer"
              />
            </div>
            
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">สัดส่วน Pure Oud Extract (%): {oudRatio}%</span>
              <input 
                type="range" min="0" max="25" value={oudRatio} 
                onChange={(e) => setOudRatio(parseInt(e.target.value))} 
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">แอลกอฮอล์ base ตัวทลายเจือปน (%): {solventRatio}%</span>
              <input 
                type="range" min="40" max="95" value={solventRatio} 
                onChange={(e) => setSolventRatio(parseInt(e.target.value))} 
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">น้ำตรึงกลิ่นหอมธรรมชาติ (Fixative %): {fixativeRatio}%</span>
              <input 
                type="range" min="0" max="10" value={fixativeRatio} 
                onChange={(e) => setFixativeRatio(parseInt(e.target.value))} 
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-55 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span>ปริมาตรสัดส่วนสารรวมต่อขวด:</span>
                <span className={`font-mono font-bold ${sumRatios === 100 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {sumRatios}% {sumRatios === 100 ? '(สัดส่วนเทียบดีพอดี 100%)' : '(ยังไม่ลงตัว 100%)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-1 border-t dark:border-slate-800">
                <span className="text-slate-800 dark:text-slate-200">ราคาต้นทุนรวมน้ำหอม + ขวดแก้วหลัก:</span>
                <span className="text-lg font-black text-[#E83E8C] font-mono">฿{totalCostEstimate.toFixed(1)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={sumRatios !== 100}
              onClick={() => onNotify(`บันทึกพารามิเตอร์ขวดน้ำยาสำเร็จ ต้นทุนที่บันทึก: ฿${totalCostEstimate.toFixed(1)}`, "success")}
              className={`w-full py-2 font-bold rounded-xl shadow-xs text-xs transition-colors ${
                sumRatios === 100 
                  ? 'bg-primary hover:bg-opacity-95 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              ✔ เซฟแบบแปลนการคำนวณต้นทุนสูตรนี้
            </button>
          </div>
        </div>

        {/* Lab Versioning control details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">ตราแผนลิขสิทธิ์ทะเบียนเวอร์ชันห้องแล็บ (Formulation Version Tree)</strong>
          
          <div className="space-y-2.5">
            {formulas.map((f) => (
              <div key={f.id} className="p-3 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs gap-3">
                <div className="space-y-0.5">
                  <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{f.id}</span>
                  <strong className="text-xs text-slate-900 dark:text-white block truncate mt-1">{f.name}</strong>
                  <span className="text-[9.5px] text-slate-400 font-mono">เวอร์ชันแล็บแกะกลิ่น: {f.version}</span>
                </div>

                <div className="text-right">
                  <span className="text-[9.5px] text-emerald-500 font-bold block bg-emerald-100/50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">{f.status}</span>
                  <span className="text-xs font-mono font-bold mt-1 block">฿{f.cost}/ขวด</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 45 Degree Stability Test Chambers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
          <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">ห้องอภิบาลคุมอุณหภูมิ 45°C ทวนสอบเสถียรกลิ่น (Stability Test Logs)</strong>
          <p className="text-[11px] text-slate-400 leading-normal">มาตรฐานการตรวจสอบอุตสาหกรรมเครื่องสำอางชั้นสากล บังคับทดสอบบ่มระบายอุณหภูมิ เพื่อป้องกันสารหอมเปลี่ยนสีหรือตกตะกอนแยกตัว</p>

          <form onSubmit={handleAddStabilityRecord} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-end bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
            <div>
              <label className="block text-slate-400 font-bold mb-1">เลือกสูตรรักษาวิจัย:</label>
              <select
                value={newStab.code}
                onChange={(e) => setNewStab({ ...newStab, code: e.target.value })}
                className="w-full p-1.5 border dark:border-slate-800 dark:bg-slate-900 dark:text-white rounded-lg outline-none cursor-pointer"
              >
                {formulas.map(f => (
                  <option key={f.id} value={f.id}>{f.id} - {f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">เงื่อนไขการทดลองบ่ม:</label>
              <input
                type="text"
                required
                placeholder="เช่น เตาตู้แช่ 45C (20 วัน)"
                value={newStab.cond}
                onChange={(e) => setNewStab({ ...newStab, cond: e.target.value })}
                className="w-full p-1.5 border dark:border-slate-800 dark:bg-slate-900 dark:text-white rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <div className="grow">
                <label className="block text-slate-400 font-bold mb-1">ผลประเมินแอมป์ทดสอบ:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สีกลิ่นมั่นคงไม่เปลี่ยนแปลง"
                  value={newStab.res}
                  onChange={(e) => setNewStab({ ...newStab, res: e.target.value })}
                  className="w-full p-1.5 border dark:border-slate-800 dark:bg-slate-900 dark:text-white rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-opacity-95 text-white font-bold p-1.5 px-3.5 rounded-lg shrink-0 text-xs"
              >
                ✔ เพิ่มเสถียร
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {stabilityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-600 px-1.5 py-0.5 rounded font-bold">{log.id}</span>
                    <strong className="font-bold text-slate-900 dark:text-white">รหัสสูตร: {log.formulaCode}</strong>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">เงื่อนไขตรวจสอบ: {log.condition} | สรรพผลทดลอง: {log.result}</p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  log.status === 'Passed' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' 
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
