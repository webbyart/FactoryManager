import React, { useState } from 'react';
import { 
  Wrench, Calendar, Settings, ShieldAlert, Cpu, Hammer, BarChart, 
  Clock, AlertCircle, CheckSquare, Plus, Check, RefreshCw, QrCode
} from 'lucide-react';
import GoogleSheetEditor from './GoogleSheetEditor';

interface MaintenanceOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function MaintenanceOS({ dbState, onRefresh, onNotify, userRole }: MaintenanceOSProps) {
  const [activeMntTab, setActiveMntTab] = useState<'registry' | 'repairs' | 'pm' | 'spares'>('registry');
  
  // Selected machine for simulated scan
  const [scannedMachineId, setScannedMachineId] = useState<string | null>(null);
  
  // Repair ticket inputs
  const [newRepair, setNewRepair] = useState({ description: '', priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical' });
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolveForm, setResolveForm] = useState({ rootCause: '', correctiveAction: '' });

  const handleSimulateQRScan = (machineId: string) => {
    setScannedMachineId(machineId);
    onNotify(`QR Code parsed successfully: Machine Target Ref: ${machineId}. Dispatch terminal ready.`, "info");
  };

  const handleRequestRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedMachineId || !newRepair.description) {
      onNotify("Please provide a scanned machine reference and describing failure symptoms.", "warning");
      return;
    }

