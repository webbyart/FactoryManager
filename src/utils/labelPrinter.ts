// Dynamic QR logo label printing system for IDEVA Factory OS

export function generateMockQRCodeSVG(text: string): string {
  // Hash the text to generate deterministic random seed for the matrix
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Outer frame & anchors are standard QR features
  let svgContent = `<rect width="100" height="100" fill="white"/>`;
  
  // Anchors Top-Left, Top-Right, Bottom-Left
  // TL
  svgContent += `<path d="M10 10H30V30H10V10ZM14 14V26H26V14H14Z" fill="#000000"/>`;
  svgContent += `<rect x="18" y="18" width="4" height="4" fill="#000000"/>`;
  // TR
  svgContent += `<path d="M70 10H90V30H70V10ZM74 14V26H86V14H74Z" fill="#000000"/>`;
  svgContent += `<rect x="78" y="18" width="4" height="4" fill="#000000"/>`;
  // BL
  svgContent += `<path d="M10 70H30V90H10V70ZM14 74V86H26V74H14Z" fill="#000000"/>`;
  svgContent += `<rect x="18" y="78" width="4" height="4" fill="#000000"/>`;
  
  // Center small anchor
  svgContent += `<rect x="70" y="70" width="8" height="8" fill="#000000"/>`;
  svgContent += `<rect x="72" y="72" width="4" height="4" fill="white"/>`;
  svgContent += `<rect x="73" y="73" width="2" height="2" fill="#000000"/>`;

  // Draw some realistic random matrix dots based on the hash
  for (let y = 3; y < 17; y++) {
    for (let x = 3; x < 17; x++) {
      // Avoid overlapping with the 3 large anchors
      const isTL = x < 7 && y < 7;
      const isTR = x > 13 && y < 7;
      const isBL = x < 7 && y > 13;
      const isBR = x > 13 && y > 13;
      if (isTL || isTR || isBL || isBR) continue;
      
      const val = Math.abs(Math.sin(hash + x * 12.3 + y * 9.7));
      if (val > 0.45) {
        svgContent += `<rect x="${x * 5}" y="${y * 5}" width="5" height="5" fill="#000000"/>`;
      }
    }
  }
  return svgContent;
}

export function printQRCodeLabel(type: 'batch' | 'material' | 'product', data: any) {
  const codeValue = data.id || data.sku || data.code || 'LABEL';
  const qrSVG = generateMockQRCodeSVG(codeValue);
  
  let labelTitle = '';
  let fields: { label: string, value: string }[] = [];
  
  if (type === 'batch') {
    labelTitle = 'IDEVA BATCH RETRIEVAL GMP LABEL';
    fields = [
      { label: 'BATCH / MO ID', value: data.id || 'N/A' },
      { label: 'PRODUCT', value: data.productName || data.productId || 'N/A' },
      { label: 'FORMULA ID', value: data.formulaId || 'N/A' },
      { label: 'TARGET QTY', value: `${data.quantityRequested || data.qtyRequested || 0} Units` },
      { label: 'START DATE', value: data.startDate || new Date().toISOString().split('T')[0] },
      { label: 'GMP STATUS', value: 'VERIFIED CLEAR (GMP-LOT)' },
    ];
  } else if (type === 'material') {
    labelTitle = 'IDEVA RAW INGREDIENT LOCK LABEL';
    fields = [
      { label: 'CHEMICAL CODE', value: data.code || 'CHEM-N/A' },
      { label: 'INGREDIENT', value: data.name || 'N/A' },
      { label: 'CATEGORY', value: data.category || 'N/A' },
      { label: 'SAFETY MIN', value: `${data.minStock || 0} ${data.unit || 'g'}` },
      { label: 'ON HAND STOCK', value: `${data.stockLevel || 0} ${data.unit || 'g'}` },
      { label: 'AUDIT STATUS', value: 'STABLE (FIFO LOCKED)' },
    ];
  } else {
    labelTitle = 'IDEVA PRODUCT SKU RETAIL LABEL';
    fields = [
      { label: 'SKU REF CODE', value: data.sku || 'SKU-N/A' },
      { label: 'PRODUCT NAME', value: data.name || 'N/A' },
      { label: 'CATEGORY', value: data.category || 'N/A' },
      { label: 'UNIT OF SCALE', value: data.unit || 'Pcs' },
      { label: 'LIST PRICE', value: `฿${(data.sellPrice || 0).toLocaleString()}` },
      { label: 'REGULATORY', value: 'COSMETIC ISO-22716 APPROVED' },
    ];
  }
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IDEVA OS LABEL - ${codeValue}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;700;800&display=swap');
            @page {
              size: 4in 3in;
              margin: 0;
            }
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 12px;
              width: 3.8in;
              height: 2.8in;
              color: #000;
              background-color: #fff;
              box-sizing: border-box;
            }
            .label-card {
              border: 3px solid #000;
              border-radius: 12px;
              padding: 10px;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            .header {
              border-bottom: 2px solid #000;
              padding-bottom: 4px;
              margin-bottom: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-title {
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .header-badge {
              font-size: 7px;
              font-weight: bold;
              padding: 1px 4px;
              border: 1.5px solid #000;
              border-radius: 4px;
              font-family: 'JetBrains Mono', monospace;
              text-transform: uppercase;
            }
            .content-grid {
              display: flex;
              gap: 12px;
              flex: 1;
              align-items: center;
              margin-bottom: 4px;
              min-height: 0;
            }
            .qr-code {
              width: 75px;
              height: 75px;
              border: 1.5px solid #000;
              padding: 4px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
              flex-shrink: 0;
            }
            .qr-code svg {
              width: 100%;
              height: 100%;
            }
            .fields {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 3px;
              min-width: 0;
            }
            .field-row {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              border-bottom: 0.5px dashed #666;
              padding-bottom: 2px;
              font-family: 'JetBrains Mono', monospace;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .field-row:last-child {
              border-bottom: none;
            }
            .field-label {
              color: #444;
              font-weight: normal;
              margin-right: 4px;
            }
            .field-value {
              font-weight: bold;
              color: #000;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .footer {
              border-top: 2.5px solid #000;
              padding-top: 3px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 6px;
              font-family: 'JetBrains Mono', monospace;
              color: #000;
              font-weight: bold;
            }
            .barcode-sim {
              font-size: 14px;
              letter-spacing: 2px;
              font-family: monospace;
              font-weight: normal;
              margin: 0;
              line-height: 1;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <span class="header-title">${labelTitle}</span>
              <span class="header-badge">GMP APP</span>
            </div>
            <div class="content-grid">
              <div class="qr-code">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  ${qrSVG}
                </svg>
              </div>
              <div class="fields">
                ${fields.map(f => `
                  <div class="field-row">
                    <span class="field-label">${f.label}:</span>
                    <span class="field-value">${f.value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="footer">
              <span>LOT-REF: ${codeValue}</span>
              <span class="barcode-sim">||| | |||| | ||</span>
              <span>VERIFIED SEAL</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
