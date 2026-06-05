import { 
  Employee, Department, Role, Customer, Supplier, Product, Material, Formula, 
  Machine, ManufacturingOrder, RepairTicket, PMTask, SparePart, AttendanceRecord, 
  LeaveRequest, OTRequest, PayrollPeriod, Payslip, AccountTransaction, Invoice, 
  SupplierBill, AuditLog, QCInspection, PurchaseRequest, PurchaseOrder, GoodsReceipt
} from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'ฝ่ายบริหารจัดการและอำนวยการ', code: 'ADM' },
  { id: 'dept-2', name: 'ฝ่ายผลิตและบ่มปรุงน้ำหอม', code: 'PRD' },
  { id: 'dept-3', name: 'ฝ่ายควบคุมและประกันคุณภาพ (QA/QC)', code: 'QAQC' },
  { id: 'dept-4', name: 'ฝ่ายวิศวกรรมระบบและซ่อมบำรุง', code: 'MNT' },
  { id: 'dept-5', name: 'ฝ่ายบริหารทรัพยากรบุคคล', code: 'HR' },
  { id: 'dept-6', name: 'ฝ่ายบัญชีและการเงินโรงงาน', code: 'ACC' }
];

export const ROLES: Role[] = [
  { id: 'role-admin', name: 'ผู้จัดการทั่วไป (General Admin)', permittedMenus: ['Production', 'Maintenance', 'HR', 'Accounting', 'Developer'] },
  { id: 'role-mgmt', name: 'ผู้บริหารระดับสูง (Management)', permittedMenus: ['Production', 'Maintenance', 'HR', 'Accounting'] },
  { id: 'role-sales', name: 'เจ้าหน้าที่ฝ่ายขายและส่งออก', permittedMenus: ['Accounting'] },
  { id: 'role-rd', name: 'นักปรุงแต่งกลิ่นน้ำหอม (Perfumer / R&D)', permittedMenus: ['Production'] },
  { id: 'role-purchase', name: 'เจ้าหน้าที่จัดซื้อสารเคมีดิบ', permittedMenus: ['Production', 'Accounting'] },
  { id: 'role-wh', name: 'ผู้ดูแลคลังกระจายสินค้าวัตถุดิบและเคมีภัณฑ์', permittedMenus: ['Production'] },
  { id: 'role-qc', name: 'เจ้าหน้าที่ตรวจสอบคุณภาพแล็บ (QC)', permittedMenus: ['Production'] },
  { id: 'role-prod', name: 'หัวหน้าทีมควบคุมหม้อกลั่นผสม', permittedMenus: ['Production'] },
  { id: 'role-maint', name: 'ช่างเทคนิคซ่อมบำรุงระบบดักซึม', permittedMenus: ['Maintenance'] },
  { id: 'role-hr', name: 'เจ้าหน้าที่งานบุคคลและอัตราจ้าง', permittedMenus: ['HR'] },
  { id: 'role-acc', name: 'พนักงานตรวจสอบบัญชีโรงงาน', permittedMenus: ['Accounting'] }
];

