import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Building, Layers, Wrench, Users, DollarSign, Cpu, AlertTriangle, 
  ShieldCheck, RefreshCw, MessageSquare, Terminal, Eye, Bell, Check, 
  QrCode, Play, ChevronRight, User, Settings, Info, BrainCircuit, Beaker, Clipboard,
  MoreHorizontal, X
} from 'lucide-react';

// Subcomponents import
import ProductionOS from './components/ProductionOS';
import MaintenanceOS from './components/MaintenanceOS';
import HRPayrollOS from './components/HRPayrollOS';
import AccountingOS from './components/AccountingOS';
import DeveloperOS from './components/DeveloperOS';
import DashboardQuickTable from './components/DashboardQuickTable';
import PerfumeFormulaOS from './components/PerfumeFormulaOS';
import ChemicalStockOS from './components/ChemicalStockOS';
import GMPHubOS from './components/GMPHubOS';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'production' | 'maintenance' | 'hr' | 'accounting' | 'developer' | 'copilot' | 'perfume-formulas' | 'chemical-stocks' | 'gmp-hub'>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  
  // Notification logs toast state
  const [toasts, setToasts] = useState<{ id: string, msg: string, type: 'info' | 'warning' | 'error' }[]>([]);
  
  // AI Copilot state
  const [copilotMessage, setCopilotMessage] = useState<string>('');
  const [copilotHistory, setCopilotHistory] = useState<{ sender: 'user' | 'ai', msg: string }[]>([
    { sender: 'ai', msg: "Greetings! I am the **IDEVA Factory OS Copilot**. I analyze real-time inventory balances, floor OEE scores, maintenance backlogs, and corporate ledger distributions. Ask me anything such as *'Give me an operational optimization blueprint'*." }
  ]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Scanner Simulator State
  const [scanningMachineName, setScanningMachineName] = useState<string | null>(null);
  const [scannerProgress, setScannerProgress] = useState<number>(0);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) {
        throw new Error("Failed to fetch state from backend");
      }
      const data = await response.json();
      if (data && typeof data === 'object') {
        setDbState((prev: any) => ({
          ...prev,
          ...data
        }));
      }
    } catch (e) {
      addToast("Failed to connect to backend server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const addToast = (msg: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleSendCopilotMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || copilotMessage;
    if (!promptToSend.trim()) return;

    setCopilotHistory(prev => [...prev, { sender: 'user', msg: promptToSend }]);
    setCopilotMessage('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptToSend })
      });
      const data = await response.json();
      setCopilotHistory(prev => [...prev, { sender: 'ai', msg: data.response }]);
    } catch {
      setCopilotHistory(prev => [...prev, { sender: 'ai', msg: "Sorry, I had an issue connecting to the cognitive copilot. Check process logs." }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !dbState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-md border flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
          <span className="font-semibold text-slate-700 tracking-tight">Booting IDEVA Factory OS v1.0 Enterprise Suite...</span>
        </div>
      </div>
    );
  }

  // Calculate dynamic dashboard stats
  const totalEmployees = dbState.employees?.length || 0;
  
  const totalRevenues = dbState.coa?.filter((ac: any) => ac.type === 'Revenue')
    .reduce((sum: number, ac: any) => sum + ac.balance, 0) || 0;
  
  const totalOperatingExpenses = dbState.coa?.filter((ac: any) => ac.type === 'Expense')
    .reduce((sum: number, ac: any) => sum + ac.balance, 0) || 0;
  
  const netEarnings = totalRevenues - totalOperatingExpenses;
  
  const unrestrictedStockPercent = dbState.materials
    ? Math.round((dbState.materials.filter((m: any) => m.stockLevel >= m.minStock).length / dbState.materials.length) * 100)
    : 100;

  // Formatting chart data
  const revenueExpenseChartData = [
    { name: 'Income Statement', GrossRevenues: totalRevenues, TotalOpex: totalOperatingExpenses, NetMargin: netEarnings }
  ];

  const moStageChartData = dbState.manufacturingOrders
    ? [
        { name: 'Weighing', count: dbState.manufacturingOrders.filter((m: any) => m.status === 'Weighing').length },
        { name: 'In Production', count: dbState.manufacturingOrders.filter((m: any) => m.status === 'In Production' || m.status === 'Material Issued').length },
        { name: 'QC Station', count: dbState.manufacturingOrders.filter((m: any) => m.status.includes('QC')).length },
        { name: 'Released', count: dbState.manufacturingOrders.filter((m: any) => m.status === 'Released').length },
      ]
    : [];

  const machineryChartData = dbState.machines
    ? dbState.machines.map((m: any) => ({
        name: m.name,
        MTBF: m.mtbfHours,
        MTTR: m.mttrHours * 50 // scaled up for visualization
      }))
    : [];

  const PIE_COLORS = ['#0071E3', '#FF9500', '#5856D6', '#34C759'];

  return (
    <div className="flex min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased" id="ideva-applet-root">
      {/* LEFT NAVIGATION COLUMN */}
      <aside className="w-64 bg-[#F5F5F7] border-r border-[#E5E5EA] text-[#1D1D1F] flex flex-col shrink-0 select-none hidden md:flex">
        {/* Brand Banner */}
        <div className="p-6 border-b border-[#E5E5EA] flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white shadow-sm">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-xs tracking-wider font-sans text-[#1D1D1F]">IDEVA Factory OS</h1>
            <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-widest mt-0.5">ระบบควบคุมโรงงานอัจฉริยะ</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">แผงควบคุมหลัก</p>
          
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'dashboard' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className={`h-4 w-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#86868B]'}`} /> 
              แดชบอร์ด OEE
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'dashboard' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gmp-hub')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'gmp-hub' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className={`h-4 w-4 ${activeTab === 'gmp-hub' ? 'text-white' : 'text-[#86868B]'}`} /> 
              มาตรฐาน GMP
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'gmp-hub' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('production')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'production' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Cpu className={`h-4 w-4 ${activeTab === 'production' ? 'text-white' : 'text-[#86868B]'}`} /> 
              ไลน์กวนผสมน้ำหอม
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'production' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'maintenance' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Wrench className={`h-4 w-4 ${activeTab === 'maintenance' ? 'text-white' : 'text-[#86868B]'}`} /> 
              การซ่อมบำรุง
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'maintenance' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'hr' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className={`h-4 w-4 ${activeTab === 'hr' ? 'text-white' : 'text-[#86868B]'}`} /> 
              บุคลากร/เงินเดือน
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'hr' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounting')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'accounting' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <DollarSign className={`h-4 w-4 ${activeTab === 'accounting' ? 'text-white' : 'text-[#86868B]'}`} /> 
              งานบัญชี/จัดซื้อ
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'accounting' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <p className="px-3 pt-6 text-[10px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">ระบบคำนวณสูตรอัจฉริยะ</p>

          <button
            type="button"
            onClick={() => setActiveTab('perfume-formulas')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'perfume-formulas' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Beaker className={`h-4 w-4 ${activeTab === 'perfume-formulas' ? 'text-white' : 'text-[#86868B]'}`} /> 
              สูตรวิจัย (R&D)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'perfume-formulas' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chemical-stocks')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'chemical-stocks' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Clipboard className={`h-4 w-4 ${activeTab === 'chemical-stocks' ? 'text-white' : 'text-[#86868B]'}`} /> 
              คลังสารเคมีดิบ
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'chemical-stocks' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'copilot' 
                ? 'bg-[#1D1D1F] text-white shadow-sm font-semibold' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BrainCircuit className={`h-4 w-4 ${activeTab === 'copilot' ? 'text-white' : 'text-[#86868B]'}`} /> 
              บอทสมองกล AI
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'copilot' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <p className="px-3 pt-6 text-[10px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">ฐานข้อมูลวิศวกร</p>

          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all duration-150 ${
              activeTab === 'developer' 
                ? 'bg-[#E8E8ED] text-[#1D1D1F] font-bold border border-[#D1D1D6]' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Terminal className={`h-4 w-4 ${activeTab === 'developer' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`} /> 
              คิวรี่ SQL
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'developer' ? 'translate-x-0.5 text-[#1D1D1F]' : 'text-slate-400'}`} />
          </button>
        </nav>

        {/* Footer profile area */}
        <div className="p-4 border-t border-[#E5E5EA] text-[#86868B] text-center text-[10px] font-sans">
          เซิร์ฟเวอร์หลักทำงานปกติ
        </div>
      </aside>

      {/* MID SECTION CONTENT CONTAINER BODY */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#F5F5F7]" id="mid-content-scroller">
        
        {/* TOP HEADER STATUS PANEL */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E5EA] shrink-0 flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1D1D1F] md:hidden">IDEVA OS</span>
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-[#E5E5EA] text-[#1D1D1F] px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
              <span>ระบบดำเนินงานปกติแบบเรียลไทม์</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Interactive User Switcher RBAC simulated badge */}
            <div className="flex items-center gap-2.5 bg-neutral-50 p-1 rounded-xl border border-[#E5E5EA]">
              <span className="hidden lg:inline text-[10px] text-[#86868B] font-bold uppercase pl-2">สิทธิ์ทดลองใช้งาน:</span>
              <select
                className="text-xs bg-white text-[#1D1D1F] font-semibold rounded-lg border border-[#E5E5EA] shadow-xs px-2 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-[#0071E3]/20"
                value={userRole}
                onChange={(e) => {
                  setUserRole(e.target.value);
                  addToast(`Permission Profile toggled to: ${e.target.value}`, "info");
                }}
              >
                <option value="Admin">Admin (All Access)</option>
                <option value="Management">Management (Read Audit)</option>
                <option value="QC">QC Inspector</option>
                <option value="Production">Production Desk</option>
                <option value="Maintenance">Reliability Tech</option>
                <option value="HR">HR &amp; Payroll Desk</option>
                <option value="Accounting">Finance Auditor</option>
                <option value="R&D">BOM Chemist (R&amp;D)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchState}
              className="p-2 text-[#1D1D1F] hover:bg-neutral-100 rounded-lg transition-colors border border-[#E5E5EA] max-md:hidden bg-white"
              title="Hot-Reload DB"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT AREA CONTAINER */}
        <section className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 space-y-6">
          
          {/* TOAST NOTIFICATION STACK OVERLAY */}
          <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            {toasts.map(t => (
              <div 
                key={t.id} 
                className={`p-3.5 rounded-2xl shadow-md border text-xs font-semibold flex items-center gap-3 animate-fade-in pointer-events-auto ${
                  t.type === 'error' ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' :
                  t.type === 'warning' ? 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20' :
                  'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
                }`}
              >
                {t.type === 'error' ? <AlertTriangle className="h-4.5 w-4.5" /> : <ShieldCheck className="h-4.5 w-4.5" />}
                <span>{t.msg}</span>
              </div>
            ))}
          </div>

          <div className="md:hidden bg-neutral-900 text-white font-semibold text-xs border border-neutral-950 p-3 rounded-2xl mb-4 flex justify-between items-center shadow-xs select-none">
            <span>📱 ระบบนำทาง IDEVA Mobile OS ทำงานราบรื่น</span>
            <span className="text-[9px] uppercase tracking-widest bg-white/15 px-2 py-0.5 rounded-lg text-emerald-300 font-extrabold font-mono animate-pulse">● Live</span>
          </div>

          {/* TAB CONTENT SWITCH RULES */}

          {/* A. EXECUTIVE COCKPIT SCREEN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in" id="dashboard-tab-portal">
              
              {/* Executive Metrics Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                  <div className="space-y-1">
                    <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-wider">กำลังพลพนักงาน (Staff Active)</p>
                    <p className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">{totalEmployees} Active staff</p>
                    <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">On Shift: {(dbState.employees || []).filter((e: any)=>e.status==='Active').length} พนักงาน</span>
                  </div>
                  <span className="p-3 bg-neutral-50 border border-[#E5E5EA] text-[#1D1D1F] rounded-xl"><Users className="h-5 w-5" /></span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                  <div className="space-y-1">
                    <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-wider">ดัชนีโรงงานปานกลาง (Plant OEE)</p>
                    <p className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">84.5% OEE</p>
                    <span className="text-[10px] text-[#34C759] font-medium">เกณฑ์มาตรฐาน OEE: บรรลุหลักแล้ว</span>
                  </div>
                  <span className="p-3 bg-neutral-50 border border-[#E5E5EA] text-[#1D1D1F] rounded-xl"><Cpu className="h-5 w-5" /></span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                  <div className="space-y-1">
                    <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-wider">ความเสถียรวัตถุดิบ (Stability)</p>
                    <p className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">{unrestrictedStockPercent}% Stable</p>
                    <span className="text-[10px] text-[#FF9500] font-medium">ต่ำกว่ากำหนด {(dbState.materials || []).filter((m:any)=>m.stockLevel < m.minStock).length} รายการ</span>
                  </div>
                  <span className="p-3 bg-neutral-50 border border-[#E5E5EA] text-[#1D1D1F] rounded-xl"><AlertTriangle className="h-5 w-5" /></span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                  <div className="space-y-1">
                    <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-wider">รายรับสุทธิ (Net Earnings)</p>
                    <p className="text-2xl font-bold tracking-tight text-[#34C759] font-mono">฿{netEarnings.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-400 font-medium">รวมบันทึกสุทธิถ้วน</span>
                  </div>
                  <span className="p-3 bg-neutral-50 border border-[#E5E5EA] text-[#34C759] rounded-xl"><DollarSign className="h-5 w-5" /></span>
                </div>
              </div>

              {/* Dynamic Recharts Visualizations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Cashflow doubleentry Area chart */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4 lg:col-span-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-[#1D1D1F] text-sm">งบแสดงรายรับรายจ่ายบริษัท (Income Statement Tracking)</h4>
                      <p className="text-[#86868B] text-xs mt-0.5">การตรวจสอบยอดทางบัญชีสุทธิระหว่างบิลเจ้าหนี้และใบแจ้งตั๋วค้างชำระลูกค้า</p>
                    </div>
                  </div>
                  <div className="h-64 min-h-[256px] min-w-0" id="income-statement-chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={revenueExpenseChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0071E3" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOpex" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#86868B" fontSize={10} />
                        <YAxis stroke="#86868B" fontSize={10} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="GrossRevenues" stroke="#0071E3" fillOpacity={1} fill="url(#colorRev)" name="รายรับรวม (Revenues) (฿)" />
                        <Area type="monotone" dataKey="TotalOpex" stroke="#FF3B30" fillOpacity={1} fill="url(#colorOpex)" name="รายจ่ายสะสม (Gross Opex) (฿)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. active MO dispatch stage distribution */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4 lg:col-span-1">
                  <h4 className="font-semibold text-[#1D1D1F] text-sm">การกระจายตัวขั้นตอนสั่งผลิต (Manufacturing Dispatch Stages)</h4>
                  <div className="h-60 min-h-[240px] min-w-0 flex items-center justify-center relative" id="manufacturing-dispatch-chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={moStageChartData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {moStageChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered balance score */}
                    <div className="absolute text-center">
                      <p className="text-2xl font-semibold text-[#1D1D1F]">{(dbState.manufacturingOrders || []).length} ใบ</p>
                      <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-wider">กำลังผลิตทั้งหมด</p>
                    </div>
                  </div>
                  {/* Legend list custom */}
                  <div className="grid grid-cols-2 text-[10px] gap-2 pt-2 border-t border-[#E5E5EA] text-[#86868B] font-medium">
                    {moStageChartData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                        <span>{entry.name}: <strong className="text-[#1D1D1F]">{entry.count} ใบ</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warnings Desk Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI recommendations quick trigger summary card */}
                <div className="bg-[#1D1D1F] text-white rounded-2xl p-6 shadow-md border border-[#3A3A3C] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white font-semibold px-2.5 py-1 text-[9px] rounded-full uppercase tracking-wider font-mono">
                      <BrainCircuit className="h-3.5 w-3.5" /> AI Engine Core Active
                    </span>

                    <h4 className="font-semibold text-base tracking-tight leading-snug text-white">ให้สมองกล AI มอบคำแนะนำสายผลิต</h4>
                    <p className="text-neutral-400 text-xs">
                      วิเคราะห์จุดขวดทางอุตสาหกรรม การระบายสินค้าคงคลัง และรอบการซ่อมบำรุงเชิงป้องกันแม่นยำด้วยเวคเตอร์ข้อมูลจริง
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('copilot');
                        handleSendCopilotMessage(undefined, "Analyse current OEE bottlenecks and recommend preventive actions");
                      }}
                      className="w-full bg-[#0071E3] hover:bg-[#147ce5] py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md text-center inline-block text-white"
                    >
                      ตรวจวิเคราะห์ OEE Bottlenecks
                    </button>
                  </div>
                </div>

                {/* Notifications alert panel */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-[#E5E5EA] pb-2">
                    <h4 className="font-semibold text-[#1D1D1F] text-sm flex items-center gap-1.5">
                      <Bell className="h-4.5 w-4.5 text-[#0071E3]" /> รายการแจ้งเตือนระบบ (Activity Feed)
                    </h4>
                    <span className="text-[10px] bg-[#FF3B30]/10 text-[#FF3B30] font-semibold px-2 py-0.5 rounded-full">Alerts Active</span>
                  </div>

                  <div className="space-y-2.5 max-h-[185px] overflow-y-auto">
                    {(dbState.notifications || []).map((n: any) => (
                      <div key={n.id} className="p-3 bg-neutral-50 border border-[#E5E5EA] rounded-xl space-y-1">
                        <p className="text-[#1D1D1F] font-medium text-xs leading-relaxed">{n.message}</p>
                        <span className="font-mono text-[9px] text-[#86868B] block">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auditing track events log */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-3">
                  <div className="flex justify-between flex-wrap gap-2 items-center border-b border-[#E5E5EA] pb-2">
                    <h4 className="font-semibold text-[#1D1D1F] text-sm flex items-center gap-1.5">
                      <Terminal className="h-4.5 w-4.5 text-[#86868B]" /> ประวัติธุรกรรมพนักงาน (Audit Log Trail)
                    </h4>
                  </div>

                  <div className="space-y-3 max-h-[185px] overflow-y-auto font-mono text-[10px] text-zinc-600">
                    {(dbState.auditLogs || []).slice(0, 8).map((log: any) => (
                      <div key={log.id} className="border-b border-[#E5E5EA] pb-1.5 last:border-0 last:pb-0">
                        <span className="text-[9px] bg-neutral-100 text-[#1D1D1F] border border-[#E5E5EA] px-1 py-0.5 rounded font-bold">{log.module}</span>
                        <p className="text-[#1D1D1F] font-medium mt-1 leading-normal">{log.action}</p>
                        <div className="flex justify-between text-[8px] text-[#86868B] mt-0.5">
                          <span>User: {log.user}</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ตารางแสดงข้อมูล (List Table) ที่รวมปุ่มคำสั่ง แก้ไข, บันทึก, ลบ โดยใช้ Lucide icons */}
              <DashboardQuickTable 
                dbState={dbState}
                onRefresh={fetchState}
                onNotify={addToast}
              />
            </div>
          )}

          {/* B. OPERATIONAL MODULAR SCREENS */}
          {activeTab === 'production' && (
            <ProductionOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
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

          {activeTab === 'perfume-formulas' && (
            <PerfumeFormulaOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'chemical-stocks' && (
            <ChemicalStockOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'gmp-hub' && (
            <GMPHubOS 
              dbState={dbState} 
              onRefresh={fetchState} 
              onNotify={addToast} 
              userRole={userRole} 
            />
          )}

          {activeTab === 'copilot' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm max-w-4xl mx-auto space-y-6 animate-fade-in" id="ai-intelligence-panel">
              <div className="flex items-center gap-3 border-b border-[#E5E5EA] pb-4">
                <span className="p-3 bg-neutral-100 border border-[#E5E5EA] rounded-xl text-[#1D1D1F]"><BrainCircuit className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-semibold text-[#1D1D1F] text-lg">สมองกลสนับสนุนไลน์ผลิต (Factory OS Copilot)</h3>
                  <p className="text-[#86868B] text-xs">วิเคราะห์แผน OEE, ทะเบียนวัตถุดิบขาดแคลน และจัดงบลงทุนเชิงประหยัดด้วยปัญญาประดิษฐ์สถิติขั้นสูง</p>
                </div>
              </div>

              {/* Chat timeline dialog */}
              <div className="h-[430px] border border-[#E5E5EA] bg-[#F5F5F7]/40 rounded-2xl p-5 overflow-y-auto space-y-4">
                {copilotHistory.map((h, idx) => (
                  <div key={idx} className={`flex ${h.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`p-4 rounded-2xl max-w-2xl text-xs shadow-xs leading-relaxed ${
                        h.sender === 'user' 
                          ? 'bg-[#0071E3] text-white rounded-br-none' 
                          : 'bg-white border border-[#E5E5EA] text-[#1D1D1F] rounded-bl-none'
                      }`}
                    >
                      <div className="flex font-bold uppercase tracking-wider text-[9px] mb-1.5 opacity-80">
                        {h.sender === 'user' ? 'Operator' : 'AI Engineer Core'}
                      </div>
                      
                      <div className="space-y-1.5 font-sans">
                        {h.msg.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#E5E5EA] p-4 rounded-xl flex items-center gap-3">
                      <RefreshCw className="h-4 w-4 text-[#0071E3] animate-spin" />
                      <span className="text-xs text-[#86868B]">กำลังประมวลความเร็วสูงด้วยโครงข่ายข้อมูล Gemini Neural...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample prebuilt prompts */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider">ตัวอย่างหัวข้อมอบหมายด่วน</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Audit current OEE bottlenecks across live chemical mixers")}
                    className="px-3.5 py-2 border border-[#E5E5EA] hover:border-[#D1D1D6] bg-white text-[#1D1D1F] text-xs rounded-xl font-medium transition-colors"
                  >
                    🚀 ตรวจคอขวด OEE Mixers
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Check inventory stock level warnings and list pending PR orders")}
                    className="px-3.5 py-2 border border-[#E5E5EA] hover:border-[#D1D1D6] bg-white text-[#1D1D1F] text-xs rounded-xl font-medium transition-colors"
                  >
                    📦 วิเคราะห์วัตถุดิบสำรอง
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Draft structural operating cost reductions for active facility bills")}
                    className="px-3.5 py-2 border border-[#E5E5EA] hover:border-[#D1D1D6] bg-white text-[#1D1D1F] text-xs rounded-xl font-medium transition-colors"
                  >
                    💵 ร่างงบลดต้นทุนคงคลัง
                  </button>
                </div>
              </div>

              {/* Input block */}
              <form onSubmit={(e) => handleSendCopilotMessage(e)} className="flex gap-2">
                <input
                  type="text"
                  className="w-full text-xs rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] p-3.5 focus:bg-white focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3] outline-none text-[#1D1D1F] font-sans"
                  placeholder="Ask anything (เช่น 'วิเคราะห์แผนการซ่อมเครื่องจักร Mixer-MX10 เชิงรุก')"
                  value={copilotMessage}
                  onChange={(e) => setCopilotMessage(e.target.value)}
                  disabled={aiLoading}
                  required
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-6 py-3.5 bg-[#1D1D1F] hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all h-full"
                >
                  ส่งข้อมูล
                </button>
              </form>
            </div>
          )}

          {activeTab === 'developer' && (
            <DeveloperOS onNotify={addToast} />
          )}

        </section>
      </main>

      {/* 📱 iOS-Style Bottom Navigation Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/80 backdrop-blur-md border border-[#E5E5EA] rounded-2xl shadow-xl flex justify-around items-center py-2 px-1 text-center select-none">
        
        {/* Tab 1: Dashboard OEE */}
        <button
          type="button"
          onClick={() => { setActiveTab('dashboard'); setDrawerOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1.5 flex-1 transition-all ${
            activeTab === 'dashboard' ? 'text-[#0071E3] scale-102 font-bold' : 'text-[#86868B]'
          }`}
        >
          <Layers className="h-4.5 w-4.5" />
          <span className="text-[9px] font-sans font-semibold tracking-tight">แดชบอร์ด OEE</span>
        </button>

        {/* Tab 2: มาตรฐาน GMP */}
        <button
          type="button"
          onClick={() => { setActiveTab('gmp-hub'); setDrawerOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1.5 flex-1 transition-all ${
            activeTab === 'gmp-hub' ? 'text-[#34C759] scale-102 font-bold' : 'text-[#86868B]'
          }`}
        >
          <ShieldCheck className="h-4.5 w-4.5" />
          <span className="text-[9px] font-sans font-semibold tracking-tight">มาตรฐาน GMP</span>
        </button>

        {/* Tab 3: คลังเคมี */}
        <button
          type="button"
          onClick={() => { setActiveTab('chemical-stocks'); setDrawerOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1.5 flex-1 transition-all ${
            activeTab === 'chemical-stocks' ? 'text-[#0071E3] scale-102 font-bold' : 'text-[#86868B]'
          }`}
        >
          <Clipboard className="h-4.5 w-4.5" />
          <span className="text-[9px] font-sans font-semibold tracking-tight">คลังสารเคมี</span>
        </button>

        {/* Tab 4: สูตรวิจัย (R&D) */}
        <button
          type="button"
          onClick={() => { setActiveTab('perfume-formulas'); setDrawerOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1.5 flex-1 transition-all ${
            activeTab === 'perfume-formulas' ? 'text-[#0071E3] scale-102 font-bold' : 'text-[#86868B]'
          }`}
        >
          <Beaker className="h-4.5 w-4.5" />
          <span className="text-[9px] font-sans font-semibold tracking-tight">สูตรวิจัย (R&D)</span>
        </button>

        {/* Tab 5: เพิ่มเติม (•••) */}
        <button
          type="button"
          onClick={() => setDrawerOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1.5 flex-1 transition-all ${
            drawerOpen ? 'text-neutral-950 scale-102 font-bold' : 'text-[#86868B]'
          }`}
        >
          <MoreHorizontal className="h-4.5 w-4.5" />
          <span className="text-[9px] font-sans font-semibold tracking-tight">เพิ่มเติม</span>
        </button>

      </div>

      {/* 📱 Sleek Menu Drawer (Mobile Only) */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-45 bg-black/40 backdrop-blur-xs flex flex-col justify-end transition-opacity" onClick={() => setDrawerOpen(false)}>
          <div 
            className="bg-white rounded-t-3xl border-t border-[#E5E5EA] shadow-2xl p-5 pb-20 space-y-4 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">เมนูระบบงานเพิ่มเติม (Factory Desk)</h3>
                <p className="text-[10px] text-[#86868B]">คลิกเพื่อสลับเข้าสู่ห้องปฏิบัติการโรงงานส่วนอื่น</p>
              </div>
              <button 
                type="button" 
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full text-slate-400"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Blocks Grid Dual block system requested */}
            <div className="grid grid-cols-2 gap-3 pb-4 select-none">
              
              {/* Block 1: ไลน์ผสม (activeTab === 'production') */}
              <button
                type="button"
                onClick={() => { setActiveTab('production'); setDrawerOpen(false); }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  activeTab === 'production' 
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                    : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#1D1D1F] hover:bg-white'
                }`}
              >
                <Cpu className="h-5 w-5 text-[#FF9500]" />
                <div>
                  <strong className="text-xs font-semibold block">ไลน์กวนผสมสาร</strong>
                  <span className="text-[9px] opacity-75">ใบโมเดิ้ลคุมถัง BPR</span>
                </div>
              </button>

              {/* Block 2: ซ่อมบำรุง (activeTab === 'maintenance') */}
              <button
                type="button"
                onClick={() => { setActiveTab('maintenance'); setDrawerOpen(false); }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  activeTab === 'maintenance' 
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                    : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#1D1D1F] hover:bg-white'
                }`}
              >
                <Wrench className="h-5 w-5 text-[#34C759]" />
                <div>
                  <strong className="text-xs font-semibold block">การซ่อมบำรุง</strong>
                  <span className="text-[9px] opacity-75">รักษามอเตอร์/ฟิวเตอร์</span>
                </div>
              </button>

              {/* Block 3: งานบัญชี/จัดซื้อ (activeTab === 'accounting') */}
              <button
                type="button"
                onClick={() => { setActiveTab('accounting'); setDrawerOpen(false); }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  activeTab === 'accounting' 
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                    : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#1D1D1F] hover:bg-white'
                }`}
              >
                <DollarSign className="h-5 w-5 text-[#0071E3]" />
                <div>
                  <strong className="text-xs font-semibold block">งานบัญชี/จัดซื้อ</strong>
                  <span className="text-[9px] opacity-75">คุมสถานะบิลจัดจ่าย</span>
                </div>
              </button>

              {/* Block 4: บุคลากร (activeTab === 'hr') */}
              <button
                type="button"
                onClick={() => { setActiveTab('hr'); setDrawerOpen(false); }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  activeTab === 'hr' 
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                    : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#1D1D1F] hover:bg-white'
                }`}
              >
                <Users className="h-5 w-5 text-[#BF5AF2]" />
                <div>
                  <strong className="text-xs font-semibold block">ฝ่ายบุคคล</strong>
                  <span className="text-[9px] opacity-75">ลงเวลาและสลิปเงินกลั่น</span>
                </div>
              </button>

              {/* Block 5: คิวรี่ SQL (activeTab === 'developer') */}
              <button
                type="button"
                onClick={() => { setActiveTab('developer'); setDrawerOpen(false); }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  activeTab === 'developer' 
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                    : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#1D1D1F] hover:bg-white'
                }`}
              >
                <Terminal className="h-5 w-5 text-gray-400 font-mono" />
                <div>
                  <strong className="text-xs font-mono font-semibold block">คิวรี่ SQL</strong>
                  <span className="text-[9px] opacity-75 font-mono">Developer Dashboard</span>
                </div>
              </button>

              {/* Block 6: บอทสมองกล AI (activeTab === 'copilot') */}
              <button
                type="button"
                onClick={() => { setActiveTab('copilot'); setDrawerOpen(false); }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  activeTab === 'copilot' 
                    ? 'bg-neutral-900 border-neutral-950 text-white shadow-md' 
                    : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#1D1D1F] hover:bg-white'
                }`}
              >
                <BrainCircuit className="h-5 w-5 text-indigo-500 animate-pulse" />
                <div>
                  <strong className="text-xs font-semibold block">บอทสมองกล AI</strong>
                  <span className="text-[9px] opacity-75 font-sans animate-fade-in">สเกลโครงข่ายข้อมูลจริง</span>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
