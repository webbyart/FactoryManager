import React, { useState, useEffect } from 'react';
import { 
  Building, Layers, Wrench, Users, DollarSign, Cpu, AlertTriangle, 
  ShieldCheck, RefreshCw, MessageSquare, Terminal, Eye, Bell, Check, 
  QrCode, Play, ChevronRight, User, Settings, Info, BrainCircuit, Beaker, Clipboard,
  MoreHorizontal, X, FileCheck, ShoppingCart, Archive, FileText, Sun, Moon, Menu
} from 'lucide-react';

// Original Operational components
import ProductionOS from './components/ProductionOS';
import MaintenanceOS from './components/MaintenanceOS';
import HRPayrollOS from './components/HRPayrollOS';
import AccountingOS from './components/AccountingOS';
import DeveloperOS from './components/DeveloperOS';

// Brand New Modular AdminLTE 5 components
import AdminLTEDashboard from './components/AdminLTEDashboard';
import AdminLTECRM from './components/AdminLTECRM';
import AdminLTESales from './components/AdminLTESales';
import AdminLTEInventory from './components/AdminLTEInventory';
import AdminLTEPurchasing from './components/AdminLTEPurchasing';
import AdminLTEQC from './components/AdminLTEQC';
import AdminLTEWarehouse from './components/AdminLTEWarehouse';
import AdminLTERD from './components/AdminLTERD';
import AdminLTEReports from './components/AdminLTEReports';

import { 
  DEPARTMENTS, ROLES, EMPLOYEES, CUSTOMERS, SUPPLIERS, PRODUCTS, MATERIALS, 
  FORMULAS, MACHINES, MANUFACTURING_ORDERS, REPAIR_TICKETS, PM_TASKS, SPARE_PARTS, 
  ATTENDANCE, LEAVE_REQUESTS, OT_REQUESTS, PAYROLL_PERIODS, PAYSLIPS, TRANSACTIONS, 
  INVOICES, SUPPLIER_BILLS, AUDIT_LOGS, GOODS_RECEIPTS, PURCHASE_ORDERS, 
  PURCHASE_REQUESTS, QC_INSPECTIONS
} from './data/mockFactoryData';

const INITIAL_DB_STATE = {
  departments: DEPARTMENTS,
  roles: ROLES,
  employees: EMPLOYEES,
  customers: CUSTOMERS,
  suppliers: SUPPLIERS,
  products: PRODUCTS,
  materials: MATERIALS,
  formulas: FORMULAS,
  machines: MACHINES,
  manufacturingOrders: MANUFACTURING_ORDERS,
  purchaseRequests: PURCHASE_REQUESTS,
  purchaseOrders: PURCHASE_ORDERS,
  goodsReceipts: GOODS_RECEIPTS,
  qcInspections: QC_INSPECTIONS,
  repairTickets: REPAIR_TICKETS,
  pmTasks: PM_TASKS,
  spareParts: SPARE_PARTS,
  attendance: ATTENDANCE,
  leaveRequests: LEAVE_REQUESTS,
  otRequests: OT_REQUESTS,
  payrollPeriods: PAYROLL_PERIODS,
  payslips: PAYSLIPS,
  transactions: TRANSACTIONS,
  invoices: INVOICES,
  supplierBills: SUPPLIER_BILLS,
  bills: SUPPLIER_BILLS,
  coa: [
    { code: '1010', name: 'Cash on Hand / Industrial Treasury', type: 'Asset', balance: 450000, id: 'coa-1010' },
    { code: '1020', name: 'Raw Material Inventory Capitalized', type: 'Asset', balance: 185000, id: 'coa-1020' },
    { code: '1030', name: 'Accounts Receivable (A/R Ledger)', type: 'Asset', balance: 163000, id: 'coa-1030' },
    { code: '2010', name: 'Accounts Payable Accrued (A/P)', type: 'Liability', balance: 15800, id: 'coa-2010' },
    { code: '3010', name: 'Corporate Retained Earnings Capital', type: 'Equity', balance: 350000, id: 'coa-3010' },
    { code: '4010', name: 'Wholesale Factory Product Sales Revenue', type: 'Revenue', balance: 512500, id: 'coa-4010' },
    { code: '5010', name: 'Direct Plant Wages & Labor Expenses', type: 'Expense', balance: 150700, id: 'coa-5010' },
    { code: '5020', name: 'Machinery Overhaul & Corrective PM OPEX', type: 'Expense', balance: 14200, id: 'coa-5020' },
    { code: '5030', name: 'Direct Raw Material Procurement OPEX', type: 'Expense', balance: 60500, id: 'coa-5030' }
  ],
  journals: [
    {
      id: 'jn-001',
      memo: 'Raw material inventory asset adjustment',
      date: '2026-05-01',
      lines: [
        { accountCode: '1020', type: 'Debit', amount: 185000 },
        { accountCode: '3010', type: 'Credit', amount: 185000 }
      ]
    },
    {
      id: 'jn-002',
      memo: 'May 2026 plant wages ledger allocation',
      date: '2026-05-28',
      lines: [
        { accountCode: '5010', type: 'Debit', amount: 150700 },
        { accountCode: '1010', type: 'Credit', amount: 150700 }
      ]
    }
  ],
  auditLogs: AUDIT_LOGS,
  notifications: [
    { id: 'n-1', message: 'Welcome to IDEVA Factory OS - System Boot Completed', severity: 'info', createdAt: new Date().toISOString() },
    { id: 'n-2', message: 'Alert: Spare Part SP-VLV-PV90 is below core minStock. Manual or auto PR check triggered.', severity: 'warning', createdAt: new Date().toISOString() }
  ]
};

