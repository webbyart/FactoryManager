import React, { useState, useRef } from 'react';
import { 
  Users, Calendar, Clock, DollarSign, Award, MapPin, Check, 
  X, Printer, FileText, ChevronRight, UserCheck, Play, Send,
  Camera, Upload
} from 'lucide-react';
import GoogleSheetEditor from './GoogleSheetEditor';
import LinePayslipOS from './LinePayslipOS';

interface HRPayrollOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function HRPayrollOS({ dbState, onRefresh, onNotify, userRole }: HRPayrollOSProps) {
  const [activeHrTab, setActiveHrTab] = useState<'roster' | 'clock' | 'requests' | 'payroll' | 'line-payslips'>('roster');
  
  // Simulated Selected Slip for Print
  const [printingSlip, setPrintingSlip] = useState<any>(null);

  // States for Shift Clock terminal with custom inputs & camera
  const [simulatedEmployeeId, setSimulatedEmployeeId] = useState<string>('emp-103'); 
  const [clockLat, setClockLat] = useState<number>(13.7563);
  const [clockLng, setClockLng] = useState<number>(100.5018);
  const [clockPhoto, setClockPhoto] = useState<string>(''); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClockPhoto(reader.result as string);
        onNotify("อัปโหลดและสแกนใบหน้าจับคู่อัตราจ้างสำเร็จ", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePhoto = () => {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    ];
    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setClockPhoto(randomPhoto);
    onNotify("ถ่ายเซฟฟี่จำลองด้วยกล้องเสมือนจริงเรียบร้อย", "info");
  }; 

