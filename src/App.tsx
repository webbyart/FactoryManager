import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Building, Layers, Wrench, Users, DollarSign, Cpu, AlertTriangle, 
  ShieldCheck, RefreshCw, MessageSquare, Terminal, Eye, Bell, Check, 
  QrCode, Play, ChevronRight, User, Settings, Info, BrainCircuit
} from 'lucide-react';

// Subcomponents import
import ProductionOS from './components/ProductionOS';
import MaintenanceOS from './components/MaintenanceOS';
import HRPayrollOS from './components/HRPayrollOS';
import AccountingOS from './components/AccountingOS';
import DeveloperOS from './components/DeveloperOS';
import DashboardQuickTable from './components/DashboardQuickTable';

export default function App() {
  const [dbState, setDbState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('Admin'); // Interactive RBAC
  const [activeTab, setActiveTab] = useState<'dashboard' | 'production' | 'maintenance' | 'hr' | 'accounting' | 'developer' | 'copilot'>('dashboard');
  
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
      const data = await response.json();
      setDbState(data);
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
            <h1 className="font-semibold text-xs tracking-wider font-sans text-[#1D1D1F]">IDEVA FACTORY SYSTEM</h1>
            <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-widest mt-0.5">ระบบควบคุมโรงงานอุตสาหกรรม</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">โมดูลปฏิบัติการ (Operations)</p>
          
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'dashboard' 
                ? 'bg-[#1D1D1F] text-white shadow-sm' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className={`h-4 w-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#86868B]'}`} /> 
              แผงวิเคราะห์ผู้บริหาร (Dashboard)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'dashboard' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('production')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'production' 
                ? 'bg-[#1D1D1F] text-white shadow-sm' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Cpu className={`h-4 w-4 ${activeTab === 'production' ? 'text-white' : 'text-[#86868B]'}`} /> 
              ระบบการผลิตเคมีภัณฑ์ (Production)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'production' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'maintenance' 
                ? 'bg-[#1D1D1F] text-white shadow-sm' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Wrench className={`h-4 w-4 ${activeTab === 'maintenance' ? 'text-white' : 'text-[#86868B]'}`} /> 
              ระบบซ่อมบำรุงเครื่องจักร (Maintenance)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'maintenance' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'hr' 
                ? 'bg-[#1D1D1F] text-white shadow-sm' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className={`h-4 w-4 ${activeTab === 'hr' ? 'text-white' : 'text-[#86868B]'}`} /> 
              ระบบบุคลากร &amp; เงินเดือน (HR Admin)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'hr' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounting')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'accounting' 
                ? 'bg-[#1D1D1F] text-white shadow-sm' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <DollarSign className={`h-4 w-4 ${activeTab === 'accounting' ? 'text-white' : 'text-[#86868B]'}`} /> 
              ระบบบัญชีและการเงิน (Accounting)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'accounting' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <p className="px-3 pt-6 text-[10px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">ระบบประมวลผล AI</p>

          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              activeTab === 'copilot' 
                ? 'bg-[#1D1D1F] text-white shadow-sm' 
                : 'text-[#1D1D1F] hover:bg-[#E8E8ED]/80'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BrainCircuit className={`h-4 w-4 ${activeTab === 'copilot' ? 'text-white' : 'text-[#86868B]'}`} /> 
              ผู้ช่วยประธานตรวจการ (AI Copilot)
            </span>
            <ChevronRight className={`h-3 w-3 transition-transform ${activeTab === 'copilot' ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
          </button>

          <p className="px-3 pt-6 text-[10px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">เครื่องมือฐานข้อมูล</p>

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
              ผังดึงโครงสร้าง DB &amp; SQL Query
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
              <span>ระบบทำงานปกติ (System Normal)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Interactive User Switcher RBAC simulated badge */}
            <div className="flex items-center gap-2.5 bg-neutral-50 p-1 rounded-xl border border-[#E5E5EA]">
              <span className="hidden lg:inline text-[10px] text-[#86868B] font-bold uppercase pl-2">Testing Role:</span>
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
        <section className="flex-1 overflow-y-auto p-6 space-y-6">
          
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

          <div className="md:hidden bg-[#FF9500]/15 text-[#FF9500] font-semibold text-xs border border-[#FF9500]/30 p-3 rounded-xl mb-4">
            Notice: Mobile optimization is active. Access side modules via the sidebar or open from an executive viewport.
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                  <div className="h-60 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
    </div>
  );
}