export const EMPLOYEES: Employee[] = [
  { id: 'emp-101', name: 'กิตติพงษ์ เลิศอัครเดช', email: 'kittipong@factory.com', departmentId: 'dept-1', roleId: 'role-admin', status: 'Active', salary: 120000, allowance: 10000, joiningDate: '2023-01-15', skills: ['SAP ERP', 'Perfume Formulation Specialist', 'Executive Leadership'] },
  { id: 'emp-102', name: 'อนงค์นาฏ ทรัพย์มงคล', email: 'anongnart@factory.com', departmentId: 'dept-5', roleId: 'role-hr', status: 'Active', salary: 75000, allowance: 4000, joiningDate: '2023-05-10', skills: ['Conflict Resolution', 'Corporate Payroll', 'Training Programs'] },
  { id: 'emp-103', name: 'ธนวัชร รัตนเวชศาสน์', email: 'thanawat@factory.com', departmentId: 'dept-2', roleId: 'role-prod', status: 'Active', salary: 65000, allowance: 6000, joiningDate: '2024-02-12', skills: ['Perfume Blender', 'Maturation Control', 'Weighing Precision'] },
  { id: 'emp-104', name: 'ดร. ลลิตา วรโชติสกุล', email: 'lalita@factory.com', departmentId: 'dept-3', roleId: 'role-qc', status: 'Active', salary: 68000, allowance: 4000, joiningDate: '2024-03-01', skills: ['Gas Chromatography-Mass Spectrometry (GC-MS)', 'ISO 22716 Cosmetics GMP', 'Sensory Evaluation'] },
  { id: 'emp-105', name: 'สมชาย ไวกิจการ', email: 'somchai@factory.com', departmentId: 'dept-4', roleId: 'role-maint', status: 'Active', salary: 72000, allowance: 5000, joiningDate: '2023-11-20', skills: ['Pneumatic Pumps', 'Aerosol Filling Line Maintenance', 'Autoclaves Repair'] },
  { id: 'emp-106', name: 'ศิริพร บุญครองกุล', email: 'siriporn@factory.com', departmentId: 'dept-6', roleId: 'role-acc', status: 'Active', salary: 85000, allowance: 3000, joiningDate: '2023-08-15', skills: ['BOI Tax Incentives', 'Standard Costing', 'Inventory Audit'] },
  { id: 'emp-107', name: 'ดร. นิรุตต์ ตั้งจิตประสงค์', email: 'niroot@factory.com', departmentId: 'dept-2', roleId: 'role-rd', status: 'Active', salary: 95000, allowance: 8000, joiningDate: '2022-09-01', skills: ['Scent Engineering', 'Synthetics Sourcing', 'GC-MS Spectroscopy'] },
  { id: 'emp-999', name: 'นายกิตติ์ธนา คำมูล', email: 'kittithana.km@factory.com', departmentId: 'dept-4', roleId: 'role-maint', status: 'Active', salary: 14000, allowance: 0, joiningDate: '2020-04-12', skills: ['Computer Networking', 'IoT Systems', 'Database Admin'], lineUserId: 'Ue26ade3b0cd4d6eda90f72436e4c5a43', citizenId: '1-1022-00543-12-9' }
];

export const CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'บริษัท คิงพาวเวอร์ บิวตี้ ดิสทริบิวชั่น จำกัด', code: 'CUST-KINGPOWER', email: 'dutyfree-beauty@kingpower.co.th', phone: '+66-2-677-8888', address: 'กรุงเทพมหานคร, ประเทศไทย' },
  { id: 'cust-2', name: 'บริษัท มัทสึโมโตะ คิโยชิ โฮลดิ้ง ประเทศไทย LLC', code: 'CUST-MATSU', email: 'b2b-procurement@matsukiyo.co.th', phone: '+66-2-589-3344', address: 'สมุทรปราการ, ประเทศไทย' },
  { id: 'cust-3', name: 'กลุ่มธุรกิจสปารับจ้างผลิต แอนนิแมค โกรฟ สยาม', code: 'CUST-ANIMAC', email: 'oem-contract@animac.com', phone: '+66-2-332-1111', address: 'เชียงใหม่, ประเทศไทย' }
];

export const SUPPLIERS: Supplier[] = [
  { id: 'supp-1', name: 'Robertet Fragrance Distillery (Grasse, France)', code: 'SUPP-ROB-FR', contactPerson: 'Jean-Luc Grasse', phone: '+33-4-9340-3300', email: 'contact@robertet.fr' },
  { id: 'supp-2', name: 'บริษัท ไทยแพคเกจจิ้ง แอนด์ ลักซูรี่ บ็อกซ์ จำกัด', code: 'SUPP-THAI-PACK', contactPerson: 'พิมพ์ลดา จรัสแสง', phone: '+66-2-440-9988', email: 'sales@thaipacklux.co.th' },
  { id: 'supp-3', name: 'ศิริมงคล เคมีคอล แอดดิทิฟส์ ผู้จัดส่งเอทานอลบริสุทธิ์', code: 'SUPP-SIRI-CHEM', contactPerson: 'สมพล ไพบูลย์', phone: '+66-2-711-2334', email: 'info@sirichem.co.th' }
];