  const handleClockAction = async (type: 'Check In' | 'Check Out') => {
    const coords = {
      lat: clockLat,
      lng: clockLng
    };

    try {
      const res = await fetch('/api/hr/attendance/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: simulatedEmployeeId,
          checkType: type,
          gpsCoords: coords,
          photo: clockPhoto || null
        })
      });
      const data = await res.json();
      if(data.success) {
        const empName = dbState.employees?.find((e: any) => e.id === simulatedEmployeeId)?.name || (simulatedEmployeeId === 'emp-103' ? 'Marcus Brody' : simulatedEmployeeId);
        onNotify(`บันทึกเวลาสำเร็จ: ${type} ของ ${empName}. พิกัด Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`, "info");
        setClockPhoto(''); // reset photo state after clock action
        onRefresh();
      } else {
        onNotify(data.error, "error");
      }
    } catch {
      onNotify("Failed to communicate with HR clock server.", "error");
    }
  };

  const handlePostPayroll = async (periodId: string) => {
    try {
      const res = await fetch('/api/hr/payroll/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`June 2026 payroll finalized. Disbursed salaries posted immediately to General Ledger accounts!`, "info");
        onRefresh();
      }
    } catch {
      onNotify("Error executing payroll posting.", "error");
    }
  };

  // Roles verification
  const canFinalizePayroll = ['Admin', 'HR', 'Management'].includes(userRole);

  return (
    <div className="space-y-6" id="hr-payroll-os-panel">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">ระบบคนและคำนวณบัญชีเงินเดือน (HR Operations &amp; Enterprise Payroll)</h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              จัดการทะเบียนพนักงาน จัดตารางเวลาสแกนนิ้ว GPS ปรับปรุงวันลาป่วย/ลากิจ และตรวจสอบสลิปเงินเดือนโอนเข้า General Ledger อัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Sub menu links */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none">
        <button
          type="button"
          onClick={() => setActiveHrTab('roster')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'roster' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          แผนผังและผังองค์กร (Corporate Roster)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('clock')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'clock' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ลงเวลาทำงานสแกน GPS (Clock In)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('requests')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'requests' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          อนุมัติวันลาและเวลาทำงานพิเศษ (Leave &amp; OT)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('payroll')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'payroll' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          สลิปและเงินเดือนพนักงาน (Payroll Specs)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('line-payslips')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'line-payslips' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ส่งสลิปไลน์ Flex Message (E-Payslip)
        </button>
      </div>

      {/* Renders Tab Elements */}
      <div className="min-h-[400px]">

        {/* Tab 1: Org Chart and Roster */}
        {activeHrTab === 'roster' && (
          <div className="space-y-6">
            {/* Interactive Organization Chart Graphic (Fluent Style) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Visual Organizational Hierarchy (Sharing Master Database)</h3>
              
              <div className="flex flex-col items-center gap-4 border border-dashed border-slate-200 p-6 rounded-xl bg-slate-50/50">
                {/* Director Node */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-3.5 rounded-xl text-white text-center shadow-md w-52 border border-slate-700">
                  <p className="font-bold text-sm">Edward Vane</p>
                  <p className="text-[10px] text-slate-300">Managing Director (Admin)</p>
                </div>

                <div className="w-0.5 h-6 bg-slate-200"></div>

                {/* Second tier nodes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative w-full max-w-2xl">
                  {/* QA Head */}
                  <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs text-center flex flex-col items-center">
                    <p className="font-semibold text-slate-800 text-xs text-sm">Elena Rostova</p>
                    <p className="text-[10px] text-slate-500">VP Quality Assurance</p>
                  </div>
                  {/* Chemist */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm text-center flex flex-col items-center">
                    <p className="font-semibold text-slate-800 text-xs text-sm">Kenji Sato</p>
                    <p className="text-[10px] text-slate-500">VP Chemistry & R&D</p>
                  </div>
                  {/* Accounts */}
                  <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs text-center flex flex-col items-center">
                    <p className="font-semibold text-slate-800 text-xs text-sm">Sofia Rodriguez</p>
                    <p className="text-[10px] text-slate-500">VP Finance & Accounts</p>
                  </div>
                </div>

                <div className="w-full max-w-xl flex justify-around">
                  <div className="w-0.5 h-5 bg-slate-200"></div>
                  <div className="w-0.5 h-5 bg-slate-200"></div>
                </div>

                {/* Third level: Engineering Floor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-center border">
                    <p className="font-bold text-slate-700 text-xs">Marcus Brody</p>
                    <p className="text-[9px] text-slate-500">Production Operator</p>
                  </div>
                  <div className="bg-slate-100 p-2.5 rounded-xl text-center border">
                    <p className="font-bold text-slate-700 text-xs">Tariq Al-Fayed</p>
                    <p className="text-[9px] text-slate-500">Chief Reliability Engineer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roster database table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Active Staff Roster Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="py-3 px-4">Emp ID</th>
                      <th className="py-3 px-4">FullName</th>
                      <th className="py-3 px-4">Email Channel</th>
                      <th className="py-3 px-4">Dept Node</th>
                      <th className="py-3 px-4 text-right">Compensation Rate</th>
                      <th className="py-3 px-4 text-right">Monthly Allowance</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbState.employees.map((emp: any) => {
                      const dept = dbState.departments.find((d: any) => d.id === emp.departmentId);
                      return (
                        <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{emp.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{emp.name}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{emp.email}</td>
                          <td className="py-3 px-4 font-semibold text-indigo-700">{dept ? dept.name : emp.departmentId}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold">${emp.salary.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">${emp.allowance.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{emp.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clock terminal GPS */}
        {activeHrTab === 'clock' && (() => {
          const isInsidePlant = Math.abs(clockLat - 13.7563) < 0.005 && Math.abs(clockLng - 100.5018) < 0.005;
          return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulator Card block */}
                <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs font-mono font-bold animate-pulse">GPS POSITION SATLOCK - OK</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg">Shift Clock terminal</h4>
                    <p className="text-slate-400 text-xs">Simulating as employee: <strong>{dbState.employees?.find((e: any) => e.id === simulatedEmployeeId)?.name || "Marcus Brody"}</strong></p>
                  </div>

                  {/* Simulate Employee Selector Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Simulating employee user</label>
                    <select
                      value={simulatedEmployeeId}
                      onChange={(e) => setSimulatedEmployeeId(e.target.value)}
                      className="w-full bg-slate-800 text-white rounded-xl py-2 px-3 text-xs border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {dbState.employees?.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.id === 'emp-103' ? 'Marcus Brody (CNC Operator)' : `${emp.name} (${emp.id})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coordinates & Custom Geofence Input Fields */}
                  <div className="bg-slate-800 p-4 rounded-xl space-y-3 text-xs font-mono border border-slate-700 text-slate-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block font-sans">Target Latitude</label>
                        <input 
                          type="number" 
                          step="0.0001" 
                          value={clockLat} 
                          onChange={(e) => setClockLat(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block font-sans">Target Longitude</label>
                        <input 
                          type="number" 
                          step="0.0001" 
                          value={clockLng} 
                          onChange={(e) => setClockLng(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-sans">Geofence Lock:</span>
                      {isInsidePlant ? (
                        <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">VERIFIED INSIDE PLANT</span>
                      ) : (
                        <span className="bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded text-[9px] font-bold">OUTSIDE PLANT - LOCKED</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setClockLat(13.7563);
                        setClockLng(100.5018);
                        onNotify("รีเซ็ตพิกัดโรงงานหลัก 13.7563° N, 100.5018° E เรียบร้อย", "info");
                      }}
                      className="w-full border border-dashed border-slate-600 hover:border-slate-400 py-1 rounded text-[9px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      กลับพิกัดโรงงาน (13.7563°, 100.5018°)
                    </button>
                  </div>

                  {/* "สามารถ ถ่ายรูปได้ด้วย" - Photo Selection/Capture Card */}
                  <div className="p-4 bg-slate-800 rounded-xl space-y-3 border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ยืนยันภาพถ่าย (Selfie Verification)</span>
                      {clockPhoto && (
                        <button
                          type="button"
                          onClick={() => setClockPhoto('')}
                          className="text-rose-400 hover:text-rose-300 text-[10px] underline"
                        >
                          ลบภาพ
                        </button>
                      )}
                    </div>
                    
                    {clockPhoto ? (
                      <div className="relative flex flex-col items-center justify-center p-3 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden group">
                        <img 
                          src={clockPhoto} 
                          alt="Employee Selfie Preview" 
                          referrerPolicy="no-referrer"
                          className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="mt-2 text-center">
                          <span className="inline-block bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold animate-pulse">
                            FACIAL PROFILE MATCHED - 99.8%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-950 rounded-lg border border-dashed border-slate-700 text-center">
                        <Camera className="h-8 w-8 text-slate-500 mb-2" />
                        <p className="text-[11px] text-slate-400">ยังไม่ได้ถ่ายภาพถ่ายยันพนักงาน</p>
                        <p className="text-[9px] text-slate-500 mt-1">กรุณากดเปิดกล้องถ่ายหรือจำลองภาพเซลฟี่</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                      >
                        <Camera className="h-3 w-3" />
                        เปิดกล้อง / เลือกรูป
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulatePhoto}
                        className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                      >
                        <Upload className="h-3 w-3" />
                        ⚡ จำลองรูปเซลฟี่
                      </button>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="user"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleClockAction('Check In')}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs shadow-sm transition-colors text-center"
                    >
                      Check In Shift
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClockAction('Check Out')}
                      className="py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold text-xs shadow-sm transition-colors text-center"
                    >
                      Check Out Shift
                    </button>
                  </div>
                </div>

                {/* Attendance Log Table */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-semibold text-slate-800 text-sm">Attendance logs (GPS geofenced logs)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-100 font-mono text-slate-400 text-left uppercase text-[9px]">
                          <th className="pb-2">Date Record</th>
                          <th className="pb-2">Employee ID/Name</th>
                          <th className="pb-1">Verification Picture</th>
                          <th className="pb-2">Check In</th>
                          <th className="pb-2">Check Out</th>
                          <th className="pb-2">GPS Verification</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbState.attendance.map((log: any) => {
                          const empData = dbState.employees?.find((e: any) => e.id === log.employeeId);
                          const empNameLabel = empData ? (log.employeeId === 'emp-103' ? 'Marcus Brody (CNC)' : empData.name) : log.employeeId;
                          return (
                            <tr key={log.id} className="border-b border-slate-100 font-mono">
                              <td className="py-2.5 text-slate-800 font-semibold">{log.date}</td>
                              <td className="py-2.5 text-slate-500 font-bold">
                                {log.employeeId} - <span className="text-[10px] text-slate-700 font-sans">{empNameLabel}</span>
                              </td>
                              <td className="py-2 text-slate-500">
                                {log.photo ? (
                                  <img 
                                    src={log.photo} 
                                    alt="Verification selfie" 
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-xs"
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-sans italic">No Image</span>
                                )}
                              </td>
                              <td className="py-2.5 font-bold text-emerald-600">{log.checkIn}</td>
                              <td className="py-2.5 text-slate-600">{log.checkOut || '--'}</td>
                              <td className="py-2.5 text-[10px] text-slate-500">
                                {log.gpsCoords ? `${log.gpsCoords.lat.toFixed(4)}, ${log.gpsCoords.lng.toFixed(4)}` : 'N/A Geofence'}
                              </td>
                              <td className="py-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-700 font-bold'
                                }`}>{log.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab 3: Leaves & OT requests */}
        {activeHrTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leaves and approvals */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" /> Annual & Sick Leave Scheduling
              </h3>
              <div className="space-y-3">
                {dbState.leaveRequests.map((lv: any) => {
                  const emp = dbState.employees.find((e: any) => e.id === lv.employeeId);
                  
                  return (
                    <div key={lv.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{emp ? emp.name : lv.employeeId}</p>
                          <p className="text-[10px] text-slate-400 font-semibold font-mono">Request Code: {lv.id} | Type: {lv.type}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>{lv.status}</span>
                      </div>
                      <p className="text-xs text-slate-600">{lv.startDate} to {lv.endDate} | Reason: &quot;{lv.reason}&quot;</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OT Hours queue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" /> Overtime hours billing
              </h3>
              <div className="space-y-3">
                {dbState.otRequests.map((ot: any) => {
                  const emp = dbState.employees.find((e: any) => e.id === ot.employeeId);
                  
                  return (
                    <div key={ot.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{emp ? emp.name : ot.employeeId}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-semibold">{ot.date} | Request: {ot.id}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{ot.status}</span>
                      </div>
                      <p className="text-xs text-slate-600">Requested: <strong className="text-slate-800">{ot.hours} overtime hours</strong> to assist: &quot;{ot.reason}&quot;</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payroll generation & Payslip Dialog Print layout */}
        {activeHrTab === 'payroll' && (
          <div className="space-y-6">
            
            {/* Interactive Printable PDF mock overlays */}
            {printingSlip && (
              <div className="bg-slate-900/40 backdrop-blur-sm shadow-xl p-6 rounded-2xl border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                <div className="md:col-span-2 bg-white text-slate-800 p-8 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-200" id="print-area">
                  <div className="text-center space-y-1 mb-6">
                    <h3 className="font-extrabold text-sm tracking-tight">IDEVA FACTORY SYSTEM CO., LTD.</h3>
                    <p className="text-[9px] text-slate-500">HEAD OFFICE: INDUSTRIAL INDUSTRIAL ESTATE, RAYONG, THAILAND</p>
                    <p className="text-[9px] bg-slate-100 inline-block px-3 py-0.5 rounded">CONFIDENTIAL - PRIVATE EMPLOYEE PAYSLIP</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <p>Employee Reference: <strong>{printingSlip.employeeId}</strong></p>
                      <p>Full Name: <strong>{dbState.employees.find((e: any)=> e.id === printingSlip.employeeId)?.name}</strong></p>
                      <p>Account Node: <strong>Siam Commercial Bank SCS-901-2092</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Payroll slip ID: <strong>{printingSlip.id}</strong></p>
                      <p>Pay Period Month: <strong>June 2026 Shift Run</strong></p>
                      <p>Disburse Date: <strong>2026-06-30 (Expected)</strong></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <p className="font-bold border-b pb-1 text-slate-500 text-[10px]">REVENUE & ALLOWANCES</p>
                      <div className="flex justify-between"><span>Base Salary:</span><strong>+${printingSlip.baseSalary.toLocaleString()}</strong></div>
                      <div className="flex justify-between"><span>Production OT:</span><strong>+${printingSlip.otPay.toLocaleString()}</strong></div>
                      <div className="flex justify-between"><span>Allowances Sum:</span><strong>+${printingSlip.allowanceSum.toLocaleString()}</strong></div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold border-b pb-1 text-slate-500 text-[10px]">DEDUCTIONS & TAXATION</p>
                      <div className="flex justify-between"><span>SSO Fund:</span><strong>-${printingSlip.ssoDeduction}</strong></div>
                      <div className="flex justify-between"><span>Corporate Income Tax:</span><strong>-${printingSlip.taxDeduction.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  <div className="flex justify-between font-extrabold text-sm pt-4">
                    <span>NET DISBURSED INCOME:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-3 rounded">฿{printingSlip.netPay.toLocaleString()}</span>
                  </div>

                  <div className="text-center text-[8px] text-slate-400 mt-8">
                    Note: This is a system-generated secure payslip from IDEVA Factory OS Accounting API. No signed copy required.
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4 text-white">
                  <h4 className="font-bold text-sm">Payslip document generator</h4>
                  <p className="text-xs text-slate-300">
                    Verify compliance with National Insurance contributions (SSO) and progressive income tax brackets. This is ready to download.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" /> Print Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintingSlip(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold"
                    >
                      Close Viewer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Calculations period trigger card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Active Pay periods scheduler</h3>
                <p className="text-slate-500 text-xs">Verify calculations for June pay schedules. Finalizing logs auto-posts wages debit listings back to General Ledger accounting.</p>
              </div>

              <div>
                {dbState.payrollPeriods[1].status === 'Draft' ? (
                  canFinalizePayroll ? (
                    <button
                      type="button"
                      onClick={() => handlePostPayroll('payp-06')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" fill="currentColor" /> Finalize Pay Period & auto-Post to Accounting
                    </button>
                  ) : (
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-xl">Postings blocked: Only Admin or HR roles allowed.</span>
                  )
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl">Posted & finalised in Accounting ledger</span>
                )}
              </div>
            </div>

            {/* Payslips roster */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-xs uppercase text-slate-400">Archived Period Payslips roster</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-mono text-[9px] uppercase">
                      <th className="py-3 px-4">Pay ID</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4 text-right">Base salary</th>
                      <th className="py-3 px-4 text-right">OT hours earned</th>
                      <th className="py-3 px-4 text-right">allowances</th>
                      <th className="py-3 px-4 text-right">deductions (Tax+SSO)</th>
                      <th className="py-3 px-4 text-right">Total Disbursed Net</th>
                      <th className="py-3 px-4 text-right">Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbState.payslips.map((slip: any) => {
                      const emp = dbState.employees.find((e: any) => e.id === slip.employeeId);
                      return (
                        <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{slip.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{emp ? emp.name : slip.employeeId}</td>
                          <td className="py-3.5 px-4 text-right font-mono">฿{slip.baseSalary.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono">฿{slip.otPay.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono">฿{slip.allowanceSum.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-rose-600">-฿{(slip.taxDeduction + slip.ssoDeduction).toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-800 font-mono">฿{slip.netPay.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setPrintingSlip(slip)}
                              className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1.5 ml-auto"
                            >
                              <FileText className="h-4 w-4" /> View Payslip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: LINE Flex Message Creator and sender */}
        {activeHrTab === 'line-payslips' && (
          <LinePayslipOS
            dbState={dbState}
            onRefresh={onRefresh}
            onNotify={onNotify}
            userRole={userRole}
          />
        )}

      </div>

      {/* Google Sheet Simulator component bottom of page */}
      {(() => {
        const getSheetConfig = () => {
          switch (activeHrTab) {
            case 'roster':
              return {
                tableKey: 'employees',
                tableName: 'ทำเนียบบัญชีข้อมูลบุคลากรพนักงาน (Employees)',
                columns: [
                  { key: 'id', label: 'รหัสพนักงาน (ID)', type: 'text', readOnly: true },
                  { key: 'name', label: 'ชื่อ-นามสกุล', type: 'text' },
                  { key: 'department', label: 'แผนก/ฝ่ายสังกัด', type: 'text' },
                  { key: 'role', label: 'ตำแหน่งงาน', type: 'text' },
                  { key: 'baseSalary', label: 'เงินเดือนพื้นฐาน (บาท)', type: 'number' },
                  { key: 'status', label: 'สถานะการทำงาน', type: 'select', options: ['Active', 'Inactive', 'On Leave'] }
                ] as any,
                data: dbState.employees || []
              };
            case 'clock':
              return {
                tableKey: 'attendance',
                tableName: 'บันทึกประวัติการลงเวลาทำงาน (Attendance)',
                columns: [
                  { key: 'id', label: 'รหัสการลงเวลา (ID)', type: 'text', readOnly: true },
                  { key: 'employeeId', label: 'รหัสพนักงาน', type: 'text' },
                  { key: 'clockIn', label: 'วันเวลาเข้างาน', type: 'text' },
                  { key: 'clockOut', label: 'วันเวลาออกงาน', type: 'text' },
                  { key: 'status', label: 'สถานะการลงเวลา', type: 'select', options: ['Present', 'Late', 'Absent'] }
                ] as any,
                data: dbState.attendance || []
              };
            case 'requests':
              return {
                tableKey: 'leaveRequests',
                tableName: 'แบบใบคำร้องขอการลางาน (Leave Requests)',
                columns: [
                  { key: 'id', label: 'รหัสใบลางาน', type: 'text', readOnly: true },
                  { key: 'employeeId', label: 'รหัสพนักงาน', type: 'text' },
                  { key: 'type', label: 'เหตุผลประเภทการลา', type: 'text' },
                  { key: 'status', label: 'สถานะอนุมัติลา', type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
                ] as any,
                data: dbState.leaveRequests || []
              };
            case 'payroll':
              return {
                tableKey: 'payslips',
                tableName: 'บัญชีประวัติจ่ายเงินเดือน (Payslips Registry)',
                columns: [
                  { key: 'id', label: 'เอกสารหักจ่าย (ID)', type: 'text', readOnly: true },
                  { key: 'employeeId', label: 'รหัสพนักงาน', type: 'text' },
                  { key: 'baseSalary', label: 'ฐานเงินสุทธิ', type: 'number' },
                  { key: 'otPay', label: 'ค่าล่วงเวลา (OT)', type: 'number' },
                  { key: 'allowanceSum', label: 'ค่าสวัสดิการรวม', type: 'number' },
                  { key: 'taxDeduction', label: 'หักภาษี ณ ที่จ่าย', type: 'number' },
                  { key: 'ssoDeduction', label: 'หักสมทบประกันสังคม', type: 'number' },
                  { key: 'netPay', label: 'ยอดชำระสุทธิโอนเข้า', type: 'number' }
                ] as any,
                data: dbState.payslips || []
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
