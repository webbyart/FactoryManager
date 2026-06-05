import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';

import { 
  DEPARTMENTS, ROLES, EMPLOYEES, CUSTOMERS, SUPPLIERS, PRODUCTS, MATERIALS, 
  FORMULAS, MACHINES, MANUFACTURING_ORDERS, REPAIR_TICKETS, PM_TASKS, SPARE_PARTS, 
  ATTENDANCE, LEAVE_REQUESTS, OT_REQUESTS, PAYROLL_PERIODS, PAYSLIPS, TRANSACTIONS, 
  INVOICES, SUPPLIER_BILLS, AUDIT_LOGS, GOODS_RECEIPTS, PURCHASE_ORDERS, 
  PURCHASE_REQUESTS, QC_INSPECTIONS
} from "./src/data/mockFactoryData";

import { 
  Employee, Material, Product, Formula, Machine, ManufacturingOrder, 
  RepairTicket, PMTask, SparePart, AttendanceRecord, LeaveRequest, OTRequest, 
  PayrollPeriod, Payslip, AccountTransaction, Invoice, SupplierBill, AuditLog, 
  QCInspection, PurchaseRequest, PurchaseOrder, GoodsReceipt
} from "./src/types"; // Path alignment

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Server State Store
let dbState = {
  departments: [...DEPARTMENTS],
  roles: [...ROLES],
  employees: [...EMPLOYEES],
  customers: [...CUSTOMERS],
  suppliers: [...SUPPLIERS],
  products: [...PRODUCTS],
  materials: [...MATERIALS],
  formulas: [...FORMULAS],
  machines: [...MACHINES],
  manufacturingOrders: [...MANUFACTURING_ORDERS],
  purchaseRequests: [...PURCHASE_REQUESTS],
  purchaseOrders: [...PURCHASE_ORDERS],
  goodsReceipts: [...GOODS_RECEIPTS],
  qcInspections: [...QC_INSPECTIONS],
  repairTickets: [...REPAIR_TICKETS],
  pmTasks: [...PM_TASKS],
  spareParts: [...SPARE_PARTS],
  attendance: [...ATTENDANCE],
  leaveRequests: [...LEAVE_REQUESTS],
  otRequests: [...OT_REQUESTS],
  payrollPeriods: [...PAYROLL_PERIODS],
  payslips: [...PAYSLIPS],
  transactions: [...TRANSACTIONS],
  invoices: [...INVOICES],
  supplierBills: [...SUPPLIER_BILLS],
  bills: [...SUPPLIER_BILLS], // Alias for Accounting tab safety
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
  auditLogs: [...AUDIT_LOGS],
  notifications: [
    { id: 'n-1', message: 'Welcome to IDEVA Factory OS - System Boot Completed', severity: 'info', createdAt: new Date().toISOString() },
    { id: 'n-2', message: 'Alert: Spare Part SP-VLV-PV90 is below core minStock. Manual or auto PR check triggered.', severity: 'warning', createdAt: new Date().toISOString() }
  ]
};