export const PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'กลิ่น Chérie Rose Eau de Parfum (EDP) 100ml', sku: 'PFM-CHRE-100', category: 'น้ำหอมผู้หญิง (EDP)', minStock: 50, stockLevel: 120, unit: 'ขวด', costPrice: 450, sellPrice: 2450 },
  { id: 'prod-002', name: 'กลิ่น Midnight Oud Extrait de Parfum 50ml', sku: 'PFM-MOUD-50', category: 'น้ำหอมพรีเมียมเข้มข้น', minStock: 30, stockLevel: 45, unit: 'ขวด', costPrice: 850, sellPrice: 4200 },
  { id: 'prod-003', name: 'กลิ่น Summer Citrus Refreshing Body Mist 150ml', sku: 'PFM-SCIT-150', category: 'บอดี้มิสต์บางเบา', minStock: 100, stockLevel: 85, unit: 'ขวด', costPrice: 180, sellPrice: 690 },
  { id: 'prod-004', name: 'กลิ่น Jasmine Blossom Signature Cologne 100ml', sku: 'PFM-JASM-100', category: 'น้ำหอมโคโลญจน์', minStock: 40, stockLevel: 60, unit: 'ขวด', costPrice: 280, sellPrice: 1250 }
];

export const MATERIALS: Material[] = [
  // Essential oils (สารหอมและน้ำมันหอมระเหยเข้มข้น)
  { id: 'mat-001', name: 'สารสกัดน้ำมันหอมระเหยกุหลาบฝรั่งเศส (French Rose Centric Oil)', code: 'RAW-ESS-ROSE', category: 'Raw Material', minStock: 200, stockLevel: 450, unit: 'ลิตร', costPerUnit: 850 },
  { id: 'mat-002', name: 'สารสกัดไม้กฤษณาธรรมชาติระดับพรีเมียม (Natural Agarwood Oud Oil)', code: 'RAW-ESS-OUD', category: 'Raw Material', minStock: 20, stockLevel: 15, unit: 'ลิตร', costPerUnit: 4500 },
  { id: 'mat-003', name: 'สารสกัดมะลิไทยสดบริสุทธิ์เข้มข้น (Thai Jasmine Absolute Oil)', code: 'RAW-ESS-JASM', category: 'Raw Material', minStock: 100, stockLevel: 180, unit: 'ลิตร', costPerUnit: 1800 },
  { id: 'mat-004', name: 'น้ำมันผิวส้มอิตาเลียนเบอร์กาม็อท (Italian Bergamot Citrus Oil)', code: 'RAW-ESS-BERG', category: 'Raw Material', minStock: 150, stockLevel: 320, unit: 'ลิตร', costPerUnit: 950 },
  { id: 'mat-005', name: 'สารสกัดโกโก้เบอร์เบินวนิลลา (Madagascar Bourbon Vanilla Extract)', code: 'RAW-ESS-VANIL', category: 'Raw Material', minStock: 80, stockLevel: 95, unit: 'ลิตร', costPerUnit: 2100 },
  
  // Solvents, bases and additives (เบสและสารเคมีทำปฏิกิริยาตรึงกลิ่น)
  { id: 'mat-006', name: 'เอทานอลแปลงสภาพบริสุทธิ์สูง 99.9% (Perfume De-odorized Ethanol 99.9%)', code: 'RAW-SOLV-ETH', category: 'Raw Material', minStock: 2000, stockLevel: 4500, unit: 'ลิตร', costPerUnit: 85 },
  { id: 'mat-007', name: 'สารละลายมัสก์ช่วยตรึงกลิ่นหอมทนนาน (Specialist Musk Fixative Base)', code: 'RAW-FIX-MSK', category: 'Raw Material', minStock: 200, stockLevel: 180, unit: 'กิโลกรัม', costPerUnit: 350 },
  { id: 'mat-008', name: 'สารสกัดสีกำยานเบนโซอินเชื่อมสาร (Benzoin Resin Additive)', code: 'RAW-FIX-BENZ', category: 'Raw Material', minStock: 50, stockLevel: 80, unit: 'กิโลกรัม', costPerUnit: 280 },
  { id: 'mat-009', name: 'สารเคมีกรองสียูวีปกป้องความเสถียรสีสังเคราะห์ (Benzophenone-4 UV Absorber)', code: 'RAW-CHEM-BP4', category: 'Raw Material', minStock: 100, stockLevel: 140, unit: 'กิโลกรัม', costPerUnit: 150 },
  
  // Packaging (บรรจุภัณฑ์และขวดหัวฉีดหรู)
  { id: 'mat-010', name: 'ขวดแก้วเหลี่ยมฝาโลหะทองคัตทีงคริสตัล 100ml', code: 'PKG-BTL-100G', category: 'Packaging', minStock: 1000, stockLevel: 2500, unit: 'ขวด', costPerUnit: 45 },
  { id: 'mat-011', name: 'ขวดแก้วทรงหรูพร้อมปลอกสัมผัสแบบสเปรย์ 50ml', code: 'PKG-BTL-50', category: 'Packaging', minStock: 1000, stockLevel: 900, unit: 'ขวด', costPerUnit: 35 },
  { id: 'mat-012', name: 'หัวฉีดแบบพ่นสเปรย์ระดับไมครอนคอเกลียวสีทองพรีเมียม', code: 'PKG-CAP-MIST', category: 'Packaging', minStock: 2000, stockLevel: 3200, unit: 'ชิ้น', costPerUnit: 12 },
  { id: 'mat-013', name: 'กล่องของขวัญแข็งพิมพ์ฟอยล์ทองแบบปั๊มนูนแชมเปญ 100ml', code: 'PKG-BOX-GIFT', category: 'Packaging', minStock: 1000, stockLevel: 1400, unit: 'กล่อง', costPerUnit: 20 }
];