export default function App() {
  const [dbState, setDbState] = useState<any>(INITIAL_DB_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('Admin'); // Interactive RBAC
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Custom states matching AdminLTE 5
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<any[]>([]);

  // Copilot AI chat states
  const [copilotHistory, setCopilotHistory] = useState<any[]>([
    { sender: 'assistant', msg: 'สวัสดีจ้าพาร์ทเนอร์วิจัย! มีอะไรให้ฉันตรวจสอบพารามิเตอร์ OEE, ความพร้อมล็อต FIFO คลังสาร หรือประเมินต้นทุนสูตรกวนแบทช์เครื่องสำอางวันนี้บ้างไหม?' }
  ]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Sync state from server on load
  const fetchState = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        if (data && data.materials) {
          setDbState(data);
        }
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const addToast = (msg: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Dispatch Copilot assistant message
  const handleSendCopilotMessage = async (e: any, prebuiltMsg?: string) => {
    if (e) e.preventDefault();
    const prompt = prebuiltMsg || "";
    if (!prompt.trim()) return;

    setCopilotHistory(prev => [...prev, { sender: 'user', msg: prompt }]);
    setAiLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userRole })
      });
      if (response.ok) {
        const resJson = await response.json();
        setCopilotHistory(prev => [...prev, { sender: 'assistant', msg: resJson.response }]);
      } else {
        throw new Error();
      }
    } catch {
      setCopilotHistory(prev => [...prev, { sender: 'assistant', msg: 'เกิดข้อขัดข้องในการเชื่อมโครงข่าย AI จ้า ลองระบุสารใหม่อีกครั่งน่ะ' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Navigation Items
  const menuList = [
    { id: 'dashboard', label: 'ภาพรวมระบบโรงงาน', icon: Cpu, category: 'แดชบอร์ด & วิเคราะห์' },
    { id: 'inventory', label: 'คลังสินค้า & Lot FIFO', icon: Archive, category: 'ฝ่ายจัดซื้อ & คลังวัตถุดิบ' },
    { id: 'purchasing', label: 'จัดซื้อเคมีภัณฑ์ (PR/PO)', icon: ShoppingCart, category: 'ฝ่ายจัดซื้อ & คลังวัตถุดิบ' },
    { id: 'warehouse', label: 'โอนย้าย & สแกนเนอร์ QR', icon: Building, category: 'ฝ่ายจัดซื้อ & คลังวัตถุดิบ' },
    { id: 'production', label: 'เครื่องจักร OEE & คุมงานกวน', icon: Layers, category: 'สายผลิต & แล็บศูนย์วิจัย' },
    { id: 'rd', label: 'ผสมกลิ่น & คำนวณต้นทุนต่อขวด', icon: Beaker, category: 'สายผลิต & แล็บศูนย์วิจัย' },
    { id: 'qc', label: 'ควบคุมคุณภาพแบทช์ (NCR/CAPA)', icon: ShieldCheck, category: 'สายผลิต & แล็บศูนย์วิจัย' },
    { id: 'crm', label: 'จัดการ OEM แบรนด์คู่ค้า', icon: Users, category: 'การขาย & ความสัมพันธ์ลูกค้า' },
    { id: 'sales', label: 'ระบบสั่งปล่อยจัดคิวผลิต (JO)', icon: FileText, category: 'การขาย & ความสัมพันธ์ลูกค้า' },
    { id: 'reports', label: 'พิมพ์สติ๊กเกอร์ & ออกเอกสาร', icon: FileCheck, category: 'การขาย & ความสัมพันธ์ลูกค้า' },
    { id: 'copilot', label: 'สมองกลสนับสนุนคู่คุย (AI Copilot)', icon: BrainCircuit, category: 'เครื่องมือประจุแล็บ' },
    { id: 'maintenance', label: 'แจ้งซ่อมเครื่องผสม (OEE)', icon: Wrench, category: 'การจัดการฝ่ายทั่วไป' },
    { id: 'hr', label: 'งานคน & บัญชีเงินเดือน', icon: Users, category: 'การจัดการฝ่ายทั่วไป' },
    { id: 'accounting', label: 'บัญชีกระแสเงินและค่าซื้อ', icon: DollarSign, category: 'การจัดการฝ่ายทั่วไป' },
    { id: 'developer', label: 'ด่านเขียนรหัสทดสอบ', icon: Terminal, category: 'การจัดการฝ่ายทั่วไป' }
  ];

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Brand Identity with Purple/Pink Accent */}
          <span className="p-2 ml-1 bg-gradient-to-tr from-[#6F42C1] to-[#E83E8C] text-white rounded-xl shadow-md">
            <Beaker className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">LuxePerfume ERP</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cosmetics &amp; Fragrance GMP System</p>
          </div>
        </div>

        {/* Action Widgets - Mode switches, notifications and RBAC selector */}
        <div className="flex items-center gap-3">
          
          {/* Interactive Role Selector for instant RBAC demonstration */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800">
            <span className="text-[10px] text-slate-400 pl-1.5 select-none font-bold">บานสิทธิ์:</span>
            <select
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
                addToast(`สลับสิทธิ์การเข้าใช้งานเป็น: ${e.target.value}`, "info");
              }}
              className="bg-transparent text-[10px] font-bold text-primary focus:outline-none cursor-pointer pr-1"
            >
              <option value="Admin">Admin (สิทธิ์ดูแลระบบกวน)</option>
              <option value="QC Manager">QC Lab Officer (ผู้คุม COA)</option>
              <option value="Warehouse Keeper">Warehouse Keeper (คลังล็อต)</option>
              <option value="Sales OEM">Sales Representative</option>
            </select>
          </div>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              addToast(`เปิดใช้งานโหมดหน้าจอ${!isDarkMode ? 'ถนอมสายตามิติเข้ม' : 'สีขาวพรีเมียม'}`, "info");
            }}
            className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 transition"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5 text-warning" /> : <Moon className="h-4.5 w-4.5 text-slate-650" />}
          </button>

          {/* Real-Time Notification Bell indicator */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 relative transition-all"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary ring-2 ring-white"></span>
            </button>

            {/* Simple notification drop-down dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-4 z-50 space-y-3 animate-fade-in text-xs">
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-1.5">
                  <strong className="font-bold">เสาแจ้งเตือนโรงงาน (Notifications)</strong>
                  <button type="button" onClick={() => setIsNotificationOpen(false)}><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  <div className="p-2 bg-pink-100/30 border-l-2 border-[#E83E8C] rounded">
                    <p className="font-bold">เตือนคลังวัตถุดิบใกล้ขาด!</p>
                    <span className="text-[10px] text-slate-400">ขวดแก้วทรงหรู 100ml เหลือยอดแบนต่ำกว่า 150 ใบ</span>
                  </div>
                  <div className="p-2 bg-emerald-100/30 border-l-2 border-[#198754] rounded">
                    <p className="font-bold">BPR อนุมัติการกวน Lot PFM-993</p>
                    <span className="text-[10px] text-slate-400">ผู้คุมห้องแล็ปเซ็น COA ผ่านฉลุยแล้ว</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      <div className="flex">
        
        {/* 2. Left Sidebar for Desktop Viewports (hidden on mobile) */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-64px)] p-4 space-y-5 shadow-xs shrink-0">
          
          <div className="space-y-4">
            {/* Group category routing */}
            {['แดชบอร์ด & วิเคราะห์', 'ฝ่ายจัดซื้อ & คลังวัตถุดิบ', 'สายผลิต & แล็บศูนย์วิจัย', 'การขาย & ความสัมพันธ์ลูกค้า', 'เครื่องมือประจุแล็บ', 'การจัดการฝ่ายทั่วไป'].map((cat) => (
              <div key={cat} className="space-y-1.5" id={`category-${cat}`}>
                <span className="text-[10px] font-black text-slate-400 block dark:text-slate-500 uppercase tracking-widest pl-2">
                  {cat}
                </span>
                
                <div className="space-y-1">
                  {menuList.filter(item => item.category === cat).map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          addToast(`สวิตช์ทางหน้าเวิร์คช็อพ: ${item.label}`, "info");
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
                          activeTab === item.id 
                            ? 'bg-[#6F42C1] text-white' 
                            : 'text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          {item.label}
                        </span>
                        
                        {/* Dynamic mini badges */}
                        {item.id === 'inventory' && (
                          <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black">LOW</span>
                        )}
                        {item.id === 'production' && (
                          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-mono">LIVE</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </aside>

        {/* 3. Main Operational Content viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
          
          {loading && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs animate-pulse">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>ระบบ LuxePerfume กำลังโอนสถิติจริงและกู้ Lot จากระบบหลังบ้านคริปโตเกียว...</span>
            </div>
          )}

          {/* A. PRIMARY CONTENT DESK */}
          {activeTab === 'dashboard' && (
            <AdminLTEDashboard 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'crm' && (
            <AdminLTECRM 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'sales' && (
            <AdminLTESales 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'production' && (
            <div className="space-y-6">
              {/* Premium Cosmetic / Perfume Mixing flow header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
                <span className="text-[9.5px] font-mono bg-[#6F42C1]/10 text-[#6F42C1] font-black px-2.5 py-0.5 rounded-full uppercase">GMP Certified ISO-22716 Mixing Suite</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">แผนภาพการรันล็อต &amp; ฉลากเบิกชั่งสาร (Automatic FIFO Lot Allocation)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">ข้อมูลการกวนต้มผสมสารเตาร้อน OEE, ดึงล็อตเคมีดิบแบบ FIFO อัตโนมัติ เพื่อรักษาผลแล็บมาตรฐานโรงงานความปลอดภัยสูงสูตรกวน</p>
                
                {/* Visual state map */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800">
                    <span className="text-slate-400 block font-bold text-[10px]">ขั้นตอน 1:</span>
                    <strong className="text-[#333] dark:text-white mt-1 block">ฝ่ายขายเคาะ Job (SO)</strong>
                    <span className="text-[9px] text-[#A1A1A6]">รัน Code อัตโนมัติ</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800">
                    <span className="text-slate-400 block font-bold text-[10px]">ขั้นตอน 2:</span>
                    <strong className="text-[#333] dark:text-white mt-1 block">ใบชั่ง / ฉลากชั่งสติกเกอร์</strong>
                    <span className="text-[9px] text-emerald-500 font-bold">🟢 พร้อมพิมพ์ QR</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800">
                    <span className="text-slate-400 block font-bold text-[10px]">ขั้นตอน 3:</span>
                    <strong className="text-[#333] dark:text-white mt-1 block">บันทึกผสมเครื่องกวนถัง</strong>
                    <span className="text-[9px] text-primary font-bold">OEE Real-time Sync</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800">
                    <span className="text-slate-400 block font-bold text-[10px]">ขั้นตอน 4:</span>
                    <strong className="text-[#333] dark:text-white mt-1 block">ตรวจ COA / ปล่อยบรรจุ</strong>
                    <span className="text-[9px] text-secondary font-bold">Lab Verified pass</span>
                  </div>
                </div>
              </div>

              {/* original layout with machinery monitoring details */}
              <ProductionOS 
                dbState={dbState} 
                onRefresh={fetchState} 
                onNotify={addToast} 
                userRole={userRole} 
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <AdminLTEInventory 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'purchasing' && (
            <AdminLTEPurchasing 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'qc' && (
            <AdminLTEQC 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'warehouse' && (
            <AdminLTEWarehouse 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'rd' && (
            <AdminLTERD 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'reports' && (
            <AdminLTEReports 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'hr' && (
            <HRPayrollOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'accounting' && (
            <AccountingOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'copilot' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto space-y-6 animate-fade-in" id="ai-intelligence-panel">
              <div className="flex items-center gap-3 border-b dark:border-slate-805 pb-4">
                <span className="p-3 bg-slate-100 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-[#1D1D1F] dark:text-white"><BrainCircuit className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">สมองกลวิจัยผลิตภัณฑ์ (LuxePerfume AI Lab Copilot)</h3>
                  <p className="text-[#86868B] text-xs">วิเคราะห์พารามิเตอร์ OEE, ลำดับความพร้อมของสาร และตรวจเช็คปริมาตรบ่มผสมตามมาตรฐานคอร์เคมีด้วย AI</p>
                </div>
              </div>

              {/* Chat Timeline */}
              <div className="h-[360px] border dark:border-slate-800 bg-[#F5F5F7]/45 dark:bg-slate-950 rounded-2xl p-5 overflow-y-auto space-y-4">
                {copilotHistory.map((h, idx) => (
                  <div key={idx} className={`flex ${h.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed ${
                        h.sender === 'user' 
                          ? 'bg-[#6F42C1] text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="flex font-bold uppercase tracking-wider text-[9px] mb-1.5 opacity-80">
                        {h.sender === 'user' ? 'Operator' : 'Luxe AI Coordinator'}
                      </div>
                      
                      <div className="space-y-1.5">
                        {h.msg.split('\n').map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                      <span className="text-xs text-slate-400">กำลังส่งคำปรึกษาไปยังระบบเครือข่ายความเร็วสูง Gemini...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Prebuilt Prompt Shortcuts */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">แนะนำคำสั่งด่วน</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Check OEE bottlenecks and calculate cost price for Chérie Rose v1.1")}
                    className="px-3 py-2 border dark:border-slate-850 hover:border-primary dark:bg-slate-950 text-[10px] rounded-xl font-bold font-mono transition-colors dark:text-slate-200"
                  >
                    🚀 เช็ค OEE ขวด Chérie Rose 1.1
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Provide GMP ISO-22716 guidelines for incoming french rose extracts")}
                    className="px-3 py-2 border dark:border-slate-850 hover:border-primary dark:bg-slate-950 text-[10px] rounded-xl font-bold font-mono transition-colors dark:text-slate-200"
                  >
                    🧪 คู่มือตรวจรับโรสออยล์ GMP
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <DeveloperOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
            />
          )}

        </main>
      </div>

      {/* 4. Real-time Toast Notifications display stack (Sticky center-right) */}
      <div className="fixed top-5 right-5 space-y-2 z-50">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`p-3 rounded-2xl shadow-xl flex items-center gap-2 border text-xs min-w-[280px] animate-fade-in ${
              t.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800' 
                : t.type === 'warning' 
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-900 border-amber-200 dark:border-amber-800' 
                  : t.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950 text-rose-900 border-rose-200 dark:border-rose-800'
                    : 'bg-[#F2F2F7] dark:bg-slate-900 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700'
            }`}
          >
            <div className="grow font-bold">{t.msg}</div>
            <button type="button" onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="text-slate-400 hover:text-slate-650">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 5. Mobile / Tablet Bottom Navigation Bar (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg">
        
        <button
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center grow h-full text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-450'}`}
        >
          <Cpu className="h-5 w-5 mb-0.5" />
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('inventory');
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center grow h-full text-[10px] font-bold ${activeTab === 'inventory' ? 'text-primary' : 'text-slate-450'}`}
        >
          <Archive className="h-5 w-5 mb-0.5" />
          Inventory
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('production');
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center grow h-full text-[10px] font-bold ${activeTab === 'production' ? 'text-primary' : 'text-slate-450'}`}
        >
          <Layers className="h-5 w-5 mb-0.5" />
          Production
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('purchasing');
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center grow h-full text-[10px] font-bold ${activeTab === 'purchasing' ? 'text-primary' : 'text-slate-450'}`}
        >
          <ShoppingCart className="h-5 w-5 mb-0.5" />
          Purchasing
        </button>

        <button
          type="button"
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          className={`flex flex-col items-center justify-center grow h-full text-[10px] font-bold ${mobileMoreOpen ? 'text-primary' : 'text-slate-450'}`}
        >
          <MoreHorizontal className="h-5 w-5 mb-0.5 animate-pulse" />
          More
        </button>

      </nav>

      {/* 6. Mobile Bottom Sheet Menu (The App Store quality visual panel) */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 flex items-end justify-center animate-fade-in" onClick={() => setMobileMoreOpen(false)}>
          <div 
            className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-6 pb-24 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" onClick={() => setMobileMoreOpen(false)}></div>
            
            <div className="flex justify-between items-center border-b dark:border-slate-850 pb-2">
              <strong className="text-xs text-slate-500 font-bold uppercase tracking-wider">แผงโมดูลการทำงาน (Enterprise Menu Grid)</strong>
              <button type="button" onClick={() => setMobileMoreOpen(false)} className="text-slate-400 hover:text-slate-650"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-bold">
              {[
                { id: 'crm', label: 'CRM / แบรนด์', icon: Users },
                { id: 'sales', label: 'คำสั่งปล่อย (JO)', icon: FileText },
                { id: 'warehouse', label: 'ตรวจรับสแกนคลัง', icon: Building },
                { id: 'qc', label: 'ควบคุมแล็บ QC', icon: ShieldCheck },
                { id: 'rd', label: 'สูตร R&D', icon: Beaker },
                { id: 'reports', label: 'พิมพ์ & รีพอร์ต', icon: FileCheck },
                { id: 'maintenance', label: 'ช่างบำรุง', icon: Wrench },
                { id: 'hr', label: 'งานคน / เดือน', icon: Users },
                { id: 'accounting', label: 'บัญชีกระแสยาท', icon: DollarSign },
                { id: 'copilot', label: 'คุยกับ AI Lab', icon: BrainCircuit }
              ].map((m) => {
                const MobileIcon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(m.id);
                      setMobileMoreOpen(false);
                      addToast(`สับหน่าวัดแผงโมดูล: ${m.label}`, "info");
                    }}
                    className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition ${
                      activeTab === m.id 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border dark:border-slate-850'
                    }`}
                  >
                    <MobileIcon className="h-5 w-5 text-secondary" style={{ color: activeTab === m.id ? 'white' : '' }} />
                    <span className="truncate max-w-[70px] select-none">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
