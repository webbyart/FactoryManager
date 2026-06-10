import React, { useState } from 'react';
import { 
  Building, Play, QrCode, ClipboardList, CheckCircle, 
  RefreshCw, Layers, ArrowLeftRight, HelpCircle
} from 'lucide-react';

interface AdminLTEWarehouseProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTEWarehouse({ dbState, onRefresh, onNotify }: AdminLTEWarehouseProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'transfer'>('scan');
  
  // Simulated barcode scanning states
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanAction, setScanAction] = useState<'RECEIVE' | 'ISSUE'>('RECEIVE');

  // Hardcoded lot barcode options for easy clicks
  const barcodeOptions = [
    { code: 'BAR-ESS-ROSE-2026', name: 'น้ำมันกุหลาบฝรั่งเศส Centric Oil', type: 'Raw Material' },
    { code: 'BAR-PKG-GOLD-100ML', name: 'กล่องน้ำหอมหรู Gold Foil 100ml', type: 'Packaging' },
    { code: 'BAR-FIN-CHRE-50ML', name: 'น้ำหอมพร้อมชาย Chérie SKU-01', type: 'Finished Goods' }
  ];

  const triggerScanSimulate = (code: string, name: string) => {
    setScannerActive(true);
    setScanResult(null);
    onNotify("เปิดใช้งานเครื่องแสกนเสมือนบาร์โค้ดยิงฉลาก...", "info");
    
    setTimeout(() => {
      setScannerActive(false);
      setScanResult(code);
      onNotify(`ยิงบาร์โค้ดสำเร็จ! ผลลัพธ์: ${code} (${name})`, "success");
    }, 1500);
  };

  // Internal sub-transfer states
  const [transfer, setTransfer] = useState({
    materialCode: 'RAW-ESS-ROSE',
    qty: '',
    fromLoc: 'คลังเก็บสารดิบหลัก ชั้น R2',
    toLoc: 'หอห้องผสมวิจัยแปรสภาพชั้น 2'
  });

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseFloat(transfer.qty);
    if (!qtyVal || isNaN(qtyVal)) {
      onNotify("กรุณากรอกปริมาณการโอนย้ายชั้นคลังให้ถูกต้อง", "warning");
      return;
    }

    onNotify(`ยื่นการขอย้ายวัตถุดิบ ${transfer.materialCode} จำนวน ${qtyVal} ลิตร ย้ายสำเร็จ: [${transfer.fromLoc}] ➔ [${transfer.toLoc}]`, "success");
    setTransfer({
      materialCode: 'RAW-ESS-ROSE',
      qty: '',
      fromLoc: 'คลังเก็บสารดิบหลัก ชั้น R2',
      toLoc: 'หอห้องผสมวิจัยแปรสภาพชั้น 2'
    });
  };

  return (
    <div className="space-y-6" id="warehouse-management-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Building className="h-5.5 w-5.5 text-primary" />
          ระบบคลังจัดเก็บและสแกนเนอร์ด่านตรวจ (Warehouse &amp; Scanner Simulation)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">ควบคุมตำแหน่งแบทช์สารดิบ, ทำโอนย้ายคลังภายในจุดแยกกักกัน (Quarantine), และกระตุ้นการยิงเครื่องยิงบาร์โค้ด QR อัจฉริยะแบบสัมผัสเร็ว</p>
      </div>

      <div className="flex border-b border-slate-205 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'scan' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-755'
          }`}
        >
          📷 เครื่องยิงบาร์โค้ดสแกนเนอร์เสมือน (Virtual Barcode Gun)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'transfer' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-755'
          }`}
        >
          🚚 โอนย้ายคลังย่อยและแยะกัก (Quarantine Transfer)
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Scanner Simulation Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-center space-y-4 lg:col-span-1">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">แผ่นกระจกเลนส์อ่านแสงยิงบาร์โค้ด (Camera Lens)</strong>
            
            <div className="aspect-square w-full max-w-[210px] mx-auto border-4 border-dashed border-primary bg-slate-55 dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-6">
              {scannerActive ? (
                <div className="space-y-2 animate-pulse text-primary">
                  <RefreshCw className="h-10 w-10 mx-auto animate-spin" />
                  <span className="text-[10px] font-bold block">กำลังกรองเลนส์อินฟราเรด...</span>
                </div>
              ) : scanResult ? (
                <div className="space-y-2 text-emerald-500">
                  <CheckCircle className="h-10 w-10 mx-auto" />
                  <p className="text-[10px] font-bold">แสกนพบรหัสสินค้า</p>
                  <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded font-mono text-[9px] text-emerald-600 font-bold block truncate max-w-[190px]">
                    {scanResult}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 text-slate-400">
                  <QrCode className="h-11 w-11 mx-auto" />
                  <p className="text-[10px]">เลนส์สแกนเนอร์พร้อมยิงบิล</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] pt-2">
              <button
                type="button"
                onClick={() => {
                  setScanAction('RECEIVE');
                  onNotify("ตั้งค่าสแกนเพื่อ: รับสินค้าเข้าคลังย่อย", "info");
                }}
                className={`py-1.5 font-bold rounded ${scanAction === 'RECEIVE' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                📥 สแกนรับสินค้า (GRN)
              </button>
              <button
                type="button"
                onClick={() => {
                  setScanAction('ISSUE');
                  onNotify("ตั้งค่าสแกนเพื่อ: เบิกสารจ่ายปรุงในไลน์ผลิต", "info");
                }}
                className={`py-1.5 font-bold rounded ${scanAction === 'ISSUE' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                🧪 สแกนเบิกวัตถุดิบจ่าย
              </button>
            </div>
          </div>

          {/* Clicks simulating barcode tag scanner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-3.5">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">แผ่นจำลองสติ๊กเกอร์บาร์โค้ดติดพัสดุ (Tag Stickers)</strong>
            <p className="text-[11px] text-slate-400">คลิกที่ปุ่มเป้าหมายบาร์โค้ดยาสระหอมด้านหลังกล่อง เพื่อจำลองการแนบแสกนเข้าระบบ ERP เสมือนจริง</p>
            
            <div className="space-y-3 pt-2">
              {barcodeOptions.map((opt) => (
                <div key={opt.code} className="p-3.5 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-wrap justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">{opt.type}</span>
                    <strong className="text-xs text-slate-900 dark:text-white block mt-1">{opt.name}</strong>
                    <span className="text-[9.5px] text-slate-400 font-mono tracking-wider">รหัสบาร์โค้ดยิง: {opt.code}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerScanSimulate(opt.code, opt.name)}
                    className="bg-primary hover:bg-opacity-95 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    ⚡ ยิงบาร์โค้ดฉลากนี้
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Quarantine and location Sub-transfer */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">บันทึกโอนคลังย่อยและแอมป์วิจัย</strong>
            
            <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">เลือกสารวัตถุดิบเป้าหมาย:</label>
                <select
                  value={transfer.materialCode}
                  onChange={(e) => setTransfer({ ...transfer, materialCode: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-850 dark:text-white rounded-lg cursor-pointer outline-none"
                >
                  {(dbState.materials || []).map((m: any) => (
                    <option key={m.id} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">ปริมาตรการแบ่งโอนสาร:</label>
                <input
                  type="number"
                  required
                  placeholder="เช่น 25"
                  value={transfer.qty}
                  onChange={(e) => setTransfer({ ...transfer, qty: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">คลังต้นทางออกสารดิบ:</label>
                <input
                  type="text"
                  value={transfer.fromLoc}
                  onChange={(e) => setTransfer({ ...transfer, fromLoc: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">คลังหรือห้องผสมปลายทางรับวิจัย:</label>
                <input
                  type="text"
                  value={transfer.toLoc}
                  onChange={(e) => setTransfer({ ...transfer, toLoc: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-opacity-95 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                ✔ บันทึกปิดสั่งโอนย้ายคสวัตถุดิบ
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-3">
            <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider">ผังสรีระชั้นจัดเก็บสารโรงงานความร้อนระวัง (Zone Layout map)</strong>
            <p className="text-[11px] text-slate-400 leading-normal">มาตรฐาน GMP กำหนดที่กั้นและการควบคุมอุณหภูมิความเย็นของ สารระเหยนำหอม และห้องนิรภัย</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-red-100/35 border border-red-200 dark:border-red-950 rounded-2xl">
                <span className="font-bold text-red-600 block mb-1">🔴 Zone A: สารอัคคีภัยสารไวไฟ</span>
                <p className="text-[10px] text-slate-500">จำกัดอากาศและอุณหภูมิ &lt; 25°C เสมอ สำหรับแอลกอฮอล์ เอทิลและเบสผสม</p>
              </div>
              <div className="p-3 bg-blue-100/35 border border-blue-200 dark:border-blue-905 rounded-2xl">
                <span className="font-bold text-blue-600 block mb-1">🔵 Zone B: คลังหอมสกัดสุนทรีย์</span>
                <p className="text-[10px] text-slate-500">เก็บสารสกัด Rose, Agarwood ปราศจากแสงแดดเพื่อรักษาประสิทธิภาพกลิ่นโมเลกุล</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