export const FORMULAS: Formula[] = [
  {
    id: 'form-001',
    productId: 'prod-001',
    version: 'กลั่นปรับปรุงสัดส่วน 3.1',
    status: 'Approved',
    approvedBy: 'ดร. นิรุตต์ ตั้งจิตประสงค์',
    items: [
      { materialId: 'mat-001', quantity: 0.15 }, // 15% French Rose Oil
      { materialId: 'mat-006', quantity: 0.80 }, // 80% Ethanol Alcohol Base
      { materialId: 'mat-007', quantity: 0.03 }, // 3% Musk Fixative
      { materialId: 'mat-009', quantity: 0.02 }  // 2% UV and water adjustments
    ]
  },
  {
    id: 'form-002',
    productId: 'prod-002',
    version: 'เข้มข้นสูงพิเศษ 1.0b',
    status: 'Approved',
    approvedBy: 'กิตติพงษ์ เลิศอัครเดช',
    items: [
      { materialId: 'mat-002', quantity: 0.35 }, // 35% Pure Agarwood Oud Essence Oil
      { materialId: 'mat-006', quantity: 0.60 }, // 60% Perfumer Spirit Solvent
      { materialId: 'mat-008', quantity: 0.05 }  // 5% Benzoin Resin stabilizer
    ]
  },
  {
    id: 'form-003',
    productId: 'prod-003',
    version: 'สูตรคงทนกันแดด 2.2',
    status: 'Approved',
    approvedBy: 'ดร. นิรุตต์ ตั้งจิตประสงค์',
    items: [
      { materialId: 'mat-004', quantity: 0.08 }, // 8% Italian Bergamot Citrus Oil
      { materialId: 'mat-005', quantity: 0.02 }, // 2% Premium Madagascar Vanilla scent note
      { materialId: 'mat-006', quantity: 0.88 }, // 88% de-odorized Ethanol Spirit
      { materialId: 'mat-009', quantity: 0.02 }  // 2% Chemical stabilizers
    ]
  }
];