// Automation helper to generate notifications & audit logs
function createEventLog(message: string, module: 'Production' | 'Maintenance' | 'HR' | 'Accounting' | 'System', severity: 'info' | 'warning' | 'error' = 'info', user = 'System Daemon') {
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  dbState.auditLogs.unshift({
    id: logId,
    user,
    role: 'System',
    action: message,
    timestamp,
    module
  });

  dbState.notifications.unshift({
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000000)}`,
    message,
    severity,
    createdAt: new Date().toISOString()
  });
}

// ----------------------------------------------------
// AUTOMATIC TRIGGERS & SYNC ENGINE
// ----------------------------------------------------
function runStateAutomations() {
  // 1. When Material Stock < Minimum -> Create PR Automatically
  dbState.materials.forEach(mat => {
    if (mat.stockLevel < mat.minStock) {
      // Check if open PR already exists for this material
      const extPR = dbState.purchaseRequests.find(pr => pr.materialId === mat.id && pr.status === 'Draft');
      if (!extPR) {
        const prId = `pr-auto-${Date.now()}-${Math.floor(Math.random()*100)}`;
        dbState.purchaseRequests.push({
          id: prId,
          materialId: mat.id,
          quantity: Math.max(mat.minStock * 2, 100),
          urgency: 'High',
          status: 'Draft',
          requestedBy: 'Auto Stock Engine',
          createdAt: new Date().toISOString().split('T')[0]
        });
        createEventLog(`[STOCK AUTOMATION] Raw Material ${mat.name} (${mat.code}) stock level is ${mat.stockLevel}/${mat.minStock}. Created Auto Purchase Request ${prId}.`, 'Production', 'warning');
      }
    }
  });

  // 2. When Spare Part < Minimum -> Create Warning/Notify Technician
  dbState.spareParts.forEach(part => {
    if (part.stock < part.minStock) {
      const extAlert = dbState.notifications.find(n => n.message.includes(`Spare Part ${part.name} under minimum stock`));
      if (!extAlert) {
        createEventLog(`[SPARE WARNING] Stock of spare part ${part.name} is ${part.stock}/${part.minStock}. Repair capability might be affected.`, 'Maintenance', 'warning');
      }
    }
  });

  // 3. When PM Task is overdue -> Notify Maintenance team
  const todayStr = new Date().toISOString().split('T')[0];
  dbState.pmTasks.forEach(pm => {
    if (pm.status === 'Pending' && pm.dueBy < todayStr) {
      pm.status = 'Overdue';
      createEventLog(`[OVERDUE PM] Preventive Maintenance task '${pm.title}' for machine ${pm.machineId} is OVERDUE (Due: ${pm.dueBy})`, 'Maintenance', 'error');
    }
  });

  // 4. When Invoice is overdue -> Notify Accounting
  dbState.invoices.forEach(inv => {
    if (inv.status === 'Unpaid' && inv.dueDate < todayStr) {
      inv.status = 'Overdue';
      createEventLog(`[OVERDUE INVOICE] Customer Invoice ${inv.id} has breached due date ${inv.dueDate}. Balance of $${inv.amount.toLocaleString()} is OVERDUE.`, 'Accounting', 'error');
    }
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Consolidated DB State
app.get("/api/state", (req, res) => {
  runStateAutomations();
  res.json(dbState);
});

// Reset State
app.post("/api/state/reset", (req, res) => {
  dbState = {
    departments: [...DEPARTMENTS],
    roles: [...ROLES],
    employees: [...EMPLOYEES],
    customers: [...CUSTOMERS],
    suppliers: [...SUPPLIERS],
    products: [...PRODUCTS],
    materials: [...MATERIALS],
    formulas: [...FORMULAS],
    machines: [...MACHINES],
    manufacturingOrders: [...MANUFACTURING_ORDERS],
    purchaseRequests: [...PURCHASE_REQUESTS],
    purchaseOrders: [...PURCHASE_ORDERS],
    goodsReceipts: [...GOODS_RECEIPTS],
    qcInspections: [...QC_INSPECTIONS],
    repairTickets: [...REPAIR_TICKETS],
    pmTasks: [...PM_TASKS],
    spareParts: [...SPARE_PARTS],
    attendance: [...ATTENDANCE],
    leaveRequests: [...LEAVE_REQUESTS],
    otRequests: [...OT_REQUESTS],
    payrollPeriods: [...PAYROLL_PERIODS],
    payslips: [...PAYSLIPS],
    transactions: [...TRANSACTIONS],
    invoices: [...INVOICES],
    supplierBills: [...SUPPLIER_BILLS],
    bills: [...SUPPLIER_BILLS], // Alias for Accounting tab safety
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
    auditLogs: [...AUDIT_LOGS],
    notifications: [
      { id: 'n-1', message: 'System Hard Reset Initiated - Seeded Production Data Reloaded', severity: 'info', createdAt: new Date().toISOString() }
    ]
  };
  createEventLog("Factory Master Database restored to seeded default ERP state.", "System", "info");
  res.json({ success: true, message: "Database state completely reset and seeded successfully." });
});

// Generic CRUD Update API
app.post("/api/generic/update", (req, res) => {
  const { table, item } = req.body;
  if (!table || !item || !item.id) {
    return res.status(400).json({ error: "Missing table name or item details with a valid id." });
  }
  if (!dbState[table]) {
    return res.status(404).json({ error: `Table '${table}' not found in database state.` });
  }
  
  const index = dbState[table].findIndex((x: any) => x.id === item.id);
  if (index === -1) {
    return res.status(404).json({ error: `Item with id '${item.id}' not found in table '${table}'.` });
  }

  // Preserve other fields and overwrite
  dbState[table][index] = { ...dbState[table][index], ...item };
  
  createEventLog(`Updated record in ${table} (ID: ${item.id}) via Sheet Editor`, "System", "info");
  res.json({ success: true, message: `Updated row in ${table} successfully.`, item: dbState[table][index] });
});

// Generic CRUD Delete API
app.post("/api/generic/delete", (req, res) => {
  const { table, id } = req.body;
  if (!table || !id) {
    return res.status(400).json({ error: "Missing table name or item id." });
  }
  if (!dbState[table]) {
    return res.status(404).json({ error: `Table '${table}' not found in database state.` });
  }
  
  const initialLength = dbState[table].length;
  dbState[table] = dbState[table].filter((x: any) => x.id !== id);
  
  if (dbState[table].length === initialLength) {
    return res.status(404).json({ error: `Item with id '${id}' not found in table '${table}'.` });
  }
  
  createEventLog(`Deleted record in ${table} (ID: ${id}) via Sheet Editor`, "System", "warning");
  res.json({ success: true, message: `Deleted row in ${table} successfully.` });
});

// Generic CRUD Add API
app.post("/api/generic/create", (req, res) => {
  const { table, item } = req.body;
  if (!table || !item) {
    return res.status(400).json({ error: "Missing table name or item data." });
  }
  if (!dbState[table]) {
    return res.status(404).json({ error: `Table '${table}' not found.` });
  }
  
  const newItem = {
    id: item.id || `${table.substring(0, 3)}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
    ...item
  };
  
  dbState[table].push(newItem);
  createEventLog(`Created new record in ${table} (ID: ${newItem.id}) via Sheet Editor`, "System", "info");
  res.json({ success: true, message: `Created record in ${table} successfully.`, item: newItem });
});

