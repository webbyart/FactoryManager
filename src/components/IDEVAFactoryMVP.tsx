import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Beaker, Archive, Landmark, ShoppingCart, Truck, Cpu, 
  Scale, ClipboardList, ShieldCheck, BarChart4, Heart, Search, Plus, 
  Trash2, Edit, ChevronRight, User, Key, LogOut, ArrowLeft, RefreshCw, 
  Check, AlertTriangle, QrCode, FileSpreadsheet, PlusCircle, Power, 
  Clock, CheckSquare, Download, MapPin, Eye, Bell, ShieldAlert
} from 'lucide-react';
import { printQRCodeLabel } from '../utils/labelPrinter';

interface IDEVAFactoryMVPProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

export default function IDEVAFactoryMVP({ 
  dbState, 
  onRefresh, 
  onNotify, 
  userRole, 
  setUserRole 
}: IDEVAFactoryMVPProps) {
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('admin_ideva');
  const [password, setPassword] = useState<string>('••••••••');
  
  // Navigation inside the Mobile Simulator App
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'products' | 'formulas' | 'materials' | 'inventory' | 'pr' | 'receiving' | 'mo' | 'issue' | 'production' | 'qc' | 'reports'>('dashboard');
  
  // Searching & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Detail views drawers
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [viewingFormula, setViewingFormula] = useState<any>(null);
  const [viewingMO, setViewingMO] = useState<any>(null);
  
  // Create / Edit states
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [isEditingProduct, setIsEditingProduct] = useState<any>(null);
  const [newProductData, setNewProductData] = useState({
    name: '',
    sku: '',
    category: 'น้ำหอมผู้หญิง (EDP)',
    minStock: 50,
    stockLevel: 100,
    unit: 'ขวด',
    costPrice: 350,
    sellPrice: 1850
  });

  // Custom Adding / Editing States for other MVP modules to make them fully functional
  // 1. Formula
  const [isAddingFormula, setIsAddingFormula] = useState<boolean>(false);
  const [newFormulaData, setNewFormulaData] = useState({
    productId: '',
    version: 'กลั่นผสมพิเศษ v1.0',
    items: [{ materialId: 'mat-001', quantity: 0.20 }, { materialId: 'mat-006', quantity: 0.80 }]
  });

  // 2. Raw Material
  const [isAddingRM, setIsAddingRM] = useState<boolean>(false);
  const [newRMData, setNewRMData] = useState({
    name: 'สารตรึงกลิ่นกุหลาบฝรั่งเศส (French Rose Fixative)',
    code: 'RAW-FIX-ROSE',
    category: 'Raw Material' as const,
    minStock: 100,
    stockLevel: 250,
    unit: 'ลิตร',
    costPerUnit: 1200
  });

  // 3. PR
  const [newPRData, setNewPRData] = useState({
    materialId: 'mat-001',
    quantity: 100,
    urgency: 'Medium' as const
  });

  // 4. Receiving
  const [newGRNData, setNewGRNData] = useState({
    poId: 'PO-2026-004',
    supplierId: 'supp-1',
    materialId: 'mat-001',
    quantityReceived: 100,
    lotNumber: 'LOT-ESS-玫瑰-' + Date.now().toString().slice(-4),
    expiryDate: '2028-12-31'
  });

  // 5. MO
  const [newMOData, setNewMOData] = useState({
    productId: 'prod-001',
    formulaId: 'form-001',
    quantityRequested: 100
  });

  // 6. Material Issue
  const [newIssueData, setNewIssueData] = useState({
    moId: 'mo-perfume-901',
    materialId: 'mat-006',
    quantity: 50
  });

  // 7. Production record
  const [newRecordData, setNewRecordData] = useState({
    moId: 'mo-perfume-901',
    processStep: 'ห้องแล็บบ่มกลิ่นอุณหภูมิ 12°C',
    remark: 'เร่งพัดลมลมเย็นขจัดสารแขวนลอยพรีเมียม'
  });

  // Custom states for Customer Ordered Production Flow (OEM) according to Video/Clip
  const [moSourceMode, setMoSourceMode] = useState<'general' | 'customer'>('customer');
  const [moCustomerId, setMoCustomerId] = useState<string>('cust-1');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [isCustomCustomer, setIsCustomCustomer] = useState<boolean>(false);
  const [moBatchSize, setMoBatchSize] = useState<number>(1);
  const [moBottleSizeMl, setMoBottleSizeMl] = useState<number>(100);

  // QR Code Generation details
  const [showQrCode, setShowQrCode] = useState<string | null>(null);

  // Auto-calculated Dashboard Stats from database
  const totalProducts = dbState.products?.length || 0;
  const totalMaterials = dbState.materials?.length || 0;
  const activeMOQtySum = dbState.manufacturingOrders?.filter((m: any) => m.status === 'In Production' || m.status === 'Material Issued').length || 0;
  const totalCompletedMOs = dbState.manufacturingOrders?.filter((m: any) => m.status === 'Released' || m.status === 'QC Approved' || m.status === 'Finished').length || 0;
  
  // LOW STOCK ALERTS
  const lowStockMaterials = dbState.materials?.filter((m: any) => m.stockLevel < m.minStock) || [];
  const lowStockProducts = dbState.products?.filter((p: any) => p.stockLevel < p.minStock) || [];
  const totalLowStockAlerts = lowStockMaterials.length + lowStockProducts.length;

  // Handles Role selection triggers logout of previous interface to ensure safety
  const handleRoleChange = (role: string) => {
    setUserRole(role);
    onNotify(`เปลี่ยนสถานะสิทธิ์จำลองระบบเป็น: ${role}`, "info");
  };

  // Handle Login simulation click
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      onNotify(`ลงชื่อเข้าใช้งานสำเร็จ ยินดีต้อนรับบทบาท: ${userRole}`, "info");
    } else {
      onNotify("กรุณากรอกชื่อผู้ใช้งาน", "warning");
    }
  };

  // CRUD API Calls via the generic /api/generic/ endpoints
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.sku) {
      onNotify("กรุณากรอกรหัส SKU และชื่อสินค้าให้ครบถ้วน", "warning");
      return;
    }

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'products',
          item: {
            ...newProductData,
            minStock: Number(newProductData.minStock),
            stockLevel: Number(newProductData.stockLevel),
            costPrice: Number(newProductData.costPrice),
            sellPrice: Number(newProductData.sellPrice)
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onNotify(`เพิ่มสินค้าสำเร็จ: ${data.item.name} (${data.item.sku})`, "info");
        onRefresh();
        setIsAddingProduct(false);
        // Reset inputs
        setNewProductData({
          name: '',
          sku: '',
          category: 'น้ำหอมผู้หญิง (EDP)',
          minStock: 50,
          stockLevel: 100,
          unit: 'ขวด',
          costPrice: 350,
          sellPrice: 1850
        });
      } else {
        onNotify(data.error || "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล", "error");
      }
    } catch {
      onNotify("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ในการบันทึก", "error");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProduct.name || !isEditingProduct.sku) return;

    try {
      const response = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'products',
          item: {
            ...isEditingProduct,
            minStock: Number(isEditingProduct.minStock),
            stockLevel: Number(isEditingProduct.stockLevel),
            costPrice: Number(isEditingProduct.costPrice),
            sellPrice: Number(isEditingProduct.sellPrice)
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onNotify(`แก้ไขข้อมูลสินค้า ${data.item.sku} สำเร็จ`, "info");
        onRefresh();
        setIsEditingProduct(null);
      } else {
        onNotify(data.error || "เกิดข้อผิดพลาดในการตรวจสอบ", "error");
      }
    } catch {
      onNotify("การเชื่อมต่อล้มเหลว", "error");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า ${name}?`)) return;

    try {
      const response = await fetch('/api/generic/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'products',
          id: id
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onNotify(`ลบสินค้า ${name} สำเร็จแล้ว`, "warning");
        onRefresh();
        if (viewingProduct?.id === id) setViewingProduct(null);
      } else {
        onNotify(data.error || "เกิดข้อผิดพลาดในการลบข้อมูล", "error");
      }
    } catch {
      onNotify("ไม่สามารถลบข้อมูลผ่านคลาวด์", "error");
    }
  };

  // Other quick creation flows for MVP requirements:
  // Create Formula Master
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormulaData.productId) {
      onNotify("กรุณาเลือกสินค้าสำเร็จรูป", "warning");
      return;
    }
    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'formulas',
          item: {
            productId: newFormulaData.productId,
            version: newFormulaData.version,
            status: 'Approved',
            approvedBy: dbState.employees?.[0]?.name || 'กิตติพงษ์ เลิศอัครเดช',
            items: newFormulaData.items
          }
        })
      });
      const data = await response.json();
      if (response.ok) {
        onNotify(`บันทึกสูตรผลิตสากลรุ่น ${newFormulaData.version} เรียบร้อย`, "info");
        onRefresh();
        setIsAddingFormula(false);
      }
    } catch {
      onNotify("บันทึกสูตรผลิตขัดข้อง", "error");
    }
  };

  // Create Raw Material
  const handleCreateRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'materials',
          item: {
            ...newRMData,
            minStock: Number(newRMData.minStock),
            stockLevel: Number(newRMData.stockLevel),
            costPerUnit: Number(newRMData.costPerUnit)
          }
        })
      });
      if (response.ok) {
        onNotify(`เพิ่มพิกัดวัตถุดิบและโหลดขึ้นคลังความหอมระดับวิสาหกิจสำเร็จ`, "info");
        onRefresh();
        setIsAddingRM(false);
      }
    } catch {
      onNotify("เกิดข้อผิดพลาดในการบันทึกสารสกัดใหม่", "error");
    }
  };

  // Create Purchase Request
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/procurement/pr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: newPRData.materialId,
          quantity: Number(newPRData.quantity),
          urgency: newPRData.urgency
        })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`ส่งเอกสารใบเสนอความต้องการ PR สำเร็จ: รหัส ${data.pr.id}`, "info");
        onRefresh();
      }
    } catch {
      onNotify("ขัดข้องในการสร้างคำร้องจัดซื้อ", "error");
    }
  };

  // Create Goods Receipt (GRN)
  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'goodsReceipts',
          item: {
            id: 'grn-' + Date.now().toString().slice(-4),
            poId: newGRNData.poId,
            supplierId: newGRNData.supplierId,
            materialId: newGRNData.materialId,
            quantityReceived: Number(newGRNData.quantityReceived),
            lotNumber: newGRNData.lotNumber,
            expiryDate: newGRNData.expiryDate,
            status: 'Pending QC',
            createdAt: new Date().toISOString()
          }
        })
      });
      if (res.ok) {
        onNotify(`รับมอบสารสกัดสำเร็จ และส่งเข้าตรวจแล็บ QC (Lot: ${newGRNData.lotNumber})`, "warning");
        onRefresh();
      }
    } catch {
      onNotify("ไม่สามารถรับ GRN เข้าคลังได้", "error");
    }
  };

  // Create Manufacturing Order (MO) บันทึกใบหลัก
  const handleCreateMO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let custId = null;
      let custName = null;
      if (moSourceMode === 'customer') {
        if (isCustomCustomer) {
          custName = customCustomerName || "ลูกค้าทั่วไป (OEM)";
          custId = "cust-custom";
        } else {
          const selectedCust = dbState.customers?.find((c: any) => c.id === moCustomerId);
          custId = moCustomerId;
          custName = selectedCust ? selectedCust.name : "บริษัท คิงพาวเวอร์ บิวตี้ ดิสทริบิวชั่น จำกัด";
        }
      }

      const res = await fetch('/api/mo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newMOData.productId,
          formulaId: newMOData.formulaId,
          quantityRequested: Number(newMOData.quantityRequested),
          customerId: custId,
          customerName: custName,
          batchSize: Number(moBatchSize),
          notes: custName ? `ผลิตพิเศษลูกค้าสำเร็จ: ขนาดยิงบรรจุ ${moBottleSizeMl}ml ต่อขวด` : "การผลิตคลังปกติ"
        })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`เปิดใบคำสั่งผลิตน้ำหอมสำเร็จ! MO ID: ${data.mo.id} (${custName || "คลังปกติ"})`, "info");
        onRefresh();
      } else {
        onNotify(data.error, "error");
      }
    } catch {
      onNotify("ส่งข้อมูลผลิตล้มเหลว", "error");
    }
  };

  // Material Issue (เบิกวัตถุดิบ)
  const handleIssueMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate issue by adding event logs or updating stock level
    const targetMat = dbState.materials?.find((m: any) => m.id === newIssueData.materialId);
    if (!targetMat) return;
    if (targetMat.stockLevel < newIssueData.quantity) {
      onNotify(`สาร ${targetMat.name} ในสต็อกไม่พอจัดเบิก! (เหลือ ${targetMat.stockLevel})`, "error");
      return;
    }

    try {
      const updatedStock = Number(targetMat.stockLevel) - Number(newIssueData.quantity);
      // Let's use standard update generic endpoint
      await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'materials',
          item: { id: targetMat.id, stockLevel: updatedStock }
        })
      });
      onNotify(`เบิกวัตถุดิบ ${targetMat.name} จำนวน ${newIssueData.quantity} ${targetMat.unit} จ่ายเข้าใบผลิตใบสำคัญเรียบร้อย`, "info");
      onRefresh();
    } catch {
      onNotify("เกิดข้อผิดพลาดในการเบิกจ่าย", "error");
    }
  };

  // Fast Update MO status
  const handleMoStatusChange = async (moId: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/mo/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moId, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`ปรับสเตจงานพิมพ์ MO: ${moId} -> ${nextStatus} เรียบร้อย`, "info");
        onRefresh();
        if (viewingMO?.id === moId) {
          setViewingMO({ ...viewingMO, status: nextStatus });
        }
      }
    } catch {
      onNotify("เปลี่ยนสถานะผลิตล้มเหลว", "error");
    }
  };

  // QC inspection pass/fail resolution
  const handleQCResolve = async (inspectionId: string, result: 'Passed' | 'Failed') => {
    try {
      const res = await fetch('/api/qc/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId, status: result })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`ด่านตรวจ QC อนุมัติล็อตแล้ว ผลลัพธ์: ${result === 'Passed' ? 'ผ่านเกณฑ์ (GMP-PASS)' : 'ตกเกณฑ์ (REJECT)'}`, "info");
        onRefresh();
      }
    } catch {
      onNotify("บันทึกเกณฑ์ QC ขัดข้อง", "error");
    }
  };

  // Simulate PDF report download
  const handleDownloadReport = (title: string) => {
    onNotify(`ดาวน์โหลดเอกสารรายงาน: ${title} เรียบร้อย (ไฟล์รายงานหลัก ERP-Export)`, "info");
  };

  // Filtered lists
  const filteredProducts = (dbState.products || []).filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-950 p-1 md:p-4 rounded-[40px] shadow-2xl border-8 border-slate-800 relative overflow-hidden flex flex-col h-[780px] text-slate-100 font-sans" id="mobile-phone-device-frame">
      
      {/* 📱 Mobile UI Notch / Top Status Bar */}
      <div className="w-full h-6 shrink-0 flex justify-between items-center px-6 text-[11px] text-slate-400 font-mono tracking-tighter select-none bg-slate-950 z-20">
        <span>07:52 <span className="text-[10px] text-indigo-400 font-sans ml-1">IDEVA OS</span></span>
        <div className="w-24 h-4 bg-slate-900 absolute left-1/2 transform -translate-x-1/2 top-1 rounded-b-xl border border-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-800"></div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-green-400 animate-pulse font-mono block">5G ●</span>
          <span>99% 🔋</span>
        </div>
      </div>

      {/* Main Container screen wrapper */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950 rounded-[28px] overflow-hidden">
        
        {/* --- SCREEN 0: OUTSIDE PHONE LOGIN SCREEN (If not logged in) --- */}
        {!isLoggedIn ? (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 animate-fade-in text-slate-200">
            <div className="my-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl flex items-center justify-center text-white shadow-lg animate-bounce">
                  <Cpu className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-white mt-4">IDEVA Factory OS</h2>
                <p className="text-xs text-slate-400">ระบบควบคุมส่วนผลิตอุตสาหกรรมในมือคุณ (MVP Mobile)</p>
              </div>

              {/* Login UI Box */}
              <form onSubmit={handleLogin} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">ชื่อผู้เข้าใช้งาน (Username)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="เช่น admin_ideva"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">รหัสผ่านลับ (Credentials)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">เลือกบทบาททำงานประจำวัน (RBAC Access)</label>
                  <select
                    value={userRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Admin">Admin (All Access)</option>
                    <option value="Production">Production Supervisor</option>
                    <option value="QC">QC Lab Chemist</option>
                    <option value="R&D">BOM Chemist (R&D)</option>
                    <option value="Management">Management Desk</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Power className="h-4 w-4" /> ลงชื่อเข้าทำงานสู่ระบบ (Secure Login)
                </button>
              </form>

              <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-center text-[10px] text-indigo-400 leading-relaxed font-sans">
                ระบบจัดการอุตสาหกรรมเครื่องหอมสากล IDEVA Group จำกัด <br />
                มาตรฐานอ้างอิง GMP / ISO-22716 Cosmetics Digital Certification
              </div>
            </div>

            <p className="text-center text-[9px] text-slate-600 font-mono">
              IP TRACE: CONNECTED CORE API CONTAINER
            </p>
          </div>
        ) : (
          /* --- INNER APP SHELL AND NAVIGATORS --- */
          <div className="flex-1 flex flex-col overflow-hidden text-slate-100 bg-slate-950">
            
            {/* IN-APP HEADER BAR */}
            <header className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-10">
              <div className="flex items-center gap-2">
                {currentScreen !== 'dashboard' ? (
                  <button 
                    type="button" 
                    onClick={() => { setSearchQuery(''); setCurrentScreen('dashboard'); }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl">
                    <Cpu className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold tracking-tight text-white">
                    {currentScreen === 'dashboard' ? 'IDEVA Factory OS' : 
                     currentScreen === 'products' ? '📦 Product Master' : 
                     currentScreen === 'formulas' ? '🧪 Formula Master' : 
                     currentScreen === 'materials' ? '📥 Raw Material' : 
                     currentScreen === 'inventory' ? '🏪 Inventory Hub' : 
                     currentScreen === 'pr' ? '🛒 Purchase Request' : 
                     currentScreen === 'receiving' ? '🚚 Goods Receiving' : 
                     currentScreen === 'mo' ? '🏭 Manufacturing Orders' : 
                     currentScreen === 'issue' ? '⚖️ Material Issues' : 
                     currentScreen === 'production' ? '⚙️ Process Records' : 
                     currentScreen === 'qc' ? '✅ QC Standards' : '📊 Reports Center'}
                  </h3>
                  <span className="text-[9px] text-slate-400 block font-mono">Role: {userRole}</span>
                </div>
              </div>

              {/* Top Panel Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { onRefresh(); onNotify("อัปเดตแคชฐานข้อมูลเซิร์ฟเวอร์", "info"); }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
                  title="รีเฟรสข้อมูลกรรไกร"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoggedIn(false); onNotify("ลงชื่อออกเรียบร้อยแล้ว", "info"); }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            {/* SCREEN SCROLL BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16 [scrollbar-width:none]">
              
              {/* --- SCREEN 1: APP MOBILE DASHBOARD --- */}
              {currentScreen === 'dashboard' && (
                <div className="space-y-4 animate-fade-in select-none">
                  
                  {/* APP SUBHEADER GREENTING */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-3xl border border-indigo-900/30 flex justify-between items-center shadow-lg">
                    <div className="space-y-1">
                      <p className="text-stone-300 text-[11px]">สถานะผลิตน้ำหอมวันนี้</p>
                      <h4 className="text-white font-black text-sm tracking-tight">ไลน์หลักคุมกวนเคมีเสถียร</h4>
                      <p className="text-emerald-400 font-mono text-[9px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> 
                        {dbState.manufacturingOrders?.length || 0} MOs loaded
                      </p>
                    </div>
                    <div className="p-2 bg-indigo-900/30 text-indigo-400 rounded-2xl border border-indigo-500/20">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  {/* MVP STATS CARDS BLOCK (6 Metrics specified in prompt!) */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* 1. จำนวนสินค้าสำเร็จรูป (SKUs) */}
                    <div 
                      onClick={() => setCurrentScreen('products')}
                      className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-1 shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">จำนวนสินค้า</span>
                        <Package className="h-4 w-4 text-indigo-400" />
                      </div>
                      <p className="text-2xl font-black text-white leading-tight font-mono">{totalProducts} <span className="text-xs text-slate-400">SKUs</span></p>
                      <p className="text-[9px] text-slate-400">คลิกปรับสต็อกสินค้า</p>
                    </div>

                    {/* 2. วัตถุดิบคงเหลือ */}
                    <div 
                      onClick={() => setCurrentScreen('materials')}
                      className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-1 shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">วัตถุดิบคงเหลือ</span>
                        <Archive className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-black text-white leading-tight font-mono">{totalMaterials} <span className="text-xs text-slate-400">รายการ</span></p>
                      <p className="text-[9px] text-emerald-400">รวมสารและเคมีบ่มหรู</p>
                    </div>

                    {/* 3. งานผลิตวันนี้ */}
                    <div 
                      onClick={() => setCurrentScreen('mo')}
                      className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-1 shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">งานผลิตวันนี้</span>
                        <Cpu className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-2xl font-black text-white leading-tight font-mono">
                        {(dbState.manufacturingOrders || []).filter((m: any) => m.startDate === '2026-06-03' || m.startDate === '2026-06-01').length} <span className="text-xs text-slate-400">งาน</span>
                      </p>
                      <p className="text-[9px] text-slate-400">คุมสเตจปรุง/บรรจุขวด</p>
                    </div>

                    {/* 4. งานผลิตกำลังดำเนินการ */}
                    <div 
                      onClick={() => setCurrentScreen('mo')}
                      className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer space-y-1 shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">กำลังดำเนินการ</span>
                        <PlusCircle className="h-4 w-4 text-sky-400" />
                      </div>
                      <p className="text-2xl font-black text-white leading-tight font-mono">{activeMOQtySum} <span className="text-xs text-slate-400">MOs</span></p>
                      <p className="text-[9px] text-sky-400">กำลังปั๊มเร่งสกัดไอ</p>
                    </div>

                    {/* 5. งานผลิตเสร็จแล้ว (Released / Closed) */}
                    <div 
                      onClick={() => setCurrentScreen('mo')}
                      className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/60 transition-all cursor-pointer space-y-1 shadow-md bg-gradient-to-br from-slate-900 to-emerald-950/20"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">งานผลิตเสร็จแล้ว</span>
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-black text-emerald-400 leading-tight font-mono">{totalCompletedMOs} <span className="text-xs text-slate-400 font-sans">เสร็จ</span></p>
                      <p className="text-[9px] text-emerald-500 font-medium">สแกนปิดใบสั่งเรียบร้อย</p>
                    </div>

                    {/* 6. แจ้งเตือนคลังต่ำต่ำ (Red Warning Box) */}
                    <div 
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('All');
                        setCurrentScreen('materials');
                        onNotify("เปิดตัวคัดกรองสารเคมีที่มีสต็อกวิกฤต", "warning");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 shadow-md ${
                        totalLowStockAlerts > 0 ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">แจ้งเตือน Stock ต่ำ</span>
                        <ShieldAlert className={`h-4 w-4 ${totalLowStockAlerts > 0 ? 'text-rose-500' : 'text-slate-500'}`} />
                      </div>
                      <p className="text-2xl font-black leading-tight font-mono text-rose-400">
                        {totalLowStockAlerts} <span className="text-xs text-slate-400 font-sans">จุด</span>
                      </p>
                      <p className="text-[9px] text-rose-300">สารสกัดต่ำกว่าจุดจัดสั่ง PR</p>
                    </div>

                  </div>

                  {/* BENTO APP INTERACTIVE MAIN MENU SELECTION (11 Programs of Phase 1 OS) */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">เมนูแผงควบคุมหลัก IDEVA OS</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      
                      {/* [1] Product Master */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('products')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-xl mt-0.5"><Package className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">📦 Product Master</strong>
                          <span className="text-[9.5px] text-slate-400">จัดการข้อมูลสินค้า</span>
                        </div>
                      </button>

                      {/* [2] Formula Master */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('formulas')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-xl mt-0.5"><Beaker className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">🧪 Formula Master</strong>
                          <span className="text-[9.5px] text-slate-400">สูตรการผลิต/BOM</span>
                        </div>
                      </button>

                      {/* [3] Raw Material */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('materials')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-emerald-600/10 text-emerald-400 rounded-xl mt-0.5"><Archive className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">📥 สารสกัดวัตถุดิบ</strong>
                          <span className="text-[9.5px] text-slate-400">สต็อกเคมีภัณฑ์พรีเมียม</span>
                        </div>
                      </button>

                      {/* [4] คลังสินค้า Inventory */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('inventory')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-slate-800 text-slate-300 rounded-xl mt-0.5"><Landmark className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">🏪 คลังและพิกัดถัง</strong>
                          <span className="text-[9.5px] text-slate-400">คุมโลเคชั่นถังบ่มผสม</span>
                        </div>
                      </button>

                      {/* [5] Purchase Request PR */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('pr')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-orange-600/20 text-orange-400 rounded-xl mt-0.5"><ShoppingCart className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">🛒 ขอสั่งจัดซื้อ PR</strong>
                          <span className="text-[9.5px] text-slate-400">คำร้องเบิกวัตถุดิบ</span>
                        </div>
                      </button>

                      {/* [6] Goods Receiving (GRN) */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('receiving')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-orange-600/20 text-orange-400 rounded-xl mt-0.5"><Truck className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">🚚 ตรวจรับของ GRN</strong>
                          <span className="text-[9.5px] text-slate-400">บันทึกรับสสารเข้าล็อต</span>
                        </div>
                      </button>

                      {/* [7] Manufacturing Order MO */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('mo')}
                        className="p-3 bg-slate-930 hover:bg-slate-850 rounded-2xl border border-indigo-900/50 text-left flex items-start gap-2.5 transition-all text-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950/15"
                      >
                        <span className="p-1.5 bg-indigo-600/35 text-indigo-400 rounded-xl mt-0.5 animate-pulse"><Cpu className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-black block text-indigo-300">🏭 ใบสั่งผลิต MO</strong>
                          <span className="text-[9.5px] text-slate-400 font-medium">หัวใจด่านกลั่นผสม</span>
                        </div>
                      </button>

                      {/* [8] Material Issue */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('issue')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-emerald-600/10 text-emerald-400 rounded-xl mt-0.5"><Scale className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">⚖️ การเบิกจ่ายสาร</strong>
                          <span className="text-[9.5px] text-slate-400">Issue วัตถุดิบเข้างาน</span>
                        </div>
                      </button>

                      {/* [9] Production Record */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('production')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-slate-800 text-slate-300 rounded-xl mt-0.5"><ClipboardList className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">⚙️ ประวัติขั้นตอน</strong>
                          <span className="text-[9.5px] text-slate-400">บันทึกความร้อน/เวลากวน</span>
                        </div>
                      </button>

                      {/* [10] QC Inspection */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('qc')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200"
                      >
                        <span className="p-1.5 bg-emerald-600/10 text-emerald-400 rounded-xl mt-0.5"><ShieldCheck className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">✅ ตรวจแล็บบอดี้ QC</strong>
                          <span className="text-[9.5px] text-slate-400">วิเคราะห์ GC-MS กลิ่น</span>
                        </div>
                      </button>

                      {/* [11] Reports */}
                      <button 
                        type="button" 
                        onClick={() => setCurrentScreen('reports')}
                        className="p-3 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left flex items-start gap-2.5 transition-all text-slate-200 col-span-2"
                      >
                        <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-xl mt-0.5"><BarChart4 className="h-4 w-4" /></span>
                        <div>
                          <strong className="text-xs font-semibold block">📊 รายงานวิเคราะห์สถิติทั่วทั้งระบบ</strong>
                          <span className="text-[9.5px] text-slate-400"> OEE, Inventory, QC Inspection Reports ประจำฝ่ายบริหาร</span>
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* QUICK SYSTEM FEEDBACK LOGS */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ปูมบันทึกความเคลื่อนไหวอุตสาหกรรม (Audit Logs)</h5>
                    <div className="space-y-1.5 text-[9.5px] max-h-24 overflow-y-auto">
                      {(dbState.auditLogs || []).slice(0, 4).map((log: any) => (
                        <div key={log.id} className="text-slate-400 leading-snug">
                          <span className="text-indigo-400">[{log.timestamp?.split(' ')?.[1] || '08:30'}]</span> {log.action}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* --- SCREEN 2: 📦 PRODUCT MASTER (MANAGE SKU CRUD) --- */}
              {currentScreen === 'products' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* SEARCH & ADD PRODUCT HEADER */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="พิมพ์รหัส SKU หรือชื่อกลิ่นน้ำหอม..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(true)}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shrink-0"
                    >
                      <Plus className="h-4 w-4" /> เพิ่มสินค้า SKU
                    </button>
                  </div>

                  {/* CATEGORY SWIPE SELECTOR */}
                  <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {['All', 'น้ำหอมผู้หญิง (EDP)', 'น้ำหอมพรีเมียมเข้มข้น', 'บอดี้มิสต์บางเบา', 'น้ำหอมโคโลญจน์'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${
                          categoryFilter === cat 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* ADD NEW PRODUCT SKU DRAWER/FORM MODAL */}
                  {isAddingProduct && (
                    <form onSubmit={handleCreateProduct} className="bg-slate-900 p-4 rounded-2xl border border-indigo-500/30 space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <strong className="text-xs text-white">📦 บันทึกสินค้าสำเร็จรูปชิ้นใหม่ (Product Add)</strong>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingProduct(false)} 
                          className="text-xs text-rose-400 underline"
                        >
                          ยกเลิก
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] text-slate-400">ชื่อกลิ่นและสเกลน้ำหอม (Product Name)</label>
                          <input 
                            type="text" 
                            required
                            value={newProductData.name}
                            onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300"
                            placeholder="กลิ่น Chérie Floral EDP 100ml"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">รหัส SKU จัดสต็อก</label>
                          <input 
                            type="text" 
                            required
                            value={newProductData.sku}
                            onChange={(e) => setNewProductData({...newProductData, sku: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-mono"
                            placeholder="PFM-CHFL-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">หมวดหมู่น้ำหอม</label>
                          <select 
                            value={newProductData.category}
                            onChange={(e) => setNewProductData({...newProductData, category: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-sans"
                          >
                            <option value="น้ำหอมผู้หญิง (EDP)">น้ำหอมผู้หญิง (EDP)</option>
                            <option value="น้ำหอมพรีเมียมเข้มข้น">น้ำหอมพรีเมียมเข้มข้น</option>
                            <option value="บอดี้มิสต์บางเบา">บอดี้มิสต์บางเบา</option>
                            <option value="น้ำหอมโคโลญจน์">น้ำหอมโคโลญจน์</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">หน่วยนับ</label>
                          <input 
                            type="text" 
                            required
                            value={newProductData.unit}
                            onChange={(e) => setNewProductData({...newProductData, unit: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300"
                            placeholder="ขวด / กล่อง"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">ต้นทุนฝ่ายผลิต (บาท)</label>
                          <input 
                            type="number" 
                            required
                            value={newProductData.costPrice}
                            onChange={(e) => setNewProductData({...newProductData, costPrice: Number(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">ราคาขายส่งหน้าบัตร (บาท)</label>
                          <input 
                            type="number" 
                            required
                            value={newProductData.sellPrice}
                            onChange={(e) => setNewProductData({...newProductData, sellPrice: Number(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300"
                          />
                        </div>

                        <div className="space-y-1 font-sans">
                          <label className="text-[10px] text-slate-400">สต็อกตั้งต้น (Initial Stock)</label>
                          <input 
                            type="number" 
                            required
                            value={newProductData.stockLevel}
                            onChange={(e) => setNewProductData({...newProductData, stockLevel: Number(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-mono"
                          />
                        </div>

                        <div className="space-y-1 font-sans">
                          <label className="text-[10px] text-slate-400">จุดแจ้งเตือนต่ำสุด (Min Stock)</label>
                          <input 
                            type="number" 
                            required
                            value={newProductData.minStock}
                            onChange={(e) => setNewProductData({...newProductData, minStock: Number(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-mono"
                          />
                        </div>

                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg"
                      >
                        ✔ บันทึกข้อมูลและซิงค์คลาวด์มอนิเตอร์
                      </button>
                    </form>
                  )}

                  {/* EDIT PRODUCT SKU DRAWER/FORM MODAL */}
                  {isEditingProduct && (
                    <form onSubmit={handleUpdateProduct} className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/30 space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <strong className="text-xs text-white">✏ แก้ไขสินค้า: {isEditingProduct.sku}</strong>
                        <button 
                          type="button" 
                          onClick={() => setIsEditingProduct(null)} 
                          className="text-xs text-rose-400 underline"
                        >
                          ยกเลิก
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] text-slate-400">ชื่อกลิ่นน้ำหอม</label>
                          <input 
                            type="text" 
                            required
                            value={isEditingProduct.name}
                            onChange={(e) => setIsEditingProduct({...isEditingProduct, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-300"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">ราคาขายส่ง (บาท)</label>
                          <input 
                            type="number" 
                            required
                            value={isEditingProduct.sellPrice}
                            onChange={(e) => setIsEditingProduct({...isEditingProduct, sellPrice: Number(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-300"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-sans">คลังสารเคมีคงเหลือ (Qty)</label>
                          <input 
                            type="number" 
                            required
                            value={isEditingProduct.stockLevel}
                            onChange={(e) => setIsEditingProduct({...isEditingProduct, stockLevel: Number(e.target.value) || 0})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-300 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg"
                      >
                        ✔ บันทึกการแก้ไขข้อมูลเรียบร้อย
                      </button>
                    </form>
                  )}

                  {/* PRODUCTS LIST TABLE (Old school interactive grid but responsive) */}
                  <div className="space-y-2">
                    {filteredProducts.length === 0 ? (
                      <div className="p-8 bg-slate-900 rounded-2xl text-center border border-slate-800 text-slate-500 text-xs">
                        ไม่พบน้ำหอมหรือรหัสสินค้าที่คุณค้นหา
                      </div>
                    ) : (
                      filteredProducts.map((p: any) => {
                        const isUnderStock = p.stockLevel < p.minStock;
                        return (
                          <div 
                            key={p.id} 
                            className={`p-3 bg-slate-900 border rounded-2xl flex items-center justify-between gap-3 text-xs transition-transform hover:scale-101 ${
                              isUnderStock ? 'border-amber-500/40' : 'border-slate-800'
                            }`}
                          >
                            <div 
                              className="flex-1 cursor-pointer space-y-1"
                              onClick={() => setViewingProduct(p)}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[9px] font-black tracking-widest text-[#86868B] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{p.sku}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  isUnderStock ? 'bg-amber-950 text-amber-400 border border-amber-800/40 font-black animate-pulse' : 'bg-indigo-950 text-indigo-400'
                                }`}>
                                  {isUnderStock ? '⚠️ สต็อกวิกฤต' : p.category}
                                </span>
                              </div>
                              <h5 className="font-extrabold text-white text-xs leading-tight">{p.name}</h5>
                              <div className="flex gap-4 font-mono text-[10px] text-slate-400">
                                <span>คลัง: <strong className="text-slate-200">{p.stockLevel}</strong>/{p.minStock} {p.unit}</span>
                                <span>ราคา: <strong className="text-emerald-400">฿{p.sellPrice || p.sellPrice.toLocaleString()}</strong></span>
                              </div>
                            </div>

                            {/* Direct Action triggers */}
                            <div className="flex items-center gap-1.5 shrink-0 select-none">
                              <button
                                type="button"
                                onClick={() => { setSearchQuery(p.sku); setViewingProduct(p); }}
                                className="p-1.5 bg-slate-800 hover:bg-indigo-950 hover:text-indigo-400 rounded-lg text-slate-300"
                                title="สแกนส่ง QR คลื่นจำลอง"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingProduct(p)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                                title="แก้ไข"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg"
                                title="ลบ"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* DRAWER VIEW DETAILS MODAL WITH QR-CODE */}
                  {viewingProduct && (
                    <div className="p-5 bg-slate-900 border-2 border-indigo-500 rounded-3xl animate-fade-in space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <div>
                          <p className="text-[10px] tracking-widest text-[#86868B] font-mono leading-none">{viewingProduct.sku}</p>
                          <h4 className="text-white font-black text-sm">{viewingProduct.name}</h4>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setViewingProduct(null)} 
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Display specs layout */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-0.5">
                          <span className="text-[9px] text-[#86868B]">หมวดหมู่:</span>
                          <p className="font-semibold text-slate-200">{viewingProduct.category}</p>
                        </div>
                        <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-0.5 font-mono">
                          <span className="text-[9px] text-[#86868B] font-sans">ต้นทุน vs ราคาขาย:</span>
                          <p className="font-bold text-emerald-400">฿{viewingProduct.costPrice} / ฿{viewingProduct.sellPrice}</p>
                        </div>
                        <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-0.5 font-sans col-span-2">
                          <p className="text-[10px] text-slate-400">สถานะ GMP สากลโรงงาน:</p>
                          <p className="text-emerald-400 font-bold text-[10px]">✔ ปราศจากการปนเปื้อนโลหะหนัก (Cosmetic standard ISO22716)</p>
                        </div>
                      </div>

                      {/* QR Code Graphic Section */}
                      <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                        <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">รหัส QR Code ติดป้ายกล่องพัสดุน้ำหอมสำเร็จ</p>
                        
                        {/* Interactive dynamic SVG based QrCode! Looks incredibly sharp and renders immediately */}
                        <div className="bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg animate-pulse" id="qrcode-mock-svg">
                          <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" rx="10" fill="white"/>
                            {/* Outer Frame Top Left */}
                            <path d="M10 10H30V30H10V10ZM14 14V26H26V14H14Z" fill="#1D1D1F"/>
                            <rect x="18" y="18" width="4" height="4" fill="#0071E3"/>
                            {/* Outer Frame Top Right */}
                            <path d="M70 10H90V30H70V10ZM74 14V26H86V14H74Z" fill="#1D1D1F"/>
                            <rect x="78" y="18" width="4" height="4" fill="#0071E3"/>
                            {/* Outer Frame Bottom Left */}
                            <path d="M10 70H30V90H10V70ZM14 74V86H26V74H14Z" fill="#1D1D1F"/>
                            <rect x="18" y="78" width="4" height="4" fill="#0071E3"/>
                            {/* Internal Matrix Noise representation for beautiful realistic look */}
                            <rect x="38" y="14" width="6" height="6" fill="#1D1D1F"/>
                            <rect x="44" y="24" width="10" height="4" fill="#1D1D1F"/>
                            <rect x="38" y="38" width="8" height="8" fill="#1D1D1F"/>
                            <rect x="54" y="38" width="12" height="6" fill="#1D1D1F"/>
                            <rect x="70" y="38" width="6" height="12" fill="#1D1D1F"/>
                            <rect x="14" y="38" width="16" height="4" fill="#1D1D1F"/>
                            <rect x="38" y="54" width="4" height="18" fill="#1D1D1F"/>
                            <rect x="54" y="54" width="12" height="12" fill="#1D1D1F"/>
                            <rect x="74" y="54" width="12" height="4" fill="#1D1D1F"/>
                            <rect x="74" y="62" width="12" height="12" fill="#1D1D1F"/>
                            <rect x="54" y="74" width="12" height="4" fill="#1D1D1F"/>
                            <rect x="14" y="48" width="6" height="6" fill="#1D1D1F"/>
                            <rect x="38" y="80" width="18" height="10" fill="#1D1D1F"/>
                          </svg>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">SKU_REF: {viewingProduct.sku}</p>
                        
                        <div className="flex flex-col gap-1.5 w-full mt-2">
                          <button
                            type="button"
                            onClick={() => printQRCodeLabel('product', viewingProduct)}
                            className="text-[11px] bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-md"
                          >
                            🖨️ พิมพ์ป้ายฉลากสินค้า & QR (Direct Print)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadReport(viewingProduct.sku + "-Label")}
                            className="text-[10px] bg-slate-900 border border-slate-800 text-slate-350 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
                          >
                            <Download className="h-3 w-3" /> ดาวน์โหลดรายงานสเกล PDF-Trace
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
                    <span>แหล่องข้อมูลจำลองเชื่อมโยงฐานข้อมูลหลัก</span>
                    <span className="text-emerald-400 font-bold font-mono">GMP-ONLINE</span>
                  </div>

                </div>
              )}

              {/* --- SCREEN 3: 🧪 FORMULA MASTER --- */}
              {currentScreen === 'formulas' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400">ตารางสูตรการผลิต (BOM Header & Detail)</p>
                    <button
                      onClick={() => setIsAddingFormula(prev => !prev)}
                      className="px-2.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> เปิดสูตรใหม่
                    </button>
                  </div>

                  {isAddingFormula && (
                    <form onSubmit={handleCreateFormula} className="bg-slate-900 p-4 rounded-2xl border border-indigo-500/30 space-y-3 font-sans">
                      <strong className="text-xs text-white block">สูตรการผลิตทางวิศวกรรม</strong>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">เลือกสินค้าปลายทาง</label>
                        <select 
                          value={newFormulaData.productId} 
                          onChange={(e) => setNewFormulaData({ ...newFormulaData, productId: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-sans"
                          required
                        >
                          <option value="">-- เลือกกลิ่นน้ำหอม --</option>
                          {dbState.products?.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">เวอร์ชัน / ชื่อสูตรบ่มผสม</label>
                        <input 
                          type="text" 
                          value={newFormulaData.version}
                          onChange={(e) => setNewFormulaData({ ...newFormulaData, version: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                      >
                        บดบันทึกสูตร Master
                      </button>
                    </form>
                  )}

                  {/* Formulas list view */}
                  <div className="space-y-3">
                    {(dbState.formulas || []).map((f: any) => {
                      const relateProduct = dbState.products?.find((p: any) => p.id === f.productId);
                      return (
                        <div 
                          key={f.id} 
                          className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400 border border-slate-850">BOM ID: {f.id}</span>
                              <h4 className="text-xs font-bold text-white mt-1">รุ่นสูตร: {f.version}</h4>
                              <p className="text-[10px] text-slate-400 leading-none mt-1">สินค้า: {relateProduct ? relateProduct.name : 'N/A'}</p>
                            </div>
                            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">อนุมัติใช้จริง</span>
                          </div>

                          {/* Detail of Boms */}
                          <div className="p-2 bg-slate-950 rounded-xl space-y-1.5 border border-slate-850">
                            <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">รายละเอียดส่วนผสมสาร (Formula Detail)</span>
                            {f.items?.map((item: any, id: number) => {
                              const mat = dbState.materials?.find((m: any) => m.id === item.materialId);
                              return (
                                <div key={id} className="flex justify-between items-center text-[10.5px] font-mono border-b border-slate-900 pb-1 text-slate-300">
                                  <span className="truncate max-w-[180px]">{mat ? mat.name : item.materialId}</span>
                                  <span className="font-extrabold text-indigo-400">{(item.quantity * 100).toFixed(1)}% <span className="text-slate-500 font-normal">ของปริมาตร</span></span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- SCREEN 4: 📥 RAW MATERIAL --- */}
              {currentScreen === 'materials' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400">วัตถุดิบคลังสารสกัดสารหอมและเบส (Raw Materials)</p>
                    <button
                      onClick={() => setIsAddingRM(prev => !prev)}
                      className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                    >
                      + เพิ่มวัตถุดิบ
                    </button>
                  </div>

                  {isAddingRM && (
                    <form onSubmit={handleCreateRawMaterial} className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                      <strong className="text-xs text-white block">เพิ่มประวัติเคมีดิบนำเข้าสต็อก</strong>
                      <div className="space-y-2 text-xs">
                        <input 
                          type="text" 
                          placeholder="ชื่อสารสกัดตั้งต้น (เช่น French Jasmine Absolute Oil)" 
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                          value={newRMData.name}
                          onChange={(e) => setNewRMData({...newRMData, name: e.target.value})}
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="รหัสโค้ด (เช่น RAW-ESS-JASM)" 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                            value={newRMData.code}
                            onChange={(e) => setNewRMData({...newRMData, code: e.target.value})}
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="หน่วยนับ (เช่น ลิตร)" 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                            value={newRMData.unit}
                            onChange={(e) => setNewRMData({...newRMData, unit: e.target.value})}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" 
                            placeholder="Current Stock" 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                            value={newRMData.stockLevel}
                            onChange={(e) => setNewRMData({...newRMData, stockLevel: Number(e.target.value)})}
                            required
                          />
                          <input 
                            type="number" 
                            placeholder="Min Safety Level" 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                            value={newRMData.minStock}
                            onChange={(e) => setNewRMData({...newRMData, minStock: Number(e.target.value)})}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold">บันทึกข้อมูลทางเคมี</button>
                    </form>
                  )}

                  {/* Materials List */}
                  <div className="space-y-2">
                    {(dbState.materials || []).map((m: any) => {
                      const isLow = m.stockLevel < m.minStock;
                      return (
                        <div key={m.id} className={`p-3 bg-slate-900 rounded-2xl border ${isLow ? 'border-amber-500/40' : 'border-slate-850'} flex flex-col gap-2`}>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1">
                              <span className="text-[9px] font-mono text-slate-500 tracking-wider block bg-slate-950 py-0.5 px-2 rounded w-fit">{m.code}</span>
                              <span className="text-xs font-bold text-white block">{m.name}</span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                สต็อกปัจจุบัน: <span className={isLow ? 'text-amber-400 font-black' : 'text-emerald-400 font-bold'}>{m.stockLevel}</span> / ต่ำสุด: {m.minStock} {m.unit}
                              </div>
                            </div>
                            <div className="shrink-0 pl-2 text-right space-y-1">
                              {isLow ? (
                                <span className="inline-block bg-amber-950 text-amber-400 px-2 py-0.5 rounded-xl text-[9px] font-extrabold uppercase animate-pulse">สต็อกวิกฤต</span>
                              ) : (
                                <span className="inline-block bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-xl text-[9px] font-bold">ปกติ</span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-2">
                            <button
                              type="button"
                              onClick={() => printQRCodeLabel('material', m)}
                              className="text-[9.5px] bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-indigo-400 font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                            >
                              🖨️ พิมพ์ฉลาก Lot เคมีภัณฑ์ (Print)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- SCREEN 5: 🏪 INVENTORY (คลังสินค้าและพิกัด) --- */}
              {currentScreen === 'inventory' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-slate-400">รหัสชั้นวางและโลเคชั่นเก็บรักษา (Inventory & Tanks)</p>
                  
                  {/* Mock locations layout */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                        <strong className="text-indigo-400 block text-[11px]">ชั้นเก็บน้ำมันดิบ Zone A</strong>
                        <span className="text-[9.5px] bg-[#34C759]/10 text-green-400 px-1 py-0.5 rounded font-mono">OK</span>
                      </div>
                      <p className="text-[10px] text-slate-400">จัดเก็บสารสกัด Rose Centric Base และ Agarwood Oud พรีเมียม ที่อุณหภูมิควบคุม 4°C เสมอ</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1 font-sans">
                        <strong className="text-indigo-400 block text-[11px]">พื้นที่วัตถุถังบ่มบอดี้ Zone B</strong>
                        <span className="text-[9.5px] bg-[#34C759]/10 text-green-400 px-1 py-0.5 rounded font-mono">OK</span>
                      </div>
                      <p className="text-[10px] text-slate-400">ควบคุมถังกวนระดับอุตสาหกรรม และแอลกอฮอล์ตรึง Solvent ถนอมกลิ่นสสารกลั่น</p>
                    </div>
                  </div>

                  {/* List items with location representation */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400">คลังพิกัดจัดเก็บสารผสม (Chemical Locations)</h5>
                    {(dbState.materials || []).slice(0, 5).map((m: any, idx: number) => {
                      const locationCode = `ZONE-TANK-0${idx + 1}`;
                      return (
                        <div key={m.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono text-[9px] text-[#86868B] block">{m.code}</span>
                            <span className="font-bold text-white block truncate max-w-[180px]">{m.name}</span>
                          </div>
                          <div className="text-right font-mono text-[10px] space-y-0.5">
                            <span className="block font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/40 text-center">{locationCode}</span>
                            <span className="text-slate-400 block text-[9.5px]">จำนวน: {m.stockLevel} {m.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- SCREEN 6: 🛒 PURCHASE REQUEST (PR) --- */}
              {currentScreen === 'pr' && (
                <div className="space-y-4 animate-fade-in">
                  <form onSubmit={handleCreatePR} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3 font-sans">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">เปิดเอกสารคำร้องจัดซื้อสารเคมี (PR Creator)</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">เลือกวัตถุดิบและฝาบรรจุ</label>
                      <select 
                        value={newPRData.materialId}
                        onChange={(e) => setNewPRData({ ...newPRData, materialId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-300 font-sans"
                      >
                        {dbState.materials?.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.code} | {m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">ปริมาณคำร้อง</label>
                        <input 
                          type="number" 
                          value={newPRData.quantity}
                          onChange={(e) => setNewPRData({ ...newPRData, quantity: Number(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-indigo-300"
                        />
                      </div>
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] text-slate-400">ความเร่งด่วน</label>
                        <select
                          value={newPRData.urgency}
                          onChange={(e) => setNewPRData({...newPRData, urgency: e.target.value as any})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-indigo-300 font-sans"
                        >
                          <option value="Low">ปกติ (Low)</option>
                          <option value="Medium">เร่งด่วน (Medium)</option>
                          <option value="High">ฉุกเฉิน (High)</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg">✔ ยอมรับและเปิดเอกสาร PR</button>
                  </form>

                  {/* PR List */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400">ประวัติการขอเสนอสั่ง PR ค้าส่ง</h5>
                    {(dbState.purchaseRequests || []).map((pr: any) => {
                      const mat = dbState.materials?.find((m: any) => m.id === pr.materialId);
                      return (
                        <div key={pr.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl text-xs space-y-1.5 flex justify-between items-center">
                          <div>
                            <span className="font-mono text-[9px] text-[#86868B] block">{pr.id}</span>
                            <span className="font-bold text-white block">{mat ? mat.name : pr.materialId}</span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              จำนวนเสนอ: <strong className="text-slate-200">{pr.quantity}</strong> {mat ? mat.unit : ''} | ระดับ: {pr.urgency}
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              pr.status === 'Ordered' || pr.status === 'Approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                            }`}>{pr.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- SCREEN 7: 🚚 GOODS RECEIVING (GRN) --- */}
              {currentScreen === 'receiving' && (
                <div className="space-y-4 animate-fade-in">
                  <form onSubmit={handleCreateGRN} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">บันทึกรับสสารเข้าล็อตสินค้า GRN</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">เลือกประเภทวัตถุดิบนำส่งสำเร็จ</label>
                      <select 
                        value={newGRNData.materialId}
                        onChange={(e) => setNewGRNData({ ...newGRNData, materialId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-indigo-300"
                      >
                        {dbState.materials?.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.code} | {m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      <input 
                        type="text" 
                        placeholder="รหัส Lot ตัวอย่าง"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" 
                        value={newGRNData.lotNumber}
                        onChange={(e) => setNewGRNData({ ...newGRNData, lotNumber: e.target.value })}
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="จำนวนรับมอบ" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" 
                        value={newGRNData.quantityReceived}
                        onChange={(e) => setNewGRNData({ ...newGRNData, quantityReceived: Number(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black">✔ ตรวจรับเข้าคลังพักคอย</button>
                  </form>

                  {/* Goods receipts table */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400">ประวัติบันทึกนำส่ง GRN</h5>
                    {(dbState.goodsReceipts || []).map((gr: any) => {
                      const mat = dbState.materials?.find((m: any) => m.id === gr.materialId);
                      return (
                        <div key={gr.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono text-[9px] text-[#86868B] block">GRN: {gr.id} | PO: {gr.poId || 'PO-091'}</span>
                            <strong className="text-white block">{mat ? mat.name : gr.materialId}</strong>
                            <p className="text-[10px] font-mono text-slate-400">Lot: {gr.lotNumber} | รับมอบ: {gr.quantityReceived} {mat?.unit}</p>
                          </div>
                          <div>
                            <span className="bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-black">{gr.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- SCREEN 8: 🏭 MANUFACTURING ORDER (MO) --- */}
              {currentScreen === 'mo' && (
                <div className="space-y-4 animate-fade-in font-sans">
                  
                  {/* SEGMENT SELECTION */}
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMoSourceMode('customer')}
                      className={`py-1.5 rounded-lg text-center text-[11px] font-bold transition-all ${
                        moSourceMode === 'customer' 
                          ? 'bg-[#0071E3] text-white shadow-sm' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🛒 ลูกค้า OEM สั่งผลิตพิเศษ
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoSourceMode('general')}
                      className={`py-1.5 rounded-lg text-center text-[11px] font-bold transition-all ${
                        moSourceMode === 'general' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🏭 ใบสำคัญสั่งผลิตทั่วไป
                    </button>
                  </div>

                  <form onSubmit={handleCreateMO} className="bg-slate-900 p-4 rounded-3xl border border-indigo-900/40 space-y-3 font-sans">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-indigo-300">
                        {moSourceMode === 'customer' ? '✨ ฟอร์มลูกค้าสั่งผลิตพิเศษ' : '📋 ปล่อยคำสั่งขับผลิตทั่วไป'}
                      </strong>
                      <span className="text-[9px] text-indigo-400 bg-indigo-950 border border-indigo-800/40 px-2 py-0.5 rounded-full font-bold">
                        BPR Master Match
                      </span>
                    </div>

                    {/* Customer Selection Block */}
                    {moSourceMode === 'customer' && (
                      <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-slate-400">เลือกบัญชีคู่ค้าสั่งทำ (Customer Select)</label>
                          <button
                            type="button"
                            onClick={() => setIsCustomCustomer(!isCustomCustomer)}
                            className="text-[9px] text-indigo-400 hover:underline"
                          >
                            {isCustomCustomer ? '← รายชื่อในฐานข้อมูล' : '+ ใส่ข้อมูลลูกค้าใหม่'}
                          </button>
                        </div>

                        {isCustomCustomer ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={customCustomerName}
                              onChange={(e) => setCustomCustomerName(e.target.value)}
                              placeholder="กรอกชื่อผู้สั่งผลิต/สปา/แบรนด์เครื่องสำอาง..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                              required
                            />
                            <p className="text-[9px] text-[#86868B]">ข้อมูลจะถูกบันทึกลงปูมบันทึก OEM รายสั่งทันที</p>
                          </div>
                        ) : (
                          <select
                            value={moCustomerId}
                            onChange={(e) => setMoCustomerId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-200 font-sans"
                          >
                            {(dbState.customers || []).map((c: any) => (
                              <option key={c.id} value={c.id}>{c.code} | {c.name}</option>
                            ))}
                          </select>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] text-slate-500">ขนาดบรรจุขวด (ml)</label>
                            <select
                              value={moBottleSizeMl}
                              onChange={(e) => setMoBottleSizeMl(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                            >
                              <option value={50}>50 ml</option>
                              <option value={100}>100 ml</option>
                              <option value={150}>150 ml</option>
                            </select>
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] text-slate-500">ขนาดแบทช์ผลิต (Batch)</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={moBatchSize}
                              onChange={(e) => setMoBatchSize(Math.max(1, Number(e.target.value) || 1))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs text-center text-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">เลือกกลิ่นหอมสำเร็จ (Finished SKU)</label>
                      <select 
                        value={newMOData.productId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const f = dbState.formulas?.find((fm: any) => fm.productId === pid);
                          setNewMOData({ ...newMOData, productId: pid, formulaId: f ? f.id : 'form-001' });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-300"
                      >
                        {dbState.products?.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">รหัสเวอร์ชันสูตร (BOM Auto)</label>
                        <input 
                          type="text" 
                          value={newMOData.formulaId}
                          readOnly
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-500 font-mono text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">ปริมาณสั่งผลิต (ขวดสำเร็จ)</label>
                        <input 
                          type="number" 
                          value={newMOData.quantityRequested}
                          onChange={(e) => setNewMOData({ ...newMOData, quantityRequested: Number(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-indigo-300 font-mono"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC FORMULATION MATH BREAKDOWN (BOM CALCULATOR ACCORDING TO VIDEO) */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400">การประเมินสูตรและสารตั้งต้น (BOM Checker)</span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          ปริมาตรลิตรสกัดรวม: <strong className="text-white">
                            {Number(((Number(newMOData.quantityRequested) * Number(moSourceMode === 'customer' ? moBottleSizeMl : 100)) / 1000).toFixed(2))} ลิตร
                          </strong>
                        </span>
                      </div>

                      {/* Ingredients requirement list */}
                      <div className="space-y-1.5">
                        {(() => {
                          const selectedProdId = newMOData.productId || (dbState.products?.[0]?.id || 'prod-001');
                          const activeFormula = dbState.formulas?.find((f: any) => f.productId === selectedProdId) || dbState.formulas?.[0];
                          const bottleSize = moSourceMode === 'customer' ? moBottleSizeMl : 100;
                          const totalVolumeLiters = Number(((Number(newMOData.quantityRequested) * Number(bottleSize)) / 1000).toFixed(2));
                          
                          const ingList = activeFormula?.items?.map((item: any) => {
                            const mat = dbState.materials?.find((m: any) => m.id === item.materialId);
                            // adjust scaling factor based on ratio
                            const qtyNeeded = Number((totalVolumeLiters * item.quantity).toFixed(2));
                            const hasEnough = mat ? Number(mat.stockLevel) >= qtyNeeded : false;
                            return {
                              id: item.materialId,
                              name: mat ? mat.name : item.materialId,
                              unit: mat ? mat.unit : 'ลิตร',
                              qtyNeeded,
                              percent: (item.quantity * 100).toFixed(0),
                              currentStock: mat ? Number(mat.stockLevel) : 0,
                              hasEnough
                            };
                          }) || [];

                          const shortItemsList = ingList.filter(i => !i.hasEnough);

                          return (
                            <>
                              <div className="space-y-1 max-h-24 overflow-y-auto">
                                {ingList.map((ing, i) => (
                                  <div key={i} className="flex justify-between items-center text-[10px] font-mono p-1 border-b border-slate-900 pb-1 text-slate-300">
                                    <span className="truncate max-w-[120px]" title={ing.name}>✨ {ing.name} ({ing.percent}%)</span>
                                    <div className="flex gap-2 items-center">
                                      <span className="text-slate-400">{ing.qtyNeeded} {ing.unit}</span>
                                      <span className={`px-1 rounded text-[8px] font-black uppercase ${
                                        ing.hasEnough 
                                          ? 'bg-emerald-950/80 text-emerald-400' 
                                          : 'bg-rose-950/80 text-rose-400'
                                      }`}>
                                        {ing.hasEnough ? 'พร้อม ✅' : 'ขาด ⚠️'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {shortItemsList.length > 0 && (
                                <div className="p-2 bg-amber-950/20 border border-amber-800/30 rounded-xl space-y-1.5 text-center mt-1">
                                  <p className="text-[9.5px] text-amber-300">⚠️ มีสสารสำหรับหม้อต้มของลูกค้าไม่เพียงพอในคลังสูญญากาศหลัก</p>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      let prCount = 0;
                                      for (const ing of shortItemsList) {
                                        const shortQty = Number((ing.qtyNeeded * 1.5).toFixed(2));
                                        try {
                                          await fetch('/api/generic/create', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              table: 'purchaseRequests',
                                              item: {
                                                id: `pr-auto-${Date.now().toString().slice(-4)}`,
                                                materialId: ing.id,
                                                quantity: shortQty,
                                                urgency: 'High',
                                                status: 'Draft',
                                                requestedBy: `ใบประเมิน MO คิว ${dbState.manufacturingOrders?.length + 1}`,
                                                createdAt: new Date().toISOString().split('T')[0]
                                              }
                                            })
                                          });
                                          prCount++;
                                        } catch (e) {}
                                      }
                                      if (prCount > 0) {
                                        onNotify(`สร้างความต้องการลดขาดสะสม PR จัดซื้อสารค้ำจุน ${prCount} ใบเสร็จแล้ว!`, "info");
                                        onRefresh();
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[9px] font-extrabold"
                                  >
                                    ⚡ ปรับจัดตั้งใบเสนอซื้อ PR ทันควัน
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-[#0071E3] hover:bg-[#147ce5] text-white rounded-xl text-xs font-black shadow-lg">
                      🏭 ยอมรับและปล่อยใบขับคำสั่งผลิต (Create & Pipeline First)
                    </button>
                  </form>

                  {/* MO List with Interactive Steps Track SIMULATOR */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 pl-1">บอร์ดคุมประตูข้ามขั้นตอนจริง (Live Factory Desk)</h5>
                    
                    {(dbState.manufacturingOrders || []).map((mo: any) => {
                      const relateProduct = dbState.products?.find((p: any) => p.id === mo.productId);
                      const isOem = !!mo.customerName;
                      
                      return (
                        <div key={mo.id} className="p-3 bg-slate-900 border border-slate-800 rounded-3xl text-xs space-y-3 shadow-md">
                          
                          {/* MO TOP META BAR */}
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[9px] text-[#86868B]">MO_ID: {mo.id}</span>
                                {isOem ? (
                                  <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded text-[8.5px] font-extrabold max-w-[130px] truncate" title={mo.customerName}>
                                    🏷️ OEM: {mo.customerName}
                                  </span>
                                ) : (
                                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[8.5px] font-bold">
                                    📦 คลังค้ำจุน
                                  </span>
                                )}
                              </div>
                              <strong className="text-white block mt-1 leading-snug">{relateProduct ? relateProduct.name : 'Finished Perfume'}</strong>
                            </div>
                            
                            <select
                              value={mo.status}
                              onChange={(e) => handleMoStatusChange(mo.id, e.target.value)}
                              className="text-[9.5px] bg-slate-950 text-indigo-300 font-extrabold rounded-lg border border-slate-800 px-2 py-1 outline-none cursor-pointer"
                            >
                              <option value="Created">Created (ขึ้นใบ)</option>
                              <option value="Material Reserved">Material Reserved (จองสาร)</option>
                              <option value="Material Issued">Material Issued (ชั่งตัวออกจ่าย)</option>
                              <option value="In Production">In Production (คุมกวนและบ่ม)</option>
                              <option value="Finished Goods QC">Finished Goods QC (คุมเฝ้าแล็บ)</option>
                              <option value="Released">Released ( closed ขึ้นสำเร็จรูป)</option>
                            </select>
                          </div>

                          {/* MO STATS AND LABELS */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-slate-950 rounded-2xl font-mono text-slate-400">
                            <div>
                              <span>ปริมาณสั่ง: <strong className="text-slate-200">{mo.quantityRequested} ขวด</strong></span>
                              {mo.batchSize > 1 && <span className="block text-indigo-400">ขนาด: {mo.batchSize} แบทช์</span>}
                            </div>
                            <div className="text-right space-y-1">
                              <button
                                type="button"
                                onClick={() => setViewingMO(mo)}
                                className="text-indigo-400 hover:underline flex items-center gap-0.5 ml-auto text-[9.5px]"
                              >
                                <QrCode className="h-3.5 w-3.5 inline text-indigo-500 animate-pulse" /> พิมพ์ฉลากคุมถัง
                              </button>
                            </div>
                          </div>

                          {/* 🎬 VISUAL STEPPER TRACKER (FAST PROGRESS INDICATOR) */}
                          <div className="space-y-1 bg-slate-950/40 p-2 rounded-2xl border border-slate-850/40 select-none">
                            <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                              <span>สเตจขับสารประตูโรงงานจริง</span>
                              <span className="text-indigo-400">{mo.status}</span>
                            </div>
                            <div className="relative flex justify-between items-center pt-1 pb-1">
                              {/* Step lines background */}
                              <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
                              
                              {[
                                { status: 'Created', icon: '📝' },
                                { status: 'Material Reserved', icon: '🔒' },
                                { status: 'Material Issued', icon: '⚖️' },
                                { status: 'In Production', icon: '🌡️' },
                                { status: 'Finished Goods QC', icon: '🔬' },
                                { status: 'Released', icon: '🏆' }
                              ].map((step, idx) => {
                                const statesOrder = ['Created', 'Material Reserved', 'Material Issued', 'In Production', 'Finished Goods QC', 'Released'];
                                const currentIndex = statesOrder.indexOf(mo.status);
                                const stepIndex = statesOrder.indexOf(step.status);
                                const isActive = stepIndex <= currentIndex;
                                const isCurrent = step.status === mo.status;

                                return (
                                  <div key={idx} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sans transition-all duration-300 ${
                                      isCurrent 
                                        ? 'bg-[#0071E3] text-white scale-110 shadow-[0_0_8px_rgba(0,113,227,0.6)] font-bold' 
                                        : isActive 
                                          ? 'bg-emerald-600 text-white' 
                                          : 'bg-slate-850 text-slate-400'
                                    }`} title={step.status}>
                                      {step.icon}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ⚡ ACTIVE OPERATIONS STEPS SIMULATOR CONSOLE (THE MOVIE CLIP SIMULATION!) */}
                          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-850 p-3 rounded-2xl space-y-2">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#86868B] block">แผงเกตคุมระดับคนเลอทสเต็บ (Operations console)</span>
                            
                            {mo.status === 'Created' && (
                              <div className="space-y-1.5">
                                <p className="text-[10.5px] text-slate-300">ขั้นตอนถัดไปคือการ <strong className="text-indigo-400">จองสสารตั้งต้น</strong> ในระบบคลังดิบ เพื่อกันสต็อกไม่ให้สูตรอื่นดึงไปใช้ชั่วคราว</p>
                                <button
                                  type="button"
                                  onClick={() => handleMoStatusChange(mo.id, 'Material Reserved')}
                                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10.5px] font-black"
                                >
                                  🔒 ดำเนินจองสสารสำรองในคลังทันที
                                </button>
                              </div>
                            )}

                            {mo.status === 'Material Reserved' && (
                              <div className="space-y-1.5">
                                <p className="text-[10.5px] text-slate-300">ปุ่มควิกชั่งตวง: <strong className="text-emerald-400">จ่ายเบิกสารสกัดเข้าหม้อ</strong> เมื่อพนักงานตวงน้ำหอมพร้อม ระบบจะหักสต็อกเคมีภัณฑ์จริงอัตโนมัติ!</p>
                                <button
                                  type="button"
                                  onClick={() => handleMoStatusChange(mo.id, 'Material Issued')}
                                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 animate-pulse"
                                >
                                  ⚖️ ตวงเสร็จสิ้นและชั่งตัดสต็อก (Auto Material Issue)
                                </button>
                              </div>
                            )}

                            {mo.status === 'Material Issued' && (
                              <div className="space-y-1.5">
                                <p className="text-[10.5px] text-slate-300">สสารเคมีคราฟได้รับการตัดจ่ายแล้ว ขณะนี้พร้อมเทลงตู้อบในแล็บและ <strong className="text-indigo-400">เริ่มกวนผสมปั่น Scent Blending</strong></p>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    // auto post a production step record
                                    try {
                                      await fetch('/api/generic/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          table: 'productionRecords',
                                          item: {
                                            id: `rec-auto-${Date.now().toString().slice(-4)}`,
                                            moId: mo.id,
                                            processStep: `กวน Homogenizer หม้อเหล็กแก้ว 150 ตลบ (Oem spec: ${mo.quantityRequested} ขวด)`,
                                            remark: `อุณหภูมิบ่มผสม 12องศา สลัดสารตะกอนเรียบร้อย`,
                                            operator: 'นายธนวัชร รัตนเวชศาสน์ (หัวหน้าคุมกวน)'
                                          }
                                        })
                                      });
                                    } catch (e) {}
                                    handleMoStatusChange(mo.id, 'In Production');
                                  }}
                                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10.5px] font-black"
                                >
                                  🌡️ เปิดระบบกวนผสมและรายงาน BPR ทันที
                                </button>
                              </div>
                            )}

                            {mo.status === 'In Production' && (
                              <div className="space-y-1.5">
                                <p className="text-[10.5px] text-slate-300">ตู้อบกวนผสมทำงานครบตามประมวลผลเวลาแล้ว ลำดับถัดไปคือการส่งตัวอย่างให้ <strong className="text-pink-400">ด่านตรวจสอบคุณภาพ (Lab QC)</strong></p>
                                <button
                                  type="button"
                                  onClick={() => handleMoStatusChange(mo.id, 'Finished Goods QC')}
                                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10.5px] font-black"
                                >
                                  🔬 ส่งเข้ากลุ่มแล็บ และยิงตรวจตรวจสอบ QC
                                </button>
                              </div>
                            )}

                            {mo.status === 'Finished Goods QC' && (
                              <div className="space-y-1.5">
                                <p className="text-[10.5px] text-slate-300">น้ำยาอยู่ในคิวพักคอยแล็บตรวจ คุณสามารถสลับไปเมนูสแกนตรวจแล็บ QC หรือใช้สิทธิ์ <strong className="text-emerald-400">อนุมัติ GMP ด่วน</strong></p>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCurrentScreen('qc')}
                                    className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] text-center font-bold"
                                  >
                                    🔍 แผงตรวจสูตร QC
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      // Fast pass the QC inspection for this MO reference if exists
                                      const targetQC = dbState.qcInspections?.find((q: any) => q.referenceId === mo.id);
                                      if (targetQC) {
                                        try {
                                          await fetch('/api/generic/update', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              table: 'qcInspections',
                                              item: { id: targetQC.id, status: 'Passed' }
                                            })
                                          });
                                        } catch (e) {}
                                      }
                                      handleMoStatusChange(mo.id, 'Released');
                                    }}
                                    className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] text-center font-black animate-pulse"
                                  >
                                    🏆 ดำเนินอนุมัติผ่าน (GMP-Passed)
                                  </button>
                                </div>
                              </div>
                            )}

                            {mo.status === 'Released' && (
                              <div className="text-center py-1 text-slate-400 text-[10px] space-y-1 select-text">
                                <p className="text-emerald-400 font-bold font-sans">🎉 ประตูกลั่นเสร็จสมบูรณ์ 100% (Released)</p>
                                <p className="text-[9px]">คลังเพิ่มน้ำยาพร้อมส่งมอบลูกค้าแล้ว บัญชีถูกลงแคลคูลัสกำไรลงสมุดรายวันเรียบร้อย!</p>
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic MO interactive drawer */}
                  {viewingMO && (
                    <div className="p-4 bg-slate-900 border-2 border-[#0071E3] rounded-3xl space-y-3 animate-fade-in text-xs font-sans">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <strong className="text-white">ฉลากติดภาชนะบรรจุชั่งถัง (BPR/MO Tracking)</strong>
                        <button type="button" onClick={() => setViewingMO(null)} className="text-slate-400 hover:text-white">✕</button>
                      </div>
                      <p className="text-[10px] text-slate-400">สแกนรหัสเพื่อดูประวัติการเบิกสารและเช็คความร้อนตู้อบ:</p>
                      
                      <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-950">
                        {/* Dynamic SVG with MO number embedded for realistic display */}
                        <div className="bg-white p-2">
                          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" rx="10" fill="white"/>
                            {/* Inner QR patterns */}
                            <path d="M10 10H30V30H10V10ZM14 14V26H26V14H14Z" fill="#1D1D1F"/>
                            <path d="M70 10H90V30H70V10ZM74 14V26H86V14H74Z" fill="#1D1D1F"/>
                            <path d="M10 70H30V90H10V70ZM14 74V86H26V74H14Z" fill="#1D1D1F"/>
                            <rect x="38" y="14" width="8" height="8" fill="#1D1D1F"/>
                            <rect x="54" y="24" width="6" height="14" fill="#1D1D1F"/>
                            <rect x="38" y="44" width="12" height="6" fill="#1D1D1F"/>
                            <rect x="54" y="44" width="12" height="12" fill="#1D1D1F"/>
                            <rect x="74" y="44" width="10" height="6" fill="#1D1D1F"/>
                            <rect x="14" y="38" width="16" height="4" fill="#1D1D1F"/>
                            <rect x="38" y="60" width="4" height="14" fill="#1D1D1F"/>
                            <rect x="54" y="64" width="12" height="6" fill="#1D1D1F"/>
                            <rect x="74" y="60" width="10" height="10" fill="#1D1D1F"/>
                            <rect x="18" y="18" width="4" height="4" fill="#0071E3"/>
                            <rect x="78" y="18" width="4" height="4" fill="#0071E3"/>
                            <rect x="18" y="78" width="4" height="4" fill="#0071E3"/>
                          </svg>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200 mt-1">MEMBER: {viewingMO.id}</span>
                      </div>
                      
                      {/* Direct API Printing controls */}
                      <button 
                        type="button" 
                        onClick={() => {
                          const pObj = dbState.products?.find((p: any) => p.id === viewingMO.productId);
                          printQRCodeLabel('batch', {
                            id: viewingMO.id,
                            productName: pObj ? pObj.name : viewingMO.productId,
                            formulaId: viewingMO.formulaId,
                            quantityRequested: viewingMO.quantityRequested,
                            startDate: viewingMO.startDate
                          });
                        }}
                        className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md text-center inline-flex items-center justify-center gap-1.5"
                      >
                        🖨️ พิมพ์ป้ายล็อตมาตรฐาน GMP (Print API)
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleDownloadReport(viewingMO.id + "-Barrel-Tag")}
                        className="w-full py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-850 rounded-xl text-center"
                      >
                        📥 ดาวน์โหลดรายงานฉบับย่อ PDF
                      </button>

                      {/* Interactive Mobile Timeline Traceability */}
                      <div className="border-t border-slate-800 pt-3 space-y-2 mt-2">
                        <strong className="text-white text-[10px] block font-mono uppercase tracking-wider text-[#A1A1A6]">🔎 เส้นทางการผลิต (Batch Timeline):</strong>
                        
                        <div className="relative border-l border-slate-700 pl-3 ml-1.5 space-y-3.5 mt-1.5">
                          {/* Step 1 */}
                          <div className="relative">
                            <span className={`absolute -left-[16.5px] top-0.5 h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                              ['Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(viewingMO.status)
                                ? 'bg-emerald-500 border-emerald-600'
                                : 'bg-[#1D1D1F] border-slate-600'
                            }`}></span>
                            <div className="text-[10px]">
                              <p className="font-bold text-slate-100">1. จองและจัดเบิกตั้งต้น (Material Issued)</p>
                              <p className="text-slate-400 text-[9px]">สูตรผสมประจำตัวสากล: {viewingMO.formulaId}</p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="relative">
                            <span className={`absolute -left-[16.5px] top-0.5 h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                              ['Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(viewingMO.status)
                                ? 'bg-emerald-500 border-emerald-600'
                                : 'bg-[#1D1D1F] border-slate-600'
                            }`}></span>
                            <div className="text-[10px]">
                              <p className="font-bold text-slate-100">2. ชั่งตวงตักวัตถุดิบ (Ingredient Weighing)</p>
                              <p className="text-slate-400 text-[9px]">ทวนสอบสเกล Calibration เรียบร้อย ±0.001g</p>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="relative">
                            <span className={`absolute -left-[16.5px] top-0.5 h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                              ['In Production', 'Packaging', 'Finished Goods QC', 'Released'].includes(viewingMO.status)
                                ? 'bg-emerald-500 border-emerald-600'
                                : 'bg-[#1D1D1F] border-slate-600'
                            }`}></span>
                            <div className="text-[10px]">
                              <p className="font-bold text-slate-100">3. เครื่องจักรผสมและต้มบ่ม (Vessel telemetry)</p>
                              <p className="text-slate-400 text-[9px]">คงมาตรฐานสูญญากาศและอุณหภูมิ 18°C เสมอ</p>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="relative">
                            <span className={`absolute -left-[16.5px] top-0.5 h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                              ['Finished Goods QC', 'Released'].includes(viewingMO.status)
                                ? 'bg-emerald-500 border-emerald-600'
                                : 'bg-[#1D1D1F] border-slate-600'
                            }`}></span>
                            <div className="text-[10px]">
                              <p className="font-bold text-slate-100">4. ผล QC สมาคมเครื่องหอม (QC Verification)</p>
                              <p className="text-slate-400 text-[9px]">
                                {['Finished Goods QC', 'Released'].includes(viewingMO.status) ? '✔ ผ่านการกรองตรวจจับจุลชีวะชองสตาร์' : 'รอก้าวถัดไป'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* --- SCREEN 9: ⚖️ MATERIAL ISSUE (เบิกจ่ายสารสกัด) --- */}
              {currentScreen === 'issue' && (
                <div className="space-y-4 animate-fade-in">
                  <form onSubmit={handleIssueMaterial} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3 font-sans">
                    <strong className="text-xs text-white block">ส่งคำร้องคุมชั่งตวงเบิกสสาร (Material Issues)</strong>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">ใบสำคัญใบรับสั่งผลิต (MO ID Target)</label>
                      <select 
                        value={newIssueData.moId}
                        onChange={(e) => setNewIssueData({ ...newIssueData, moId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-indigo-300"
                      >
                        {dbState.manufacturingOrders?.slice(0, 5).map((mo: any) => (
                          <option key={mo.id} value={mo.id}>{mo.id} ({dbState.products?.find((p: any) => p.id === mo.productId)?.sku || mo.productId})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] text-slate-400">แอลกอฮอล์/สารเคมี</label>
                        <select 
                          value={newIssueData.materialId}
                          onChange={(e) => setNewIssueData({ ...newIssueData, materialId: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-indigo-300"
                        >
                          {dbState.materials?.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.code} | {m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] text-slate-400">ปริมาณจัดเบิก</label>
                        <input 
                          type="number" 
                          value={newIssueData.quantity}
                          onChange={(e) => setNewIssueData({ ...newIssueData, quantity: Number(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-indigo-300 font-mono text-center"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg">✔ บันทึกชั่งน้ำหนักเบิกจ่ายสสาร</button>
                  </form>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">ประวัติการเบิกจ่ายเข้าหม้อปรุงน้ำยา</span>
                    <p className="text-slate-400 text-[10.5px]">เมื่อผู้คุมหม้อต้มกดชั่งจ่ายสารหอม ระบบดิจิทัลจะป้อนค่าน้ำหนักสารสกัดน้ำมันหอมหรู หักลบสต็อกที่คลังสูญญากาศหลักทันทีตามระเบียบ CGMP และรายงานผลลัพธ์ผ่าน API ประจำคลาวด์</p>
                  </div>
                </div>
              )}

              {/* --- SCREEN 10: ⚙️ PRODUCTION RECORD --- */}
              {currentScreen === 'production' && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <form onSubmit={(e) => { e.preventDefault(); onNotify(`บันทึกขั้นตอนการบ่ม: ${newRecordData.processStep} สำเร็จ`, "info"); }} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
                    <span className="text-[10px] uppercase font-black text-indigo-400 block">บันทึกขั้นตอนระหว่างคุมเครื่องกวนผสม (Scent Blending records)</span>
                    
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] text-zinc-400">อ้างอิงใบคำสั่ง MO</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300"
                        value={newRecordData.moId}
                        onChange={(e) => setNewRecordData({ ...newRecordData, moId: e.target.value })}
                      >
                        {dbState.manufacturingOrders?.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.id} (ขวดสั่ง: {m.quantityRequested})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] text-zinc-400">ระบุพิกัด / อุปกรณ์บ่มผสมขั้นตอนจริง</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                        value={newRecordData.processStep}
                        onChange={(e) => setNewRecordData({ ...newRecordData, processStep: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] text-zinc-400">หมายเหตุทางวิศวกรรมผสมสาร (Remark logs)</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                        value={newRecordData.remark}
                        onChange={(e) => setNewRecordData({ ...newRecordData, remark: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-slate-700 text-white rounded-xl text-xs font-black">✔ ยอมรับและเขียนประวัติลง BPR Card</button>
                  </form>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-slate-400 text-[10.5px] leading-relaxed">
                    <p className="font-bold text-slate-300 block mb-1">มาตรฐาน GMP / HACCP Cosmetic Logging:</p>
                    ประวัติเวลาเริ่ม, สลับชิมกลิ่นในหม้อ, และจดบันทึกค่าแรงดันสุญญากาศทางแล็บอย่างต่อเนื่อง จะช่วยให้พนักงานสามารถตามรอยการปนเปื้อนย้อนกลับ (Traceability) ได้ 100% กรณีเกิดปัญหากลิ่นผิดเพี้ยนไปจากมาตรฐานผลิตภัณฑ์
                  </div>
                </div>
              )}

              {/* --- SCREEN 11: ✅ QC (ด่านตรวจสอบคุณภาพเคมีแล็บ) --- */}
              {currentScreen === 'qc' && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="bg-gradient-to-r from-red-950/20 to-indigo-950/15 p-4 rounded-2xl border border-red-800/30">
                    <span className="text-[9px] uppercase font-bold text-rose-400 block mb-1 tracking-wider">QC INSPECTOR PLATFORM v1.0</span>
                    <p className="text-[11px] text-slate-300">กรุณาสุ่มตรวจสสารกวนน้ำหอม Lot นำเข้า และวิเคราะห์ความปลอดภัย สารเจือปน โลหะหนัก และความเสถียรของสีสังเคราะห์</p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400">การสืบค้นตรวจประวัติค้างพักวิเคราะห์ (Pending Inspections)</h5>
                    
                    {(dbState.qcInspections || []).map((qc: any) => {
                      return (
                        <div key={qc.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] text-[#86868B]">ตรวจรหัส: {qc.id} | ชนิด: {qc.sourceType}</span>
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                              qc.status === 'Passed' ? 'bg-emerald-950 text-emerald-400' :
                              qc.status === 'Failed' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400 animate-pulse'
                            }`}>{qc.status}</span>
                          </div>

                          <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-300 border-t border-slate-950 pt-2 flex-wrap gap-1">
                            <span>ความเสถียร: {(qc.parameters?.density || 0.89).toFixed(3)} g/cm³</span>
                            <span>สี: {qc.parameters?.colorHex || 'ปกติ'}</span>
                          </div>

                          {qc.status === 'Pending' && (
                            <div className="grid grid-cols-2 gap-2 pt-1.5 select-none">
                              <button
                                type="button"
                                onClick={() => handleQCResolve(qc.id, 'Passed')}
                                className="py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] text-center"
                              >
                                ✔ ตรวจผ่าน (Passed)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQCResolve(qc.id, 'Failed')}
                                className="py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] text-center"
                              >
                                ✕ ไม่ผ่านเกณฑ์ (Failed)
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- SCREEN 12: 📊 REPORTS --- */}
              {currentScreen === 'reports' && (
                <div className="space-y-4 animate-fade-in text-xs font-sans">
                  
                  {/* Executive statistical cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl space-y-1">
                      <span className="text-[9px] text-[#86868B] block uppercase tracking-wider font-bold">อัตรากวนเสร็จเฉลี่ย</span>
                      <p className="text-xl font-black text-indigo-400 leading-none">94.2%</p>
                      <span className="text-[8.5px] text-slate-400">ประสิทธิภาพ OEE สุทธิ</span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl space-y-1">
                      <span className="text-[9px] text-[#86868B] block uppercase tracking-wider font-bold">ความบกพร่องในสัปดาห์</span>
                      <p className="text-xl font-black text-red-400 leading-none">0.82%</p>
                      <span className="text-[8.5px] text-slate-400 font-sans">ค่าน้ำยาเคมีปนเปื้อน</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <strong className="text-xs text-white block">ดาวน์โหลดรายงานผู้เสนอฝ่ายบริหาร (ERP Exports)</strong>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadReport("รายงานคลังสินค้าและอัตราการใช้สารหอม")}
                        className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-between"
                      >
                        <span>📊 รายงานสต็อกวัตถุดิบคราฟน้ําหอม</span>
                        <Download className="h-3.5 w-3.5 text-indigo-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadReport("รายงานการผลิตและการสูญเสียสลัดไอ")}
                        className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-between"
                      >
                        <span>📊 รายงานบันทึกความร้อน/เวลากลั่นหม้อ</span>
                        <Download className="h-3.5 w-3.5 text-indigo-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadReport("รายงานสถิติการตรวจสอบแล็บของ QC")}
                        className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-between"
                      >
                        <span>📊 รายงานวิเคราะห์ใบสำคัญ QCPassed</span>
                        <Download className="h-3.5 w-3.5 text-indigo-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* 📱 MOBILE NAVIGATION FOOTER PORTAL BAR */}
            <footer className="h-14 shrink-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-10 text-[9.5px] select-none">
              
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentScreen('dashboard'); }}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${
                  currentScreen === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="h-4.5 w-4.5" />
                <span>หน้าแรก App</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('products')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${
                  currentScreen === 'products' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="h-4.5 w-4.5" />
                <span>สินค้า SKU</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('formulas')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${
                  currentScreen === 'formulas' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Beaker className="h-4.5 w-4.5" />
                <span>สูตรผสม</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('mo')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${
                  currentScreen === 'mo' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="h-4.5 w-4.5 animate-pulse" />
                <span className="font-bold">คุมใบ MO</span>
              </button>

            </footer>

          </div>
        )}

      </div>
      
      {/* Home Swipe Indicator (Native iOS/Android style bar) */}
      <div className="w-28 h-1 bg-slate-800 mx-auto mt-2 rounded-full shrink-0 select-none"></div>

    </div>
  );
}