export const MACHINES: Machine[] = [
  { id: 'mch-01', name: 'เครื่องกลั่นแอลกอฮอล์ถนอมกลิ่น และสกัดสารละลายสุญญากาศ Fragrance Reactor FE-500', code: 'PFM-MCH-FE500', section: 'ส่วนกลั่นแยกไอระเหย (Fractional Scent Column)', status: 'Online', qrCodeUrl: 'MCH-FE500-VALID', installedDate: '2023-04-10', mtbfHours: 420, mttrHours: 4.5 },
  { id: 'mch-02', name: 'เครื่องผสมโฮโมจีไนเซอร์ควบคุมอุณหภูมิวาล์วปิดสนิทแบบระบายไอ Scent Homogenizer MX-Rose', code: 'PFM-MCH-MXROSE', section: 'ส่วนบ่มผสมน้ำยาเข้มข้น (Concentration Mixing)', status: 'Online', qrCodeUrl: 'MCH-MXROSE-VALID', installedDate: '2023-08-25', mtbfHours: 350, mttrHours: 2.8 },
  { id: 'mch-03', name: 'เครื่องตรวจสอบวิเคราะห์แก๊ส GC-MS สเปกโทรสโกปี Chroma-G4', code: 'PFM-MCH-CHROMAG4', section: 'ห้องปฏิบัติการควบคุมมาตรฐาน (QC & Lab Diagnostics)', status: 'Online', qrCodeUrl: 'MCH-G4-VALID', installedDate: '2024-01-15', mtbfHours: 480, mttrHours: 3.2 },
  { id: 'mch-04', name: 'ระบบบรรจุหัวฉีดสเปรย์ไมครอน และขันเกลียวสีกดกึ่งอัตโนมัติ Luxe-Filling Robot AP-10', code: 'PFM-MCH-AP10', section: 'ส่วนบรรจุภัณฑ์และลงส่งกล่องรับสินค้า (Spray Caps Insertion)', status: 'Online', qrCodeUrl: 'MCH-AP10-VALID', installedDate: '2024-02-18', mtbfHours: 600, mttrHours: 1.5 }
];

export const MANUFACTURING_ORDERS: ManufacturingOrder[] = [
  {
    id: 'mo-perfume-901',
    productId: 'prod-001',
    formulaId: 'form-001',
    quantityRequested: 250,
    quantityProduced: 0,
    startDate: '2026-06-01',
    status: 'In Production',
    costSummary: {
      materialCost: 45000,
      packagingCost: 8000,
      laborCost: 12000,
      overheadCost: 5500,
      lossCost: 1200,
      totalCost: 71700,
      costPerPiece: 286.80
    }
  },
  {
    id: 'mo-perfume-902',
    productId: 'prod-002',
    formulaId: 'form-002',
    quantityRequested: 100,
    quantityProduced: 100,
    startDate: '2026-05-18',
    endDate: '2026-05-20',
    status: 'Released',
    costSummary: {
      materialCost: 157500,
      packagingCost: 3500,
      laborCost: 15000,
      overheadCost: 6000,
      lossCost: 2300,
      totalCost: 184300,
      costPerPiece: 1843.00
    }
  },
  {
    id: 'mo-perfume-903',
    productId: 'prod-003',
    formulaId: 'form-003',
    quantityRequested: 400,
    quantityProduced: 0,
    startDate: '2026-06-03',
    status: 'Material Reserved'
  }
];

