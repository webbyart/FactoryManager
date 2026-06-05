import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Play, Sparkles, Droplet, Thermometer, Wind, Check, 
  HelpCircle, Trash2, Plus, RefreshCw, FileText, CheckCircle, Search, Settings, 
  Cpu, Activity, Filter, Layers, BadgeAlert, ArrowUpRight, HelpCircle as HelpIcon
} from 'lucide-react';

interface GMPHubOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function GMPHubOS({ dbState, onRefresh, onNotify, userRole }: GMPHubOSProps) {
  // 15 GMP Core Points Statuses
  const [gmpPoints, setGmpPoints] = useState([
    { id: 1, title: 'บุคลากรและการฝึกอบรม (Personnel & Training)', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', comment: 'อบรมหลักสูตรส่วนบุคคลสุขอนามัย ISO 22716 ครบถ้วน 100%' },
    { id: 2, title: 'อาคารสถานที่ผลิตและสุขลักษณ์ (Premises & Hygiene)', status: 'Approved', auditor: 'นายกิตติ์ธนา คำมูล', comment: 'พื้นที่ Cleanroom Class 10,000 ผ่านเกณฑ์ความกดอากาศเป็นบวก' },
    { id: 3, title: 'การซ่อมบำรุงและปรับเทียบเครื่องผสม (Equipment Calibration)', status: 'Approved', auditor: 'นายกิตติ์ธนา คำมูล', comment: 'Homogenizer MX-10 แคลิเบรตเซนเซอร์ความเร็วรอบและอุณหภูมิเสร็จสิ้น' },
    { id: 4, title: 'ระบบสุขาภิบาลและสัตว์พาหะ (Sanitation & Pest Control)', status: 'Approved', auditor: 'พนักงานภายนอกผู้จัดจำหน่าย', comment: 'ติดตั้งระบบม่านอากาศแบบแม่เหล็กไฟฟ้าและตรวจกับดักแมลงทุกจุด' },
    { id: 5, title: 'คุณภาพระบบน้ำจืดและวัตถุดิบ (Raw Materials & Pure Water)', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', comment: 'ค่านำไฟฟ้าของ DI Water อยู่ที่ 0.85 µS/cm ต่ำกว่าพิกัดมาตรฐานกําหนด' },
    { id: 6, title: 'บรรจุภัณฑ์และภาชนะตรวจรับ (Packaging Components)', status: 'Warning', auditor: 'นายกิตติ์ธนา คำมูล', comment: 'กล่องฟอยล์พัดข้าง Lot 2569/006 พบบุบบิดชำรุด 4 ชิ้น อยู่ระหว่างตรวจสอบซิม' },
    { id: 7, title: 'การควบคุมกระบวนการปรุงผสม (Process Control)', status: 'Approved', auditor: 'นายกิตติ์ธนา คำมูล', comment: 'ใช้ใบ BPR ควบคุมแบบตรรกะแยกขั้นตอนชั่งตวงชิงโต้แชนแนลเรียบร้อย' },
    { id: 8, title: 'ห้องปฏิบัติการและวิเคราะห์ผล QA (QC Lab Diagnostics)', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', comment: 'เครื่อง GC-MS ตรวจสอบตัวอย่างน้ำหอม Lot ล่าสุดไม่พบสิ่งปนเปื้อนเคมี' },
    { id: 9, title: 'คลังเก็บรักษารายงาน FEFO (Storage & FEFO Control)', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', comment: 'ตรวจสอบระบบจัดจ่ายสารที่หมดอายุก่อนเบิกก่อน (Expiry First Out)' },
    { id: 10, title: 'เอกสารบันทึกและการตรวจสอบย้อนหลัง (Documentation Trail)', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', comment: 'ซิงโครไนซ์ใบ BPR, COA และรายงานน้ำหนักชั่งเข้าระเบียบดิจิทัลเสถียร' },
    { id: 11, title: 'การตรวจประเมินภายในโรงงาน (Internal GMP Auditing)', status: 'Approved', auditor: 'ทีมตรวจสอบวิศวกรรมผสม', comment: 'รอบประเมินประจำไตรมาสได้คะแนน 98.45% ผ่านเกณฑ์มาตรฐานระดับ A' },
    { id: 12, title: 'การจัดการเรื่องร้องเรียนเรียกคืนสินค้า (Product Recall Plan)', status: 'Approved', auditor: 'ฝ่ายประกันคุณภาพรวม', comment: 'จำลองสัญญารับมือและซ้อมแผนสุ่มเรียกคืนขวดทดสอบเสร็จใน 4 ชั่วโมง' },
    { id: 13, title: 'การตรวจสอบผู้รับจ้างช่วงภายนอก (Contract Operations)', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', comment: 'โรงปั๊มแพ็คเกจจิ้งภายนอกลงนามยอมรับสเปค Cleanroom และคุม COA ถ้วน' },
    { id: 14, title: 'การบริหารความเบี่ยงเบนแผน (Deviation Handling)', status: 'Approved', auditor: 'นายกิตติ์ธนา คำมูล', comment: 'บันทึกแก้ไขค่าอุณหภูมิความเย็นที่เลื่อนช้าตอนเริ่มต้น 0.5 องศาลงสมุด' },
    { id: 15, title: 'สุขอนามัยสิ่งแวดล้อมและจัดการขยะสากล (Waste Disposal)', status: 'Approved', auditor: 'ทีมวิศวกรรมสิ่งแวดล้อม', comment: 'ค่าน้ำทิ้งหลังบำบัดก่อนปล่อยออก มีค่าความเป็นกรดด่างคงที่ pH 7.12' }
  ]);

  // Classification Categories selector states
  const [productCategory, setProductCategory] = useState<'skincare' | 'makeup' | 'haircare' | 'bodycare' | 'fragrance'>('skincare');
  const [gmpFormInput, setGmpFormInput] = useState({
    skuName: 'ครีมบำรุงผิวหน้าขาวอมชมพู วิตามินบี 3 พลัส',
    batchNo: 'BDC66-014',
    inspectorName: 'นายกิตติ์ธนา คำมูล',
    bulkCategory: 'สกินแคร์เนื้อครีมบัตเตอร์พรีเมียม (Skincare Premium Cream)',
    rawMaterialCount: 320 // Simulated 320 items classification
  });

  // Mixing simulator states (ตัวกระตุ้นเครื่องผสม)
  const [mixingState, setMixingState] = useState<{
    isRunning: boolean;
    speedRPM: number;
    targetSpeed: number;
    temperature: number;
    targetTemp: number;
    vacuumPSI: number;
    cycleTime: number;
    statusText: string;
  }>({
    isRunning: false,
    speedRPM: 0,
    targetSpeed: 1800,
    temperature: 24.5,
    targetTemp: 78.0,
    vacuumPSI: -0.2,
    cycleTime: 0,
    statusText: 'พร้อมเริ่มกวนสกรีนสาร'
  });

  // FEFO & COA Registry mock data matching cosmetics GMP requirements
  const [fefoRegistry, setFefoRegistry] = useState([
    { rmCode: 'RMOL-0001', name: 'DI Pure Water (น้ำปราศจากประจุระดับสารเคมี)', lotNo: 'LOT-W2605-01', expiry: '2026-11-20', shelfLifeDays: 168, coaStatus: 'Approved', matchFEFO: '✓ ตรงตามด่าน' },
    { rmCode: 'RMQP-0008', name: '2Na EDTA สารสกัดดักประจุมวลรวม', lotNo: 'LOT-EDTA-449', expiry: '2027-04-12', shelfLifeDays: 310, coaStatus: 'Approved', matchFEFO: '✓ ตรงตามด่าน' },
    { rmCode: 'RMAP-0007', name: 'Vitamin B3 Niacinamide พลาสม่าคริสตัล', lotNo: 'LOT-NBN-6604', expiry: '2026-09-05', shelfLifeDays: 92, coaStatus: 'Approved', matchFEFO: '✓ เร่งใช้ด่วน (FEFO)' },
    { rmCode: 'RMES-0005', name: 'Emulgade 165 ตัวพยุงเนื้อแว็กซ์หลอมอณู', lotNo: 'LOT-EMU-0043', expiry: '2026-10-18', shelfLifeDays: 135, coaStatus: 'Approved', matchFEFO: '✓ ตรงตามด่าน' },
    { rmCode: 'RMTR-0012', name: 'Tranexamic Acid เกรดยาช่วยผิวกระจ่างขาว', lotNo: 'LOT-TXA-321', expiry: '2026-08-01', shelfLifeDays: 57, coaStatus: 'Approved', matchFEFO: '✓ วิกฤตเหลือน้อยเร่งเบิก' }
  ]);

  // Interactive search for FEFO registry
  const [fefoSearch, setFefoSearch] = useState('');

  // Environmental monitoring telemetry tracking states (Realtime simulation)
  const [telemetry, setTelemetry] = useState({
    roomTemp: 22.4,
    humidity: 48.5,
    pressureDiff: 14.8, // positive pressure room PASCAL
    airParticles: 2450, // per cubic meter Class 10,000 allowance < 100000
    wastewaterPh: 7.15
  });

  // Tick cycle simulation for mixing and sensor telemetry
  useEffect(() => {
    let interval: any = null;
    if (mixingState.isRunning) {
      interval = setInterval(() => {
        setMixingState(prev => {
          // Accelerate RPM towards target
          let currentRPM = prev.speedRPM;
          if (prev.speedRPM < prev.targetSpeed) {
            currentRPM = Math.min(prev.speedRPM + 250, prev.targetSpeed);
          } else if (prev.speedRPM > prev.targetSpeed) {
            currentRPM = Math.max(prev.speedRPM - 250, prev.targetSpeed);
          }

          // Raise/Lower temperature towards target
          let currentTemp = prev.temperature;
          if (prev.temperature < prev.targetTemp) {
            currentTemp = Math.round((prev.temperature + 1.2) * 10) / 10;
          } else if (prev.temperature > prev.targetTemp) {
            currentTemp = Math.round((prev.temperature - 1.2) * 10) / 10;
          }

          // Increase vacuum sealing simulation
          let currentVac = prev.vacuumPSI;
          if (prev.vacuumPSI > -0.95) {
            currentVac = Math.round((prev.vacuumPSI - 0.05) * 100) / 100;
          }

          let cycle = prev.cycleTime + 1;
          let statusStr = 'กำลังปั่นกวนและระเบิดอิมัลซิไฟเออร์';
          if (currentTemp >= prev.targetTemp && currentRPM >= prev.targetSpeed) {
            statusStr = 'บรรลุค่าน้ำร้อนและแรงปั่นผสมเต็มกำลัง (Stable Homogenizer Mode)';
          }

          return {
            ...prev,
            speedRPM: currentRPM,
            temperature: currentTemp,
            vacuumPSI: currentVac,
            cycleTime: cycle,
            statusText: statusStr
          };
        });

        // Mutate environmental values incrementally
        setTelemetry(prev => ({
          roomTemp: Math.round((22.0 + Math.random() * 0.8) * 10) / 10,
          humidity: Math.round((47.5 + Math.random() * 2.0) * 10) / 10,
          pressureDiff: Math.round((14.0 + Math.random() * 1.5) * 10) / 10,
          airParticles: Math.floor(2100 + Math.random() * 450),
          wastewaterPh: Math.round((7.08 + Math.random() * 0.15) * 100) / 100
        }));
      }, 1000);
    } else {
      // Cool down simulation
      interval = setInterval(() => {
        setMixingState(prev => {
          let currentRPM = Math.max(0, prev.speedRPM - 350);
          let currentTemp = Math.max(24.5, prev.temperature - 1.5);
          let currentVac = Math.min(-0.2, prev.vacuumPSI + 0.1);
          return {
            ...prev,
            speedRPM: currentRPM,
            temperature: currentTemp,
            vacuumPSI: currentVac,
            isRunning: false,
            statusText: currentRPM > 0 ? 'กำลังชะลอหัวปั่นสแตนด์บาย' : 'เครื่องควบคุมหยุดทำงานสมบูรณ์'
          };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [mixingState.isRunning]);

  const handleToggleGMPCheck = (id: number) => {
    setGmpPoints(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Approved' ? 'Warning' : 'Approved';
        onNotify(`เปลี่ยนสถานะข้อที่ ${p.id}: เป็น ${nextStatus === 'Approved' ? 'ผ่านเกณฑ์ (Approved)' : 'เฝ้าระวัง (Warning)'}`, 'info');
        return {
          ...p,
          status: nextStatus,
          auditor: userRole === 'Admin' ? 'กิตติพงษ์ (Admin Override)' : userRole
        };
      }
      return p;
    }));
  };

  const handleAuditReset = () => {
    setMixingState({
      isRunning: false,
      speedRPM: 0,
      targetSpeed: 1800,
      temperature: 24.5,
      targetTemp: 78.0,
      vacuumPSI: -0.2,
      cycleTime: 0,
      statusText: 'พร้อมเริ่มกวนสกรีนสาร'
    });
    onNotify("สลัดรีบูตสายตรวจสอบสเปคระบบ GMP & ล็อตจำมาตรอัจฉริยะแล้ว", "info");
  };

  const handleStartMixing = () => {
    setMixingState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      statusText: prev.isRunning ? 'หยุดกระบวนการปั่นผสมชั่วข้ามคืน' : 'สตาร์ทระบบมอเตอร์กระแสน้ำวนด่วน...'
    }));
    onNotify(mixingState.isRunning ? "หยุดเครื่องผสมสูตรเนื้อครีม Homogenizer MX-10" : "เริ่มเดินมอเตอร์โฮโมคุมผสมสูตรพรีเมียม", "info");
  };

  const filteredFefo = fefoRegistry.filter(f => 
    f.name.toLowerCase().includes(fefoSearch.toLowerCase()) || 
    f.rmCode.toLowerCase().includes(fefoSearch.toLowerCase()) ||
    f.lotNo.toLowerCase().includes(fefoSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="gmp-core-viewport">
      
      {/* 1. Header Hero Panel with responsive design */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#E4ECE1] text-[#3c5934] rounded-xl font-bold text-xs">COSMETIC GMP ISO 22716</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">• สำหรับสมาร์ทโฟน 100%</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight mt-1 focus:outline-none flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#34C759]" /> 
            ศูนย์คุมมาตรฐานสุขอนามัยรอบโรงงาน (GMP 15 Central Core Hub)
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5">
            บูรณาการงานคุม Cleanroom ตรวจรับบรรจุภัณฑ์ COA ตัวกรอง FEFO และเครื่องกวนปรับมวลสารสกินแคร์/เมคอัพอัจฉริยะ
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAuditReset}
            className="px-3.5 py-2 bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] text-xs font-bold rounded-xl hover:bg-neutral-100 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> รีบูตระบบด่านตรวจ
          </button>
        </div>
      </div>

      {/* 2. Primary 3-Column Layout: Grid System designed for great mobile stacking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT (lg:col-span-4): Cosmetics Input Form & Mixing Simulator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Dynamic Classification Input Form for 300+ cosmetics substances */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">1. ทะเบียนจำหมวดหมู่สําหรับผลิต</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-md">ฟอร์มอัจฉริยะ</span>
            </div>

            {/* Premium Touch Target Tabs for cosmetic classes */}
            <div className="grid grid-cols-5 gap-1 select-none">
              {(['skincare', 'makeup', 'haircare', 'bodycare', 'fragrance'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setProductCategory(cat);
                    // Autofill standard formula mockup based on category
                    const dict = {
                      skincare: { sku: 'ครีมบำรุงผิวหน้าขาวอมชมพู วิตามินบี 3 พลัส', bulk: 'สกินแคร์เนื้อครีมบัตเตอร์พรีเมียม (Skincare Premium Cream)', items: 320 },
                      makeup: { sku: 'ลิปสติกเนื้อแมตต์สีส้มอิฐสากล (Brick Velvet Lip)', bulk: 'เมคอัพกลุ่มสีและซิลิโคนแว็กซ์พิกัดสูง', items: 285 },
                      haircare: { sku: 'เซรั่มบำรุงรากผมเข้มข้นผสมขิงและโสมทอง', bulk: 'แชมพูและสารทรีทเม้นต์บำรุงเส้นผมเก็งสเปคลึก', items: 194 },
                      bodycare: { sku: 'โลชั่นน้ำนมทาผิวกายกันแดดยูวีเอแอนด์บี', bulk: 'โลชั่นขวดปั๊มสูตรสะท้อนแดดเคลือบพิทักษ์', items: 412 },
                      fragrance: { sku: 'พรีเมียมหัวน้ำหอมกุหลาบสัมผัสอบอุ่นฝรั่งเศส', bulk: 'สารน้ำหอมแอลกอฮอล์ระดับพรีเซิร์ฟเกียร์พิเศษ', items: 530 }
                    };
                    setGmpFormInput(prev => ({
                      ...prev,
                      skuName: dict[cat].sku,
                      bulkCategory: dict[cat].bulk,
                      rawMaterialCount: dict[cat].items
                    }));
                    onNotify(`เลือกประเภทการผลิต: ${cat.toUpperCase()}`, 'info');
                  }}
                  className={`py-2 rounded-xl text-[10px] font-bold text-center tracking-tight transition-all truncate border ${
                    productCategory === cat 
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs' 
                      : 'bg-neutral-50 border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {cat === 'skincare' && 'ผิว'}
                  {cat === 'makeup' && 'แต่งหน้า'}
                  {cat === 'haircare' && 'ผม'}
                  {cat === 'bodycare' && 'กาย'}
                  {cat === 'fragrance' && 'น้ำหอม'}
                </button>
              ))}
            </div>

            {/* Category Subform */}
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">ชื่อผลิตภัณฑ์คีย์ตรวจสอบทาง GMP</label>
                <input
                  type="text"
                  value={gmpFormInput.skuName}
                  onChange={(e) => setGmpFormInput(prev => ({ ...prev, skuName: e.target.value }))}
                  className="w-full border border-[#E5E5EA] rounded-xl p-2.5 outline-none font-sans bg-neutral-50 font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 text-[#1D1D1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">เลขล็อตกำหนด</label>
                  <input
                    type="text"
                    value={gmpFormInput.batchNo}
                    onChange={(e) => setGmpFormInput(prev => ({ ...prev, batchNo: e.target.value }))}
                    className="w-full border border-[#E5E5EA] font-mono rounded-xl p-2.5 outline-none bg-neutral-50 text-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">หัวหน้าผู้คุมไลน์</label>
                  <input
                    type="text"
                    value={gmpFormInput.inspectorName}
                    onChange={(e) => setGmpFormInput(prev => ({ ...prev, inspectorName: e.target.value }))}
                    className="w-full border border-[#E5E5EA] rounded-xl p-2.5 outline-none bg-neutral-50 text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-150 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-[#86868B] font-bold">
                  <span>สถานะการจำแนกสารเคมีคลังอัติโนมัติ</span>
                  <span className="text-emerald-600">✓ ซิงค์ฐานข้อมูลโรงงาน</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700">
                  <p><strong>หมวดหมู่แมคโคร:</strong> {gmpFormInput.bulkCategory}</p>
                  <p><strong>จำนวนรหัสสารเคมีในฐานตรวจสอบคลัง:</strong> <span className="font-mono text-indigo-600 font-bold">{gmpFormInput.rawMaterialCount} ชนิดอัจฉริยะ</span></p>
                  <p className="text-[10px] text-indigo-500 italic font-medium leading-normal">* ระบบดึงแผนวิจัยแล็บ R&amp;D และจับคู่สิทธิรักษาการป้อนบรรจุภัณฑ์ FEFO สมบูรณ์แล้ว</p>
                </div>
              </div>
            </div>
          </div>

          {/* B. Mixing Simulator (ตัวกระตุ้นเครื่องผสม) designed as an industrial visualizer */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-[#FF9500]" /> 
                2. บอร์ดควบคุมและกระตุ้นเครื่องผสม (Homogenizer Mixer Controller)
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${mixingState.isRunning ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`}></span>
            </div>

            {/* Visual animated pot representation */}
            <div className="bg-neutral-950 p-4 rounded-2xl relative overflow-hidden h-44 flex flex-col justify-between text-white border border-[#3A3A3C]">
              
              {/* Overlay animated bubbles/spinners representing homomixer rotor */}
              {mixingState.isRunning && (
                <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center opacity-60">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-indigo-400 animate-spin flex items-center justify-center" style={{ animationDuration: `${2000 - mixingState.speedRPM}ms` }}>
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-white animate-reverse-spin"></div>
                  </div>
                </div>
              )}

              {/* Readout sensors header */}
              <div className="grid grid-cols-3 gap-2 text-center text-zinc-400 font-mono text-[10px] relative z-10">
                <div className="bg-zinc-900 border border-zinc-805 p-1.5 rounded-xl">
                  <span className="block text-zinc-500 text-[8px] uppercase">ความเร็วรอบ (RPM)</span>
                  <strong className="text-xs text-white font-extrabold">{mixingState.speedRPM}</strong>
                </div>
                <div className="bg-zinc-900 border border-zinc-805 p-1.5 rounded-xl">
                  <span className="block text-zinc-500 text-[8px] uppercase">ความร้อน (°C)</span>
                  <strong className="text-xs text-orange-400 font-extrabold">{mixingState.temperature.toFixed(1)}°C</strong>
                </div>
                <div className="bg-zinc-900 border border-zinc-805 p-1.5 rounded-xl">
                  <span className="block text-zinc-500 text-[8px] uppercase">สุญญากาศ (PSI)</span>
                  <strong className="text-xs text-sky-400 font-extrabold">{mixingState.vacuumPSI.toFixed(2)}</strong>
                </div>
              </div>

              {/* Status display overlay */}
              <div className="relative z-10 text-center space-y-1.5">
                <p className="text-[11px] font-sans font-medium text-emerald-300 block truncate" title={mixingState.statusText}>
                  {mixingState.statusText}
                </p>
                <div className="flex justify-center gap-4 text-[9px] font-mono text-zinc-400">
                  <span>เวลากลั่นผสมสะสม: {mixingState.cycleTime}s</span>
                  <span>•</span>
                  <span>สถานะความกดถัง: บัญญัติ GMP ใส</span>
                </div>
              </div>

              {/* Controller setpoints inputs */}
              <div className="grid grid-cols-2 gap-3 relative z-10 border-t border-zinc-800 pt-2 text-[9px] font-mono text-zinc-400">
                <div className="flex justify-between items-center bg-zinc-900/60 p-1 px-2 rounded-lg">
                  <span>เป้าเด็ดความเร็ว:</span>
                  <input
                    type="number"
                    value={mixingState.targetSpeed}
                    step="100"
                    onChange={(e) => setMixingState(prev => ({ ...prev, targetSpeed: Number(e.target.value) }))}
                    className="w-12 text-right bg-transparent text-white font-extrabold border-none p-0 outline-none"
                    disabled={mixingState.isRunning}
                  />
                  <span>RPM</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/60 p-1 px-2 rounded-lg">
                  <span>เป้าเด็ดความร้อน:</span>
                  <input
                    type="number"
                    value={mixingState.targetTemp}
                    step="5"
                    onChange={(e) => setMixingState(prev => ({ ...prev, targetTemp: Number(e.target.value) }))}
                    className="w-10 text-right bg-transparent text-white font-extrabold border-none p-0 outline-none"
                    disabled={mixingState.isRunning}
                  />
                  <span>°C</span>
                </div>
              </div>
            </div>

            {/* Quick Trigger Button for Homomixer state */}
            <button
              type="button"
              onClick={handleStartMixing}
              className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm uppercase ${
                mixingState.isRunning 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              <Play className={`h-4 w-4 ${mixingState.isRunning ? 'animate-pulse' : ''}`} />
              {mixingState.isRunning ? 'หยุดเครื่องปั่นผสมในถัง' : 'เริ่มปั่นกวนอิมัลชัน Homogenizer'}
            </button>
          </div>

        </div>

        {/* MIDDLE & RIGHT COMBINED (lg:col-span-8): 15 GMP Core checklist & Telemetry logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. Cleanroom GMP Environmental Realtime Telemetry Grid */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#86868B] block border-b pb-2">
              3. ติดตามสภาพแวดล้อม Cleanroom Realtime (GMP Environmental Safety Logs)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
              
              <div className="bg-[#FFF8F2] border border-[#FFE8D6] p-3 rounded-2xl relative">
                <Thermometer className="h-4.5 w-4.5 text-[#FF9500] mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">อุณหภูมิห้องผสม</span>
                <strong className="text-base font-mono text-[#FF9500] block mt-1">{telemetry.roomTemp}°C</strong>
                <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold block mt-1">คุมดี (20-24°C)</span>
              </div>

              <div className="bg-[#EFFFFA] border border-[#C6FCE5] p-3 rounded-2xl relative">
                <Droplet className="h-4.5 w-4.5 text-emerald-600 mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">ความชื้นสัมพัทธ์</span>
                <strong className="text-base font-mono text-emerald-750 block mt-1">{telemetry.humidity}% RH</strong>
                <span className="text-[8px] text-emerald-750 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold block mt-1">เกณฑ์กักฝุ่น</span>
              </div>

              <div className="bg-sky-50/55 border border-sky-150 p-3 rounded-2xl relative">
                <Wind className="h-4.5 w-4.5 text-sky-600 mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">ความกดอากาศ</span>
                <strong className="text-base font-mono text-sky-750 block mt-1">{telemetry.pressureDiff} Pa</strong>
                <span className="text-[8px] text-sky-750 bg-sky-100 px-1.5 py-0.5 rounded-md font-semibold block mt-1">+Positive Air</span>
              </div>

              <div className="bg-indigo-50/45 border border-indigo-150 p-3 rounded-2xl relative">
                <Layers className="h-4.5 w-4.5 text-indigo-700 mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">ความหนาแน่นฝุ่น</span>
                <strong className="text-base font-mono text-indigo-850 block mt-1">{telemetry.airParticles.toLocaleString()}</strong>
                <span className="text-[8px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-md font-semibold block mt-1">Class 10,000</span>
              </div>

              <div className="bg-[#FFFCE4] border border-[#FFF5C6] p-3 rounded-2xl col-span-2 sm:col-span-1">
                <Activity className="h-4.5 w-4.5 text-yellow-600 mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">บำบัดน้ำทอดทิ้ง</span>
                <strong className="text-base font-mono text-yellow-800 block mt-1">pH {telemetry.wastewaterPh}</strong>
                <span className="text-[8px] text-green-750 bg-green-50 px-1.5 py-0.5 rounded-md font-semibold block mt-1">เป็นกลางปลอดภัย</span>
              </div>

            </div>
          </div>

          {/* B. 15 GMP Core points with interactive auditor toggles */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#34C759]" /> 
                4. รายละเอียดการคุมสเปค มาตรฐาน GMP 15 จุดสากล (15 GMP Central Audit Checkpoints)
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">
                ผ่านเกณฑ์: {gmpPoints.filter(p => p.status === 'Approved').length} / 15
              </span>
            </div>

            {/* List with scrollbar on desktop, stacked on mobile */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {gmpPoints.map((point) => {
                const isApproved = point.status === 'Approved';
                return (
                  <div 
                    key={point.id}
                    onClick={() => handleToggleGMPCheck(point.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 text-xs justify-between items-start ${
                      isApproved 
                        ? 'bg-white border-zinc-150 text-slate-700 hover:border-slate-350 shadow-xs' 
                        : 'bg-rose-50/40 border-rose-200 text-rose-900 shadow-xs'
                    }`}
                  >
                    <div className="flex gap-2.5 items-start">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] shrink-0 mt-0.5 ${
                        isApproved ? 'bg-[#34C759] text-white' : 'bg-rose-600 text-white animate-pulse'
                      }`}>
                        {point.id}
                      </span>
                      <div className="space-y-1 select-none">
                        <strong className={`font-semibold block ${isApproved ? 'text-[#1D1D1F]' : 'text-rose-900'}`}>{point.title}</strong>
                        <p className={`text-[11px] ${isApproved ? 'text-[#86868B]' : 'text-rose-800'}`}>{point.comment}</p>
                        <div className="flex gap-3 text-[9px] text-[#A6B2C3] font-mono mt-1">
                          <span>หัวหน้าตรวจสอบ: {point.auditor}</span>
                          <span>•</span>
                          <span>เวลาตรวจสอบ: ล่าสุด</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                        isApproved ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700 animate-pulse'
                      }`}>
                        {isApproved ? 'Approved' : 'Attention'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* C. First Expired First Out (FEFO) & Certificate of Analysis (COA) Registry */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#86868B] block">
                  5. คลังรายงาน FEFO &amp; เอกสารใบรับรองผล COA (FEFO Materials Expiry Checklist)
                </span>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">ดักจับอายุสารเพื่อเบิกใช้เร่งด่วนตามข้อกำหนดอุตสาหกรรมสําสมดุลเคมีสำอาง</p>
              </div>

              {/* Minimalist Search inside FEFO */}
              <div className="relative w-full sm:w-56 shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 font-bold" />
                <input
                  type="text"
                  placeholder="ค้นหารหัส หรือล็อตเคมีสังเคราะห์..."
                  value={fefoSearch}
                  onChange={(e) => setFefoSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#E5E5EA] rounded-xl text-[11px] bg-neutral-50 outline-none focus:bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse font-sans text-slate-700">
                <thead>
                  <tr className="bg-neutral-50 border-b font-bold text-slate-500 uppercase tracking-widest text-[9px]">
                    <th className="py-2 px-3">รหัสและวัตถุดิบเคมี</th>
                    <th className="py-2 px-2 text-center">ล็อต (Lot)</th>
                    <th className="py-2 px-3 text-right">วันหมดอายุหมดลงคลัง</th>
                    <th className="py-2 px-3 text-right">วันคงเหลือ (FEFO)</th>
                    <th className="py-2 px-3 text-center">CoA Lab QA</th>
                    <th className="py-2 px-3 text-right">ด่านเบิกสะสม</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFefo.map((f, i) => (
                    <tr key={f.rmCode} className="border-b border-zinc-100 hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3">
                        <strong className="font-semibold block text-slate-900">{f.name}</strong>
                        <span className="font-mono text-[9px] text-[#86868B]">{f.rmCode}</span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[#86868B]">{f.lotNo}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">{f.expiry}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700 bg-indigo-50/15">
                        {f.shelfLifeDays} วัน
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-emerald-50 text-emerald-800 p-0.5 px-2 rounded-full font-bold text-[9px]">
                          {f.coaStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-zinc-800 text-[10px]">
                        {f.matchFEFO}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
