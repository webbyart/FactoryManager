import React, { useState } from 'react';
import { 
  FileCheck, Download, FileSpreadsheet, RefreshCw, Printer, 
  Check, Layers, Award, BarChart3, Clock, AlertTriangle, QrCode
} from 'lucide-react';

interface AdminLTEReportsProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminLTEReports({ dbState, onRefresh, onNotify }: AdminLTEReportsProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const startExportSimulation = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    setDownloadingFormat(format);
    onNotify(`ระบบความเร็วสูงกำลังรวบรวมข้อมูล และโครงข่ายวิจัยคำนวณเอกสาร ${format}...`, "info");

    setTimeout(() => {
      setDownloadingFormat(null);
      onNotify(`รวบรวมไฟล์รายงานสถิติสำเร็จ! ไฟล์ LuxePerfume_Report_2026.${format.toLowerCase()} ดาวน์โหลดแชลงแล้ว`, "success");
    }, 2000);
  };

  // Simulating chemical lot label printing
  const dispatchPrintLabel = (lotNumber: string, item: string) => {
    onNotify(`สั่งพิมพ์พิกัดฉลาก สติ๊กเกอร์ QR ล็อต: ${lotNumber} (${item}) ไปยังเครื่องพิมพ์ ZEBRA สติกเกอร์ด่านตรวจแล้ว`, "success");
    
    // Call standard browser printing mechanism
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="font-family: 'Courier New', monospace; text-align: center; padding: 25px; border: 3px solid #6F42C1;">
            <p style="font-size: 14px; font-weight: bold; margin: 0;">LUXE PERFUME GMP LABEL</p>
            <p style="font-size: 10px; color: #888; margin: 5px 0;">Cosmetics Factory Audit Standards</p>
            <hr style="border-top: 1px dashed #333;" />
            <div style="font-size: 15px; font-weight: bold; margin: 15px 0; background: #eee; padding: 10px;">
              LOT: ${lotNumber}
            </div>
            <p style="font-size: 12px; font-weight: bold;">ITEM: ${item}</p>
            <p style="font-size: 10px; margin-top: 15px;">CERTIFICATION: VERIFIED ISO-22716</p>
            <p style="font-size: 8px; color: #aaa; margin-top: 20px;">SYSTEM TIMETABLE PRINT - ALL RECOVERY ENGINES SHUT</p>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6" id="reports-engine-panel">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileCheck className="h-5.5 w-5.5 text-primary" />
          ศูนย์สารสนเทศและพิมพ์เอกสาร GMP (Analytical Reports &amp; Exports)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">ควบคุมข้อมูลเชิงลึก ERP, ดาวน์โหลดสรุปยอดขาย-ส่วนผสมวัตถุดิบคงค้างรายเดือน, และยิงกระตุ้นเครื่องปริ๊นเตอร์พิมพ์ฉลากสารเคมีติดหน้าถัง (Zebra Starch labels)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Export Tower Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
          <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="h-4 w-4 text-primary" /> ระบบปุ่มออกใบรายงานภายนอก (Export Station)
          </strong>
          <p className="text-[11px] text-slate-400 leading-normal">มาตรฐานการคำนวณภาษีและรอบเข้าตรวจ ISO 22716 สากล สามารถรวบรวมไฟล์รายงานคลังวัตถุดิบและ OEE โรงงานผสมออกไปเปิดภายนอก</p>

          <div className="space-y-2.5 pt-1.5">
            <button
              type="button"
              disabled={downloadingFormat !== null}
              onClick={() => startExportSimulation('PDF')}
              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold p-3 text-xs rounded-xl flex items-center justify-between border dark:border-slate-800 transition-all shadow-xs"
            >
              <span className="flex items-center gap-2 font-bold select-none"><Download className="h-4 w-4 text-red-500" /> Export PDF รายงานผู้ถือหุ้น</span>
              {downloadingFormat === 'PDF' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            <button
              type="button"
              disabled={downloadingFormat !== null}
              onClick={() => startExportSimulation('EXCEL')}
              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold p-3 text-xs rounded-xl flex items-center justify-between border dark:border-slate-800 transition-all shadow-xs"
            >
              <span className="flex items-center gap-2 font-bold select-none"><FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export MS EXCEL ตารางบัญชีภาษี</span>
              {downloadingFormat === 'EXCEL' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            <button
              type="button"
              disabled={downloadingFormat !== null}
              onClick={() => startExportSimulation('CSV')}
              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold p-3 text-xs rounded-xl flex items-center justify-between border dark:border-slate-800 transition-all shadow-xs"
            >
              <span className="flex items-center gap-2 font-bold select-none"><Download className="h-4 w-4 text-blue-500" /> Export CSV สถิติ OEE ประมูลเครื่อง</span>
              {downloadingFormat === 'CSV' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* QR Printing dispatch terminal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
          <strong className="text-slate-800 dark:text-slate-200 text-xs block font-bold uppercase tracking-wider flex items-center gap-1">
            <Printer className="h-4 w-4 text-primary" /> พิมพ์ฉลากสติ๊กเกอร์บาร์โค้ดยาสระหอมหน้าถัง (Zebra Sticker dispatch)
          </strong>
          <p className="text-[11px] text-slate-400 leading-normal">มาตรฐานการติดฉลาก GMP บังคับติดสติ๊กเกอร์เตือนวัตถุดิบและเลข Lot วันหมดอายุหน้าชั้นเพื่อปัดความผิดพลาดในการชั่งสาร</p>
          
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {(dbState.goodsReceipts || []).slice(0, 5).map((gr: any) => (
              <div key={gr.id} className="p-3 bg-slate-55 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">GMP LOT PREPARED</span>
                    <strong className="text-[#333] dark:text-white">ล็อตรหัสบาร์: {gr.lotNumber}</strong>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">ซัพพลายเออร์ล็อตอ้างอิง: {gr.id} | สแตนดาร์ด COA: {gr.coaCode || 'COA-9812-ROSE'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => dispatchPrintLabel(gr.lotNumber, `Raw Material SKU #${gr.id}`)}
                  className="bg-primary hover:bg-opacity-95 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs font-mono"
                >
                  <Printer className="h-3 w-3" /> PRINT STICKER
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