export const PURCHASE_REQUESTS: PurchaseRequest[] = [
  { id: 'pr-perfume-101', materialId: 'mat-002', quantity: 30, urgency: 'High', status: 'Ordered', requestedBy: 'ดร. นิรุตต์ ตั้งจิตประสงค์', createdAt: '2026-05-25' },
  { id: 'pr-perfume-102', materialId: 'mat-007', quantity: 50, urgency: 'Medium', status: 'Draft', requestedBy: 'ธนวัชร รัตนเวชศาสน์', createdAt: '2026-06-03' }
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po-perfume-201', prId: 'pr-perfume-101', supplierId: 'supp-1', materialId: 'mat-002', quantity: 30, totalCost: 135000, status: 'Issued', createdAt: '2026-05-26' }
];

export const GOODS_RECEIPTS: GoodsReceipt[] = [
  { id: 'grn-perfume-301', poId: 'po-perfume-201', supplierId: 'supp-1', materialId: 'mat-002', quantityReceived: 30, lotNumber: 'LOT-FR-OUD-998A', expiryDate: '2029-05-27', status: 'Pending QC', createdAt: '2026-05-28' }
];

export const QC_INSPECTIONS: QCInspection[] = [
  {
    id: 'qc-perfume-401',
    sourceType: 'Incoming',
    referenceId: 'LOT-FR-OUD-998A',
    inspector: 'ดร. ลลิตา วรโชติสกุล',
    status: 'Passed',
    parameters: [
      { name: 'สเปกตรัมความบริสุทธิ์หอมระเหย (Agarwood Purity)', value: '99.8%', expected: '>= 99.0%', passed: true },
      { name: 'ค่าความชื้นและน้ำสัมบูรณ์ปะปน (Moisture %)', value: '0.01%', expected: '<= 0.05%', passed: true },
      { name: 'ดัชนีหักเหของไอระเหย (Refractive Index)', value: '1.4820', expected: '1.4800 - 1.4890', passed: true }
    ],
    createdAt: '2026-05-29'
  }
];

export const REPAIR_TICKETS: RepairTicket[] = [
  { id: 'tix-01', machineId: 'mch-04', requestedBy: 'ธนวัชร รัตนเวชศาสน์', description: 'โอริงและซีลยางวาล์วจ่ายหัวสเปรย์แรงฉีดตกกะทันหัน ออโต้ไลน์ชะงักตัว', priority: 'High', status: 'Assigned', assignedTechnician: 'สมชาย ไวกิจการ', createdAt: '2026-06-03' }
];

export const PM_TASKS: PMTask[] = [
  { id: 'pm-201', machineId: 'mch-01', title: 'เปลี่ยนชุดกรองถ่านกัมมันต์และล้างกรดยางถังกลั่นระเหยเวสเซิล', dueBy: '2026-06-15', status: 'Pending', checklist: ['ลดแรงดันสูญญากาศให้เป็นศูนย์', 'ล้างหมุนเวียนแอลกอฮอล์ปรับสภาพขจัดตะกอนเขม่า', 'ตรวจใบมีดกวนและซีลกันกลิ่นระเหยหลัก', 'เปลี่ยนปะเก็นและซีลหล่อเย็นเทฟลอนใหม่'] },
  { id: 'pm-202', machineId: 'mch-02', title: 'หล่อลื่นแมคคานิคัลซีลตลับลูกปืนแบริ่งแกนหมุนโฮโมจีไนเซอร์', dueBy: '2026-06-01', status: 'Completed', checklist: ['เปิดฝาครอบครอบเกียร์มอเตอร์ดักละออง', 'อัดจาระบีสังเคราะห์อุณหภูมิสูงเกรดอาหาร/เครื่องสำอาง', 'ตรวจสอบสมดุลการสั่นสะเทือนและค่าโอเวอร์โหลดที่ 3000 RPM'], completedBy: 'สมชาย ไวกิจการ', completedAt: '2026-06-01' },
  { id: 'pm-203', machineId: 'mch-04', title: 'ตรวจสอบแนวตั้งแนวระนาบของหัวยัดฉีดกล่องแรปพลาสติก', dueBy: '2026-05-30', status: 'Overdue', checklist: ['คาริเบรตเซ็นเซอร์โฟโตอิเล็กทริคตรวจจับขอบแก้วคอขวด', 'ตรวจสอบความตึงสปริงโช้คอัพหัวกดฝาครอบ'] }
];

