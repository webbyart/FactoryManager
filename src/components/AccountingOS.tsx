import React, { useState } from 'react';
import { 
  DollarSign, FileText, Plus, Check, Trash2, ArrowUpRight, 
  ArrowDownLeft, AlertCircle, RefreshCw, BarChart2, ShieldCheck, Mail
} from 'lucide-react';
import GoogleSheetEditor from './GoogleSheetEditor';

interface AccountingOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function AccountingOS({ dbState, onRefresh, onNotify, userRole }: AccountingOSProps) {
  const [activeAccTab, setActiveAccTab] = useState<'coa' | 'journal' | 'ar' | 'ap' | 'reports'>('coa');
  
  // States for manual journal slip drafting
  const [journalLines, setJournalLines] = useState<any[]>([
    { accountCode: '', type: 'Debit', amount: 0 },
    { accountCode: '', type: 'Credit', amount: 0 }
  ]);
  const [journalMemo, setJournalMemo] = useState<string>('Adjust inventory accounts');

  // Trigger automated reminder
  const handleSendARReminder = async (invoiceId: string) => {
    try {
      const res = await fetch('/api/accounting/invoice/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`Automated reminder notification transmitted: ${data.message}`, "info");
      }
    } catch {
      onNotify("Error sending invoice reminder alert.", "error");
    }
  };