// --- MODULE 1: PRODUCTION & PROCUREMENT ---

// Create MO & Generate Material Requirements
app.post("/api/mo/create", (req, res) => {
  const { productId, formulaId, quantityRequested } = req.body;
  if (!productId || !formulaId || !quantityRequested) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const moId = `mo-${Date.now().toString().slice(-4)}`;
  const formula = dbState.formulas.find(f => f.id === formulaId);
  const prod = dbState.products.find(p => p.id === productId);

  if (!formula || !prod) {
    return res.status(404).json({ error: "Formula or Product not found." });
  }

  const newMO: ManufacturingOrder = {
    id: moId,
    productId,
    formulaId,
    quantityRequested: Number(quantityRequested),
    quantityProduced: 0,
    startDate: new Date().toISOString().split('T')[0],
    status: 'Created'
  };

  dbState.manufacturingOrders.unshift(newMO);
  createEventLog(`Manufacturing Order ${moId} created for ${quantityRequested} units of ${prod.name}`, 'Production', 'info');

  // TRIGGER: When MO Created -> Generate Material Requirement & Material Reservation check
  formula.items.forEach(item => {
    const requiredQty = item.quantity * Number(quantityRequested);
    const material = dbState.materials.find(m => m.id === item.materialId);
    if (material) {
      createEventLog(`[MO REQUIREMENT] Order ${moId} requires ${requiredQty.toFixed(2)} ${material.unit} of raw ingredient ${material.name}`, 'Production', 'info');
    }
  });

  runStateAutomations();
  res.json({ success: true, mo: newMO });
});

