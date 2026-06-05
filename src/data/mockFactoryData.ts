import { 
  Employee, Department, Role, Customer, Supplier, Product, Material, Formula, 
  Machine, ManufacturingOrder, RepairTicket, PMTask, SparePart, AttendanceRecord, 
  LeaveRequest, OTRequest, PayrollPeriod, Payslip, AccountTransaction, Invoice, 
  SupplierBill, AuditLog, QCInspection, PurchaseRequest, PurchaseOrder, GoodsReceipt
} from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Administration', code: 'ADM' },
  { id: 'dept-2', name: 'Production', code: 'PRD' },
  { id: 'dept-3', name: 'Quality Control', code: 'QAQC' },
  { id: 'dept-4', name: 'Maintenance', code: 'MNT' },
  { id: 'dept-5', name: 'Human Resources', code: 'HR' },
  { id: 'dept-6', name: 'Accounting & Finance', code: 'ACC' }
];

export const ROLES: Role[] = [
  { id: 'role-admin', name: 'Admin', permittedMenus: ['Production', 'Maintenance', 'HR', 'Accounting', 'Developer'] },
  { id: 'role-mgmt', name: 'Management', permittedMenus: ['Production', 'Maintenance', 'HR', 'Accounting'] },
  { id: 'role-sales', name: 'Sales', permittedMenus: ['Accounting'] },
  { id: 'role-rd', name: 'R&D', permittedMenus: ['Production'] },
  { id: 'role-purchase', name: 'Purchasing', permittedMenus: ['Production', 'Accounting'] },
  { id: 'role-wh', name: 'Warehouse', permittedMenus: ['Production'] },
  { id: 'role-qc', name: 'QC', permittedMenus: ['Production'] },
  { id: 'role-prod', name: 'Production', permittedMenus: ['Production'] },
  { id: 'role-maint', name: 'Maintenance', permittedMenus: ['Maintenance'] },
  { id: 'role-hr', name: 'HR', permittedMenus: ['HR'] },
  { id: 'role-acc', name: 'Accounting', permittedMenus: ['Accounting'] }
];

export const EMPLOYEES: Employee[] = [
  { id: 'emp-101', name: 'Edward Vane', email: 'vane@ideva.com', departmentId: 'dept-1', roleId: 'role-admin', status: 'Active', salary: 120000, allowance: 10000, joiningDate: '2023-01-15', skills: ['SAP ERP', 'Lean Six Sigma', 'Executive Leadership'] },
  { id: 'emp-102', name: 'Amanda Sterling', email: 'sterling@ideva.com', departmentId: 'dept-5', roleId: 'role-hr', status: 'Active', salary: 75000, allowance: 4000, joiningDate: '2023-05-10', skills: ['Conflict Resolution', 'Corporate Payroll', 'Training Programs'] },
  { id: 'emp-103', name: 'Marcus Brody', email: 'brody@ideva.com', departmentId: 'dept-2', roleId: 'role-prod', status: 'Active', salary: 65000, allowance: 6000, joiningDate: '2024-02-12', skills: ['CNC Operation', 'Material Weighing', 'Batch Production'] },
  { id: 'emp-104', name: 'Elena Rostova', email: 'rostova@ideva.com', departmentId: 'dept-3', roleId: 'role-qc', status: 'Active', salary: 68000, allowance: 4000, joiningDate: '2024-03-01', skills: ['Spectrophotometry', 'ISO 9001 Standards', 'Incoming Inspection'] },
  { id: 'emp-105', name: 'Tariq Al-Fayed', email: 'fayed@ideva.com', departmentId: 'dept-4', roleId: 'role-maint', status: 'Active', salary: 72000, allowance: 5000, joiningDate: '2023-11-20', skills: ['Pneumatic Systems', 'Sensors & PLC', 'Hydraulics'] },
  { id: 'emp-106', name: 'Sofia Rodriguez', email: 'rodriguez@ideva.com', departmentId: 'dept-6', roleId: 'role-acc', status: 'Active', salary: 85000, allowance: 3000, joiningDate: '2023-08-15', skills: ['AP/AR Aging', 'Tax Filings', 'P&L Accounting'] },
  { id: 'emp-107', name: 'Kenji Sato', email: 'sato@ideva.com', departmentId: 'dept-2', roleId: 'role-rd', status: 'Active', salary: 95000, allowance: 8000, joiningDate: '2022-09-01', skills: ['Chemical Synthesis', 'Formula Management', 'Product Design'] }
];

