import React, { useState } from 'react';
import { 
  Users, Plus, Search, FileText, Award, ShieldAlert, 
  MapPin, Phone, Mail, FileCheck, Check, Trash2, Tag, Layers
} from 'lucide-react';

interface AdminLTECRMProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTECRM({ dbState, onRefresh, onNotify }: AdminLTECRMProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(dbState.customers?.[0]?.id || null);

  const [newCust, setNewCust] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    brandName: '',
    brandChannel: 'E-Commerce / B2C'
  });

  // Handle customer creation
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.code) {
      onNotify("กรุณากรอกชื่อและรหัสลูกค้าให้ครบถ้วน", "warning");
      return;
    }

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'customers',
          item: {
            id: `cust-${Date.now()}`,
            name: newCust.name,
            code: `CUST-${newCust.code.toUpperCase()}`,
            email: newCust.email,
            phone: newCust.phone,
            address: newCust.address,
            brand: newCust.brandName,
            channel: newCust.brandChannel
          }
        })
      });

      if (!response.ok) throw new Error();
      onNotify("บันทึกแบรนด์ลูกค้า OEM ใหม่เข้าระบบสำเร็จ", "success");
      setIsAddingCustomer(false);
      setNewCust({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        brandName: '',
        brandChannel: 'E-Commerce / B2C'
      });
      onRefresh();
    } catch {
      onNotify("เกิดข้อผิดพลาดในการบันทึก", "error");
    }
  };

  const filteredCustomers = (dbState.customers || []).filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomerInfo = dbState.customers?.find((c: any) => c.id === selectedCustomerId);

  // Hardcoded documents for high-fidelity CRM Document Hub
  const customerDocuments = [
    { id: 'doc-1', name: 'สัญญาจ้างผลิตสูตรน้ำหอมพรีเมียม (OEM Contract).pdf', type: 'Contract', date: '2026-02-12', status: 'สัญญามีผลใช้บังคับ' },
    { id: 'doc-2', name: 'ใบอนุญาต Certificate of Analysis (COA) - Rose Base v2.pdf', type: 'COA', date: '2026-03-01', status: 'ผ่านเกณฑ์ตรวจสอบ' },
    { id: 'doc-3', name: 'งานศิลปะสติ๊กเกอร์แชมเปญบรรจุฟอยล์ทอง 100ml (Artwork Final).png', type: 'Artwork', date: '2026-05-18', status: 'ได้รับการอนุมัติบล็อก' },
    { id: 'doc-4', name: 'สูตรลับกลั่นสากลประจุขวดน้ำหอม (Customer Recipe Core).json', type: 'Recipe', date: '2026-04-20', status: 'จัดเก็บบรอนซ์แล็บ' }
  ];

  return (
    <div className="space-y-6" id="crm-module-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users className="h-5.5 w-5.5 text-primary" />
          ระบบสารสนเทศลูกค้าและแบรนด์ในเครือ (Cosmetic CRM &amp; Brands)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">บริหารรหัสลูกค้า OEM, ตรวจประวัติงานอุตสาหกรรม, เช็คสัญญา COA, สลัก Artwork และประมวลสูตรลิขสิทธิ์ประจำตัว</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer and Brands Directory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center gap-2">
            <strong className="text-sm text-slate-800 dark:text-slate-100 font-bold">ทะเบียนแบรนด์ลูกค้า</strong>
            <button
              type="button"
              onClick={() => setIsAddingCustomer(true)}
              className="bg-primary hover:bg-opacity-90 text-white rounded-lg p-1 px-2.5 text-xs font-bold leading-normal flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> เพิ่มพาร์ทเนอร์
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาแบรนด์ / ลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-2 pl-8 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Customer list */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredCustomers.map((c: any) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCustomerId(c.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                  selectedCustomerId === c.id 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div>
                  <span className="text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded block w-fit mb-1">{c.code}</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.email || 'ไม่มีข้อมูลติดต่อ'}</p>
                </div>
                <Tag className="h-3 w-3 text-secondary shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Center / Right Columns: Brand Files & Document Vault */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomerInfo ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-5">
              
              {/* Client detailed profile */}
              <div className="flex flex-wrap gap-4 items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedCustomerInfo.name}</h3>
                    <span className="text-[9px] bg-secondary text-white px-2 py-0.5 rounded-full font-bold">VIP CONTRACTOR</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">จองสิทธิพิเศษการผลิต OEM - สำหรับแบรนด์น้ำมันหอมและเครื่องสำอางระดับประเทศ</p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {selectedCustomerInfo.address}</p>
                </div>
              </div>

              {/* Grid Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-55 dark:bg-slate-950 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block font-bold mb-1">📞 ข้อมูลพนักงานโทรเช็คสาย:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomerInfo.phone || '+66-2-xxx-xxxx'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold mb-1">✉️ อีเมลรับเอกสารสัญญายิง COA:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomerInfo.email || 'partner@cosmetics.com'}</p>
                </div>
              </div>

              {/* Document Center */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <strong className="text-xs text-slate-800 dark:text-slate-200 block uppercase font-bold tracking-wider">📁 ศูนย์จัดเก็บบิลและเอกสารสำคัญกึ่งตรวจประวัติ (Customer Document Vault)</strong>
                  <span className="text-[10px] text-primary font-bold">GMP Verified 100%</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerDocuments.map((doc: any) => (
                    <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                        {doc.type === 'COA' ? <Award className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>วันที่อัปเดต: {doc.date}</span>
                          <span className="text-emerald-500 font-bold">{doc.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onNotify("ไฟล์เอกสารดาวน์โหลดแล้ว ไปยังคาสเตอร์สแต็คหลัก", "info")}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg"
                >
                  📥 ดาวน์โหลดเอกสารทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => onNotify("ระบบ CRM ยืนยันสัญญาร่วมบริการ เรียบร้อยคุณกิตติ์ธนาคีย์เชน", "success")}
                  className="bg-primary hover:bg-opacity-95 text-white font-bold px-3 py-1.5 rounded-lg"
                >
                  ✔ ทวนสอบสัญญาบริการ OEM
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-950 p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
              กรุณาเลือกหรือสร้างพาร์ทเนอร์แบรนด์เพื่อเปิดประวัติตรวจบันทึก COA ด้านขวา
            </div>
          )}
        </div>
      </div>

      {/* New customer modal simulator overlay */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-850 pb-2">
              <Plus className="h-5 w-5 text-primary" /> เพิ่มลูกค้า /แบรนด์ร่วมผลิตใหม่ OEM
            </h4>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">ชื่อแบรนด์/นิติบุคคล:</label>
                  <input
                    type="text"
                    required
                    placeholder="บจก. คิงพาวเวอร์ บิวตี้"
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">รหัสลูกค้าสั้น:</label>
                  <input
                    type="text"
                    required
                    placeholder="KP-BEAUTY"
                    value={newCust.code}
                    onChange={(e) => setNewCust({ ...newCust, code: e.target.value })}
                    className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">อีเมลทางการ:</label>
                  <input
                    type="email"
                    placeholder="dutyfree@co.th"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
                  <input
                    type="text"
                    placeholder="02-677-8888"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">ช่องทางจัดจำหน่ายแบรนด์:</label>
                <select
                  value={newCust.brandChannel}
                  onChange={(e) => setNewCust({ ...newCust, brandChannel: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white cursor-pointer"
                >
                  <option value="E-Commerce / B2C">E-Commerce / B2C (สติ๊กเกอร์สีชมพู)</option>
                  <option value="Duty Free Outlets">Duty Free Outlets (คิงส์พาวเวอร์)</option>
                  <option value="Luxury Spas">Luxury Spas (เชียงใหม่ แอนิมัค)</option>
                  <option value="National Retail Pharmacies">National Retail Pharmacies (มัตสึคิโยสิ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">ที่อยู่นิติบุคคลสำหรับออกใบชำระภาษี:</label>
                <input
                  type="text"
                  placeholder="เขตราชเทวี กรุงเทพมหานคร"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full p-2 border dark:bg-slate-950 dark:border-slate-800 rounded-lg dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsAddingCustomer(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-opacity-95 text-white font-bold px-4 py-1.5 rounded-lg"
                >
                  บันทึกเข้าระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
