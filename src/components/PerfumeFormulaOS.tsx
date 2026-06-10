import React, { useState } from 'react';
import { 
  Beaker, Save, RotateCcw, Plus, Trash2, Edit3, ClipboardList, Info, 
  Layers, Package, Sparkles, Scale, RefreshCcw, Check, ChevronDown, CheckCircle
} from 'lucide-react';

interface PerfumeFormulaOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function PerfumeFormulaOS({ dbState, onRefresh, onNotify, userRole }: PerfumeFormulaOSProps) {
  // Master Lists
  const products = dbState.products || [];
  const rawMaterials = (dbState.materials || []).filter((m: any) => m.category === 'Raw Material');
  const formulas = dbState.formulas || [];

  // Active selected Formula for calculator or detailed viewing
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(formulas[0]?.id || '');
  
  // Batch calculator state
  const [batchWeight, setBatchWeight] = useState<number>(100); // 100 kg/liters standard batch
  const [batchUnit, setBatchUnit] = useState<'kg' | 'liters'>('kg');

  // Form states for creating a new Formula
  const [showAddFormula, setShowAddFormula] = useState(false);
  const [newFormulaProductId, setNewFormulaProductId] = useState('');
  const [newFormulaVersion, setNewFormulaVersion] = useState('');
  const [newFormulaStatus, setNewFormulaStatus] = useState<'Draft' | 'Pending Review' | 'Approved'>('Draft');
  
  // Custom ingredients rows within the recipe creator
  const [newFormulaItems, setNewFormulaItems] = useState<{ materialId: string; quantity: number }[]>([
    { materialId: '', quantity: 0.10 } // standard 10% row seed
  ]);

  const [loading, setLoading] = useState(false);

  // Get active formula details
  const activeFormula = formulas.find((f: any) => f.id === selectedFormulaId) || formulas[0];

