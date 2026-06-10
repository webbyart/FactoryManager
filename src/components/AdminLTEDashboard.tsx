import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Cpu, AlertTriangle, DollarSign, Layers, Bell, 
  TrendingUp, TrendingDown, Star, CheckCircle, PackageOpen, 
  ShoppingCart, RefreshCw, Zap
} from 'lucide-react';

interface AdminLTEDashboardProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function AdminLTEDashboard({ 
  dbState, 
  onRefresh, 
  onNotify, 
  userRole 
}: AdminLTEDashboardProps) {

  // 1. Calculations for KPIs
  const totalEmployees = dbState.employees?.length || 0;
  
  // Sales & earnings
  const totalRevenues = dbState.coa?.filter((ac: any) => ac.type === 'Revenue')
    .reduce((sum: number, ac: any) => sum + ac.balance, 0) || 0;
  
  const totalOperatingExpenses = dbState.coa?.filter((ac: any) => ac.type === 'Expense')
    .reduce((sum: number, ac: any) => sum + ac.balance, 0) || 0;
  
  const netEarnings = totalRevenues - totalOperatingExpenses;

  // Stock value
  const materialsValue = dbState.materials?.reduce((sum: number, m: any) => sum + (m.stockLevel * m.costPerUnit), 0) || 0;
  const productsValue = dbState.products?.reduce((sum: number, p: any) => sum + (p.stockLevel * p.costPrice), 0) || 0;
  const totalStockValue = materialsValue + productsValue;

  // Active production lots
  const activeMOQtySum = dbState.manufacturingOrders?.filter((m: any) => m.status === 'In Production' || m.status === 'Weighing' || m.status === 'Material Issued').length || 0;
  // Pending orders
  const pendingOrders = dbState.manufacturingOrders?.filter((m: any) => m.status === 'Material Reserved' || m.status === 'Draft').length || 0;
  // Low Stock
  const lowStockMaterials = dbState.materials?.filter((m: any) => m.stockLevel < m.minStock) || [];
  const lowStockProducts = dbState.products?.filter((p: any) => p.stockLevel < p.minStock) || [];
  const totalLowStockCount = lowStockMaterials.length + lowStockProducts.length;

  const totalCustomers = dbState.customers?.length || 0;

  // 2. Mock Chart Data
  const productionTrendData = [
    { name: 'ม.ค.', น้ำหอมผู้หญิง: 120, น้ำหอมพรีเมียม: 45, บอดี้มิสต์: 90 },
    { name: 'ก.พ.', น้ำหอมผู้หญิง: 150, น้ำหอมพรีเมียม: 50, บอดี้มิสต์: 100 },
    { name: 'มี.ค.', น้ำหอมผู้หญิง: 180, น้ำหอมพรีเมียม: 55, บอดี้มิสต์: 120 },
    { name: 'เม.ย.', น้ำหอมผู้หญิง: 140, น้ำหอมพรีเมียม: 40, บอดี้มิสต์: 110 },
    { name: 'พ.ค.', น้ำหอมผู้หญิง: 220, น้ำหอมพรีเมียม: 70, บอดี้มิสต์: 160 },
    { name: 'มิ.ย.', น้ำหอมผู้หญิง: activeMOQtySum * 10 || 250, น้ำหอมพรีเมียม: 80, บอดี้มิสต์: 180 }
  ];

  const salesTrendData = [
    { name: 'King Power', ยอดซื้อ: 420000, ค่าแนะนำ: 35000 },
    { name: 'Matsumoto', ยอดซื้อ: 280000, ค่าแนะนำ: 12000 },
    { name: 'Animac Spa', ยอดซื้อ: 150000, ค่าแนะนำ: 10000 },
    { name: 'B2C Online', ยอดซื้อ: 95000, ค่าแนะนำ: 5000 }
  ];

  const materialLevelData = dbState.materials ? dbState.materials.slice(0, 6).map((m: any) => ({
    name: m.name.substring(0, 15) + '...',
    'ระดับสต๊อก': m.stockLevel,
    'เกณฑ์ต่ำสุด': m.minStock
  })) : [];

  const PIE_COLORS = ['#6F42C1', '#E83E8C', '#198754', '#0DCAF0'];

  return (
    <div className="space-y-6" id="kpi-cosmetic-dashboard">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            แผงควบคุมหลักโรงงาน (Executive ERP Cockpit)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">ภาพรวมการทำงาน ดำเนินการตรวจสอบตามเกณฑ์ GMP &amp; ISO 22716 ถ้วน</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onRefresh();
            onNotify("สถานะและสถิติอัปเดตเรียลไทม์แล้ว", "info");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-white hover:bg-opacity-90 rounded-lg shadow-sm transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> ซิงค์ข้อมูลข้ามสายผลิต
        </button>
      </div>

      {/* KPI Cards Grid - Luxury AdminLTE 5 style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : งานผลิตวันนี้ */}
        <div id="kpi-card-production-today" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-primary/10 rounded-lg text-primary">
            <Cpu className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">งานผลิตวันนี้</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeMOQtySum} ล็อต</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded">OEE 84.5%</span>
            <span>ความเร็วคงที่</span>
          </div>
        </div>

        {/* KPI 2 : จำนวน Lot ที่กำลังผลิต */}
        <div id="kpi-card-active-lots" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-secondary/10 rounded-lg text-secondary">
            <Layers className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">บ่มผสมและรอบรรจุ</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{(dbState.manufacturingOrders?.filter((m: any)=>m.status==='Weighing'||m.status.includes('QC')).length || 0) + 1} ล็อตย่อย</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-[#0DCAF0] font-bold">
            <span className="bg-[#0DCAF0]/10 px-1 py-0.5 rounded">GMP Process</span>
            <span>ทวนสอบรหัส Lot เลขที่</span>
          </div>
        </div>

        {/* KPI 3 : Order รอดำเนินการ */}
        <div id="kpi-card-pending-orders" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-[#FFC107]/10 rounded-lg text-[#FFC107]">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">ออเดอร์รอดำเนินการ</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingOrders} คำขอสั่งผลิต</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold">
            <span className="bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded">รอจัดเบิกคลัง</span>
            <span>จองสารหอมแล้ว</span>
          </div>
        </div>

        {/* KPI 4 : มูลค่ารวมสต๊อกสินค้า */}
        <div id="kpi-card-stock-value" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">มูลค่าคลังทั้งหมด (Estimate)</p>
          <p className="text-xl sm:text-2xl font-bold text-[#198754] font-mono mt-1">฿{totalStockValue.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-[#198754] font-bold">
            <span className="bg-[#198754]/10 px-1 py-0.5 rounded">FIFO Flow</span>
            <span>เสถียรภาพคลัง 94%</span>
          </div>
        </div>

        {/* KPI 5 : วัตถุดิบขาด/ใกล้หมด */}
        <div id="kpi-card-low-stock" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-rose-100 dark:bg-rose-950/40 rounded-lg text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">วัตถุดิบขาดแคลน</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{totalLowStockCount} รายการเด่น</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-red-650 font-bold">
            <span className="bg-rose-100 dark:bg-rose-950 px-1 py-0.5 rounded">Critical Low</span>
            <span>ระบบออกใบ PR ออโต้</span>
          </div>
        </div>

        {/* KPI 6 : ยอดขายเดือนนี้ */}
        <div id="kpi-card-monthly-sales" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-[#0DCAF0]/10 rounded-lg text-[#0DCAF0]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">ยอดส่งออก/ยอดขาย</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-905 dark:text-white mt-1">฿{totalRevenues.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-[#0DCAF0] font-bold">
            <span className="bg-[#0DCAF0]/10 px-1 py-0.5 rounded">Target 80%</span>
            <span>บวก 12.4% MoM</span>
          </div>
        </div>

        {/* KPI 7 : แบรนด์ลูกค้าใหม่ */}
        <div id="kpi-card-new-customers" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-purple-100 dark:bg-purple-950/40 rounded-lg text-purple-600">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">แบรนด์ในเครือ (OEM)</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-905 dark:text-white mt-1">{totalCustomers} แบรนด์ยักษ์</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-purple-600 font-bold">
            <span className="bg-purple-100 dark:bg-purple-950 px-1 py-0.5 rounded">Active Brands</span>
            <span>ประวัติผลิตแน่น</span>
          </div>
        </div>

        {/* KPI 8 : กำไรสะสมสุทธิเดือนนี้ */}
        <div id="kpi-card-period-profits" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute top-2 right-2 p-2 bg-pink-100 dark:bg-pink-950/40 rounded-lg text-pink-600">
            <Star className="h-5 w-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">กำไรสุทธิผู้ประกอบการ</p>
          <p className="text-xl sm:text-2xl font-bold text-[#E83E8C] font-mono mt-1">฿{netEarnings.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-[#E83E8C] font-bold">
            <span className="bg-pink-100 dark:bg-pink-950 px-1 py-0.5 rounded">Net Earnings</span>
            <span>หักลบต้นทุนถังแล้ว</span>
          </div>
        </div>

      </div>

      {/* Charts Block - AdminLTE 5 Style Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Production Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <strong className="text-slate-800 dark:text-slate-100 text-sm block mb-1">แนวโน้มรอบกำลังผสมการแยกชั้นผลิต (Scent Maturation Trends)</strong>
          <span className="text-[10px] text-slate-400 block mb-4">ปริมาณก๊าซกลั่นตัวสะสมเทียบการบรรจุหัวน้ำหอมและแอลกอฮอล์กลั่น (หน่วย: ลิตร)</span>
          <div className="h-64" id="scent-maturation-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionTrendData}>
                <defs>
                  <linearGradient id="primaryColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F42C1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6F42C1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="secondaryColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E83E8C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#E83E8C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="น้ำหอมผู้หญิง" stroke="#6F42C1" fillOpacity={1} fill="url(#primaryColor)" />
                <Area type="monotone" dataKey="น้ำหอมพรีเมียม" stroke="#E83E8C" fillOpacity={1} fill="url(#secondaryColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Buyer Brand Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <strong className="text-slate-800 dark:text-slate-100 text-sm block mb-1">ยอดจัดซื้อแบ่งตามช่องทางและแบรนด์สำคัญ (OEM Revenue Breakdown)</strong>
          <span className="text-[10px] text-slate-400 block mb-4">สรุปรายได้สะสมบิลค้างจ่ายและบิลสำเร็จ (หน่วย: บาท)</span>
          <div className="h-64" id="oem-revenue-breakdown-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrendData}>
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="ยอดซื้อ" fill="#198754" radius={[4, 4, 0, 0]} name="ยอดส่งมอบออก (฿)" />
                <Bar dataKey="ค่าแนะนำ" fill="#0DCAF0" radius={[4, 4, 0, 0]} name="สืบอนุสิทธิสปอนเซอร์ (฿)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Real-Time Materials stock level check */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative lg:col-span-2">
          <strong className="text-slate-800 dark:text-slate-100 text-sm block mb-1">ตัวเช็คระดับสารเคมีและวัตถุดิบเครื่องสำอาง (Chemical Sourcing &amp; Raw Stocks)</strong>
          <span className="text-[10px] text-slate-400 block mb-4">ปริมาณวัตถุดิบและสารสะสมเปรียบเทียบกับพารามิเตอร์สต๊อกขั้นต่ำ (แดง = เสี่ยงหมดอายุ/ขาด)</span>
          <div className="h-64" id="raw-stocks-monitoring-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialLevelData}>
                <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ระดับสต๊อก" fill="#6F42C1" name="ปริมาณสำรองหน้าชั้น" />
                <Bar dataKey="เกณฑ์ต่ำสุด" fill="#DC3545" name="ค่าเตือนขั้นต่ำกะเกณฑ์" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