export const CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Apex Microelectronics Corp', code: 'CUST-APEX', email: 'procurement@apexmicro.com', phone: '+1-555-0912', address: 'Silicon Valley, CA, USA' },
  { id: 'cust-2', name: 'BlueTech Aerospace', code: 'CUST-BLUE', email: 'supply@bluetechaero.com', phone: '+1-555-2384', address: 'Seattle, WA, USA' },
  { id: 'cust-3', name: 'Continental Telecom', code: 'CUST-CONT', email: 'incoming@contitelecom.de', phone: '+49-89-23450', address: 'Munich, Germany' }
];

export const SUPPLIERS: Supplier[] = [
  { id: 'supp-1', name: 'Global Chemical Refineries Co.', code: 'SUPP-CHEM', contactPerson: 'Johnathan Miller', phone: '+1-555-8901', email: 'sales@globalchemref.com' },
  { id: 'supp-2', name: 'Omni Packaging Solutions', code: 'SUPP-PACK', contactPerson: 'Theresa Vance', phone: '+1-555-4678', email: 'orders@omnipack.com' },
  { id: 'supp-3', name: 'Sankyo Heavy Machinery Corp', code: 'SUPP-MACH', contactPerson: 'Takahiro Mori', phone: '+81-3-3245-1200', email: 'support@sankyomachinery.jp' }
];

export const PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'IDEVA Pro-Shield Coating Lot 100L', sku: 'IDV-PRSH-100', category: 'Chemical Coating', minStock: 20, stockLevel: 35, unit: 'Drum', costPrice: 420, sellPrice: 850 },
  { id: 'prod-002', name: 'IDEVA Ultra-Solder Paste Premium Grade', sku: 'IDV-ULSD-05', category: 'Jointing Materials', minStock: 100, stockLevel: 140, unit: 'Jar', costPrice: 35, sellPrice: 85 },
  { id: 'prod-003', name: 'IDEVA Premium Thermal Pad 100x100mm', sku: 'IDV-PTP-100', category: 'Cooling Materials', minStock: 50, stockLevel: 45, unit: 'Box', costPrice: 120, sellPrice: 240 }
];

export const MATERIALS: Material[] = [
  { id: 'mat-001', name: 'Solvent Base A-99 Refinement', code: 'RAW-SOLV-A99', category: 'Raw Material', minStock: 1000, stockLevel: 2400, unit: 'Liters', costPerUnit: 2.50 },
  { id: 'mat-002', name: 'Catalyst Core Active Compound X', code: 'RAW-CAT-ACTX', category: 'Raw Material', minStock: 50, stockLevel: 35, unit: 'Kilograms', costPerUnit: 45.00 },
  { id: 'mat-003', name: 'High-Purity Solder Solder Tin G9', code: 'RAW-TIN-G9', category: 'Raw Material', minStock: 500, stockLevel: 1200, unit: 'Kilograms', costPerUnit: 12.00 },
  { id: 'mat-004', name: 'IDEVA Anti-Static Aluminium Bag', code: 'PKG-AST-AL', category: 'Packaging', minStock: 1000, stockLevel: 3000, unit: 'Pieces', costPerUnit: 0.40 },
  { id: 'mat-005', name: 'Double-walled Export Carton Box', code: 'PKG-CRT-DB', category: 'Packaging', minStock: 100, stockLevel: 85, unit: 'Pieces', costPerUnit: 1.80 }
];