export const SPARE_PARTS: SparePart[] = [
  { id: 'part-01', name: 'ยางปะเก็นซิลิโคนสังเคราะห์เบอร์ 3.5 นิ้ว ทนแอลกอฮอล์', code: 'SP-RNG-3.5', stock: 12, minStock: 5, machineId: 'mch-01' },
  { id: 'part-02', name: 'ชุดหัวเซ็นเซอร์ฉีดพ่นเลเซอร์เหนี่ยวนำตำแหน่งขวดแก้ว', code: 'SP-LSR-DL2', stock: 2, minStock: 1, machineId: 'mch-03' },
  { id: 'part-03', name: 'เช็ควาล์วเปิดปิดวาล์วระบบดึงสูญญากาศและพัดลมดูดกลิ่น PV-90', code: 'SP-VLV-PV90', stock: 1, minStock: 3, machineId: 'mch-04' }
];

export const ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-501', employeeId: 'emp-101', date: '2026-06-03', checkIn: '07:45', checkOut: '18:15', gpsCoords: { lat: 13.7563, lng: 100.5018 }, status: 'Present' },
  { id: 'att-502', employeeId: 'emp-103', date: '2026-06-03', checkIn: '08:02', checkOut: '17:000', gpsCoords: { lat: 13.7621, lng: 100.5140 }, status: 'Late' },
  { id: 'att-503', employeeId: 'emp-105', date: '2026-06-03', checkIn: '07:50', checkOut: '17:30', gpsCoords: { lat: 13.7505, lng: 100.4912 }, status: 'Present' },
  { id: 'att-504', employeeId: 'emp-106', date: '2026-06-03', checkIn: '08:50', checkOut: '18:00', gpsCoords: { lat: 13.7563, lng: 100.5018 }, status: 'Present' }
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lv-901', employeeId: 'emp-103', type: 'Annual', startDate: '2026-06-10', endDate: '2026-06-12', reason: 'เรียนต่อสัมมนารสสัมผัสและกลิ่นสากลประจำปี', status: 'Pending' },
  { id: 'lv-902', employeeId: 'emp-104', type: 'Sick', startDate: '2026-05-20', endDate: '2026-05-21', reason: 'ไข้หวัดจากการสัมผัสสิ่งเร้าจมูกอักเสบกะทันหัน', status: 'Approved' }
];

export const OT_REQUESTS: OTRequest[] = [
  { id: 'ot-401', employeeId: 'emp-103', date: '2026-06-02', hours: 3, reason: 'คุมงานแล็บบ่มผสมสารสกัดกลิ่นโรสให้เสร็จทันออกตู้พรีเมียม', status: 'Approved' },
  { id: 'ot-402', employeeId: 'emp-105', date: '2026-06-03', hours: 2, reason: 'ซ่อมแซมกระบอกลูกสูบระบบลำเลียงหัวครอบสเปรย์ทองเหลืองฉุกเฉิน', status: 'Pending' }
];

export const PAYROLL_PERIODS: PayrollPeriod[] = [
  { id: 'payp-05', periodName: 'พฤษภาคม 2569 (May 2026)', startDate: '2026-05-01', endDate: '2026-05-31', status: 'Posted' },
  { id: 'payp-06', periodName: 'มิถุนายน 2569 (June 2026)', startDate: '2026-06-01', endDate: '2026-06-30', status: 'Draft' }
];

