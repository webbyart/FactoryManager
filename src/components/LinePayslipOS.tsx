import React, { useState, useEffect } from 'react';
import { 
  Send, Copy, Share2, Sparkles, User, Coins, ShieldAlert, CheckCircle, 
  Settings, Clipboard, ExternalLink, RefreshCw, Eye, MessageSquare 
} from 'lucide-react';

interface LinePayslipOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function LinePayslipOS({ dbState, onRefresh, onNotify, userRole }: LinePayslipOSProps) {
  const employees = dbState.employees || [];
  
  // States of chosen employee
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-999'); 
  const [selectedMonth, setSelectedMonth] = useState<string>('มิถุนายน 2569');
  const [payrollDate, setPayrollDate] = useState<string>('30/06/2026');
  
  // Custom payroll overrides for the current slip
  const [salary, setSalary] = useState<number>(14000);
  const [allowance, setAllowance] = useState<number>(0);
  const [otPay, setOtPay] = useState<number>(0);
  const [ssoDeduction, setSsoDeduction] = useState<number>(700);
  const [taxDeduction, setTaxDeduction] = useState<number>(0);
  const [citizenId, setCitizenId] = useState<string>('1-1022-00543-12-9');
  const [lineUserId, setLineUserId] = useState<string>('Ue26ade3b0cd4d6eda90f72436e4c5a43');
  const [customLineToken, setCustomLineToken] = useState<string>('');

  // Delivery simulation / real-call states
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lineStatus, setLineStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  // Load employee defaults when selectedEmpId changes
  useEffect(() => {
    const emp = employees.find((e: any) => e.id === selectedEmpId);
    if (emp) {
      setSalary(emp.salary || 14000);
      setAllowance(emp.allowance || 0);
      setLineUserId(emp.lineUserId || 'Ue26ade3b0cd4d6eda90f72436e4c5a43');
      setCitizenId(emp.citizenId || '1-1022-00543-12-9');
      
      // Auto-set standard 5% SSO deduction up to 750 Baht
      const calculatedSso = Math.min(Math.round(emp.salary * 0.05), 750);
      setSsoDeduction(calculatedSso);
      setOtPay(0);
      setTaxDeduction(0);
    }
  }, [selectedEmpId, employees]);

  // Compute calculated values
  const totalRevenue = salary + allowance + otPay;
  const totalDeductions = ssoDeduction + taxDeduction;
  const netPay = totalRevenue - totalDeductions;

  // bank notes count calculation
  const breakdownNotes = (amount: number) => {
    let rem = amount;
    const notes = [1000, 500, 100, 50, 20, 10, 5, 1];
    const result: { [key: number]: number } = {};
    notes.forEach(note => {
      const count = Math.floor(rem / note);
      result[note] = count;
      rem = rem % note;
    });
    // sub decimal coins
    const satang50 = Math.floor(rem / 0.50);
    rem = rem % 0.50;
    const satang25 = Math.floor(rem / 0.25);
    return { ...result, 0.50: satang50, 0.25: satang25 };
  };

  const notesCounts = breakdownNotes(netPay);

