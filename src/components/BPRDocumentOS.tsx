import React, { useState } from 'react';
import { 
  FileText, Clipboard, Printer, CheckCircle, AlertCircle, Layers, 
  Trash2, Plus, RefreshCw, Barcode, Check, ChevronRight, User, Package, Download
} from 'lucide-react';

interface BPRDocumentOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

interface BPRFormulaItem {
  no: number;
  part: string;
  rmCode: string;
  rmName: string;
  formulaPct: number; // % w/w
  lotNo: string;
  containerWeight: number; // g
}

export default function BPRDocumentOS({ dbState, onRefresh, onNotify, userRole }: BPRDocumentOSProps) {
  // Hardcoded initial list of high-quality cosmetic BPR datasets matching the video precisely
  const initialCustomers = [
    {
      id: 'cust-c66-083',
      name: 'คุณกนกวรรณ ช่วยศรัทธา',
      formulaCode: 'C66-083',
      productName: 'ครีมบำรุงผิวหน้าขาวอมชมพู วิตามินบี 3 พลัส (B3 Aura White Cream)',
      lotNo: 'BDC66-014',
      batchSize: 103, // kg
      operator: 'นายกิตติ์ธนา คำมูล',
      inspector: 'ดร. ลลิตา วรโชติสกุล',
      mfgDate: '2026-06-05',
      expDate: '2028-06-05',
      items: [
        { no: 1, part: 'A', rmCode: 'RMOL-0001', rmName: 'DI Water (น้ำปราศจากไอออน)', formulaPct: 73.10, lotNo: 'LOT-W2605-01', containerWeight: 1450 },
        { no: 2, part: 'A', rmCode: 'RMQP-0008', rmName: '2Na EDTA (สารจับประจุโลหะหนัก)', formulaPct: 0.10, lotNo: 'LOT-EDTA-449', containerWeight: 350 },
        { no: 3, part: 'A', rmCode: 'RMGL-0005', rmName: 'Propylene Glycol (สารเพิ่มความชื้นช่วยนำร่อง)', formulaPct: 3.00, lotNo: 'LOT-PG-3012', containerWeight: 680 },
        { no: 4, part: 'A', rmCode: 'RMTL-0002', rmName: 'Viscolam 100 AP (สารสร้างเนื้อขุ่นเนียนนุ่ม)', formulaPct: 2.75, lotNo: 'LOT-VIS-9801', containerWeight: 750 },
        { no: 5, part: 'B', rmCode: 'RMES-0005', rmName: 'Emulgade 165 (ตัวประสานขี้ผึ้งหลอมอณู)', formulaPct: 2.50, lotNo: 'LOT-EMU-0043', containerWeight: 450 },
        { no: 6, part: 'B', rmCode: 'RMWS-0005', rmName: 'Cetyl Alcohol Wax-C (สารเพิ่มความแกร่งเนื้อครีม)', formulaPct: 3.00, lotNo: 'LOT-CETYL-552', containerWeight: 520 },
        { no: 7, part: 'B', rmCode: 'RMNL-0011', rmName: 'Cyclopentasiloxane / low-odor (ซิลิโคนแผ่ผิวบางเบา)', formulaPct: 2.00, lotNo: 'LOT-SIL-2441', containerWeight: 800 },
        { no: 8, part: 'C', rmCode: 'RMTR-0012', rmName: 'Tranexamic Acid (สารสกัดพรีเมียมลดความหมองคล้ำ)', formulaPct: 2.00, lotNo: 'LOT-TXA-321', containerWeight: 400 },
        { no: 9, part: 'C', rmCode: 'RMAP-0007', rmName: 'Vitamin B3 Niacinamide (สารพลาสม่าเพื่อผิวสว่างใส)', formulaPct: 3.00, lotNo: 'LOT-NBN-6604', containerWeight: 510 },
        { no: 10, part: 'C', rmCode: 'RMAP-0003', rmName: 'Vitamin B5 D-Panthenol (วิตามินเร่งซ่อมแซมผิวระดับเซลล์)', formulaPct: 0.50, lotNo: 'LOT-B5P-128', containerWeight: 390 },
        { no: 11, part: 'D', rmCode: 'RMAP-0023', rmName: 'Microcare PHC (วัตถุกันเสียฆ่าเชื้อแบคทีเรีย)', formulaPct: 0.90, lotNo: 'LOT-MIC-4029', containerWeight: 320 },
        { no: 12, part: 'D', rmCode: 'RMFL-0205', rmName: 'กนกพร โรส แซนทัล ฟราแกรนซ์ (หัวน้ำหอมกุหลาบสัมผัสอบอุ่น)', formulaPct: 0.15, lotNo: 'LOT-FRG-0081', containerWeight: 250 },
      ] as BPRFormulaItem[],
      instructions: [
        { id: 1, text: 'เตรียบถังหลักชั่ง DI Water เติม 2Na EDTA และ Propylene Glycol ลงไปทีละตัว ปั่นละลายด้วยชุดฟันเฟือง Anchor Stirrer ที่สแตนด์บาย 600 RPM เป็นเวลา 15 นาทีจนเนียนใส', done: true },
        { id: 2, text: 'ค่อยๆ โรยเทโปรย Viscolam 100 AP ลงไปทีละนิด และปั่นด้วยโฮโมจีไนเซอร์ (Homogenizer) ที่ความเร็ว 2,000 RPM คุมอุณหภูมิคงที่เพื่อสร้างเนื้อเจลใสเนียนพองตัว', done: true },
        { id: 3, text: 'ต้มส่วน Part B ประกอบด้วย Emulgade 165, Wax-C และ ซิลิโคน Cyclopentasiloxane แยกต่างหากที่อุณหภูมิ 75-80 องศาเซลเซียส ให้ละลายเนียนเป็นของเหลวใสไม่มีฟองอากาศ', done: false },
        { id: 4, text: 'เทหลอมอิมัลชันของเหลว Part B ค่อยๆ เทเป็นสายลงในเจลถังหลัก ปั่นกวนแบบไฮสปีด Homogenizer 2500 RPM ค้าง 20 นาที จนเม็ดครีมอิมัลซิไฟเออร์ระเบิดตัวเงาสูงนุ่มหยุ่น', done: false },
        { id: 5, text: 'ลดความร้อนคูลลิ่งเครื่องผสมถังหลักลงมาต่ำกว่า 45 องศาเซลเซียส จึงค่อยเติม Tranexamic, Vitamin B3, B5 (Part C) และสารกันเสีย Microcare กับหัวน้ำหอมฟลอรัล (Part D)', done: false },
        { id: 6, text: 'ตรวจสอบสเปคค่าความเป็นกรดด่าง (pH) ให้อยู่ในช่วง 5.5 - 6.5 จากนั้นกรอกบันทึกใบรายงาน ส่งด่านตรวจสอบห้องปฏิบัติการ และกวนลดฟองเตรียมคัดแยกบรรจุขวดหัวปั๊มสเปรย์ต่อไป', done: false },
      ]
    },
    {
      id: 'cust-c66-094',
      name: 'คุณกชกร ดำผิว',
      formulaCode: 'C66-094',
      productName: 'เจลพอกบำรุงว่านหางจระเข้ผสมสารสกัดเข้มข้นพิเศษ (Aloe Vera Soothing Gel Deluxe)',
      lotNo: 'BDC66-015',
      batchSize: 50, // kg
      operator: 'นายสมชาย ไวกิจการ',
      inspector: 'ดร. นิรุตต์ ตั้งจิตประสงค์',
      mfgDate: '2026-06-03',
      expDate: '2028-06-03',
      items: [
        { no: 1, part: 'A', rmCode: 'RMOL-0001', rmName: 'DI Water (น้ำปราศจากไอออน)', formulaPct: 84.50, lotNo: 'LOT-W2605-01', containerWeight: 1450 },
        { no: 2, part: 'A', rmCode: 'RMQP-0008', rmName: '2Na EDTA (สารแก้โลหะแปลกปลอม)', formulaPct: 0.10, lotNo: 'LOT-EDTA-449', containerWeight: 350 },
        { no: 3, part: 'A', rmCode: 'RMGL-0005', rmName: 'Propylene Glycol (คุมชื้นสกัดค้าง)', formulaPct: 4.00, lotNo: 'LOT-PG-3012', containerWeight: 680 },
        { no: 4, part: 'A', rmCode: 'RMTL-0002', rmName: 'Viscolam 100 AP (สร้างเจลดักจับมวลน้ำ)', formulaPct: 3.50, lotNo: 'LOT-VIS-9801', containerWeight: 750 },
        { no: 5, part: 'B', rmCode: 'RMES-0010', rmName: 'สารสกัดว่านหางอะโลเวร่าอบแห้งแช่แข็ง (Aloe Barbadensis Concentrate)', formulaPct: 5.00, lotNo: 'LOT-ALOE-1011', containerWeight: 310 },
        { no: 6, part: 'B', rmCode: 'RMAP-0007', rmName: 'Vitamin B3 Niacinamide (ผิวกระชับเนียนออร่า)', formulaPct: 2.00, lotNo: 'LOT-NBN-6604', containerWeight: 515 },
        { no: 7, part: 'C', rmCode: 'RMAP-0023', rmName: 'Microcare PHC (คุมเก็บรักษาเนื้อสัมผัส)', formulaPct: 0.80, lotNo: 'LOT-MIC-4029', containerWeight: 300 },
        { no: 8, part: 'C', rmCode: 'RMFL-0220', rmName: 'กลิ่นสารสกัดอโลออร์แกนิกส์ (Aloe Fresh Organic Fragrance)', formulaPct: 0.10, lotNo: 'LOT-FRG-0022', containerWeight: 220 },
      ] as BPRFormulaItem[],
      instructions: [
        { id: 1, text: 'กวนปั่นละลาย DI Water ร่วมกับ 2Na EDTA และ Propylene Glycol ใหเข้ากันอย่างลงตัวแบบสมดุลกลศาสตร์ปั้น', done: true },
        { id: 2, text: 'โปรยสารสร้างเนื้อเจล Viscolam 100 AP ทีละลิด ปั่น Homogenizer ค้างรอบสูง 2200 RPM นาน 25 นาทีจนเจลฟอรืมวุ้นเนียนใส', done: true },
        { id: 3, text: 'ละลายสารสกัดว่านหางจระเข้เข้มข้นร่วมกับสารสว่างใสวิตามินบี 3 จนเนียนเกลี้ยง จึงเทผสมลงกวนแบบคงรอบความเร็วสม่ำเสมอ', done: true },
        { id: 4, text: 'เติมวัตถุกันเสียและแต่งกลิ่นหอมธรรมชาติอโลอิน อ่อนโยนปัด และกวนอพยพดึงสูญญากาศทิ้งฟองอากาศรอจัดลำลงขวดเจลใส', done: false }
      ]
    }
  ];

  // Simulated Packaging Inspection Ledger matching video's GMP container QC check
  const initialPackagingQc = [
    { id: 'PKG-QC-001', date: '04/06/2026', code: 'IDV-PH016', name: 'ฝาพรีเมียมสีทองวาว (28 mm.)', size: '28mm', qty: 5000, lot: '2569/1103', threading: 'ผ่านเกณฑ์', wallThickness: 'ผ่านเกณฑ์', defects: 'ไม่มี', coa: 'มีครบถ้วน', result: 'ผ่านเกณฑ์ (Approved)', inspector: 'นายกิตติ์ธนา คำมูล' },
    { id: 'PKG-QC-002', date: '04/06/2026', code: 'IDV-BTG018', name: 'ขวดแก้วหล่อใสทรงเหลี่ยมพรีเมียม 15 ml.', size: '15ml', qty: 2500, lot: '2569/009', threading: 'ผ่านเกณฑ์', wallThickness: 'ผ่านเกณฑ์', defects: 'พบนิ่มบิดตัว 1 ชิ้น', coa: 'มีครบถ้วน', result: 'ผ่านเกณฑ์ (Approved)', inspector: 'นายกิตติ์ธนา คำมูล' },
    { id: 'PKG-QC-003', date: '05/06/2026', code: 'IDV-SK182A', name: 'กระปุกครีมสูญญากาศสีขาวขอบเงิน 50 g.', size: '50g', qty: 1000, lot: '2569/087', threading: 'ผ่านเกณฑ์', wallThickness: 'ผ่านเกณฑ์', defects: 'ไม่มี', coa: 'มีครบถ้วน', result: 'ผ่านเกณฑ์ (Approved)', inspector: 'นายกิตติ์ธนา คำมูล' },
    { id: 'PKG-QC-004', date: '05/06/2026', code: 'IDV-BX0090', name: 'กล่องกระดาษเคลือบฟอยล์ทองพับข้างเรียบ', size: 'A5 Box', qty: 10000, lot: '032569/006', threading: 'ไม่เกี่ยวข้อง', wallThickness: 'ผ่านเกณฑ์', defects: 'บุบพับผิดพลาด 4 ชิ้น', coa: 'ไม่มี', result: 'กักกันตรวจสอบเพิ่มเติม', inspector: 'ดร. ลลิตา วรโชติสกุล' },
  ];

  const [customersData, setCustomersData] = useState(initialCustomers);
  const [selectedBprId, setSelectedBprId] = useState<string>('cust-c66-083');
  const [activeSegment, setActiveSegment] = useState<'bpr-sheet' | 'stock-reconcile' | 'printable-labels' | 'packaging-qc'>('bpr-sheet');
  const [packagingLogs, setPackagingLogs] = useState(initialPackagingQc);
  
  // Custom states for dynamically adding/modifying BPR
  const [editingBatchSize, setEditingBatchSize] = useState<number>(103);
  const [customWeighedWeights, setCustomWeighedWeights] = useState<{[key: number]: number}>({});
  const [actionLocked, setActionLocked] = useState<boolean>(false);

  // Active dataset
  const activeBpr = customersData.find(c => c.id === selectedBprId) || customersData[0];

  // Helper calculating target mass for ingredients: Formula % * Batch size * 10 = Grams ( since 100% of 100kg is 100,000g )
  const calculateTargetWeight = (formulaPct: number, batchSize: number) => {
    return formulaPct * batchSize * 10; // returns grams description
  };

  const handleUpdateWeighed = (itemNo: number, val: number) => {
    setCustomWeighedWeights(prev => ({
      ...prev,
      [itemNo]: val
    }));
  };

  const toggleInstruction = (bprId: string, instId: number) => {
    setCustomersData(prev => prev.map(cust => {
      if (cust.id === bprId) {
        return {
          ...cust,
          instructions: cust.instructions.map(inst => 
            inst.id === instId ? { ...inst, done: !inst.done } : inst
          )
        };
      }
      return cust;
    }));
  };

  const executeStockDeduction = () => {
    if (actionLocked) {
      onNotify("สต๊อกสารเคมีสําหรับล็อตผลิตนี้ ได้รับการบันทึกปรับลดลงคลังเรียบร้อยแล้ว!", "warning");
      return;
    }
    
    // Simulate deduction logs
    setActionLocked(true);
    onNotify(`[คลังวัตถุดิบ] สั่งเบิกหักลดยอดสารเคมีจำนวน 12 แฉก ตามมวลจริงคำนวณสีกรองสูตร ${activeBpr.lotNo} เป็นเงินสะสมมูลค่า 112,400 บาท และอัปเดตรายงาน FIFO เรียบร้อย!`, 'info');
    onRefresh();
  };

  const triggerReset = () => {
    setActionLocked(false);
    setCustomWeighedWeights({});
    setCustomersData(initialCustomers);
    onNotify("สเกลชั่งรีเซ็ตค่าน้ำหนักสารและปลดล็อกสต๊อกคลังแล้ว", "info");
  };

  const printDocument = () => {
    window.print();
    onNotify("ส่งคำสั่งสั่งพิมพ์ฉลากไปยังเครื่องพิมพ์ความร้อนแบบโอน (Thermal Label Printer) ประจำไลน์ผสม...", "info");
  };

  return (
    <div className="space-y-6" id="bpr-industrial-module">
      {/* Top Banner section */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            สมาร์ทโมดูล BPR ดิจิทัล &amp; บัญชีการชั่งวัตถุดิบสารตามหลัก GMP
          </h3>
          <p className="text-xs text-[#86868B] mt-1">
            จำลองระบบบันทึกมวลสารเคมีสูตรรอบอุตสาหกรรม (Batch Processing Record) ขั้นตอนควบคุมเบิก ชั่ง ผิวสัมผัสเนื้อ และออกพิมพ์สติ๊กเกอร์ถังชั่ง
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerReset}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> รีเซ็ตพารามิเตอร์จำลอง
          </button>
          <button
            type="button"
            onClick={printDocument}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" /> ส่งพิมพ์ฟอร์ม BPR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Selection / Controller card (col-span-1) */}
        <div className="xl:col-span-1 bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
          <div className="border-b pb-2">
            <span className="font-bold text-xs uppercase text-slate-400 tracking-wider">ดึงข้อมูลล็อตผลิตเอกสาร</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold block text-[#1D1D1F]">ชื่อลูกค้า &amp; สูตรกำกับใน Drive</label>
              <select
                value={selectedBprId}
                onChange={(e) => {
                  setSelectedBprId(e.target.value);
                  const selected = customersData.find(c => c.id === e.target.value);
                  if (selected) setEditingBatchSize(selected.batchSize);
                }}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none font-sans font-medium text-slate-800"
              >
                {customersData.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.formulaCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-[#E5E5EA] space-y-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase block">ข้อมูลสูตรเชิงวิศวกรรมทางครีม</span>
              <div className="text-xs space-y-1 text-slate-700">
                <p><strong>ชื่อ SKU ผลิตภัณฑ์:</strong> <span className="text-[#1D1D1F] block mt-0.5 font-medium">{activeBpr.productName}</span></p>
                <p><strong>เลล็อตผลิตอ้างอิง:</strong> <span className="text-indigo-600 font-mono font-bold">{activeBpr.lotNo}</span></p>
                <p><strong>หัวหน้าคุมวิจัยแล็บ:</strong> <span className="text-zinc-800">{activeBpr.inspector}</span></p>
                <p><strong>ผู้ชั่งจ่ายมวลเคมี:</strong> <span className="text-zinc-800">{activeBpr.operator}</span></p>
              </div>
            </div>

            {/* Quick adjust Batch Size scale */}
            <div className="space-y-1">
              <label className="font-semibold block text-[#1D1D1F] flex justify-between">
                <span>น้ำหนักจำมาตรล็อตผลิต (Batch Size)</span>
                <span className="font-bold text-indigo-600 font-mono text-[13px]">{editingBatchSize} KG</span>
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={editingBatchSize}
                onChange={(e) => {
                  setEditingBatchSize(Number(e.target.value));
                  setCustomersData(prev => prev.map(cust => {
                    if (cust.id === selectedBprId) {
                      return { ...cust, batchSize: Number(e.target.value) };
                    }
                    return cust;
                  }));
                }}
                className="w-full select-none cursor-ew-resize h-1 bg-neutral-200 rounded-lg appearance-none accent-indigo-600"
              />
              <span className="text-[10px] text-neutral-400 block leading-tight">
                * สเกลขนาดถังอุตสาหกรรมใน GMP (สัดส่วนร้อยละ % w/w ของสารจะเท่าเดิม มวลพิกัดเป้ากรัมจะทวีคูณคํานวณแปรผันตามขนาดถัง)
              </span>
            </div>

            {/* Segment Selector Menu */}
            <div className="space-y-1.5 pt-4 border-t">
              <span className="font-bold text-[10px] text-slate-400 uppercase block">เมนูเอกสาร BPR ตาม GMP</span>
              
              <button
                type="button"
                onClick={() => setActiveSegment('bpr-sheet')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-medium transition-all ${
                  activeSegment === 'bpr-sheet' ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2"><Clipboard className="h-4 w-4" /> BPR บันทึกการผลิต</span>
                <ChevronRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment('stock-reconcile')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-medium transition-all ${
                  activeSegment === 'stock-reconcile' ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2"><Package className="h-4 w-4" /> ใบพิกัดหักลดสต๊อกสาร</span>
                <ChevronRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment('printable-labels')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-medium transition-all ${
                  activeSegment === 'printable-labels' ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2"><Barcode className="h-4 w-4" /> สลากย่อยชั่งวัตถุดิบ</span>
                <ChevronRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment('packaging-qc')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-medium transition-all ${
                  activeSegment === 'packaging-qc' ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-150' : 'text-slate-600 hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> บันทึกตรวจรับบรรจุภัณฑ์</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display workspace (col-span-3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* 1. BPR SHEET SEGMENT */}
          {activeSegment === 'bpr-sheet' && (
            <div className="space-y-6">
              {/* Layout matching high density cosmetics factory spreadsheet precisely */}
              <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-xs overflow-hidden" id="bpr-spreadsheet-printable">
                
                {/* Visual title box resembling actual paper document form */}
                <div className="border-b border-[#E5E5EA] p-5 bg-neutral-950 text-white flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">IDEVA GROUP MANUFACTURING CO., LTD.</span>
                    <h4 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                      BATCH PROCESSING RECORD (BPR) / ใบสรุปสัดส่วนผสมการผลิต
                    </h4>
                  </div>
                  <div className="text-right font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                    <p><strong>FORM:</strong> FM-PD-017A</p>
                    <p><strong>LOT:</strong> {activeBpr.lotNo}</p>
                  </div>
                </div>

                {/* Metadata details block */}
                <div className="bg-neutral-50 p-4 border-b border-[#E5E5EA] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 font-sans">
                  <p><strong>ชื่อผลิตภัณฑ์:</strong> <span className="text-zinc-900 font-medium block truncate" title={activeBpr.productName}>{activeBpr.productName}</span></p>
                  <p><strong>ชื่อลูกค้า:</strong> <span className="text-zinc-900 font-medium block truncate">{activeBpr.name}</span></p>
                  <p><strong>Batch Size:</strong> <span className="text-indigo-600 font-bold block font-mono">{activeBpr.batchSize} kg (ถังเกรดเภสัช)</span></p>
                  <p><strong>กิโลส่วนผสมเป้า:</strong> <span className="text-zinc-900 font-bold block font-mono">{(activeBpr.batchSize * 1000).toLocaleString()} กรัม</span></p>
                </div>

                {/* High Density Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#E4ECE1] text-[#3c5934] font-bold border-b border-zinc-300 font-sans">
                        <th className="py-2.5 px-3 text-center border-r border-zinc-200">ลำดับ</th>
                        <th className="py-2.5 px-2 text-center border-r border-zinc-200">Part</th>
                        <th className="py-2.5 px-3 border-r border-zinc-200">รหัสเคมี (Code)</th>
                        <th className="py-2.5 px-4 border-r border-zinc-200">ชื่อวัตถุดิบระบุส่วนประกอบสูตรสําหรับทาบำรุง</th>
                        <th className="py-2.5 px-3 text-right border-r border-zinc-200">% w/w</th>
                        <th className="py-2.5 px-3 text-right border-r border-zinc-200">เป้าชั่งจริง (กรัม)</th>
                        <th className="py-2.5 px-3 text-right border-r border-zinc-200">มวลรวมภาชนะ (g)</th>
                        <th className="py-2.5 px-3 text-right border-r border-zinc-200">น้ำหนักชั่งชิงโต้แชนแนล (g)</th>
                        <th className="py-2.5 px-3 text-center">ผ่านเกณฑ์</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBpr.items.map((item, idx) => {
                        const targetGrams = calculateTargetWeight(item.formulaPct, activeBpr.batchSize);
                        const weighedVal = customWeighedWeights[item.no] !== undefined ? customWeighedWeights[item.no] : targetGrams;
                        const isMatch = Math.abs(weighedVal - targetGrams) < 0.5; // tolerance +/- 0.5g

                        // Highlight alternate rows or partition background based on "Part" (A=light blue, B=light yellow, C=light rose)
                        const partColor = item.part === 'A' ? 'bg-blue-50/20' : item.part === 'B' ? 'bg-yellow-50/20' : item.part === 'C' ? 'bg-rose-50/20' : 'bg-emerald-50/10';

                        return (
                          <tr key={item.no} className={`border-b border-zinc-200/60 font-sans text-slate-700 hover:bg-neutral-50/80 transition-colors ${partColor}`}>
                            <td className="py-2 px-3 text-center font-bold border-r border-zinc-150 font-mono text-zinc-500">{item.no}</td>
                            <td className="py-2 px-2 text-center border-r border-zinc-150 font-bold text-slate-800 font-mono">{item.part}</td>
                            <td className="py-2 px-3 border-r border-zinc-150 font-mono font-semibold text-zinc-900">{item.rmCode}</td>
                            <td className="py-2 px-4 border-r border-zinc-150">
                              <p className="font-semibold text-zinc-800">{item.rmName}</p>
                              <div className="flex gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                                <span>Lot สาร: {item.lotNo}</span>
                                <span>•</span>
                                <span>แล็บ QA: ปล่อยผ่าน CoA แล้ว</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right border-r border-zinc-150 font-mono text-zinc-600">{item.formulaPct.toFixed(2)} %</td>
                            <td className="py-1.5 px-3 text-right border-r border-zinc-150 font-mono text-indigo-700 font-bold bg-indigo-50/40">
                              {targetGrams.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} กรัม
                            </td>
                            <td className="py-2 px-3 text-right border-r border-zinc-150 font-mono font-medium text-slate-500">
                              {(item.containerWeight).toLocaleString()} กรัม
                            </td>
                            <td className="py-1 px-2 text-right border-r border-zinc-150">
                              {/* Inline dosage interactive weight scale input */}
                              <input
                                type="number"
                                value={weighedVal}
                                onChange={(e) => handleUpdateWeighed(item.no, Number(e.target.value))}
                                className={`w-28 text-right font-mono font-bold text-xs ring-1 ring-slate-200 border-none bg-white p-1 rounded-md focus:ring-1 focus:ring-indigo-500 ${
                                  isMatch ? 'text-green-600' : 'text-rose-600'
                                }`}
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isMatch ? (
                                <span className="inline-flex items-center justify-center p-1 rounded-full bg-green-100 text-green-700" title="น้ำหนักผ่านจุดดึก">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center p-1 rounded-full bg-amber-100 text-amber-700" title="กำลังบรรจุตวงชั่ง หรือล้นพิกัดเป้า">
                                  ●
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Cumulative Row Summary Table footer */}
                      <tr className="bg-[#FFFCE4] border-t-2 border-zinc-400 text-xs font-bold text-slate-800">
                        <td colSpan={4} className="py-3 px-4 text-left font-bold">รวมสูตรประเมินน้ำหนักสุทธิทางร้อยละ (พิกัดเคมีภัณฑ์):</td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-800">
                          {activeBpr.items.reduce((sum, i) => sum + i.formulaPct, 0).toFixed(2)} %
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-indigo-800" colSpan={1}>
                          {activeBpr.items.reduce((sum, i) => sum + calculateTargetWeight(i.formulaPct, activeBpr.batchSize), 0).toLocaleString()} กรัม
                        </td>
                        <td colSpan={3} className="py-3 px-4 text-center font-normal text-[10px] text-slate-500 font-mono">
                          น้ำหนักสารข้างต้นสัมพันธ์กับอัตราส่วนสูตรดั้งเดิม 100% สเกลถัง {activeBpr.batchSize} kg
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Steps / Mixing instruction card block */}
              <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
                <span className="font-bold text-sm text-[#1D1D1F] block border-b pb-2">
                  บัญชีส่วนผสมขั้นตอนการผสมอิมัลชันเครื่องโฮโม (Cosmetics Mixing &amp; Homologation Stages)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBpr.instructions.map((inst) => (
                    <div 
                      key={inst.id} 
                      onClick={() => toggleInstruction(activeBpr.id, inst.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 text-xs tracking-tight ${
                        inst.done 
                          ? 'bg-green-50/55 border-green-200 text-slate-700' 
                          : 'bg-white border-neutral-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={inst.done} 
                        onChange={() => {}} // Swapped via div onClick 
                        className="h-4 w-4 bg-white accent-green-600 rounded text-green-600 pointer-events-none mt-0.5 shrink-0"
                      />
                      <div className="space-y-1 select-none">
                        <span className={`font-bold block ${inst.done ? 'text-green-800' : 'text-slate-700'}`}>ขั้นตอนที่ {inst.id}</span>
                        <p className={`leading-relaxed ${inst.done ? 'line-through text-slate-500/80' : ''}`}>{inst.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. RECONCILE / DEDUCT SHEET */}
          {activeSegment === 'stock-reconcile' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-bold text-base text-[#1D1D1F]">ใบตัดคัดตัดคลังเคมีภัณฑ์เพื่อสต๊อกผลิต (Stock Reconciliation / Deduct Stock)</h4>
                  <p className="text-xs text-neutral-500">รายงานตรวจสอบปริมาณมวลรวมที่ต้องตัดลดออกจากคลังสินค้า (Inventory Subtraction Logs) เทียบมาตรฐาน GMP สำหรับใบผลิตล็อตนี้</p>
                </div>
                <button
                  type="button"
                  onClick={executeStockDeduction}
                  disabled={actionLocked}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors ${
                    actionLocked ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {actionLocked ? 'ตัดลดสต๊อกแล้ว ✓' : 'กดอนุมัติตัดสต๊อกสะสม'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-slate-500 border-b font-semibold">
                      <th className="py-2.5 px-3">รหัสสาร</th>
                      <th className="py-2.5 px-3">ชื่อเคมีและมวลสารหอม</th>
                      <th className="py-2.5 px-3 font-mono text-center">ล็อตวัตถุดิบชั่งเข้า</th>
                      <th className="py-2.5 px-3 text-right">ปริมาณร้อยละ %</th>
                      <th className="py-2.5 px-3 text-right">น้ำหนักเป้าตัดคลัง (กรัม)</th>
                      <th className="py-2.5 px-3 text-right">น้ำหนักเป้าตัดคลัง (กิโลกรัม)</th>
                      <th className="py-2.5 px-3 text-right">สถานะประเมิน FIFO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBpr.items.map((item) => {
                      const computedGrams = calculateTargetWeight(item.formulaPct, activeBpr.batchSize);
                      return (
                        <tr key={item.no} className="border-b border-zinc-100 hover:bg-neutral-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.rmCode}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">{item.rmName}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{item.lotNo}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">{item.formulaPct.toFixed(2)} %</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold bg-neutral-50">{computedGrams.toLocaleString()} g</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600">{(computedGrams / 1000).toFixed(3)} kg</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-semibold text-green-700 bg-green-50 p-1 px-2 rounded-md">สมดุลพร้อมตัด</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. LABELS STICKERS GENERATOR */}
          {activeSegment === 'printable-labels' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-base text-[#1D1D1F]">ระบบสลากย่อยติดข้างถังภาชนะคุมชั่ง (Weighing stickers &amp; Drum Labels)</h4>
                  <p className="text-xs text-neutral-500">พิมพ์ฉลากติดพิกัดถังเคมีคุมผสมสารเคมีแต่ละตัวตามหลักระเบียบ GMP/Cosmetic ของโรงงานผลิต IDEVA Group</p>
                </div>
                <button
                  type="button"
                  onClick={printDocument}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> พิมพ์ฉลากทั้งหมด
                </button>
              </div>

              {/* Printable Grid representation resembling the paper roll labels at the end of the video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeBpr.items.map((item) => {
                  const targetGrams = calculateTargetWeight(item.formulaPct, activeBpr.batchSize);
                  return (
                    <div 
                      key={item.no} 
                      className="bg-white border-2 border-dashed border-zinc-400 p-5 rounded-2xl relative overflow-hidden font-sans shadow-xs flex flex-col justify-between h-[280px]"
                    >
                      {/* Brand head label */}
                      <div className="border-b-2 border-zinc-900 pb-2 flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-extrabold text-zinc-800 tracking-wider font-sans block">IDEVA GROUP MANUFACTURING</span>
                          <strong className="text-[12px] text-zinc-950 font-bold block">ฉลากชั่งระบุวัตถุดิบ (WEIGHING LABEL)</strong>
                        </div>
                        <div className="bg-zinc-950 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold">
                          LOT: {item.lotNo}
                        </div>
                      </div>

                      {/* Content block inside label sticker */}
                      <div className="py-2 text-[10px] space-y-1.5 text-zinc-800">
                        <div className="grid grid-cols-2">
                          <p><strong>ชื่อผลิตภัณฑ์หลัก:</strong></p>
                          <p className="text-zinc-650 text-right truncate">ครีมทาผิววิตามินบี 3 ออร่าสมูท</p>
                        </div>
                        <div className="grid grid-cols-2">
                          <p><strong>รหัสวัตถุดิบ (RM Code):</strong></p>
                          <p className="font-mono text-right font-extrabold text-zinc-900">{item.rmCode}</p>
                        </div>
                        <div className="grid grid-cols-2">
                          <p><strong>ชื่อทั่วไปของสารเคมี:</strong></p>
                          <p className="text-right text-zinc-700 truncate font-semibold" title={item.rmName}>{item.rmName}</p>
                        </div>
                        <div className="grid grid-cols-2">
                          <p><strong>ล็อตคู่ผสมวิเคราะห์อ้างอิง:</strong></p>
                          <p className="text-right font-mono">{activeBpr.lotNo}</p>
                        </div>
                        <div className="grid grid-cols-2 border-t pt-1.5 font-sans">
                          <p className="text-zinc-500">ผู้ทำการถ้วนชั่ง:</p>
                          <p className="text-right font-medium text-zinc-800">{activeBpr.operator}</p>
                        </div>
                        <div className="grid grid-cols-2 font-sans">
                          <p className="text-zinc-500">ผู้ตรวจสอบความเที่ยงตรง:</p>
                          <p className="text-right font-medium text-zinc-800">{activeBpr.inspector}</p>
                        </div>
                      </div>

                      {/* Weighed values & simulated barcode block */}
                      <div className="bg-neutral-50 px-3 py-2 rounded-xl border border-zinc-200/60 flex justify-between items-center mt-2">
                        {/* Styled simulated line barcode representing product barcode from end of video */}
                        <div className="space-y-1 opacity-75 shrink-0">
                          <div className="flex gap-0.5 items-center">
                            <span className="w-1.5 h-6 bg-zinc-950"></span>
                            <span className="w-0.5 h-6 bg-zinc-950"></span>
                            <span className="w-1 h-6 bg-zinc-950"></span>
                            <span className="w-2.5 h-6 bg-zinc-950"></span>
                            <span className="w-0.5 h-6 bg-zinc-950"></span>
                            <span className="w-1.5 h-6 bg-zinc-950"></span>
                            <span className="w-1 h-6 bg-zinc-950"></span>
                            <span className="w-0.5 h-6 bg-zinc-950"></span>
                          </div>
                          <span className="text-[7px] font-mono leading-none block text-zinc-500">*{item.rmCode}*</span>
                        </div>

                        {/* Weighed figure summary */}
                        <div className="text-right">
                          <span className="text-[8px] text-zinc-500 uppercase block font-semibold leading-none">พิกัดน้ำหนักชั่งจริง</span>
                          <span className="text-base font-mono font-extrabold text-zinc-950">
                            {targetGrams.toLocaleString()} <span className="text-xs">g</span>
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. PACKAGING QC LEDGER */}
          {activeSegment === 'packaging-qc' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-bold text-base text-[#1D1D1F]">สมุดประเมินตรวจรับขวด บรรจุภัณฑ์ และอุปกรณ์ตามระเบียบ GMP</h4>
                  <p className="text-xs text-neutral-500">วิเคราะห์ตรวจสอบสภาพเชิงกลและกายภาพของขวดพลาสติก ขวดหัวปั๊ม และซองทาผิวที่รับเข้าโรงงานตามวิดีโอตัวอย่าง</p>
                </div>
                <div className="font-mono text-xs bg-[#E4ECE1] text-[#2c4026] px-3 py-1 rounded-xl border border-green-200 font-bold">
                  GMP INCOMING QC
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-slate-500 border-b border-zinc-200 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">วันรับวัสดุกล่อง</th>
                      <th className="py-2.5 px-3">รหัสสินค้าวัสดุ</th>
                      <th className="py-2.5 px-4">ชื่อบรรจุภัณฑ์ตรวจประเมิน</th>
                      <th className="py-2.5 px-3 text-center">ขนาดเกลียว</th>
                      <th className="py-2.5 px-3 text-right">จำนวนสุ่มตรวจสอบ</th>
                      <th className="py-2.5 px-3 font-mono text-center">ล็อตผู้สุ่ม (Lot)</th>
                      <th className="py-1.5 px-2 text-center">ผลเช็ครอยบิดเบี้ยวกล่อง</th>
                      <th className="py-1.5 px-2 text-center">COA เอกสารแนบ</th>
                      <th className="py-2.5 px-3 text-center">สรุปความปลอดภัย</th>
                      <th className="py-2.5 px-3 text-right">ผู้ตรวจรับ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagingLogs.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-100 hover:bg-neutral-50">
                        <td className="py-3 px-3 font-mono text-slate-600">{p.date}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{p.code}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{p.name}</td>
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">{p.size}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">{p.qty.toLocaleString()} ชิ้น</td>
                        <td className="py-3 px-3 text-center font-mono text-indigo-600 font-medium">{p.lot}</td>
                        <td className="py-3 px-2 text-center text-slate-500 font-sans">{p.defects}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.coa === 'มีครบถ้วน' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700'
                          }`}>{p.coa}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                            p.result === 'ผ่านเกณฑ์ (Approved)' ? 'bg-green-100/70 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'
                          }`}>{p.result}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-600">{p.inspector}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