export const PAYSLIPS: Payslip[] = [
  { id: 'slip-501', payrollPeriodId: 'payp-05', employeeId: 'emp-103', baseSalary: 65000, otPay: 4800, allowanceSum: 6000, bonus: 0, ssoDeduction: 750, taxDeduction: 3500, netPay: 71550, pdfGenerated: true },
  { id: 'slip-502', payrollPeriodId: 'payp-05', employeeId: 'emp-105', baseSalary: 72000, otPay: 2100, allowanceSum: 5000, bonus: 5000, ssoDeduction: 750, taxDeduction: 4200, netPay: 79150, pdfGenerated: true },
  { id: 'slip-999', payrollPeriodId: 'payp-05', employeeId: 'emp-999', baseSalary: 14000, otPay: 0, allowanceSum: 0, bonus: 0, ssoDeduction: 700, taxDeduction: 0, netPay: 13300, pdfGenerated: true }
];

export const TRANSACTIONS: AccountTransaction[] = [
  { id: 'tx-201', date: '2026-05-25', type: 'Credit', category: 'Revenue', amount: 612500, description: 'King Power Beauty - ได้รับชำระค่าส่งออกน้ำหอมล็อตกลิ่น Chérie Rose' },
  { id: 'tx-202', date: '2026-05-28', type: 'Debit', category: 'Payroll Posting', amount: 150700, description: 'จ่ายคืนบันทึกบัญชีเงินเดือนทีมแล็บและพนักงาน ฝ่ายผลิตและบ่มผสม ประจำเดือนพฤษภาคม' },
  { id: 'tx-203', date: '2026-05-29', type: 'Debit', category: 'Production Cost Posting', amount: 184300, description: 'บันทึกต้นทุนกระบวนการกลั่นผสมน้ำหอม Midnight Oud Lot 100 ขวด (MO-2402)' },
  { id: 'tx-204', date: '2026-06-01', type: 'Debit', category: 'Expense', amount: 14200, description: 'ใบแจ้งหนี้ค่าไฟฟ้าระบบทำความเย็นอุณหภูมิลดเสียงบ่มแอลกอฮอล์ถังเก็บน้ำหอม' },
  { id: 'tx-205', date: '2026-06-02', type: 'Credit', category: 'Revenue', amount: 45000, description: 'มัทสึโมโตะ คิโยชิ โฮลดิ้ง เงินมัดจำลงชื่อน้ำหอมบอดี้มิสต์หน้าร้อน' }
];

export const INVOICES: Invoice[] = [
  { id: 'inv-101', customerId: 'cust-1', amount: 612500, dueDate: '2026-06-15', status: 'Paid', createdAt: '2026-05-15' },
  { id: 'inv-102', customerId: 'cust-2', amount: 125000, dueDate: '2026-06-20', status: 'Unpaid', createdAt: '2026-05-20' },
  { id: 'inv-103', customerId: 'cust-3', amount: 38000, dueDate: '2026-06-01', status: 'Overdue', createdAt: '2026-05-01' }
];

export const SUPPLIER_BILLS: SupplierBill[] = [
  { id: 'bill-101', supplierId: 'supp-1', amount: 135000, dueDate: '2026-06-10', status: 'Unpaid', createdAt: '2026-05-10' },
  { id: 'bill-102', supplierId: 'supp-2', amount: 1800, dueDate: '2026-06-01', status: 'Paid', createdAt: '2026-05-01' }
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', user: 'กิตติพงษ์ เลิศอัครเดช', role: 'Admin', action: 'ระบบเริ่มต้นโครงสร้างข้อมูลและการกลั่นน้ำหอมแบบจำลองเสถียร GMP', timestamp: '2026-06-04 01:20:10', module: 'System' },
  { id: 'log-2', user: 'ดร. นิรุตต์ ตั้งจิตประสงค์', role: 'R&D', action: 'อนุมัติสูตรน้ำหอม Rose Concentric Blend v3.1 สำหรับสเกลพรีเมียม', timestamp: '2026-06-04 01:25:00', module: 'Production' },
  { id: 'log-3', user: 'ธนวัชร รัตนเวชศาสน์', role: 'Production', action: 'สร้างใบสั่งแปรสภาพบ่มน้ำหอม MO-903 เพื่อเตรียมนำแอลกอฮอล์สเปรย์เข้าบ่มปั่น', timestamp: '2026-06-04 01:31:12', module: 'Production' }
];