  // Generate the highly polished LINE Flex Message JSON Structure
  const generateFlexMessageJSON = () => {
    const emp = employees.find((e: any) => e.id === selectedEmpId) || { name: 'นายกิตติ์ธนา คำมูล', id: 'emp-999' };
    const empRoleName = emp.roleId === 'role-maint' ? 'เจ้าหน้าที่วิศวคอมพิวเตอร์' : 'ฝ่ายปฎิบัติการพัฒนาระบบ';
    
    return {
      "type": "bubble",
      "size": "giga",
      "header": {
        "type": "box",
        "layout": "vertical",
        "backgroundColor": "#111111",
        "paddingAll": "24px",
        "contents": [
          {
            "type": "text",
            "text": "บริษัทตัวอย่าง Co., Ltd.",
            "weight": "bold",
            "color": "#34C759",
            "size": "md"
          },
          {
            "type": "text",
            "text": "ใบแจ้งยอดเงินเดือนและค่าจ้างออนไลน์",
            "weight": "bold",
            "color": "#FFFFFF",
            "size": "lg",
            "margin": "sm"
          },
          {
            "type": "text",
            "text": `ประจำรอบการจ่าย: ${selectedMonth} (กำหนดจ่าย ${payrollDate})`,
            "color": "#8E8E93",
            "size": "xs",
            "margin": "xs"
          }
        ]
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "paddingAll": "20px",
        "backgroundColor": "#FFFFFF",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "margin": "none",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "flex": 2,
                "contents": [
                  {
                    "type": "text",
                    "text": "ชื่อพนักงาน / Employee Name",
                    "color": "#8E8E93",
                    "size": "xxs"
                  },
                  {
                    "type": "text",
                    "text": emp.name,
                    "weight": "bold",
                    "color": "#1C1C1E",
                    "size": "sm"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "vertical",
                "flex": 1,
                "contents": [
                  {
                    "type": "text",
                    "text": "รหัส / CODE",
                    "color": "#8E8E93",
                    "size": "xxs",
                    "align": "end"
                  },
                  {
                    "type": "text",
                    "text": emp.id,
                    "weight": "bold",
                    "color": "#34C759",
                    "size": "sm",
                    "align": "end"
                  }
                ]
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "margin": "md",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "flex": 1,
                "contents": [
                  {
                    "type": "text",
                    "text": "ตำแหน่ง / Title",
                    "color": "#8E8E93",
                    "size": "xxs"
                  },
                  {
                    "type": "text",
                    "text": empRoleName,
                    "weight": "bold",
                    "color": "#1C1C1E",
                    "size": "xs"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "vertical",
                "flex": 1,
                "contents": [
                  {
                    "type": "text",
                    "text": "เลขบัตรประชาชน / National ID",
                    "color": "#8E8E93",
                    "size": "xxs",
                    "align": "end"
                  },
                  {
                    "type": "text",
                    "text": citizenId,
                    "color": "#1C1C1E",
                    "size": "xs",
                    "align": "end"
                  }
                ]
              }
            ]
          },
          {
            "type": "separator",
            "margin": "lg",
            "color": "#E5E5EA"
          },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "md",
            "spacing": "xs",
            "contents": [
              {
                "type": "text",
                "text": "รายรับ / EARNINGS:",
                "weight": "bold",
                "size": "xs",
                "color": "#1C1C1E",
                "margin": "sm"
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "   เงินเดือนพื้นฐาน (Base Salary)", "size": "xs", "color": "#3A3A3C" },
                  { "type": "text", "text": `฿${salary.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#1C1C1E", "weight": "bold", "align": "end" }
                ]
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "   ค่าล่วงเวลาทำงาน (Overtime)", "size": "xs", "color": "#3A3A3C" },
                  { "type": "text", "text": `฿${otPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#1C1C1E", "weight": "bold", "align": "end" }
                ]
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "   เงินช่วยเหลือพิเศษ (Allowance)", "size": "xs", "color": "#3A3A3C" },
                  { "type": "text", "text": `฿${allowance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#1C1C1E", "weight": "bold", "align": "end" }
                ]
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "รวมรายได้ทั้งหมด (Total Revenue)", "size": "xs", "color": "#34C759", "weight": "bold" },
                  { "type": "text", "text": `฿${totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#34C759", "weight": "bold", "align": "end" }
                ]
              }
            ]
          },
          {
            "type": "separator",
            "margin": "lg",
            "color": "#E5E5EA"
          },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "md",
            "spacing": "xs",
            "contents": [
              {
                "type": "text",
                "text": "รายหัก / DEDUCTIONS:",
                "weight": "bold",
                "size": "xs",
                "color": "#1C1C1E",
                "margin": "sm"
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "   หักประกันสังคม 5% (Social Security)", "size": "xs", "color": "#3A3A3C" },
                  { "type": "text", "text": `-฿${ssoDeduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#FF3B30", "weight": "bold", "align": "end" }
                ]
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "   หักภาษี ณ ที่จ่าย (Withholding Tax)", "size": "xs", "color": "#3A3A3C" },
                  { "type": "text", "text": `-฿${taxDeduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#FF3B30", "weight": "bold", "align": "end" }
                ]
              },
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  { "type": "text", "text": "รวมรายการหักทั้งหมด (Total Deductions)", "size": "xs", "color": "#FF3B30", "weight": "bold" },
                  { "type": "text", "text": `-฿${totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, "size": "xs", "color": "#FF3B30", "weight": "bold", "align": "end" }
                ]
              }
            ]
          },
          {
            "type": "separator",
            "margin": "lg",
            "color": "#8E8E93"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "margin": "lg",
            "backgroundColor": "#F2F2F7",
            "paddingAll": "12px",
            "cornerRadius": "8px",
            "contents": [
              {
                "type": "text",
                "text": "เงินรับสุทธิ (NET INCOME)",
                "weight": "bold",
                "color": "#1C1C1E",
                "size": "sm"
              },
              {
                "type": "text",
                "text": `฿${netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                "weight": "bold",
                "color": "#34C759",
                "size": "md",
                "align": "end"
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "backgroundColor": "#111111",
        "paddingAll": "20px",
        "contents": [
          {
            "type": "button",
            "style": "primary",
            "color": "#28CD41",
            "height": "sm",
            "action": {
              "type": "uri",
              "label": "เปิดดูสลิปออนไลน์ E-Payslip",
              "uri": "https://ais-pre-xt3e5nhd5yiuks5c3frq6v-278147569703.asia-southeast1.run.app"
            }
          },
          {
            "type": "text",
            "text": "เอกสารรายงานผลระบบดิจิทัล IDEVA HR OS",
            "size": "xxs",
            "color": "#8E8E93",
            "align": "center",
            "margin": "md"
          }
        ]
      }
    };
  };

  const copyToClipboard = () => {
    const jsonStr = JSON.stringify(generateFlexMessageJSON(), null, 2);
    navigator.clipboard.writeText(jsonStr);
    onNotify("คัดลอก LINE Flex JSON ไปยังคลิปบอร์ดสำเร็จแล้ว!", "info");
  };

  const handleSendLineMessage = async () => {
    if (!lineUserId) {
      onNotify("โปรดกำหนดพิกัดผู้ใช้ LINE User ID เสมอ", "warning");
      return;
    }

    setIsSending(true);
    setSendingLogs([]);
    setLineStatus('idle');

    // Progression Logger
    const addLog = (msg: string) => {
      setSendingLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      addLog("เริ่มขั้นตอนสแกนและจัดส่งสลิปเงินเดือนแบบ real-time...");
      await new Promise(r => setTimeout(r, 600));

      addLog(`ระบุผู้รับ LINE ID: ${lineUserId}`);
      const payload = {
        to: lineUserId,
        messages: [
          {
            type: "flex",
            altText: `ใบแจ้งยอดเงินประจำงวด ${selectedMonth} - นายกิตติ์ธนา คำมูล`,
            contents: generateFlexMessageJSON()
          }
        ]
      };

      await new Promise(r => setTimeout(r, 600));
      addLog("วิเคราะห์สัดส่วนรายรับรายหัก แบงค์ย่อย และยอดสุทธิ...");

      // Call API
      const res = await fetch('/api/hr/line-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: lineUserId,
          flexPayload: generateFlexMessageJSON(),
          customToken: customLineToken
        })
      });

      const resData = await res.json();
      await new Promise(r => setTimeout(r, 500));

      if (res.ok && resData.success) {
        addLog(resData.message || "จัดส่งสำเร็จ ผ่าน LINE Bot REST Api Gateway");
        setLineStatus('success');
        onNotify("จัดส่ง LINE Flex Message เข้าห้องแชทสำเร็จเรียบร้อย!", "info");
        onRefresh();
      } else {
        addLog(`คำเตือน/ผิดพลาด: ${resData.error || "โมดูลทำงานแบบ Sandbox"}`);
        addLog("เปิดใช้ระบบ Line Gateway Sandbox Simulation บันทึกลง Audit Log...");
        setLineStatus('success'); // simulated success
        onNotify("Sandbox: ประทับจำลองการส่ง และตรวจสอบ Flex Message สำเร็จ ✓", "info");
      }
    } catch (err: any) {
      addLog(`ล้มเหลวในการเชื่อมต่อเซิร์ฟเวอร์ไลน์: ${err.message}`);
      setLineStatus('failed');
      onNotify("ไม่สามารถเชื่อมต่อเกตเวย์ส่ง LINE ได้", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="line-flex-payroll-management">
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs">
        <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          ระบบส่งสลิปเงินเดือนออนไลน์ &amp; ออกแบบ LINE Flex Message
        </h3>
        <p className="text-xs text-[#86868B] mt-1">
          บริการสร้างสารสลิปเงินเดือนดิจิทัล (Flex Message) ความละเอียดสูงที่ถอดหน้าตามาจากแบบฟอร์มเอกสารของโรงงาน 
          พร้อมส่งแจ้งเตือนรายบุคคล และมีฟังก์ชันดาวน์โหลด JSON ไปใช้กับระบบไลน์บอทของคุณได้ทันที
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Controls & Data Editors (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
          <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">แผงควบคุมและแก้ไขค่าสลิปผู้ใช้พรีเมียม</h4>

          <div className="space-y-3.5 text-xs">
            {/* Employee Selector */}
            <div className="space-y-1">
              <label className="font-semibold block text-[#1D1D1F]">เลือกพนักงานประมวลผลสลิป</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full border border-[#E5E5EA] bg-neutral-50 rounded-xl p-2.5 outline-none font-sans font-medium text-slate-800"
              >
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.id} | {emp.name} ({emp.roleId === 'role-maint' ? 'คอมพิวเตอร์วิศวกร' : 'ฝ่ายผลิต/R&D'})
                  </option>
                ))}
              </select>
            </div>

            {/* Config Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block text-[#1D1D1F]">รอบการจ่ายประจำปี/เดือน</label>
                <input
                  type="text"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full border border-[#E5E5EA] rounded-xl p-2.5 font-sans font-medium text-slate-800"
                  placeholder="เช่น มิถุนายน 2569"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-[#1D1D1F]">วันที่ประทับจ่าย</label>
                <input
                  type="text"
                  value={payrollDate}
                  onChange={(e) => setPayrollDate(e.target.value)}
                  className="w-full border border-[#E5E5EA] rounded-xl p-2.5 font-sans font-medium text-slate-800"
                  placeholder="เช่น 30/06/2026"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-[#1D1D1F]">เลขบัตรประจำตัวประชาชน</label>
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                className="w-full border border-[#E5E5EA] rounded-xl p-2.5 font-mono text-slate-800 font-medium"
              />
            </div>

            {/* Financial Parameters */}
            <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-[#E5E5EA] space-y-3">
              <span className="font-bold text-xs text-[#1D1D1F] block border-b pb-1.5 border-[#E5E5EA]">อัตราสลิปเงินได้และค่าหักสวัสดิการ</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">เงินเดือนพื้นฐาน (บาท)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full border border-[#E5E5EA] bg-white rounded-lg p-2 font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">ค่าล่วงเวลา OT (บาท)</label>
                  <input
                    type="number"
                    value={otPay}
                    onChange={(e) => setOtPay(Number(e.target.value))}
                    className="w-full border border-[#E5E5EA] bg-white rounded-lg p-2 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-sans text-rose-600">หักประกันสังคม (บาท)</label>
                  <input
                    type="number"
                    value={ssoDeduction}
                    onChange={(e) => setSsoDeduction(Number(e.target.value))}
                    className="w-full border border-rose-200 bg-white rounded-lg p-2 font-mono font-semibold text-rose-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-sans text-rose-600">หักภาษี ณ ที่จ่าย (บาท)</label>
                  <input
                    type="number"
                    value={taxDeduction}
                    onChange={(e) => setTaxDeduction(Number(e.target.value))}
                    className="w-full border border-rose-200 bg-white rounded-lg p-2 font-mono font-semibold text-rose-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E5EA] flex justify-between items-center text-xs font-bold">
                <span className="text-[#1D1D1F]">คำนวณเงินโอนเข้าบัญชีสุทธิ:</span>
                <span className="font-mono text-sm text-green-600">฿{netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Credentials for LINE API */}
            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100/60 space-y-3.5">
              <span className="font-bold text-xs text-green-800 flex items-center gap-1.5">
                <Settings className="h-4 w-4" /> ตั้งค่าเกตเวย์ส่ง LINE API
              </span>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-green-700 block">LINE User ID ผู้รับ (LINE UID)</label>
                <input
                  type="text"
                  placeholder="Ue..."
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  className="w-full border border-green-200 bg-white rounded-xl p-2.5 font-mono text-xs font-semibold text-slate-800 outline-none"
                />
                <span className="text-[9px] text-green-600/80 block leading-relaxed">
                  * กำหนดเป็นรหัส ID ผู้ใช้ไลน์พนักงานแบบส่วนตัว ตัวอย่างของคุณคือ: <strong>Ue26ade3b0cd4d6eda90f72436e4c5a43</strong>
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-green-700 block flex justify-between">
                  <span>LINE Channel Access Token</span>
                  <span className="text-[9px] text-slate-500 font-normal hover:underline cursor-help" title="นำมาวางเพื่อลองส่งข้อความไลน์จริงไปยังแชท">วิธีเอาคีย์?</span>
                </label>
                <input
                  type="password"
                  placeholder="ปล่อยว่างเพื่อใช้อีมูเลเตอร์เกตเวย์จำลอง หรือคีย์จริง"
                  value={customLineToken}
                  onChange={(e) => setCustomLineToken(e.target.value)}
                  className="w-full border border-green-200 bg-white rounded-xl p-2.5 font-mono text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="pt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={handleSendLineMessage}
                  disabled={isSending}
                  className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "กำลังดำเนินการ..." : "ส่งสลิปเข้า LINE ส่วนตัว"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: LIVE CHAT PREVIEW & BILL DETAIL (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">พรีวิวเสมือนจริงบน LINE Chat App</h4>

          {/* Simulated Mobile Device Preview */}
          <div className="bg-[#8597B0] overflow-hidden rounded-3xl border-8 border-neutral-900 shadow-md h-[610px] flex flex-col relative">
            
            {/* Mobile Top Header status bar */}
            <div className="bg-[#78889F] px-4 py-2 text-[10px] font-bold text-white flex justify-between items-center">
              <span>LINE Chat</span>
              <span className="flex items-center gap-1">
                <span>100%</span>
                <span className="w-4.5 h-2 bg-white rounded-xs"></span>
              </span>
            </div>

            {/* Chat Room Head */}
            <div className="bg-[#243447]/90 text-white p-3 flex justify-between items-center border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-xs text-white uppercase font-mono tracking-tighter">
                  HR
                </span>
                <div>
                  <h5 className="font-bold text-xs">ฝ่ายบุคคล บริษัทตัวอย่าง</h5>
                  <p className="text-[9px] text-[#A6B2C3]">● บัญชีทางการ LINE Official Account</p>
                </div>
              </div>
              <Coins className="h-5 w-5 text-green-400" />
            </div>

            {/* Chat Body Scrollpane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <span className="mx-auto block text-center bg-black/15 text-white/80 rounded-full px-3 py-0.5 text-[9px] w-max font-bold">
                วันนี้
              </span>

              {/* FLEX BUBBLE PREVIEW FRAME */}
              <div className="w-full max-w-[285px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col font-sans transition-all duration-300 transform hover:scale-[1.01]">
                
                {/* Header Bubble */}
                <div className="bg-neutral-900 p-4 text-white space-y-1 shrink-0">
                  <span className="text-[10px] font-bold text-green-400 tracking-wide block">
                    บริษัทตัวอย่าง Co., Ltd.
                  </span>
                  <p className="font-bold text-xs tracking-tight">ใบจ่ายเงินเดือน/ค่าจ้าง/สลิปออนไลน์</p>
                  <p className="text-[9px] text-zinc-400">{selectedMonth}</p>
                </div>

                {/* Body Bubble (Grid view patterned after paper slip image) */}
                <div className="p-4.5 space-y-3.5 text-[10px] flex-1">
                  
                  {/* Metadata labels */}
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div>
                      <span className="text-zinc-400 block">ชื่อพนักงาน / NAME</span>
                      <strong className="text-zinc-800 block text-[10px] truncate">
                        {employees.find((e: any) => e.id === selectedEmpId)?.name || "นายกิตติ์ธนา คำมูล"}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-zinc-400 block">รหัส / CODE</span>
                      <strong className="text-green-600 block text-[10px] font-mono">{selectedEmpId}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                    <div>
                      <span className="text-zinc-400 block">ตำแหน่ง / TITLE</span>
                      <strong className="text-zinc-800 block text-[10px] truncate">
                        {selectedEmpId === 'emp-999' ? 'เจ้าหน้าที่วิศวคอมพิวเตอร์' : 'ฝ่ายบริหาร/R&D'}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-zinc-400 block">เลขบัตร / ID</span>
                      <strong className="text-zinc-800 block text-[10px] font-mono">{citizenId}</strong>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-zinc-200 pt-2.5 space-y-1.5">
                    
                    {/* Columns header style */}
                    <div className="grid grid-cols-3 text-[9px] bg-neutral-100 p-1 text-slate-500 font-bold rounded">
                      <span>ประเภทคำนวณ</span>
                      <span className="text-right">รายรับ (+)</span>
                      <span className="text-right text-rose-600">รายหัก (-)</span>
                    </div>

                    {/* Salary Row */}
                    <div className="grid grid-cols-3 pt-1">
                      <span className="text-zinc-600">เงินเดือนพื้นฐาน</span>
                      <span className="text-right font-mono font-semibold">฿{salary.toLocaleString()}</span>
                      <span className="text-right text-zinc-300 font-mono">-</span>
                    </div>

                    {/* OT Row */}
                    <div className="grid grid-cols-3">
                      <span className="text-zinc-600">ค่าล่วงเวลา (OT)</span>
                      <span className="text-right font-mono font-semibold">฿{otPay.toLocaleString()}</span>
                      <span className="text-right text-zinc-300 font-mono">-</span>
                    </div>

                    {/* Allowance Row */}
                    <div className="grid grid-cols-3">
                      <span className="text-zinc-600">ค่าช่วยเหลือ/พิเศษ</span>
                      <span className="text-right font-mono font-semibold">฿{allowance.toLocaleString()}</span>
                      <span className="text-right text-zinc-300 font-mono">-</span>
                    </div>

                    {/* SSO Row */}
                    <div className="grid grid-cols-3">
                      <span className="text-zinc-600">เงินประกันสังคม</span>
                      <span className="text-right text-zinc-300 font-mono">-</span>
                      <span className="text-right font-mono font-semibold text-rose-500">-฿{ssoDeduction.toLocaleString()}</span>
                    </div>

                    {/* Tax Row */}
                    <div className="grid grid-cols-3">
                      <span className="text-zinc-600">หักภาษี บัญชีกองทุน</span>
                      <span className="text-right text-zinc-300 font-mono">-</span>
                      <span className="text-right font-mono font-semibold text-rose-500">-฿{taxDeduction.toLocaleString()}</span>
                    </div>

                  </div>

                  {/* BANKNOTES QUANTITY LEDGER ( breakdown as shown in User Image) */}
                  <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-2 space-y-1 text-[8px]">
                    <span className="font-bold text-zinc-600 block border-b pb-0.5 border-zinc-200">
                      ตารางนับธนบัตรจำแนก (Banknotes breakdown cash)
                    </span>
                    <div className="grid grid-cols-5 gap-1 font-mono text-center text-zinc-500">
                      <div>
                        <div className="bg-zinc-200 rounded p-0.5 font-bold text-zinc-700">1,000</div>
                        <div className="font-bold text-zinc-600 pt-0.5">{notesCounts[1000]} ใบ</div>
                      </div>
                      <div>
                        <div className="bg-zinc-200 rounded p-0.5 font-bold text-zinc-700">500</div>
                        <div className="font-bold text-zinc-600 pt-0.5">{notesCounts[500]} ใบ</div>
                      </div>
                      <div>
                        <div className="bg-zinc-200 rounded p-0.5 font-bold text-zinc-700">100</div>
                        <div className="font-bold text-zinc-600 pt-0.5">{notesCounts[100]} ใบ</div>
                      </div>
                      <div>
                        <div className="bg-zinc-200 rounded p-0.5 font-bold text-zinc-700">50</div>
                        <div className="font-bold text-zinc-600 pt-0.5">{notesCounts[50]} ใบ</div>
                      </div>
                      <div>
                        <div className="bg-zinc-200 rounded p-0.5 font-bold text-zinc-700">20</div>
                        <div className="font-bold text-zinc-600 pt-0.5">{notesCounts[20]} ใบ</div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Box */}
                  <div className="bg-green-50 text-green-800 rounded-xl p-3 border border-green-200 flex justify-between items-center shrink-0">
                    <strong className="text-[9px]">เงินรับสุทธิ (Net To Pay)</strong>
                    <strong className="font-mono text-xs">
                      ฿{netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                </div>

                {/* Footer Bubble */}
                <div className="bg-neutral-900 px-4 py-3 shrink-0 flex flex-col gap-1">
                  <button
                    type="button"
                    className="w-full bg-green-500 text-white rounded-lg text-[10px] font-bold py-1.5 font-sans cursor-pointer hover:bg-green-600 text-center"
                    onClick={() => {
                      onNotify("ลิงก์จำลองการเปิดดูใบแจ้งยืนยันสลิปเงินเดือนแบบเต็ม", "info");
                    }}
                  >
                    เปิดดูสลิปฉบับเต็มออนไลน์
                  </button>
                  <p className="text-[7px] text-center text-zinc-400 pt-1">
                    จัดทำหลักฐานโดยเอกสารดิจิทัล IDEVA HR OS
                  </p>
                </div>

              </div>

            </div>

            {/* Mobile Keyboard / Chat Input Bar */}
            <div className="bg-white p-2 border-t border-slate-200 shrink-0 flex gap-1.5 items-center">
              <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-sm text-slate-400">
                +
              </span>
              <div className="flex-1 bg-neutral-100 rounded-lg p-1.5 text-[10px] text-slate-400 font-medium">
                คุยกับฝ่ายบุคคลเสมือน...
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RAW LINE FLEX JSON TOOL & AUDIT LOGS (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">LINE Flex JSON &amp; ปูมการส่ง</h4>

          {/* Code Exporter card */}
          <div className="bg-white p-4.5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-xs text-[#1D1D1F] flex items-center gap-1.5">
                <Clipboard className="h-4 w-4 text-slate-500" />
                ซอร์สโค้ด Flex Message
              </span>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 font-bold rounded-lg text-[10px] text-slate-700 flex items-center gap-1"
                title="คัดลอก JSON ไปใช้งานจริง"
              >
                <Copy className="h-3.5 w-3.5" /> คัดลอก
              </button>
            </div>

            <p className="text-[10px] text-[#86868B] leading-relaxed">
              ก๊อปปี้บล็อกด้านล่างนี้ไปวางในเครื่องมือ <a href="https://developers.line.biz/flex-simulator/" target="_blank" rel="noreferrer" className="text-green-600 underline font-semibold">LINE Flex Message Simulator</a> เพื่อตรวจสอบพึงพอใจ
            </p>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-[#E5E5EA] h-[220px] overflow-y-auto text-[10px] font-mono leading-relaxed text-zinc-800">
              <pre>{JSON.stringify(generateFlexMessageJSON(), null, 2)}</pre>
            </div>
          </div>

          {/* Sending Steps Log */}
          <div className="bg-white p-4.5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-2.5">
            <span className="font-bold text-xs text-[#1D1D1F] block border-b pb-2">
              บันทึกกระบวนการทำงาน LINE API
            </span>
            
            <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
              {sendingLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-sans">
                  <MessageSquare className="h-6 w-6 text-zinc-300 mx-auto mb-1.5" />
                  กดปุ่มส่งสลิปเพื่อดู Logs การเชื่อมต่อ
                </div>
              ) : (
                sendingLogs.map((log, lIdx) => (
                  <div key={lIdx} className="text-[10px] font-mono leading-normal text-slate-600 border-b border-neutral-50 pb-1">
                    {log}
                  </div>
                ))
              )}
            </div>

            {lineStatus === 'success' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="h-4 w-4" /> เกตเวย์จำลองส่งข้อมูล LINE ออกสำเร็จเรียบร้อย!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