export const FORMULAS: Formula[] = [
  {
    id: 'form-001',
    productId: 'prod-001',
    version: '2.4',
    status: 'Approved',
    approvedBy: 'Kenji Sato',
    items: [
      { materialId: 'mat-001', quantity: 2.2 }, // 2.2L of Solvent A-99 per Drum
      { materialId: 'mat-002', quantity: 0.15 }, // 0.15Kg of Catalyst Compound
      { materialId: 'mat-005', quantity: 0.1 }   // Cartons
    ]
  },
  {
    id: 'form-002',
    productId: 'prod-002',
    version: '1.2',
    status: 'Approved',
    approvedBy: 'Edward Vane',
    items: [
      { materialId: 'mat-003', quantity: 0.5 }, // 0.5Kg Solder Tin
      { materialId: 'mat-004', quantity: 1.0 }  // Bag
    ]
  }
];

export const MACHINES: Machine[] = [
  { id: 'mch-01', name: 'Precision Chemical Reactor RX-3A', code: 'IDEVA-MCH-RX3A', section: 'Chemical Synthesis A', status: 'Online', qrCodeUrl: 'MCH-RX3A-VALID', installedDate: '2023-04-10', mtbfHours: 420, mttrHours: 4.5 },
  { id: 'mch-02', name: 'Ultra-Solder Mixer & Homogenizer MX-1', code: 'IDEVA-MCH-MX1', section: 'Mixing & Grinding', status: 'Online', qrCodeUrl: 'MCH-MX1-VALID', installedDate: '2023-08-25', mtbfHours: 350, mttrHours: 2.8 },
  { id: 'mch-03', name: 'Automated Dicing & Extrusion Line DL-2', code: 'IDEVA-MCH-DL2', section: 'Thermal Processing', status: 'Online', qrCodeUrl: 'MCH-DL2-VALID', installedDate: '2024-01-15', mtbfHours: 480, mttrHours: 3.2 },
  { id: 'mch-04', name: 'High-Speed Automated Packaging Robot PR-10', code: 'IDEVA-MCH-PR10', section: 'Final Packaging', status: 'Maintenance', qrCodeUrl: 'MCH-PR10-VALID', installedDate: '2024-02-18', mtbfHours: 600, mttrHours: 1.5 }
];

export const MANUFACTURING_ORDERS: ManufacturingOrder[] = [
  {
    id: 'mo-2401',
    productId: 'prod-001',
    formulaId: 'form-001',
    quantityRequested: 150,
    quantityProduced: 0,
    startDate: '2026-06-01',
    status: 'In Production',
    costSummary: {
      materialCost: 40000,
      packagingCost: 5000,
      laborCost: 8000,
      overheadCost: 6000,
      lossCost: 1500,
      totalCost: 60500,
      costPerPiece: 403.33
    }
  },
  {
    id: 'mo-2402',
    productId: 'prod-002',
    formulaId: 'form-002',
    quantityRequested: 500,
    quantityProduced: 500,
    startDate: '2026-05-18',
    endDate: '2026-05-20',
    status: 'Released',
    costSummary: {
      materialCost: 12000,
      packagingCost: 1200,
      laborCost: 2000,
      overheadCost: 1500,
      lossCost: 350,
      totalCost: 17050,
      costPerPiece: 34.10
    }
  },
  {
    id: 'mo-2403',
    productId: 'prod-003',
    formulaId: 'form-001',
    quantityRequested: 80,
    quantityProduced: 0,
    startDate: '2026-06-03',
    status: 'Material Reserved'
  }
];

export const PURCHASE_REQUESTS: PurchaseRequest[] = [
  { id: 'pr-1001', materialId: 'mat-002', quantity: 150, urgency: 'High', status: 'Ordered', requestedBy: 'Kenji Sato', createdAt: '2026-05-25' },
  { id: 'pr-1002', materialId: 'mat-005', quantity: 300, urgency: 'Medium', status: 'Draft', requestedBy: 'Marcus Brody', createdAt: '2026-06-03' }
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po-2001', prId: 'pr-1001', supplierId: 'supp-1', materialId: 'mat-002', quantity: 150, totalCost: 6750, status: 'Issued', createdAt: '2026-05-26' }
];

