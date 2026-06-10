import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckSquare, Plus, Award, 
  Trash2, Layers, ShieldAlert, CheckCircle2, Bookmark, Flame
} from 'lucide-react';

interface AdminLTEQCProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTEQC({ dbState, onRefresh, onNotify }: AdminLTEQCProps) {
  const [activeQCTab, setActiveQCTab] = useState<'incoming' | 'exception'>('incoming');
  
  // Simulated QC checks and NCR logs
  const [ncrLogs, setNcrLogs] = useState<any[]>([
    { id: 'NCR-2026-004', materialName: 'ขวดแก้วเหลี่ยม 50ml ทรงหรู', lotNumber: 'LOT-PKG-GLAS-33', defectReason: 'มีความเหวี่ยงรอยบิ่นคอเกลียว 1.2%', status: 'CAPA ดำเนินการยืดกรองแล้ว' },
    { id: 'NCR-2026-005', materialName: 'หัวสเปรย์ไมครอน สีทองพรีเมียม', lotNumber: 'LOT-PKG-CAP-99', defectReason: 'สปริงจุ่มซับน้ำหอมแรงกดผิดปกติ 3%', status: 'ตีคืนซัพพลายเออร์ส่งเคลม' }
  ]);

  // CAPA State
  const [newCAPA, setNewCAPA] = useState({
    name: 'ขวดแก้วเหลี่ยม 50ml ทรงหรู',
    lot: 'LOT-PKG-GLAS-33',
    reason: 'พบเศษฝุ่นปนเปื้อนภายในขวดนอกรอบบ่ม'
  });

  const handleCreateNCR = (e: React.FormEvent) => {
    e.preventDefault();
    const newNcr = {
      id: `NCR-2026-00${Math.floor(6 + Math.random() * 90)}`,
      materialName: newCAPA.name,
      lotNumber: newCAPA.lot,
      defectReason: newCAPA.reason,
      status: 'อยู่ระหว่างพิจารณาออกใบ NCR'
    };

    setNcrLogs(prev => [newNcr, ...prev]);
    onNotify(`บันทึกข้อบกพร่องผลิตภัณฑ์ QC NCR ${newNcr.id} แนบประมวลแล้ว`, "warning");
    setNewCAPA({ name: '', lot: '', reason: '' });
  };

  return (
    <div className="space-y-6" id="qc-gatekeeper-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-5.5 w-5.5 text-success" />
          ระบบพิจารณาควบคุมคุณภาพเครื่องสำอาง (Cosmetics ISO 22716 Quality Lab)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">ควบคุมมาตรฐานจุดกวนต้มแชมเปญผสม, ตรวจ Incoming Materials, บันทึกใบวิเคราะห์ผลิตภัณฑ์สำเร็จรูป, ถ่ายโอนเอกสาร NCR &amp; CAPA</p>
      </div>

      <div className="flex border-b border-slate-205 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveQCTab('incoming')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeQCTab === 'incoming' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          🛡️ งานตรวจสอบเกณฑ์สายผลิต (QC Inspections)
        </button>
        <button
          type="button"
          onClick={() => setActiveQCTab('exception')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeQCTab === 'exception' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          🚨 บันทึกขอปรับปรุงด่วน (CAPA &amp; NCR logs)
        </button>
      </div>

      {activeQCTab === 'incoming' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b dark:border-slate-850 pb-2">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">ใบตรวจสอบกระบวนการกวนและกรองแยม (Live QC Dispatch)</strong>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold">Standard ISO 22716</span>
          </div>

          <div className="space-y-3">
            {(dbState.qcInspections || []).map((qc: any) => (
              <div key={qc.id} className="p-3.5 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold bg-[#6F42C1]/10 text-primary px-1.5 py-0.5 rounded">QC ID: {qc.id}</span>
                    <strong className="text-slate-900 dark:text-white">ประเภทแบทช์: {qc.sourceType}</strong>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">วันที่ตรวจสอบ: {qc.referenceId} | เจ้าหน้าที่ทดสอบ: {qc.inspector}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">ผลทดสอบเครื่องจักร</span>
                    <span className={`font-mono font-black ${qc.status === 'Passed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {qc.status === 'Passed' ? '✔ ตราผ่านปกติ (PASSED)' : '● ประเมินเพิ่มเติม'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CAPA & NCR Exception Logger */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">บันทึก NCR/CAPA งานผลิตบกพร่อง (Substandard logger)</strong>
            
            <form onSubmit={handleCreateNCR} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">ชื่อเคมีดิบ/ขวดแพคเกจที่มีปัญหา:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สารสกัดวนิลลา Bourbon"
                  value={newCAPA.name}
                  onChange={(e) => setNewCAPA({ ...newCAPA, name: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">หมายเลขล็อตของซัพพลายเออร์ที่เสียหาย:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น LOT-RAW-VNL-99A"
                  value={newCAPA.lot}
                  onChange={(e) => setNewCAPA({ ...newCAPA, lot: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">วิเคราะห์ปัญหาเพื่อเขียนแผนแก้ไข (CAPA Detail):</label>
                <textarea
                  required
                  rows={3}
                  placeholder="ฝุ่นปนเปื้อนภายในหัวประแจก๊อกต้มผสม..."
                  value={newCAPA.reason}
                  onChange={(e) => setNewCAPA({ ...newCAPA, reason: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-opacity-95 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-xs"
              >
                🚨 ออกรายงานแจ้งเสีย NCR ทันที
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-3">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">ล๊อกประวัติ NCR และพิจารณากลุ่มความเสี่ยง (NCR Ledger Registry)</strong>
            
            <div className="space-y-3.5 pt-2">
              {ncrLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-wrap justify-between items-center text-xs gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono bg-red-100 dark:bg-red-950 text-red-650 px-1.5 py-0.5 rounded font-bold">{log.id}</span>
                      <strong className="font-bold text-slate-900 dark:text-white">{log.materialName}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">หมายเลขแบทช์ประทับตรา: {log.lotNumber} | สาเหตุเสีย: {log.defectReason}</p>
                  </div>

                  <span className="text-[9.5px] bg-amber-100 dark:bg-amber-950 text-amber-600 font-bold px-2.5 py-0.5 rounded-full">
                    {log.status}
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
