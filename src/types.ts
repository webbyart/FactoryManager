/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// MASTER DATA TYPES
// ==========================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  roleId: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  salary: number;
  allowance: number;
  joiningDate: string;
  skills: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  id: string;
  name: string;
  permittedMenus: string[]; // List of modules accessible
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  minStock: number;
  stockLevel: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  category: 'Raw Material' | 'Packaging';
  minStock: number;
  stockLevel: number;
  unit: string;
  costPerUnit: number;
}

export interface Formula {
  id: string;
  productId: string;
  version: string;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Archived';
  approvedBy?: string;
  items: {
    materialId: string;
    quantity: number; // relative to 1 unit of product
  }[];
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  section: string;
  status: 'Online' | 'Repairing' | 'Maintenance' | 'Offline';
  qrCodeUrl: string;
  installedDate: string;
  mtbfHours: number; // Mean Time Between Failures
  mttrHours: number; // Mean Time To Repair
}

// ==========================================
// PRODUCTION OS SPECIFICS
// ==========================================

export interface PurchaseRequest {
  id: string;
  materialId: string;
  quantity: number;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Approved' | 'Ordered' | 'Rejected';
  requestedBy: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  prId?: string;
  supplierId: string;
  materialId: string;
  quantity: number;
  totalCost: number;
  status: 'Issued' | 'Partially Received' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  supplierId: string;
  materialId: string;
  quantityReceived: number;
  lotNumber: string;
  expiryDate: string;
  status: 'Pending QC' | 'QC Approved' | 'QC Rejected';
  createdAt: string;
}

export interface QCInspection {
  id: string;
  sourceType: 'Incoming' | 'Bulk' | 'Finished Goods';
  referenceId: string; // GRN lot, Batch number, etc.
  inspector: string;
  status: 'Passed' | 'Failed' | 'Pending';
  parameters: {
    name: string;
    value: string;
    expected: string;
    passed: boolean;
  }[];
  createdAt: string;
}

export interface ManufacturingOrder {
  id: string;
  productId: string;
  formulaId: string;
  quantityRequested: number;
  quantityProduced: number;
  startDate: string;
  endDate?: string;
  status: 'Created' | 'Material Reserved' | 'Material Issued' | 'Weighing' | 'In Production' | 'Packaging' | 'Finished Goods QC' | 'Released' | 'Cancelled';
  costSummary?: {
    materialCost: number;
    packagingCost: number;
    laborCost: number;
    overheadCost: number;
    lossCost: number;
    totalCost: number;
    costPerPiece: number;
  };
}

// ==========================================
// MAINTENANCE OS TYPES
// ==========================================

export interface RepairTicket {
  id: string;
  machineId: string;
  requestedBy: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved';
  assignedTechnician?: string;
  rootCause?: string;
  correctiveAction?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PMTask {
  id: string;
  machineId: string;
  title: string;
  dueBy: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  checklist: string[];
  completedBy?: string;
  completedAt?: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  stock: number;
  minStock: number;
  machineId?: string;
}

// ==========================================
// HR & PAYROLL OS TYPES
// ==========================================

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  gpsCoords?: {
    lat: number;
    lng: number;
  };
  status: 'Present' | 'Late' | 'Absent';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Annual' | 'Sick' | 'Business';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface OTRequest {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PayrollPeriod {
  id: string;
  periodName: string; // e.g. "June 2026"
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Approved' | 'Posted';
}

export interface Payslip {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  baseSalary: number;
  otPay: number;
  allowanceSum: number;
  bonus: number;
  ssoDeduction: number;
  taxDeduction: number;
  netPay: number;
  pdfGenerated: boolean;
}

// ==========================================
// ACCOUNTING OS TYPES
// ==========================================

export interface AccountTransaction {
  id: string;
  date: string;
  type: 'Debit' | 'Credit';
  category: 'Revenue' | 'AP' | 'AR' | 'Expense' | 'Tax' | 'Payroll Posting' | 'Production Cost Posting';
  amount: number;
  description: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
  createdAt: string;
}

export interface SupplierBill {
  id: string;
  supplierId: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
  createdAt: string;
}

// ==========================================
// SYSTEM LOGS & SESSIONS
// ==========================================

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  module: 'Production' | 'Maintenance' | 'HR' | 'Accounting' | 'System';
}