export const GOODS_RECEIPTS: GoodsReceipt[] = [
  { id: 'grn-3001', poId: 'po-2001', supplierId: 'supp-1', materialId: 'mat-002', quantityReceived: 150, lotNumber: 'LOT20260527A', expiryDate: '2027-05-27', status: 'Pending QC', createdAt: '2026-05-28' }
];

export const QC_INSPECTIONS: QCInspection[] = [
  {
    id: 'qc-4001',
    sourceType: 'Incoming',
    referenceId: 'LOT20260527A',
    inspector: 'Elena Rostova',
    status: 'Passed',
    parameters: [
      { name: 'Purity Level', value: '99.7%', expected: '>= 99.5%', passed: true },
      { name: 'Moisture Water %', value: '0.04%', expected: '<= 0.10%', passed: true }
    ],
    createdAt: '2026-05-29'
  }
];

export const REPAIR_TICKETS: RepairTicket[] = [
  { id: 'tix-01', machineId: 'mch-04', requestedBy: 'Marcus Brody', description: 'Hydraulic seal micro leak detected during final packaging run', priority: 'High', status: 'Assigned', assignedTechnician: 'Tariq Al-Fayed', createdAt: '2026-06-03' }
];

export const PM_TASKS: PMTask[] = [
  { id: 'pm-201', machineId: 'mch-01', title: 'Reactor Vessel Chemical Cleanse', dueBy: '2026-06-15', status: 'Pending', checklist: ['Depressurize Reactor', 'Flush lines with neutralizing fluid', 'Inspect internal agitator paddles', 'Replace filter gaskets'] },
  { id: 'pm-202', machineId: 'mch-02', title: 'Homogenizer Motor Bearing Greasing', dueBy: '2026-06-01', status: 'Completed', checklist: ['Expose mixer gears', 'Inject multi-purpose industrial grease', 'Verify RPM balance'], completedBy: 'Tariq Al-Fayed', completedAt: '2026-06-01' },
  { id: 'pm-203', machineId: 'mch-04', title: 'Packaging Arm Alignment Audit', dueBy: '2026-05-30', status: 'Overdue', checklist: ['Recalibrate photoelectric trigger', 'Audit belt tension speed'] }
];

export const SPARE_PARTS: SparePart[] = [
  { id: 'part-01', name: 'High-Temp Reactor Gasket Ring 3.5in', code: 'SP-RNG-3.5', stock: 12, minStock: 5, machineId: 'mch-01' },
  { id: 'part-02', name: 'Automated Dicing Laser Assembly', code: 'SP-LSR-DL2', stock: 2, minStock: 1, machineId: 'mch-03' },
  { id: 'part-03', name: 'Pneumatic Control Valve PV-90', code: 'SP-VLV-PV90', stock: 1, minStock: 3, machineId: 'mch-04' } // trigger PR warning!
];

export const ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-501', employeeId: 'emp-101', date: '2026-06-03', checkIn: '07:45', checkOut: '18:15', gpsCoords: { lat: 13.7563, lng: 100.5018 }, status: 'Present' },
  { id: 'att-502', employeeId: 'emp-103', date: '2026-06-03', checkIn: '08:02', checkOut: '17:000', gpsCoords: { lat: 13.7621, lng: 100.5140 }, status: 'Late' },
  { id: 'att-503', employeeId: 'emp-105', date: '2026-06-03', checkIn: '07:50', checkOut: '17:30', gpsCoords: { lat: 13.7505, lng: 100.4912 }, status: 'Present' },
  { id: 'att-504', employeeId: 'emp-106', date: '2026-06-03', checkIn: '08:50', checkOut: '18:00', gpsCoords: { lat: 13.7563, lng: 100.5018 }, status: 'Present' }
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lv-901', employeeId: 'emp-103', type: 'Annual', startDate: '2026-06-10', endDate: '2026-06-12', reason: 'Family engagement & rest', status: 'Pending' },
  { id: 'lv-902', employeeId: 'emp-104', type: 'Sick', startDate: '2026-05-20', endDate: '2026-05-21', reason: 'High fever', status: 'Approved' }
];