  const handleSettleInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch('/api/accounting/invoice/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`Invoice marked settled. Cash credited and Receivables adjusted. Journal ID: ${data.journalId}`, "info");
        onRefresh();
      }
    } catch {
      onNotify("Error settling invoice.", "error");
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      const res = await fetch('/api/accounting/bill/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`Accounts Payable bill settled to supplier. Cash disbursed. Journal ID: ${data.journalId}`, "info");
        onRefresh();
      }
    } catch {
      onNotify("Error settling bill.", "error");
    }
  };

  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if(journalLines.some(l => !l.accountCode || l.amount <= 0)) {
      onNotify("All journal segments must map to an account code and contain a positive amount.", "warning");
      return;
    }

    const debitsValue = journalLines.filter(l => l.type === 'Debit').reduce((sum, l) => sum + l.amount, 0);
    const creditsValue = journalLines.filter(l => l.type === 'Credit').reduce((sum, l) => sum + l.amount, 0);

    if(debitsValue !== creditsValue) {
      onNotify(`Double-entry disequilibrium: Total Debits (฿${debitsValue}) must equal Total Credits (฿${creditsValue}). Out of balance by ฿${Math.abs(debitsValue - creditsValue)}.`, "warning");
      return;
    }

    try {
      const res = await fetch('/api/accounting/journal/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: journalLines,
          memo: journalMemo
        })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`Manual double-entry journal post audited and successfully committed! Journal ID: ${data.journal.id}`, "info");
        onRefresh();
        // Reset form
        setJournalLines([
          { accountCode: '', type: 'Debit', amount: 0 },
          { accountCode: '', type: 'Credit', amount: 0 }
        ]);
        setJournalMemo('Adjust inventory accounts');
      } else {
        onNotify(data.error, "error");
      }
    } catch {
      onNotify("Failed to record manual journal.", "error");
    }
  };

  const addJournalLine = () => {
    setJournalLines([...journalLines, { accountCode: '', type: 'Debit', amount: 0 }]);
  };

  const removeJournalLine = (index: number) => {
    if(journalLines.length <= 2) {
      onNotify("Double-entry journals must hold at lease 2 distinct segments.", "warning");
      return;
    }
    setJournalLines(journalLines.filter((_, i) => i !== index));
  };

  const updateJournalLine = (index: number, key: string, val: any) => {
    const list = [...journalLines];
    list[index][key] = val;
    setJournalLines(list);
  };

  // RBAC check
  const isFinanceAuthorised = ['Admin', 'Accounting', 'Management'].includes(userRole);

  // Computations for reports
  const trialBalanceDebits = dbState.coa.filter((ac: any) => ac.type === 'Asset' || ac.type === 'Expense').reduce((sum: number, ac: any) => sum + ac.balance, 0);
  const trialBalanceCredits = dbState.coa.filter((ac: any) => ac.type === 'Liability' || ac.type === 'Equity' || ac.type === 'Revenue').reduce((sum: number, ac: any) => sum + ac.balance, 0);

  // Profit Loss calculations
  const totalRevenues = dbState.coa.filter((ac: any) => ac.type === 'Revenue').reduce((sum: number, ac: any) => sum + ac.balance, 0);
  const totalOperatingExpenses = dbState.coa.filter((ac: any) => ac.type === 'Expense').reduce((sum: number, ac: any) => sum + ac.balance, 0);
  const netEarnings = totalRevenues - totalOperatingExpenses;

  return (
    <div className="space-y-6" id="accounting-os-panel">
      {/* Module Title banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">ระบบจัดทำบัญชีและการเงินองค์กร (Accounting OS &amp; Corporate Ledgers)</h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              ศูนย์รวมสมุดนำส่งบัญชีคู่แยกประเภทตามหลัก GAAP, คุมยอดเก็บค่าลูกหนี้ (A/R) และยอดพิจารณาจ่ายคู่ค้า (A/P) พร้อมวิเคราะห์งบกำไรขาดทุนทันที
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none">
        <button
          type="button"
          onClick={() => setActiveAccTab('coa')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeAccTab === 'coa' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ผังบัญชี (Chart of Accounts)
        </button>
        <button
          type="button"
          onClick={() => setActiveAccTab('journal')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeAccTab === 'journal' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          สมุดรายวันทั่วไป (Journals)
        </button>
        <button
          type="button"
          onClick={() => setActiveAccTab('ar')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeAccTab === 'ar' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          บัญชีลูกหนี้การค้า (Receivables)
        </button>
        <button
          type="button"
          onClick={() => setActiveAccTab('ap')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeAccTab === 'ap' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          บัญชีเจ้าหนี้การค้า (Payables)
        </button>
        <button
          type="button"
          onClick={() => setActiveAccTab('reports')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeAccTab === 'reports' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          สรุปรายงานงบการเงิน (P&amp;L)
        </button>
      </div>

      {/* Renders Tab Elements */}
      <div className="min-h-[400px]">

        {/* Tab 1: Chart of Accounts */}
        {activeAccTab === 'coa' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Corporate General Chart of Accounts (GAAP Compliant)</h3>
                <p className="text-xs text-slate-500 mt-1">Real-time running balances calculated across operational ledgers from factory floors, supply trucks, and payroll postings.</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-bold">Ledger Balanced Ledger</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbState.coa.map((account: any) => (
                <div key={account.code} className="border border-slate-150 p-4.5 rounded-xl flex justify-between items-center hover:border-slate-300 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2.5 py-0.5 rounded">{account.code}</span>
                    <h4 className="font-bold text-slate-700 text-sm">{account.name}</h4>
                    <p className="text-[10px] text-slate-500">Account Classification: <strong className="text-slate-700 capitalize">{account.type}</strong></p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Balance Sheet Running Val</p>
                    <p className="font-mono text-base font-bold text-slate-800">฿{account.balance.toLocaleString()}</p>
                    <span className="text-[9px] uppercase font-bold text-teal-700 font-mono">Real-time synced</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Double Entry Journal creation desk */}
        {activeAccTab === 'journal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Journal Slip Draft Block */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-250 shadow-sm h-fit space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <AlertCircle className="h-4 w-5 text-indigo-600" /> New Multi-Segment Journal entry
              </h3>
              <p className="text-slate-500 text-xs">Draft adjustments to physical raw assets, depreciation, or payroll disbursements.</p>
              
              {!isFinanceAuthorised ? (
                <div className="bg-amber-50 text-amber-800 border border-amber-100 p-3.5 rounded-xl text-xs font-semibold">
                  Access Denied. Only Admin, Accounting, or Management roles hold authority to submit general journal logs.
                </div>
              ) : (
                <form onSubmit={handlePostJournal} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-bold uppercase">Transaction Memo / Description</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50 font-medium"
                      value={journalMemo}
                      onChange={(e) => setJournalMemo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3.5 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Double-Entry Segments</span>
                      <button
                        type="button"
                        onClick={addJournalLine}
                        className="text-indigo-600 font-bold text-xs"
                      >
                        + Add Segment
                      </button>
                    </div>

                    {journalLines.map((line, idx) => (
                      <div key={idx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-slate-400">Segment #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeJournalLine(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <select
                            className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                            value={line.accountCode}
                            onChange={(e) => updateJournalLine(idx, 'accountCode', e.target.value)}
                            required
                          >
                            <option value="">-- Choose Account --</option>
                            {dbState.coa.map((ac: any) => (
                              <option key={ac.code} value={ac.code}>{ac.code} | {ac.name}</option>
                            ))}
                          </select>

                          <select
                            className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-bold text-indigo-700"
                            value={line.type}
                            onChange={(e) => updateJournalLine(idx, 'type', e.target.value)}
                          >
                            <option value="Debit">Debit (+)</option>
                            <option value="Credit">Credit (-)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-medium">Value Amount (USD)</label>
                          <input
                            type="number"
                            className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-semibold font-mono"
                            value={line.amount}
                            onChange={(e) => updateJournalLine(idx, 'amount', Number(e.target.value))}
                            min={1}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white rounded-xl py-2 px-4 text-xs font-bold shadow hover:bg-slate-800 transition-colors"
                  >
                    Post Journal to General Ledger
                  </button>
                </form>
              )}
            </div>

            {/* General Ledger Journals Log Archive */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Audited Journal Entry Register</h3>
              <div className="space-y-3.5">
                {dbState.journals.map((jn: any) => (
                  <div key={jn.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                    <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-2.5">
                      <div>
                        <strong className="font-mono text-sm text-slate-800">{jn.id}</strong>
                        <p className="text-slate-500 font-semibold font-mono mt-0.5">Auditable Posting Memo: <strong className="text-slate-700">&quot;{jn.memo}&quot;</strong></p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">Posted date: {jn.date}</span>
                    </div>

                    <div className="space-y-1.5">
                      {jn.lines.map((l: any, i: number) => {
                        const account = dbState.coa.find((coa: any) => coa.code === l.accountCode);
                        return (
                          <div key={i} className="flex justify-between items-center text-xs text-slate-700 font-mono">
                            <div className="flex items-center gap-2">
                              {l.type === 'Debit' ? (
                                <span className="p-1 bg-emerald-50 rounded text-emerald-600"><Plus className="h-3.5 w-3.5" /></span>
                              ) : (
                                <span className="p-1 bg-rose-50 rounded text-rose-600"><Trash2 className="h-3.5 w-3.5" /></span>
                              )}
                              <span>{account ? account.name : l.accountCode} ({l.accountCode})</span>
                            </div>

                            <div className="text-right">
                              <span className={l.type === 'Debit' ? 'font-bold text-emerald-700' : 'text-slate-600'}>
                                {l.type === 'Debit' ? `฿${l.amount.toLocaleString()}` : `(฿${l.amount.toLocaleString()})`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Accounts Receivable (A/R) */}
        {activeAccTab === 'ar' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Commercial Customer Accounts Receivable (A/R)</h3>
                <p className="text-xs text-slate-500 mt-1">Monitor billing invoices raised for wholesale distributor batches.</p>
              </div>
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">{dbState.invoices.length} Wholesale Accounts active</span>
            </div>

            <div className="space-y-4">
              {dbState.invoices.map((inv: any) => (
                <div key={inv.id} className="border border-slate-150 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-250 transition-all gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-sm text-slate-800">{inv.id}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700 animate-pulse'
                      }`}>{inv.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">Corporate client: <strong className="text-slate-700 capitalize">{inv.client}</strong></p>
                    <p className="text-xs font-mono text-slate-400">Due Expiry limit: {inv.dueDate}</p>
                  </div>

                  <div className="text-right md:px-6">
                    <p className="text-[10px] text-slate-500 font-medium">Invoice Value Balance</p>
                    <p className="font-mono font-bold text-slate-800 text-base">฿{inv.amount.toLocaleString()}</p>
                  </div>

                  {inv.status !== 'Paid' && isFinanceAuthorised && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendARReminder(inv.id)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Mail className="h-3.5 w-3.5" /> Remind Client
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSettleInvoice(inv.id)}
                        className="bg-indigo-650 hover:bg-indigo-750 text-white py-1.5 px-4.5 rounded-lg text-xs font-bold whitespace-nowrap bg-indigo-600"
                      >
                        Receipt Payments settlement
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Accounts Payable (A/P) */}
        {activeAccTab === 'ap' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Supplier Accounts Payable Liabilities (A/P)</h3>
                <p className="text-xs text-slate-500 mt-1">Manage outstanding liabilities logged against raw material refiners, chemical supply shipments, or custom apparatus parts.</p>
              </div>
            </div>

            <div className="space-y-4">
              {dbState.bills.map((bill: any) => (
                <div key={bill.id} className="border border-slate-150 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-250 transition-all gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-sm text-slate-800">{bill.id}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{bill.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">Creditor Supplier: <strong className="text-slate-700">{bill.supplier}</strong></p>
                    <p className="text-xs text-slate-400 font-mono">Invoice Match code: {bill.invoiceMapping || 'Direct PO'}</p>
                  </div>

                  <div className="text-right md:px-6">
                    <p className="text-[10px] text-slate-500 font-medium">Liability Sum outstanding</p>
                    <p className="font-mono font-bold text-slate-800 text-base">฿{bill.amount.toLocaleString()}</p>
                  </div>

                  {bill.status !== 'Paid' && isFinanceAuthorised && (
                    <div>
                      <button
                        type="button"
                        onClick={() => handlePayBill(bill.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 text-xs font-bold"
                      >
                        Settle & Disburse Payments
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Real-Time Financial Reports (Trial Balance, Profit & Loss) */}
        {activeAccTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real-time Trial Balance Statement */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-semibold text-slate-800 text-sm">Real-Time Trial Balance Statement</h3>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">GAAP Auditable</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-slate-705">
                {dbState.coa.map((ac: any) => (
                  <div key={ac.code} className="flex justify-between pb-1.5 border-b border-dashed border-slate-100 last:border-0 last:pb-0">
                    <span className="text-slate-600">{ac.name} ({ac.code})</span>
                    <div className="grid grid-cols-2 text-right w-44 font-semibold text-slate-850">
                      <span>{(ac.type === 'Asset' || ac.type === 'Expense') ? `฿${ac.balance.toLocaleString()}` : ''}</span>
                      <span>{(ac.type === 'Liability' || ac.type === 'Equity' || ac.type === 'Revenue') ? `฿${ac.balance.toLocaleString()}` : ''}</span>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between border-t-2 border-slate-800 pt-3 font-extrabold text-slate-900 text-sm">
                  <span>Balanced Aggregates Sum:</span>
                  <div className="grid grid-cols-2 text-right w-44">
                    <span>฿{trialBalanceDebits.toLocaleString()}</span>
                    <span>฿{trialBalanceCredits.toLocaleString()}</span>
                  </div>
                </div>
                
                {trialBalanceDebits === trialBalanceCredits ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg flex items-center gap-2 text-[11px] font-sans">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                    <span>General Ledger balance checks verified: True. Debit and Credit accounts fully equivalent.</span>
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3 rounded-lg flex items-center gap-2 text-[11px] font-sans">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                    <span>Disequilibrium Out of balance detected by audit core. Verify journal offsets.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Income Statement Profit & Loss */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-semibold text-slate-800 text-sm">Executive Income Statement (Profit &amp; Loss)</h3>
                <span className="text-[10px] text-slate-400 font-mono font-bold">June Fiscal Interval</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Revenue */}
                <div className="space-y-1.5 pb-2 border-b">
                  <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Gross Revenues</p>
                  <div className="flex justify-between">
                    <span>Wholesale Product Sales Revenue:</span>
                    <span className="font-semibold text-slate-800">฿{totalRevenues.toLocaleString()}</span>
                  </div>
                </div>

                {/* Operating Costs */}
                <div className="space-y-2.5 pb-2 border-b">
                  <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Cost of Operations (Opex)</p>
                  <div className="flex justify-between">
                    <span>Wages & Payroll Expenses:</span>
                    <span className="text-slate-705">฿{dbState.coa.find((ac: any)=> ac.code === '5010')?.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment Repair Maintenance:</span>
                    <span className="text-slate-705">฿{dbState.coa.find((ac: any)=> ac.code === '5020')?.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industrial Raw Materials OPEX:</span>
                    <span className="text-slate-705">฿{dbState.coa.find((ac: any)=> ac.code === '5030')?.balance.toLocaleString()}</span>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Raw Operational OPEX:</span>
                    <span>฿{totalOperatingExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm pt-2 text-slate-900 border-t-2 border-slate-900">
                    <span>NET ACCOUNT INCOME:</span>
                    <span className={netEarnings >= 0 ? "text-emerald-700 bg-emerald-50 px-2 rounded" : "text-rose-700"}>
                      {netEarnings >= 0 ? `฿${netEarnings.toLocaleString()}` : `(฿${Math.abs(netEarnings).toLocaleString()})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Google Sheet Simulator component bottom of page */}
      {(() => {
        const getSheetConfig = () => {
          switch (activeAccTab) {
            case 'coa':
              return {
                tableKey: 'coa',
                tableName: 'บัญชีระบบผังบัญชีแยกประเภท (Chart of Accounts)',
                columns: [
                  { key: 'id', label: 'รหัสผังบัญชี (ID)', type: 'text', readOnly: true },
                  { key: 'code', label: 'เลขรหัสบัญชี', type: 'text' },
                  { key: 'name', label: 'บัญชีควบคุมยอดรายชื่อ', type: 'text' },
                  { key: 'type', label: 'กลุ่มประเภทผังบัญชี', type: 'select', options: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] },
                  { key: 'balance', label: 'ยอดดุลบัญชีสะสม (บาท)', type: 'number' }
                ] as any,
                data: dbState.coa || []
              };
            case 'journal':
              return {
                tableKey: 'transactions',
                tableName: 'ทะเบียนสมุดรายวันขั้นต้น (Journal Entries Registry)',
                columns: [
                  { key: 'id', label: 'รหัสเลขอ้างอิง (ID)', type: 'text', readOnly: true },
                  { key: 'date', label: 'วันที่ทำการบันทึก', type: 'date' },
                  { key: 'type', label: 'ฝั่งการโอน', type: 'select', options: ['Debit', 'Credit'] },
                  { key: 'category', label: 'หมวดหมู่งบสะสม', type: 'text' },
                  { key: 'amount', label: 'มูลค่ารวมดีล (บาท)', type: 'number' },
                  { key: 'description', label: 'บันทึกเหตุช่วยจำเพิ่มเติม', type: 'text' }
                ] as any,
                data: dbState.transactions || []
              };
            case 'ar':
              return {
                tableKey: 'invoices',
                tableName: 'ระบบบัญชีลูกหนี้การค้า (Accounts Receivable - Invoices)',
                columns: [
                  { key: 'id', label: 'รหัสใบแจ้งหนี้ (Invoice ID)', type: 'text', readOnly: true },
                  { key: 'customerId', label: 'รหัสลูกค้าหลัก', type: 'text' },
                  { key: 'amount', label: 'รวมหน้าตั๋วค้างจ่าย (บาท)', type: 'number' },
                  { key: 'dueDate', label: 'กำหนดวันชำระหลัก', type: 'date' },
                  { key: 'status', label: 'สถานะตรวจสอบดีล', type: 'select', options: ['Unpaid', 'Paid', 'Overdue'] }
                ] as any,
                data: dbState.invoices || []
              };
            case 'ap':
              return {
                tableKey: 'bills',
                tableName: 'ระบบบัญชีเจ้าหนี้การค้าจัดส่งวัตถุดิบ (Accounts Payable - Supplier Bills)',
                columns: [
                  { key: 'id', label: 'รหัสตั๋วเจ้าหนี้ (Bill ID)', type: 'text', readOnly: true },
                  { key: 'supplierId', label: 'รหัสซัพพลายเออร์', type: 'text' },
                  { key: 'amount', label: 'ยอดชำระตั๋วเก็บรายจ่าย (บาท)', type: 'number' },
                  { key: 'dueDate', label: 'กำหนดชำระตั๋วซ่อม', type: 'date' },
                  { key: 'status', label: 'สถานะดีลตั๋วหลัก', type: 'select', options: ['Unpaid', 'Paid', 'Overdue'] }
                ] as any,
                data: dbState.bills || []
              };
            default:
              return null;
          }
        };

        const config = getSheetConfig();
        if (!config) return null;
        
        return (
          <GoogleSheetEditor
            tableKey={config.tableKey}
            tableName={config.tableName}
            columns={config.columns}
            data={config.data}
            onRefresh={onRefresh}
            onNotify={onNotify}
          />
        );
      })()}
    </div>
  );
}