    try {
      const res = await fetch('/api/maintenance/repair/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: scannedMachineId,
          description: newRepair.description,
          priority: newRepair.priority,
          requestedBy: 'Floor Inspector Brody'
        })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`Emergency repair ticket generated. Technician dispatched: ${data.ticket.assignedTechnician}`, "warning");
        onRefresh();
        setScannedMachineId(null);
        setNewRepair({ description: '', priority: 'Medium' });
      }
    } catch {
      onNotify("Error dispatching repair ticket.", "error");
    }
  };

  const handleCompletePM = async (pmTaskId: string) => {
    try {
      const res = await fetch('/api/maintenance/pm/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pmTaskId })
      });
      const data = await res.json();
      if(data.success) {
        onNotify("Preventive maintenance checklist recorded as completed.", "info");
        onRefresh();
      }
    } catch {
      onNotify("Communication error.", "error");
    }
  };

  const handleResolveRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!resolvingTicketId) return;

    try {
      const res = await fetch('/api/maintenance/repair/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: resolvingTicketId,
          rootCause: resolveForm.rootCause,
          correctiveAction: resolveForm.correctiveAction
        })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`Machine status returned to ONLINE. Root cause archived.`, "info");
        onRefresh();
        setResolvingTicketId(null);
        setResolveForm({ rootCause: '', correctiveAction: '' });
      }
    } catch {
      onNotify("Error updating repair docket.", "error");
    }
  };

  // RBAC checks
  const canPerformMaint = ['Admin', 'Maintenance'].includes(userRole);

  return (
    <div className="space-y-6" id="maintenance-os-panel">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">ระบบวางแผนและซ่อมบำรุงเชิงรุก (Maintenance &amp; Reliability OS)</h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              ติดตามประสิทธิภาพเครื่องกวนสารเคมี ตารางการตรวจสอบเชิงป้องกันประจำสัปดาห์ (PM) และเบิกถอนชิ้นส่วนอะไหล่คงคลังจาก QR Code
            </p>
          </div>
        </div>
      </div>

      {/* Nav bar links */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none">
        <button
          type="button"
          onClick={() => setActiveMntTab('registry')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeMntTab === 'registry' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ทะเบียนประวัติเครื่องจักร (Registry)
        </button>
        <button
          type="button"
          onClick={() => setActiveMntTab('repairs')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeMntTab === 'repairs' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          แจ้งซ่อมกรณีฉุกเฉิน (Fix Tickets)
        </button>
        <button
          type="button"
          onClick={() => setActiveMntTab('pm')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeMntTab === 'pm' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          แผนป้องกันเชิงป้องกัน (PM Tracker)
        </button>
        <button
          type="button"
          onClick={() => setActiveMntTab('spares')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeMntTab === 'spares' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          คลังอะไหล่สำรอง (Spare Parts)
        </button>
      </div>

      {/* Primary Tab Viewports */}
      <div className="min-h-[400px]">

        {/* Tab 1: Machinery panel & QR dispatcher */}
        {activeMntTab === 'registry' && (
          <div className="space-y-6">
            {/* Reliability KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <span className="p-3 bg-rose-50 rounded-xl text-rose-600"><Clock className="h-6 w-6" /></span>
                <div>
                  <p className="text-slate-500 text-xs font-semibold">Average MTBF (Global)</p>
                  <p className="text-lg font-bold text-slate-800">462 Hours</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <span className="p-3 bg-amber-50 rounded-xl text-amber-600"><Wrench className="h-6 w-6" /></span>
                <div>
                  <p className="text-slate-500 text-xs font-semibold">Average MTTR (Global)</p>
                  <p className="text-lg font-bold text-slate-800">3.2 Hours</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <span className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Cpu className="h-6 w-6" /></span>
                <div>
                  <p className="text-slate-500 text-xs font-semibold">Overall OEE Facility Score</p>
                  <p className="text-lg font-bold text-slate-800">84.5% <span className="text-[10px] text-emerald-600 font-semibold">(World Class)</span></p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <span className="p-3 bg-blue-50 rounded-xl text-blue-600"><AlertCircle className="h-6 w-6" /></span>
                <div>
                  <p className="text-slate-500 text-xs font-semibold">Open Maintenance tickets</p>
                  <p className="text-lg font-bold text-slate-800">{dbState.repairTickets.filter((t:any) => t.status !== 'Resolved').length} Active</p>
                </div>
              </div>
            </div>

            {/* Simulated QR Dispatch Overlay Modal */}
            {scannedMachineId && (
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/80 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-amber-900">
                    <QrCode className="h-5 w-5 text-amber-800" /> [SCAN INTEGRATED] Emergency Dispatch
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Authentic QR parsing completed for code: <strong>{scannedMachineId}</strong>. You are drafting an emergency downtime ticket.
                  </p>
                  <div className="p-3.5 bg-white border border-amber-200 rounded-xl mt-3 text-xs text-slate-600 space-y-1">
                    <p>Machine Name: <strong>{dbState.machines.find((m: any)=> m.id === scannedMachineId)?.name}</strong></p>
                    <p>Plant Section: <strong>{dbState.machines.find((m: any)=> m.id === scannedMachineId)?.section}</strong></p>
                    <p>Expected MTTR Resolution: <strong>~{dbState.machines.find((m: any)=> m.id === scannedMachineId)?.mttrHours} hrs</strong></p>
                  </div>
                </div>
                <form onSubmit={handleRequestRepair} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Incident Failure Manifest / Symptom description</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 text-slate-800 bg-white"
                      placeholder="E.g. Hydraulic pressure pressure drops below limits, actuator arm locked"
                      value={newRepair.description}
                      onChange={(e) => setNewRepair({ ...newRepair, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Priority Escalation</label>
                    <select
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
                      value={newRepair.priority}
                      onChange={(e) => setNewRepair({ ...newRepair, priority: e.target.value as any })}
                    >
                      <option value="Low">Low - Cosmetic Issue</option>
                      <option value="Medium">Medium - Out of calibration</option>
                      <option value="High">High - Unit degraded</option>
                      <option value="Critical">Critical - Floor STOPPED</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setScannedMachineId(null)}
                      className="flex-1 py-2 rounded-xl text-xs bg-slate-200 hover:bg-slate-300 font-bold"
                    >
                      Cancel Scan
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
                    >
                      Dispatch Repair Order
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Machine Cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dbState.machines.map((machine: any) => (
                <div key={machine.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{machine.code}</span>
                      <h4 className="font-bold text-slate-800 text-base">{machine.name}</h4>
                      <p className="text-slate-500 text-xs">Section Area: <strong className="text-slate-700">{machine.section}</strong></p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      machine.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      machine.status === 'Repairing' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {machine.status}
                    </span>
                  </div>

                  {/* MTTR MTBF Stats info bars */}
                  <div className="grid grid-cols-3 bg-slate-50 p-3 rounded-xl gap-2 font-mono text-[10px] text-center text-slate-500">
                    <div>
                      <p>OEE Rating</p>
                      <p className="font-bold text-slate-800">89% Efficiency</p>
                    </div>
                    <div>
                      <p>Failure MTBF</p>
                      <p className="font-bold text-slate-800">{machine.mtbfHours} Hrs</p>
                    </div>
                    <div>
                      <p>Repair MTTR</p>
                      <p className="font-bold text-slate-800">{machine.mttrHours} Hrs</p>
                    </div>
                  </div>

                  {/* Actions: Simulate Scan */}
                  <div className="flex border-t border-slate-100 pt-3 justify-between items-center">
                    <span className="text-[10px] text-slate-400">Commission Date: {machine.installedDate}</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateQRScan(machine.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200"
                    >
                      <QrCode className="h-4 w-4" /> Simulate QR Scan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Emergency Work orders tracking */}
        {activeMntTab === 'repairs' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-slate-800 text-base">Active Emergency Maintenance Tickets</h3>
            
            {/* Resolution sub-modal */}
            {resolvingTicketId && (
              <form onSubmit={handleResolveRepair} className="bg-blue-50/50 border border-blue-200 p-5 rounded-2xl space-y-3 space-y-3 animate-fade-in">
                <h4 className="font-bold text-blue-900 text-sm">Archiving Analysis Work Order: ID: {resolvingTicketId}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">Root Cause (Failure Analysis Report)</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
                      placeholder="E.g., Component oxidation / hydraulic pump seal decay"
                      value={resolveForm.rootCause}
                      onChange={(e) => setResolveForm({ ...resolveForm, rootCause: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">Corrective / Preventive Action taken</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
                      placeholder="E.g., Swapped hydraulic gasket and topped up fluid line"
                      value={resolveForm.correctiveAction}
                      onChange={(e) => setResolveForm({ ...resolveForm, correctiveAction: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setResolvingTicketId(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Lock Resolution & Return Online</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {dbState.repairTickets.map((ticket: any) => {
                const machine = dbState.machines.find((m: any) => m.id === ticket.machineId);
                
                return (
                  <div key={ticket.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-200 transition-colors gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-sm text-slate-800">{ticket.id}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 animate-bounce' : 'bg-amber-100 text-amber-700'
                        }`}>{ticket.priority} Priority</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700 animate-pulse'
                        }`}>{ticket.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">Equipment unit: <span className="text-slate-800">{machine ? machine.name : ticket.machineId}</span></p>
                      <p className="text-xs text-slate-600 font-medium">Issue description: {ticket.description}</p>
                    </div>

                    <div className="text-slate-500 text-xs">
                      <p>Technician: <strong className="text-slate-700">{ticket.assignedTechnician}</strong></p>
                      <p className="font-mono text-[10px] text-slate-400">Logged date: {ticket.createdAt}</p>
                    </div>

                    {ticket.status !== 'Resolved' && canPerformMaint && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setResolvingTicketId(ticket.id)}
                          className="px-4.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 text-xs font-bold rounded-xl whitespace-nowrap"
                        >
                          Resolve & close WO
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: PM Calibration Schedules & Checklist */}
        {activeMntTab === 'pm' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-slate-800 text-base">Annual Preventive Maintenance (PM) Audits</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbState.pmTasks.map((pm: any) => {
                const machine = dbState.machines.find((m: any) => m.id === pm.machineId);
                
                return (
                  <div key={pm.id} className="border border-slate-250 hover:border-slate-350 p-5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-xs font-mono text-slate-400">{pm.id}</strong>
                        <h4 className="font-bold text-slate-800 text-sm">{pm.title}</h4>
                        <p className="text-slate-500 text-xs">Target hardware: <strong className="text-slate-700">{machine ? machine.name : pm.machineId}</strong></p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pm.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        pm.status === 'Overdue' ? 'bg-red-50 text-red-700 animate-pulse' :
                        'bg-amber-100 text-amber-700'
                      }`}>{pm.status}</span>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Detailed Calibration checklists</p>
                      {pm.checklist.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {pm.status !== 'Completed' && canPerformMaint && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleCompletePM(pm.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-1 px-3 text-xs font-semibold"
                        >
                          Mark audit checklist completed
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Spare Parts inventories */}
        {activeMntTab === 'spares' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-slate-800 text-base">Factory Maintenance Spare Parts Registry</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-3 px-4">part Ref code</th>
                    <th className="py-3 px-4">Component Nomenclature</th>
                    <th className="py-3 px-4 text-right">Associated Machinery ID</th>
                    <th className="py-3 px-4 text-right">In Stock Level</th>
                    <th className="py-3 px-4 text-right">Min Buffer Limit</th>
                    <th className="py-3 px-4 text-right">Active Procurement warning</th>
                  </tr>
                </thead>
                <tbody>
                  {dbState.spareParts.map((part: any) => (
                    <tr key={part.id} className={`border-b border-slate-100 ${
                      part.stock < part.minStock ? 'bg-amber-50/30' : ''
                    }`}>
                      <td className="py-3 px-4 font-bold font-mono text-slate-800">{part.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{part.name}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{part.machineId || 'All Apparatus'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">{part.stock} pcs</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{part.minStock} pcs</td>
                      <td className="py-3 px-4 text-right">
                        {part.stock < part.minStock ? (
                          <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2.5 py-0.5 rounded border border-rose-100">LOW STOCK FLAG TRIGGERED</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded">Stock Unrestricted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Google Sheet Simulator component bottom of page */}
      {(() => {
        const getSheetConfig = () => {
          switch (activeMntTab) {
            case 'registry':
              return {
                tableKey: 'machines',
                tableName: 'ทำเนียบทะเบียนเครื่องจักรโรงงาน (Machines)',
                columns: [
                  { key: 'id', label: 'รหัสเครื่องจักร (ID)', type: 'text', readOnly: true },
                  { key: 'name', label: 'ชื่อเรียกเครื่องจักร', type: 'text' },
                  { key: 'status', label: 'สถานะเครื่องจักร', type: 'select', options: ['Idle', 'Running', 'Maintenance', 'Breakdown'] },
                  { key: 'area', label: 'กลุ่มอาคาร/โรงงาน', type: 'text' },
                  { key: 'mtbfHours', label: 'MTBF (ชั่วโมง)', type: 'number' },
                  { key: 'mttrHours', label: 'MTTR (ชั่วโมง)', type: 'number' }
                ] as any,
                data: dbState.machines || []
              };
            case 'repairs':
              return {
                tableKey: 'repairTickets',
                tableName: 'รายงานแจ้งใบประวัติซ่อมบำรุง (Repair Tickets)',
                columns: [
                  { key: 'id', label: 'รหัสใบแจ้งซ่อม', type: 'text', readOnly: true },
                  { key: 'machineId', label: 'รหัสเครื่องจักร', type: 'text' },
                  { key: 'issueDescription', label: 'หัวข้อปัญหาที่พบ', type: 'text' },
                  { key: 'urgency', label: 'ความเร่งด่วน', type: 'select', options: ['Low', 'Medium', 'Urgent'] },
                  { key: 'status', label: 'สถานะใบงานซ่อม', type: 'select', options: ['Open', 'Assigned', 'Parts Pending', 'In Progress', 'Resolved'] },
                  { key: 'reportedBy', label: 'ผู้รายงานปัญหา', type: 'text' }
                ] as any,
                data: dbState.repairTickets || []
              };
            case 'pm':
              return {
                tableKey: 'pmTasks',
                tableName: 'ปฏิทินงานบำรุงรักษาเชิงป้องกัน (Preventive Maintenance)',
                columns: [
                  { key: 'id', label: 'รหัสงาน PM', type: 'text', readOnly: true },
                  { key: 'title', label: 'ชื่องานบำรุงรักษา', type: 'text' },
                  { key: 'machineId', label: 'รหัสเครื่องจักร', type: 'text' },
                  { key: 'frequency', label: 'ความถี่รอบงาน', type: 'text' },
                  { key: 'dueBy', label: 'วันกำหนดเสร็จ', type: 'date' },
                  { key: 'status', label: 'สถานะงาน PM', type: 'select', options: ['Pending', 'Overdue', 'In Progress', 'Completed'] }
                ] as any,
                data: dbState.pmTasks || []
              };
            case 'spares':
              return {
                tableKey: 'spareParts',
                tableName: 'บัญชีอะไหล่อุปกรณ์ซ่อมแซม (Spare Parts)',
                columns: [
                  { key: 'id', label: 'รหัสอะไหล่ (ID)', type: 'text', readOnly: true },
                  { key: 'code', label: 'รหัสอะไหล่(Code)', type: 'text' },
                  { key: 'name', label: 'ชื่อสามัญอะไหล่', type: 'text' },
                  { key: 'machineId', label: 'รหัสเครื่องจักรที่รองรับ', type: 'text' },
                  { key: 'stock', label: 'จำนวนคงคลังสะสม', type: 'number' },
                  { key: 'minStock', label: 'สต็อกเกณฑ์ขั้นต่ำ', type: 'number' }
                ] as any,
                data: dbState.spareParts || []
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