export const OT_REQUESTS: OTRequest[] = [
  { id: 'ot-401', employeeId: 'emp-103', date: '2026-06-02', hours: 3, reason: 'Complete Batch Code S-3 Production run', status: 'Approved' },
  { id: 'ot-402', employeeId: 'emp-105', date: '2026-06-03', hours: 2, reason: 'Urgent diagnostics of mixer motor MX-1', status: 'Pending' }
];

export const PAYROLL_PERIODS: PayrollPeriod[] = [
  { id: 'payp-05', periodName: 'May 2026', startDate: '2026-05-01', endDate: '2026-05-31', status: 'Posted' },
  { id: 'payp-06', periodName: 'June 2026', startDate: '2026-06-01', endDate: '2026-06-30', status: 'Draft' }
];

export const PAYSLIPS: Payslip[] = [
  { id: 'slip-501', payrollPeriodId: 'payp-05', employeeId: 'emp-103', baseSalary: 65000, otPay: 4800, allowanceSum: 6000, bonus: 0, ssoDeduction: 750, taxDeduction: 3500, netPay: 71550, pdfGenerated: true },
  { id: 'slip-502', payrollPeriodId: 'payp-05', employeeId: 'emp-105', baseSalary: 72000, otPay: 2100, allowanceSum: 5000, bonus: 5000, ssoDeduction: 750, taxDeduction: 4200, netPay: 79150, pdfGenerated: true }
];

export const TRANSACTIONS: AccountTransaction[] = [
  { id: 'tx-201', date: '2026-05-25', type: 'Credit', category: 'Revenue', amount: 82500, description: 'Apex Microelectronics - Paid Invoice INV-6091' },
  { id: 'tx-202', date: '2026-05-28', type: 'Debit', category: 'Payroll Posting', amount: 150700, description: 'Posted Salaries & Wages for May 2026 Period' },
  { id: 'tx-203', date: '2026-05-29', type: 'Debit', category: 'Production Cost Posting', amount: 60500, description: 'Manufacturing Order Costing Posting MO-2401' },
  { id: 'tx-204', date: '2026-06-01', type: 'Debit', category: 'Expense', amount: 14200, description: 'Electricity Grid Heavy Industrial Draw Invoice' },
  { id: 'tx-205', date: '2026-06-02', type: 'Credit', category: 'Revenue', amount: 45000, description: 'BlueTech Aerospace Order deposit' }
];

export const INVOICES: Invoice[] = [
  { id: 'inv-101', customerId: 'cust-1', amount: 82500, dueDate: '2026-06-15', status: 'Paid', createdAt: '2026-05-15' },
  { id: 'inv-102', customerId: 'cust-2', amount: 125000, dueDate: '2026-06-20', status: 'Unpaid', createdAt: '2026-05-20' },
  { id: 'inv-103', customerId: 'cust-3', amount: 38000, dueDate: '2026-06-01', status: 'Overdue', createdAt: '2026-05-01' }
];

export const SUPPLIER_BILLS: SupplierBill[] = [
  { id: 'bill-101', supplierId: 'supp-1', amount: 14000, dueDate: '2026-06-10', status: 'Unpaid', createdAt: '2026-05-10' },
  { id: 'bill-102', supplierId: 'supp-2', amount: 1800, dueDate: '2026-06-01', status: 'Paid', createdAt: '2026-05-01' }
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', user: 'Edward Vane', role: 'Admin', action: 'System Initialized / Bootstrapped Master Schema', timestamp: '2026-06-04 01:20:10', module: 'System' },
  { id: 'log-2', user: 'Kenji Sato', role: 'R&D', action: 'Approved Formula version 2.4 for SKU IDV-PRSH-100', timestamp: '2026-06-04 01:25:00', module: 'Production' },
  { id: 'log-3', user: 'Marcus Brody', role: 'Production', action: 'Created MO-2403 Product prod-003', timestamp: '2026-06-04 01:31:12', module: 'Production' }
];