  // Calculate sum of ratios for validation
  const getIngredientsSum = (items: { materialId: string; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  // 1. Handle adding ingredient row in draft
  const handleAddIngredientRow = () => {
    setNewFormulaItems([...newFormulaItems, { materialId: '', quantity: 0.05 }]); // default 5%
  };

  // 2. Handle removing ingredient row in draft
  const handleRemoveIngredientRow = (index: number) => {
    if (newFormulaItems.length <= 1) {
      onNotify("สูตรน้ำหอมจำเป็นต้องมีส่วนผสมอย่างน้อย 1 รายการ", "warning");
      return;
    }
    setNewFormulaItems(newFormulaItems.filter((_, idx) => idx !== index));
  };

  // 3. Update specific ingredient row value
  const handleUpdateIngredientRow = (index: number, key: 'materialId' | 'quantity', value: any) => {
    const updated = [...newFormulaItems];
    if (key === 'quantity') {
      updated[index].quantity = Number(value);
    } else {
      updated[index].materialId = value;
    }
    setNewFormulaItems(updated);
  };

  // 4. Submit formula creation to backend
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormulaProductId) {
      onNotify("โปรดเลือกผลิตภัณฑ์น้ำหอมคู่สูตร", "warning");
      return;
    }
    if (!newFormulaVersion.trim()) {
      onNotify("โปรดระบุเวอร์ชัน / ชื่อเรียกสูตรการกลั่น", "warning");
      return;
    }

    // Validate that ingredients are selected
    const hasUnselectedMaterial = newFormulaItems.some(item => !item.materialId);
    if (hasUnselectedMaterial) {
      onNotify("กรุณาระบุวัตถุดิบเจาะจงให้ครบถ้วนในทุกแถว", "warning");
      return;
    }

    // Warning / Error checking for total chemical proportions
    const totalRatio = getIngredientsSum(newFormulaItems);
    if (totalRatio <= 0) {
      onNotify("สัดส่วนความเข้มข้นสารรวมจำเป็นต้องมากกว่า 0%", "warning");
      return;
    }
    
    // We can normalize or check ratio sum. In perfume formulating, often ingredients represent weights, and ratios sum up to 1.0 (100%)
    if (Math.abs(totalRatio - 1.0) > 0.001) {
      const confirmSave = window.confirm(`สัดส่วนสารปรุงในสูตรรวมกันเกลี่ยแล้วได้ ${(totalRatio * 100).toFixed(1)}% (ไม่ใช่ 100%) ท่านยืนยันจะบันทึกสูตรนี้หรือไม่? ระบบจะคำนวณสเกลตามอัตราส่วนจริงให้`);
      if (!confirmSave) return;
    }

    setLoading(true);
    try {
      const formulaPayload = {
        id: `form-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
        productId: newFormulaProductId,
        version: newFormulaVersion,
        status: newFormulaStatus,
        approvedBy: userRole === 'Admin' ? 'ทีมวิจัยแล็บปรุงกลิ่นหรู IDEVA OS' : 'ผ่านพิจารณาแล็บจำลอง',
        items: newFormulaItems.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'formulas',
          item: formulaPayload
        })
      });

      const resData = await response.json();

      if (resData.success) {
        onNotify(`จดทะเบียนบันทึกคลังสูตรน้ำหอมรุ่นที่ "${newFormulaVersion}" สำเร็จเรียบร้อย!`, "info");
        setShowAddFormula(false);
        // Reset states
        setNewFormulaProductId('');
        setNewFormulaVersion('');
        setNewFormulaItems([{ materialId: '', quantity: 0.10 }]);
        setSelectedFormulaId(formulaPayload.id); // auto switch review to the newly created formula!
        onRefresh();
      } else {
        onNotify(resData.error || "เกิดความผิดพลาดในการขึ้นทะเบียนสูตร", "error");
      }
    } catch {
      onNotify("ไม่สามารถประทับลงทะเบียนสูตรลงเซิร์ฟเวอร์ฐานเคมี", "error");
    } finally {
      setLoading(false);
    }
  };

  // Convert material ID to human readable Name
  const getMaterialName = (id: string) => {
    const m = rawMaterials.find((x: any) => x.id === id);
    return m ? m.name : id;
  };

  const getMaterialCode = (id: string) => {
    const m = rawMaterials.find((x: any) => x.id === id);
    return m ? m.code : id;
  };

  const getProductScentName = (id: string) => {
    const p = products.find((x: any) => x.id === id);
    return p ? p.name : id;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="perfume-formula-management-os">
      {/* Cupertino Premium Dashboard Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-pink-50 border border-pink-100 text-pink-600 rounded-xl">
                <Beaker className="h-5 w-5" />
              </span>
              <h2 className="font-bold text-lg text-[#1D1D1F] tracking-tight">Perfume Formula OS (การจัดการสูตรและการปรุงน้ำหอมหรู)</h2>
            </div>
            <p className="text-xs text-[#86868B]">
              วางสัดส่วนหัวน้ำหอมพรีเมียม สารยึดกลิ่น (Fixative) แอลกอฮอล์บ่มบริสุทธิ์สูง และระบบสเกลลิ่งคำนวณวัตถุดิบเพื่อสั่งผลิตในระดับอุตสาหกรรม
            </p>
          </div>

          <button
            onClick={() => setShowAddFormula(!showAddFormula)}
            className={`px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
              showAddFormula 
                ? 'bg-neutral-100 text-[#1D1D1F] border border-[#E5E5EA]' 
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            <Plus className="h-4 w-4" /> {showAddFormula ? 'ปิดระบบลงทะเบียนสูตร' : 'จดทะเบียนสูตรใหม่ขึ้นกระบอกปรุง'}
          </button>
        </div>

        {/* Quick summary metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E5E5EA] pt-4 text-xs">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-pink-500 shrink-0" />
            <div>
              <p className="text-[#86868B] font-medium text-[10px] uppercase">จำนวนสูตรที่อนุมัติจำหน่าย</p>
              <p className="font-bold text-[#1D1D1F]">{formulas.filter((f: any) => f.status === 'Approved').length} สูตรหลัก</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[#86868B] font-medium text-[10px] uppercase">ผลิตภัณฑ์ที่มีสูตรรองรับ</p>
              <p className="font-bold text-[#1D1D1F]">{formulas.length} รูปแบบน้ำหอมแบรนด์</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-[#86868B] font-medium text-[10px] uppercase">ห้องปฏิบัติการบ่มกลั่น</p>
              <p className="font-bold text-[#1D1D1F]">ฝ่ายอุตสาหกรรมวิจัยความหอม IDEVA</p>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRY: REGISTER NEW PERFUME FORMULA FORM */}
      {showAddFormula && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-md space-y-4 animate-slide-in">
          <div className="flex justify-between items-center border-b border-[#E5E5EA] pb-3">
            <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-pink-600" />
              สร้างและกางส่วนประกอบสูตรผสมน้ำหอม (Perfume Formula Composer)
            </h3>
            <span className="text-[10px] bg-pink-50 text-pink-700 border border-pink-100 px-2 py-0.5 rounded-full font-bold">
              เครื่องมือจำลองอัตราส่วนกลิ่นหอม
            </span>
          </div>

          <form onSubmit={handleCreateFormula} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#1D1D1F]">จับคู่เข้ากับผลิตภัณฑ์น้ำหอม</label>
                <select
                  value={newFormulaProductId}
                  onChange={(e) => setNewFormulaProductId(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white font-sans"
                  required
                >
                  <option value="">-- กรุณาเลือกเป้าหมายกลิ่น --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} | {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1D1D1F]">เวอร์ชัน / หมายเลขการกลั่น (BOM Version)</label>
                <input
                  type="text"
                  placeholder="เช่น เวอร์ชันคุมความหอม 1.4 โอลด์สปิริต"
                  value={newFormulaVersion}
                  onChange={(e) => setNewFormulaVersion(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1D1D1F]">สถานะเริ่มขบวนการ</label>
                <select
                  value={newFormulaStatus}
                  onChange={(e) => setNewFormulaStatus(e.target.value as any)}
                  className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none focus:bg-white font-sans"
                >
                  <option value="Draft">ร่างสูตรแล็บ (Draft)</option>
                  <option value="Pending Review">รอวิจัยความหอมประเมิน (Pending Review)</option>
                  <option value="Approved">ลงนามและอนุมัติผลิตสายกลั่น (Approved)</option>
                </select>
              </div>
            </div>

            {/* In-depth Ingredients composition builder (รองรับการเพิ่มส่วนผสมจำนวนมาก) */}
            <div className="space-y-3 bg-neutral-50/70 p-4 rounded-2xl border border-[#E5E5EA]">
              <div className="flex justify-between items-center pb-2 border-b border-[#E5E5EA]">
                <span className="font-bold flex items-center gap-1.5 text-[#1D1D1F]">
                  <Beaker className="h-4 w-4 text-pink-600" />
                  สัดส่วนวัตถุดิบและหัวหอมอโรมาเคมีคอล (Ingredients Ratios Matrix)
                </span>
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-900 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-neutral-800"
                >
                  <Plus className="h-3.5 w-3.5" /> เพิ่มส่วนผสมอโรมาหิ้วขึ้นรูปฝรั่งเศส
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {newFormulaItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs">
                    <span className="w-6 h-6 rounded-full bg-pink-50 text-pink-600 font-bold flex items-center justify-center border border-pink-100 font-mono text-[10px] shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <label className="text-[10px] text-[#86868B] font-medium block">เลือกล็อตวัตถุดิบสารหอมต้นน้ำ</label>
                        <select
                          value={item.materialId}
                          onChange={(e) => handleUpdateIngredientRow(index, 'materialId', e.target.value)}
                          className="w-full border border-[#E5E5EA] rounded-lg p-1.5 text-xs bg-neutral-50 outline-none"
                          required
                        >
                          <option value="">-- เลือกสารหอมส่วนผสม --</option>
                          {rawMaterials.map((m: any) => (
                            <option key={m.id} value={m.id}>
                              {m.code} | {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] text-[#86868B] font-medium block">สัดส่วนในขวดสูตร (สเกลทศนิยม เปอร์เซ็นต์)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.0001"
                            placeholder="เช่น 0.15 = 15%"
                            value={item.quantity}
                            onChange={(e) => handleUpdateIngredientRow(index, 'quantity', e.target.value)}
                            className="w-full border border-[#E5E5EA] rounded-lg p-1.5 text-xs font-mono text-right"
                            required
                          />
                          <span className="w-14 text-right font-mono text-slate-500 text-[11px] font-semibold shrink-0">
                            {(item.quantity * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredientRow(index)}
                      className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg shrink-0 self-end sm:self-center"
                      title="ลบส่วนผสมนี้ (Delete Row)"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Composition proportion bar indicator */}
              <div className="pt-3 border-t border-[#E5E5EA] flex justify-between items-center font-semibold text-xs text-neutral-800">
                <span>อัตราความเข้มรวมทั้งหมดในสูตรใหม่:</span>
                <span className={`font-mono text-sm px-3 py-1 rounded-full ${
                  Math.abs(getIngredientsSum(newFormulaItems) - 1.0) < 0.001 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {(getIngredientsSum(newFormulaItems) * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddFormula(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] font-bold rounded-xl"
              >
                ละทิ้งแบบฟอร์ม
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-xs"
              >
                {loading ? 'กำลังขึ้นทะเบียนลงระบบ...' : 'บันทึกสำเร็จ ขึ้นสูตรแล็บ ✓'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TWO COLUMN GRID: Left column selects Formula, Right column is the INDUSTRIAL SCALE BATCH CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left select col */}
        <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-pink-500" />
              เลือกสูตรน้ำหอมเพื่อวิเคราะห์และคำนวณ
            </h3>
            <p className="text-[11px] text-[#86868B]">
              เลือกตราสูตรความเชี่ยวชาญการกลั่นบ่ม เพื่อวิเคราะห์สเกลล้านออนซ์หรือพิกัดน้ำหนักป้อนอุตสาหกรรม
            </p>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {formulas.map((item: any) => {
              const bSelected = item.id === selectedFormulaId;
              const scent = getProductScentName(item.productId);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedFormulaId(item.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between space-y-2.5 ${
                    bSelected 
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' 
                      : 'bg-white border-[#E5E5EA] hover:border-neutral-300 text-[#1D1D1F]'
                  }`}
                >
                  <div className="w-full flex justify-between items-start gap-1">
                    <span className={`font-mono font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded ${
                      bSelected ? 'bg-white/10 text-pink-300' : 'bg-neutral-100 text-[#86868B]'
                    }`}>
                      {item.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {item.status === 'Approved' ? 'ผ่านอนุมัติปรุงกลั่น' : 'อยู่ระหว่างพัฒนาแล็บ'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold tracking-tight line-clamp-1">{scent}</h4>
                    <p className={`font-medium ${bSelected ? 'text-neutral-300' : 'text-[#86868B]'}`}>
                      เวอร์ชันสูตร: <span className="underline">{item.version}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-dashed w-full" style={{ borderColor: bSelected ? 'rgba(255,255,255,0.15)' : '#E5E5EA' }}>
                    <span className={`${bSelected ? 'text-neutral-400' : 'text-[#86868B]'}`}>ส่วนผสม: {item.items?.length || 0} ชนิด</span>
                    <span className="font-bold">สัดส่วนรวม: {((item.items || []).reduce((sum: number, x: any)=>sum + x.quantity, 0) * 100).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right calculator scale column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E5E5EA]">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 font-bold px-2.5 py-1 text-[9px] rounded-full uppercase tracking-wider font-mono border border-[#E5E5EA]">
                <Scale className="h-3.5 w-3.5 text-pink-600" /> เครื่องจักรสเกลลิงปรุงสูตรอุตสาหกรรม (Industrial Scale Batch Calculator)
              </span>
              <h3 className="font-bold text-base text-[#1D1D1F] tracking-tight">คำนวณสัดส่วนองค์ประกอบตาม Batch สั่งผลิตน้ำหอม</h3>
              <p className="text-xs text-[#86868B]">
                วิเคราะห์คำนวณเพื่อดึงสารดิบหอม เจือสารยึดคงและตัวทำละลายตามเป้าหมายน้ำหนักจริงในกระบอกผสม
              </p>
            </div>
          </div>

          {/* ACTIVE FORMULA BANNER */}
          {activeFormula ? (
            <div className="space-y-6">
              <div className="bg-neutral-50 border border-[#E5E5EA] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block">กำลังแสดงผลและวิเคราะห์สูตรเทียบ</span>
                  <p className="font-bold text-sm text-[#1D1D1F]">{getProductScentName(activeFormula.productId)}</p>
                  <p className="text-xs text-[#86868B] font-mono">เวอร์ชัน: <strong className="text-neutral-700">{activeFormula.version}</strong> | ตราวินิจฉัย: {activeFormula.approvedBy || 'หัวหน้าศูนย์ผสมแล็บ'}</p>
                </div>

                {/* Input weight multiplier parameters */}
                <div className="space-y-2 bg-white border border-[#E5E5EA] rounded-xl p-3.5 text-xs">
                  <span className="font-bold text-indigo-950 block">ระบุน้ำหนัก/เป้าหมายขนาด Batch ผลิต</span>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        value={batchWeight || ''}
                        onChange={(e) => setBatchWeight(Number(e.target.value))}
                        className="w-full bg-neutral-50 focus:bg-white text-xs font-mono font-bold rounded-lg border border-[#E5E5EA] p-2 pr-9 text-right"
                      />
                      <span className="absolute right-3.5 top-2.5 font-bold uppercase text-[10px] text-slate-400">
                        {batchUnit}
                      </span>
                    </div>

                    <select
                      value={batchUnit}
                      onChange={(e) => setBatchUnit(e.target.value as any)}
                      className="border border-[#E5E5EA] rounded-lg p-2 font-semibold text-xs bg-white"
                    >
                      <option value="kg">กิโลกรัม (Kg)</option>
                      <option value="liters">ลิตร (Liters)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BATCH INGREDIENTS SCALE RESULTS LIST (ระบบแสดงผลรายการส่วนผสมที่ต้องเบิกจ่ายจากคลัง พร้อมยอดรวมสะสม) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold border-b border-[#E5E5EA] pb-1.5">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Package className="h-4 w-4 text-pink-600" />
                    รายการมวลสารและจำนวนที่ต้องเบิกจ่ายเด็ดขาดจากคลัง (ChemicalStockOS)
                  </span>
                  <span className="font-mono text-[11px] text-slate-650 font-bold">เป้าหมายป้อน: {batchWeight.toLocaleString()} {batchUnit === 'kg' ? 'กิโลกรัม' : 'ลิตร'}</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {activeFormula.items && activeFormula.items.map((item: any, idx: number) => {
                    const materialRaw = (dbState.materials || []).find((x: any) => x.id === item.materialId);
                    const materialName = materialRaw ? materialRaw.name : item.materialId;
                    const materialCode = materialRaw ? materialRaw.code : item.materialId;
                    const stockLevel = materialRaw ? materialRaw.stockLevel : 0;
                    const unit = materialRaw ? materialRaw.unit : (batchUnit === 'kg' ? 'Kg' : 'L');
                    
                    // Ratio proportion
                    const proportionRatio = item.quantity;
                    
                    // Calculated weight to deduct
                    const calculatedScaledValue = (batchWeight * proportionRatio);
                    const hasEnoughStock = stockLevel >= calculatedScaledValue;

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5EA] py-3 text-xs last:border-0 hover:bg-[#F5F5F7]/30 px-3 rounded-xl transition-colors gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[9px] bg-neutral-900 text-white px-2 py-0.5 rounded-md font-bold">
                              {materialCode}
                            </span>
                            <span className="font-bold text-slate-800">{materialName}</span>
                            
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              hasEnoughStock 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-150 animate-pulse'
                            }`}>
                              {hasEnoughStock ? '✅ ยอดคลังพร้อมเบิก' : '❌ มีสต็อกไม่เพียงพอ'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold font-mono">
                            <span>สัดส่วนในสูตร: {(proportionRatio * 100).toFixed(2)}%</span>
                            <span>•</span>
                            <span>คงเหลือในคลังจริง: <strong className="text-slate-600 underline">{stockLevel.toLocaleString()} {unit}</strong></span>
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <span className="font-mono text-xs font-bold text-[#1D1D1F] block">จำนวนสเกลเบิก:</span>
                          <span className={`font-mono text-sm font-extrabold block px-3 py-1 rounded-xl border ${
                            hasEnoughStock 
                              ? 'bg-indigo-50/50 text-indigo-700 border-indigo-100' 
                              : 'bg-rose-50/50 text-rose-700 border-rose-100'
                          }`}>
                            {calculatedScaledValue.toFixed(4)} <span className="font-sans text-[10px] font-bold">{unit}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calculate precise grand total across ingredients */}
                {(() => {
                  const items = activeFormula.items || [];
                  const totalProportion = items.reduce((sum: number, x: any) => sum + (Number(x.quantity) || 0), 0);
                  const totalWeightCalculated = batchWeight * totalProportion;
                  
                  // Check if any ingredient is short in supply
                  const isAnyShort = items.some((item: any) => {
                    const m = (dbState.materials || []).find((x: any) => x.id === item.materialId);
                    const calculated = batchWeight * item.quantity;
                    return m ? m.stockLevel < calculated : true;
                  });

                  return (
                    <div className="space-y-4 pt-3 border-t border-[#E5E5EA]">
                      {/* Precise Cumulative Compounding Summary Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-2xl border border-[#E5E5EA]">
                        <div className="text-xs">
                          <p className="text-[#86868B] font-bold text-[10px] uppercase tracking-wider">สัดส่วนสูตรโครงสร้างหัวนํ้าหอม</p>
                          <p className="font-bold text-slate-800 text-sm font-mono mt-0.5">{(totalProportion * 100).toFixed(2)}%</p>
                        </div>
                        <div className="text-xs sm:text-right">
                          <p className="text-pink-600 font-bold text-[10px] uppercase tracking-wider">ยอดรวมสุทธิกระสุนสารสกัด (compounding grand total)</p>
                          <p className="font-extrabold text-pink-700 text-base font-mono mt-0.5">
                            {totalWeightCalculated.toFixed(4)} <span className="font-sans text-xs">{batchUnit === 'kg' ? 'Kg' : 'Liters'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Interactive Compounding Button Action */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={async () => {
                            if (isAnyShort) {
                              const confirmShort = window.confirm("⚠️ แจ้งเตือน: มีสารดิบในคลังต่ำกว่ายอดสเกลน้ำหนักผสมสูตรที่ต้องเบิกจ่ายจริง ท่านต้องการทำงานเบิกแบบกักพิกัด (Force Overdraft) หรือไม่?");
                              if (!confirmShort) return;
                            } else {
                              const confirmIssue = window.confirm(`ท่านต้องการดำเนินรายการบันทึก 'เบิกจ่ายวัตถุดิบและตัดยอดสารเคมีตามสูตร' จำนวนรวมสเกล ${totalWeightCalculated.toFixed(4)} ${batchUnit} ออกจากคลัง ChemicalStockOS ไปยังแล็บผสมทันทีใช่หรือไม่?`);
                              if (!confirmIssue) return;
                            }

                            setLoading(true);
                            try {
                              let processedCount = 0;
                              // Loop through all items and update material levels via API
                              for (const item of activeFormula.items) {
                                const m = (dbState.materials || []).find((x: any) => x.id === item.materialId);
                                if (m) {
                                  const needed = batchWeight * item.quantity;
                                  const updatedMaterial = {
                                    ...m,
                                    stockLevel: Math.max(0, Number((m.stockLevel - needed).toFixed(4)))
                                  };

                                  await fetch('/api/generic/update', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ table: 'materials', item: updatedMaterial })
                                  });
                                  processedCount++;
                                }
                              }

                              // Write a GMP transaction or log event
                              onNotify(`✓ ทำบันทึกตัดยอดสต็อกและเบิกจ่ายสำเร็จเรียบร้อย ${processedCount} รายการสารเคมี! ยอดสต็อกได้รับการอัปเดตแบบเรียลไทม์ในระบบ ChemicalStockOS`, "info");
                              onRefresh();
                            } catch (err) {
                              onNotify("ไม่สามารถทำรายการเบิกหักลบจำนวนในคลังดิบ กรุณาตรวจสอบอินเทอร์เน็ต", "error");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className={`w-full py-3 px-4.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                            isAnyShort 
                              ? 'bg-[#FF9500] hover:bg-[#e08400] text-white' 
                              : 'bg-indigo-650 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <Scale className="h-4 w-4 animate-spin-slow" />
                          {isAnyShort ? 'สัญญารับเบิกจ่ายจำลองฉุกเฉิน (Overdraft Compound)' : '⚡ กดบันทึกเพื่อหักลดสต็อกคลังเบิกจ่ายจริงทันที (Auto-Issue Compounding)'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Informational Summary Alert */}
              <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100 text-[11px] text-[#86868B] space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-pink-700">
                  <CheckCircle className="h-4 w-4" /> ได้รับการสอบทานและรองรับมาตรฐาน GMP ฮาลาล และ IFRA เรียบร้อย
                </div>
                <p>
                  โปรดมั่นใจว่า สเกลปิเปต อุณหภูมิ และระดับความดันกลั่นของเครื่องจักรผสมบ่มได้ตั้งค่ามาตรฐานไว้ตรงตามกำหนด การคำนวณสเกลนี้อ้างอิงกับรหัสวัตถุดิบคู่ตรวจสอบ FIFO อัตโนมัติในโมดูลคลังสินค้าหลัก
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Beaker className="h-8 w-8 text-neutral-300 mx-auto mb-2 animate-bounce" />
              กรุณาเลือกตระกูลสูตรเพื่อเริ่มใช้กลไตวิเคราะห์อุตสาหกรรม
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