// Update MO Workflow State
app.post("/api/mo/status", (req, res) => {
  const { moId, status } = req.body;
  const mo = dbState.manufacturingOrders.find(o => o.id === moId);
  if (!mo) {
    return res.status(404).json({ error: "MO not found" });
  }

  const oldStatus = mo.status;
  mo.status = status;
  createEventLog(`Manufacturing Order ${moId} workflow transitioned from ${oldStatus} to ${status}`, 'Production', 'info');

  // Trigger effect: When Material is ISSUED -> Deduct stock
  if (status === 'Material Issued' && oldStatus !== 'Material Issued') {
    const formula = dbState.formulas.find(f => f.id === mo.formulaId);
    if (formula) {
      formula.items.forEach(item => {
        const material = dbState.materials.find(m => m.id === item.materialId);
        if (material) {
          const deduct = item.quantity * mo.quantityRequested;
          material.stockLevel = Math.max(0, Number((material.stockLevel - deduct).toFixed(2)));
          createEventLog(`Inventory Deducted: ${deduct} ${material.unit} of ${material.name} issued for assembly ${moId}`, 'Production', 'info');
        }
      });
    }
  }

  // Trigger effect: When we reach Finished Goods QC -> create a Finished Goods QC check automatically
  if (status === 'Finished Goods QC' && oldStatus !== 'Finished Goods QC') {
    const qcId = `qc-fg-${Date.now().toString().slice(-4)}`;
    const product = dbState.products.find(p => p.id === mo.productId);
    
    dbState.qcInspections.unshift({
      id: qcId,
      sourceType: 'Finished Goods',
      referenceId: moId,
      inspector: 'Elena Rostova',
      status: 'Pending',
      parameters: [
        { name: 'Labeling & QR verification', value: 'Pending', expected: 'Accurate barcode & ID label', passed: false },
        { name: 'Product Purity Test', value: 'Pending', expected: 'High grade purity spec matching BOM', passed: false }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    });
    createEventLog(`Manufacturing Finished: Automated QC Inspection request logged for Finished Goods: Batch Reference: ${moId}`, 'Production', 'warning');
  }

  // Cost analysis posting when MO is released
  if (status === 'Released' && oldStatus !== 'Released') {
    mo.quantityProduced = mo.quantityRequested;
    const prod = dbState.products.find(p => p.id === mo.productId);
    
    // Auto calculate ERP Standard Costing breakdown
    const rawCost = Math.round(mo.quantityRequested * (prod ? prod.costPrice * 0.65 : 200));
    const pkgCost = Math.round(mo.quantityRequested * (prod ? prod.costPrice * 0.10 : 30));
    const laborCost = Math.round(mo.quantityRequested * 25);
    const overheadCost = Math.round(mo.quantityRequested * 15);
    const lossCost = Math.round(mo.quantityRequested * 3);
    const totalCost = rawCost + pkgCost + laborCost + overheadCost + lossCost;
    const costPerPiece = Number((totalCost / mo.quantityRequested).toFixed(2));

    mo.costSummary = {
      materialCost: rawCost,
      packagingCost: pkgCost,
      laborCost,
      overheadCost,
      lossCost,
      totalCost,
      costPerPiece
    };

    if (prod) {
      prod.stockLevel += mo.quantityRequested;
    }

    // TRIGGER: When MO Released -> Post production cost into General Ledger
    dbState.transactions.push({
      id: `tx-prod-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: 'Debit',
      category: 'Production Cost Posting',
      amount: totalCost,
      description: `Production release ledger posting for MO ${moId} (${mo.quantityRequested} units compiled)`
    });

    createEventLog(`[PRODUCTION POSTING] MO ${moId} fully costed & released. General ledger posted with Debit of $${totalCost.toLocaleString()} in production overhead costs. Finished products added to master warehouses.`, 'Accounting', 'info');
  }

  runStateAutomations();
  res.json({ success: true, mo });
});

// PROCUREMENT API
app.post("/api/procurement/pr/create", (req, res) => {
  const { materialId, quantity, urgency } = req.body;
  const prId = `pr-${Date.now().toString().slice(-4)}`;
  
  const newPR: PurchaseRequest = {
    id: prId,
    materialId,
    quantity: Number(quantity),
    urgency,
    status: 'Draft',
    requestedBy: 'Senior System Planner',
    createdAt: new Date().toISOString().split('T')[0]
  };

  dbState.purchaseRequests.unshift(newPR);
  createEventLog(`Manual Purchase Request ${prId} logged for Material ID: ${materialId}`, 'Production', 'info');
  res.json({ success: true, pr: newPR });
});

app.post("/api/procurement/po/create", (req, res) => {
  const { prId, supplierId, materialId, quantity } = req.body;
  const poId = `po-${Date.now().toString().slice(-4)}`;
  const pr = dbState.purchaseRequests.find(r => r.id === prId);
  const material = dbState.materials.find(m => m.id === materialId);
  
  if (pr) {
    pr.status = 'Ordered';
  }

  const cost = Number(quantity) * (material ? material.costPerUnit : 10);

  const newPO: PurchaseOrder = {
    id: poId,
    prId,
    supplierId,
    materialId,
    quantity: Number(quantity),
    totalCost: cost,
    status: 'Issued',
    createdAt: new Date().toISOString().split('T')[0]
  };

  dbState.purchaseOrders.unshift(newPO);
  createEventLog(`Purchase Order ${poId} generated and issued to Supplier ID: ${supplierId}. Total PO Cost: $${cost}`, 'Production', 'info');
  res.json({ success: true, po: newPO });
});

// Trigger: When GRN Received -> Create IQC Pending
app.post("/api/procurement/grn/receive", (req, res) => {
  const { poId, lotNumber, expiryDate, quantityReceived } = req.body;
  const po = dbState.purchaseOrders.find(o => o.id === poId);
  
  if (!po) {
    return res.status(404).json({ error: "PO not found" });
  }

  const grnId = `grn-${Date.now().toString().slice(-4)}`;
  const newGRN: GoodsReceipt = {
    id: grnId,
    poId,
    supplierId: po.supplierId,
    materialId: po.materialId,
    quantityReceived: Number(quantityReceived),
    lotNumber,
    expiryDate,
    status: 'Pending QC',
    createdAt: new Date().toISOString().split('T')[0]
  };

  dbState.goodsReceipts.unshift(newGRN);
  
  // Set PO Status
  po.status = 'Partially Received';

  // TRIGGER: Create Pending IQC Record
  const qcId = `qc-grn-${Date.now().toString().slice(-4)}`;
  const materialName = dbState.materials.find(m => m.id === po.materialId)?.name || 'Chemical Mat';
  
  dbState.qcInspections.unshift({
    id: qcId,
    sourceType: 'Incoming',
    referenceId: lotNumber,
    inspector: 'Elena Rostova',
    status: 'Pending',
    parameters: [
      { name: 'Supplier Certification Verification', value: 'Pending', expected: 'Certificate matching ISO standards', passed: false },
      { name: 'Moisture Water % Check', value: 'Pending', expected: '<= 1.0%', passed: false },
      { name: 'AQL Packaging Damage Audit', value: 'Pending', expected: 'No tear or leaks', passed: false }
    ],
    createdAt: new Date().toISOString().split('T')[0]
  });

  createEventLog(`[GRN RECEIVED] Goods Receiving entry ${grnId} processed. Created IQC verification ticket ${qcId} for lot ${lotNumber}.`, 'Production', 'warning');

  res.json({ success: true, grn: newGRN });
});

// QC Inspections Approve / Reject Trigger Workflows
app.post("/api/qc/resolve", (req, res) => {
  const { inspectionId, status, inspectorComments } = req.body;
  const qc = dbState.qcInspections.find(q => q.id === inspectionId);
  if (!qc) {
    return res.status(404).json({ error: "QC Ticket not found." });
  }

  qc.status = status;
  qc.inspector = 'Elena Rostova';
  qc.parameters.forEach(p => {
    p.passed = (status === 'Passed');
    p.value = (status === 'Passed') ? 'Verified OK' : 'Out of spec limit';
  });

  if (qc.sourceType === 'Incoming') {
    // Locate GRN by referencing LOT / ID
    const grn = dbState.goodsReceipts.find(g => g.lotNumber === qc.referenceId);
    if (grn) {
      grn.status = (status === 'Passed') ? 'QC Approved' : 'QC Rejected';
      const material = dbState.materials.find(m => m.id === grn.materialId);

      if (status === 'Passed') {
        if (material) {
          material.stockLevel += grn.quantityReceived;
        }
        createEventLog(`[QC PASSED] Raw material Lot ${grn.lotNumber} certified. Added ${grn.quantityReceived} ${material?.unit} into active factory inventory.`, 'Production', 'info');
      } else {
        // TRIGGER WORKFLOW: When IQC Rejected -> Lock Lot -> Create NCR
        createEventLog(`[NCR DETECTED - RAW LOT LOCKED] IQC Reject critical incident for Lot ${grn.lotNumber}. Lot permanently quarantined. Non-Conformance Incident Report filed. supplier informed.`, 'Production', 'error');
      }
    }
  } else if (qc.sourceType === 'Finished Goods') {
    const mo = dbState.manufacturingOrders.find(o => o.id === qc.referenceId);
    if (mo) {
      if (status === 'Passed') {
        mo.status = 'Released';
        // Auto Release Logic
        const prod = dbState.products.find(p => p.id === mo.productId);
        if (prod) {
          prod.stockLevel += mo.quantityRequested;
          mo.quantityProduced = mo.quantityRequested;
        }
        createEventLog(`[QC FINISHED PASSED] Batch Production ${mo.id} released. Premium Grade seal certified. Stock added to Finished Goods inventory.`, 'Production', 'info');
      } else {
        mo.status = 'Cancelled';
        createEventLog(`[PRODUCTION NCR WORKFLOW] MO ${mo.id} has failed finished product specifications check. Product Lot flagged [HOLD & QUARANTINED]. CAPA incident logged.`, 'Production', 'error');
      }
    }
  }

  runStateAutomations();
  res.json({ success: true, qc });
});


// --- MODULE 2: MAINTENANCE SYSTEM ---

app.post("/api/maintenance/repair/request", (req, res) => {
  const { machineId, description, priority, requestedBy } = req.body;
  const machine = dbState.machines.find(m => m.id === machineId);
  if (!machine) {
    return res.status(404).json({ error: "Machine register not found" });
  }

  const isAlreadyBroken = machine.status === 'Offline' || machine.status === 'Repairing';

  machine.status = 'Repairing';
  const tixId = `tix-${Date.now().toString().slice(-4)}`;
  const tech = "Tariq Al-Fayed"; // Default Tech assigned

  const newTicket: RepairTicket = {
    id: tixId,
    machineId,
    requestedBy: requestedBy || 'Marcus Brody',
    description,
    priority,
    status: 'Assigned',
    assignedTechnician: tech,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  dbState.repairTickets.unshift(newTicket);

  // TRIGGER: When Repair Requested -> Notify Technician
  createEventLog(`[MAINTENANCE NOTIFICATION] Repair Request ${tixId} received for Machine: ${machine.name}. Technician ${tech} dispatched immediately. Priority: ${priority}`, 'Maintenance', 'warning');

  res.json({ success: true, ticket: newTicket, machine });
});

app.post("/api/maintenance/repair/resolve", (req, res) => {
  const { ticketId, rootCause, correctiveAction } = req.body;
  const ticket = dbState.repairTickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  ticket.status = 'Resolved';
  ticket.rootCause = rootCause || 'Worn sealant ring seal fatigue';
  ticket.correctiveAction = correctiveAction || 'Replaced gasket ring and recalibrated hydraulic pressure sensors';
  ticket.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const machine = dbState.machines.find(m => m.id === ticket.machineId);
  if (machine) {
    machine.status = 'Online';
  }

  createEventLog(`[REPAIR RESOLVED] Machine ${machine ? machine.name : ticket.machineId} returned online. Component updated: ${ticket.correctiveAction}`, 'Maintenance', 'info');

  res.json({ success: true, ticket });
});

app.post("/api/maintenance/pm/complete", (req, res) => {
  const { pmTaskId } = req.body;
  const pm = dbState.pmTasks.find(t => t.id === pmTaskId);
  if (!pm) {
    return res.status(404).json({ error: "PM task not found" });
  }

  pm.status = 'Completed';
  pm.completedBy = 'Tariq Al-Fayed';
  pm.completedAt = new Date().toISOString().split('T')[0];

  createEventLog(`[PREVENTIVE MAINTENANCE] Task '${pm.title}' completed successfully for machine ${pm.machineId}. Clean audit report filed.`, 'Maintenance', 'info');

  res.json({ success: true, pm });
});


// --- MODULE 3: HR & PAYROLL SYSTEM ---

app.post("/api/hr/attendance/clock", (req, res) => {
  const { employeeId, checkType, gpsCoords } = req.body;
  const emp = dbState.employees.find(e => e.id === employeeId);
  if (!emp) {
    return res.status(404).json({ error: "Employee record not found" });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().substring(0, 5);

  let record = dbState.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);

  if (checkType === 'Check In') {
    if (record) {
      return res.status(400).json({ error: "Already checked in today." });
    }
    const isLate = timeStr > '08:00';
    record = {
      id: `att-${Date.now().toString().slice(-4)}`,
      employeeId,
      date: todayStr,
      checkIn: timeStr,
      gpsCoords: gpsCoords || { lat: 13.7563, lng: 100.5018 },
      status: isLate ? 'Late' : 'Present'
    };
    dbState.attendance.push(record);
    createEventLog(`[ATTENDANCE] Employee ${emp.name} clocked-in at ${timeStr}. Verified GPS lock. Status: ${record.status}`, 'HR', 'info');
  } else {
    if (!record) {
      return res.status(400).json({ error: "You must clock-in before checking out." });
    }
    record.checkOut = timeStr;
    createEventLog(`[ATTENDANCE] Employee ${emp.name} checked-out at ${timeStr}. Verified work shift completion.`, 'HR', 'info');
  }

  res.json({ success: true, record });
});

// Calculate & Post Payroll
app.post("/api/hr/payroll/post", (req, res) => {
  const { periodId } = req.body;
  const period = dbState.payrollPeriods.find(p => p.id === periodId);
  if (!period) {
    return res.status(404).json({ error: "Payroll Period does not exist." });
  }

  period.status = 'Posted';

  let totalPaySummaries = 0;

  // Process all employees
  dbState.employees.forEach(emp => {
    // Look up if payslip exists, otherwise build it
    let slip = dbState.payslips.find(s => s.employeeId === emp.id && s.payrollPeriodId === periodId);
    
    const base = emp.salary;
    const allowance = emp.allowance;
    const ot = 4500; // Simulated OT
    const bonus = 0;
    const sso = 750;
    const tax = Math.round(base * 0.08);
    const net = base + allowance + ot + bonus - sso - tax;

    if (!slip) {
      slip = {
        id: `slip-${Date.now().toString().slice(-4)}-${emp.id}`,
        payrollPeriodId: periodId,
        employeeId: emp.id,
        baseSalary: base,
        otPay: ot,
        allowanceSum: allowance,
        bonus,
        ssoDeduction: sso,
        taxDeduction: tax,
        netPay: net,
        pdfGenerated: true
      };
      dbState.payslips.push(slip);
    } else {
      slip.pdfGenerated = true;
    }

    totalPaySummaries += net;
  });

  // TRIGGER: When Payroll Approved -> Post to Accounting Ledger
  dbState.transactions.push({
    id: `tx-pay-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Debit',
    category: 'Payroll Posting',
    amount: totalPaySummaries,
    description: `Wages & salaries disbursement posting for period ${period.periodName}`
  });

  createEventLog(`[PAYROLL POSTED TO GL] Payroll Period ${period.periodName} completed and locked. General ledger posted with a Debit transaction card of $${totalPaySummaries.toLocaleString()} under company payroll accounts. payslips sent automatically.`, 'Accounting', 'info');

  res.json({ success: true, period });
});


// --- MODULE 4: FINANCIAL ACCOUNTING ---

app.post("/api/accounting/invoice/pay", (req, res) => {
  const { id } = req.body;
  const invoice = dbState.invoices.find(i => i.id === id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  invoice.status = 'Paid';

  // TRIGGER: Create accounts transaction ledger Cr Revenue
  dbState.transactions.push({
    id: `tx-inv-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Credit',
    category: 'Revenue',
    amount: invoice.amount,
    description: `Apex AR Posting Receipt: Client payment cleared for invoice ID: ${id}`
  });

  createEventLog(`[REVENUE Cleared] Accounts Receivable invoice ${id} paid in full ($${invoice.amount.toLocaleString()} received). Cash accounts updated.`, 'Accounting', 'info');

  res.json({ success: true, invoice });
});

app.post("/api/accounting/expense/add", (req, res) => {
  const { amount, description, category } = req.body;
  
  const newTx: AccountTransaction = {
    id: `tx-exp-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Debit',
    category: category || 'Expense',
    amount: Number(amount),
    description
  };

  dbState.transactions.unshift(newTx);
  createEventLog(`Manual expense booked: ${description} - Total $${Number(amount).toLocaleString()}`, 'Accounting', 'info');
  res.json({ success: true, transaction: newTx });
});


// --- EXECUTIVE AI GEMINI COPILOT ---
app.post("/api/copilot", async (req, res) => {
  const { message } = req.body;
  
  // Set default recommendation in case API key is missing
  let aiResponse = `### IDEVA Factory OS Architect Insights

I detected that the Gemini API Key is unconfigured in your developer studio environment. Let me provide my offline heuristic-analytic recommendations based on your active factory state:

- **Inventory warning**: Your *Double-walled Export Carton Box* is currently running at **${dbState.materials[4].stockLevel} units** which is below the strategic safety threshold of **${dbState.materials[4].minStock} pieces**. Standard replacement purchase request PR-1002 has been automatically issued to avoid a complete bottleneck at packaging lines.
- **Maintenance status**: Machine **${dbState.machines[3].name}** is on active maintenance due to hydraulic pressure issues (Repair Ticket **tix-01**). Priority dispatch is marked Critical with Tariq Al-Fayed assigned.
- **Financial summary**: Year-to-Date production costs represent **$${(dbState.transactions.filter(t => t.category === "Production Cost Posting").reduce((acc, current) => acc+current.amount, 0)).toLocaleString()}** with a strong operating cashflow margin. Highly recommend approving June payroll early to ensure uninterrupted floor operations.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptContext = `
        You are the Chief AI Operating Architect at IDEVA Factory OS, an advanced ERP suite worth $50,000 for manufacturing enterprises.
        
        Analyze this live industrial database metrics:
        1. Materials Stock Inventory: ${JSON.stringify(dbState.materials)}
        2. Maintenance Machines states: ${JSON.stringify(dbState.machines)}
        3. Active Manufacturing Orders: ${JSON.stringify(dbState.manufacturingOrders)}
        4. Repair Tickets: ${JSON.stringify(dbState.repairTickets)}
        5. Financial Transactions ledger categories: ${JSON.stringify(dbState.transactions)}
        6. System Logs and warnings: ${JSON.stringify(dbState.auditLogs.slice(0,5))}
        
        The user has sent the following advisory query: "${message}"
        
        Provide an executive-grade suite architecture report and tactical recommendations. Focus on optimizing bottlenecks, inventory forecasting, machine MTBF analysis, and workflow efficiency. Use rich markdown formatting, clean structural bulleting, and a high-level corporate tone. Make it extremely specific to the live metrics shown above. Mention specific raw materials or orders.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
      });

      if (response && response.text) {
        aiResponse = response.text;
      }
    }
  } catch (err: any) {
    console.error("AI Copilot request error: ", err);
    aiResponse += `\n\n*(Note: Client-side simulation mode engaged due to model service connection: ${err.message})*`;
  }

  res.json({ response: aiResponse });
});

// --- PORTING DELIVERABLE: SQL DDL SCHEMAS AND ER DIAGRAM ---
app.get("/api/db/schema", (req, res) => {
  const schemaDDL = `-- ========================================================
-- IDEVA Factory OS v1.0 Enterprise Database DDL
-- SQL Target Dialect: PostgreSQL 15+ / Cloud SQL
-- Generated dynamically on ${new Date().toISOString()}
-- Architecture: Unified Master Shared Model
-- ========================================================

-- Disable constraints temporarily to safely build
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Clean existing entities
DROP TABLE IF EXISTS account_transactions CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payroll_periods CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS repair_tickets CASCADE;
DROP TABLE IF EXISTS pm_tasks CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS qc_inspections CASCADE;
DROP TABLE IF EXISTS goods_receipts CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS manufacturing_orders CASCADE;
DROP TABLE IF EXISTS formula_details CASCADE;
DROP TABLE IF EXISTS formula_headers CASCADE;
DROP TABLE IF EXISTS material_master CASCADE;
DROP TABLE IF EXISTS product_master CASCADE;
DROP TABLE IF EXISTS supplier_master CASCADE;
DROP TABLE IF EXISTS customer_master CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- -------------------------------------------------------------
-- SECTION A: MASTER SHARED DATA SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    permitted_menus TEXT[] NOT NULL
);

CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Active' CHECK(status IN ('Active', 'On Leave', 'Suspended')),
    salary NUMERIC(12,2) NOT NULL,
    allowance NUMERIC(12,2) DEFAULT 0.00,
    joining_date DATE NOT NULL,
    skills TEXT[]
);

CREATE TABLE customer_master (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    address TEXT
);

CREATE TABLE supplier_master (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE product_master (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    min_stock INTEGER DEFAULT 10,
    stock_level INTEGER DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL,
    sell_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE material_master (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) CHECK(category IN ('Raw Material', 'Packaging')),
    min_stock NUMERIC(12,2) DEFAULT 10.00,
    stock_level NUMERIC(12,2) DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit NUMERIC(12,2) NOT NULL
);

-- -------------------------------------------------------------
-- SECTION B: PRODUCTION OS SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE formula_headers (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES product_master(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Draft', 'Pending Review', 'Approved', 'Archived')),
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE formula_details (
    id SERIAL PRIMARY KEY,
    formula_id VARCHAR(50) REFERENCES formula_headers(id) ON DELETE CASCADE,
    material_id VARCHAR(50) REFERENCES material_master(id) ON DELETE CASCADE,
    quantity_required NUMERIC(12,4) NOT NULL
);

CREATE TABLE manufacturing_orders (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES product_master(id),
    formula_id VARCHAR(50) REFERENCES formula_headers(id),
    quantity_requested NUMERIC(12,2) NOT NULL,
    quantity_produced NUMERIC(12,2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Created' CHECK (status IN ('Created', 'Material Reserved', 'Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released', 'Cancelled')),
    material_cost NUMERIC(12,2),
    packaging_cost NUMERIC(12,2),
    labor_cost NUMERIC(12,2),
    overhead_cost NUMERIC(12,2),
    loss_cost NUMERIC(12,2),
    total_cost NUMERIC(12,2),
    cost_per_piece NUMERIC(12,2)
);

CREATE TABLE purchase_requests (
    id VARCHAR(50) PRIMARY KEY,
    material_id VARCHAR(50) REFERENCES material_master(id),
    quantity NUMERIC(12,2) NOT NULL,
    urgency VARCHAR(20) CHECK(urgency IN ('Low', 'Medium', 'High')),
    status VARCHAR(30) CHECK(status IN ('Draft', 'Approved', 'Ordered', 'Rejected')),
    requested_by VARCHAR(100) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    pr_id VARCHAR(50) REFERENCES purchase_requests(id) ON DELETE SET NULL,
    supplier_id VARCHAR(50) REFERENCES supplier_master(id),
    material_id VARCHAR(50) REFERENCES material_master(id),
    quantity NUMERIC(12,2) NOT NULL,
    total_cost NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Issued', 'Partially Received', 'Completed', 'Cancelled')),
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE goods_receipts (
    id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) REFERENCES purchase_orders(id),
    supplier_id VARCHAR(50) REFERENCES supplier_master(id),
    material_id VARCHAR(50) REFERENCES material_master(id),
    quantity_received NUMERIC(12,2) NOT NULL,
    lot_number VARCHAR(100) UNIQUE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Pending QC', 'QC Approved', 'QC Rejected')),
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE qc_inspections (
    id VARCHAR(50) PRIMARY KEY,
    source_type VARCHAR(30) CHECK(source_type IN ('Incoming', 'Bulk', 'Finished Goods')),
    reference_id VARCHAR(100) NOT NULL,
    inspector VARCHAR(100) NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Passed', 'Failed', 'Pending')),
    parameters JSONB NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

-- -------------------------------------------------------------
-- SECTION C: MAINTENANCE OS SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE machines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    section VARCHAR(100),
    status VARCHAR(30) CHECK(status IN ('Online', 'Repairing', 'Maintenance', 'Offline')),
    qr_code_url VARCHAR(255) NOT NULL,
    installed_date DATE NOT NULL,
    mtbf_hours NUMERIC(10,2),
    mttr_hours NUMERIC(10,2)
);

CREATE TABLE pm_tasks (
    id VARCHAR(50) PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    due_by DATE NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Pending', 'Completed', 'Overdue')),
    checklist TEXT[] NOT NULL,
    completed_by VARCHAR(100),
    completed_at DATE
);

CREATE TABLE repair_tickets (
    id VARCHAR(50) PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    requested_by VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(30) CHECK(status IN ('Open', 'Assigned', 'In Progress', 'Resolved')),
    assigned_technician VARCHAR(150),
    root_cause TEXT,
    corrective_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- -------------------------------------------------------------
-- SECTION D: HR & PAYROLL OS SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    gps_lat NUMERIC(9,6),
    gps_lng NUMERIC(9,6),
    status VARCHAR(20) CHECK(status IN ('Present', 'Late', 'Absent')),
    UNIQUE(employee_id, date)
);

CREATE TABLE payroll_periods (
    id VARCHAR(50) PRIMARY KEY,
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Draft', 'Approved', 'Posted'))
);

CREATE TABLE payslips (
    id VARCHAR(50) PRIMARY KEY,
    payroll_period_id VARCHAR(50) REFERENCES payroll_periods(id),
    employee_id VARCHAR(50) REFERENCES employees(id),
    base_salary NUMERIC(12,2) NOT NULL,
    ot_pay NUMERIC(12,2) DEFAULT 0.00,
    allowance_sum NUMERIC(12,2) DEFAULT 0.00,
    bonus NUMERIC(12,2) DEFAULT 0.00,
    sso_deduction NUMERIC(12,2) DEFAULT 0.00,
    tax_deduction NUMERIC(12,2) DEFAULT 0.00,
    net_pay NUMERIC(12,2) NOT NULL,
    pdf_generated BOOLEAN DEFAULT FALSE
);

-- -------------------------------------------------------------
-- SECTION E: FINANCIAL ACCOUNTING OS SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE account_transactions (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(10) CHECK(type IN ('Debit', 'Credit')),
    category VARCHAR(50) CHECK(category IN ('Revenue', 'AP', 'AR', 'Expense', 'Tax', 'Payroll Posting', 'Production Cost Posting')),
    amount NUMERIC(12,2) NOT NULL,
    description VARCHAR(255) NOT NULL
);

-- INDEXES FOR ENTERPRISE RESOLUTION SPEED --
CREATE INDEX idx_emp_dept ON employees(department_id);
CREATE INDEX idx_formula_product ON formula_headers(product_id);
CREATE INDEX idx_mo_prod ON manufacturing_orders(product_id);
CREATE INDEX idx_qc_ref ON qc_inspections(reference_id);
CREATE INDEX idx_repair_machine ON repair_tickets(machine_id);
CREATE INDEX idx_attendance_day ON attendance_records(date, employee_id);
CREATE INDEX idx_ledger_cat ON account_transactions(category, date);

-- SEED STATEMENTS INSERT --
INSERT INTO roles VALUES ('role-admin', 'Admin', ARRAY['Production', 'Maintenance', 'HR', 'Accounting', 'Developer']);
INSERT INTO departments VALUES ('dept-1', 'Administration', 'ADM');
INSERT INTO departments VALUES ('dept-2', 'Production', 'PRD');
INSERT INTO departments VALUES ('dept-3', 'Quality Control', 'QAQC');
`;
  res.json({ ddl: schemaDDL });
});


// ----------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING RUNTIME
// ----------------------------------------------------

async function startServer() {
  // Vite integration in Dev, static file hosting in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware AFTER API routes
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IDEVA OS RUNTIME] Realtime fullstack cluster active at http://localhost:${PORT}`);
  });
}

startServer();
