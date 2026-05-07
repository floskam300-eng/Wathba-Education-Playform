/**
 * Generates a professional print report that can be saved as PDF.
 * This method is the best for Arabic language support and RTL layouts.
 */
export const generatePDFReport = (title, headers, data, filename = 'report.pdf') => {
  const printWindow = window.open('', '_blank');
  
  const tableHtml = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            padding: 40px;
            color: #1A2E4A;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #FF8C00;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1A2E4A;
          }
          .date {
            font-size: 14px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #1A2E4A;
            color: white;
            padding: 12px;
            text-align: center;
            font-size: 14px;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: center;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">منصة وثبة التعليمية - ${title}</div>
          <div class="date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          تم إنشاء هذا التقرير آلياً بواسطة منصة وثبة التعليمية
        </div>

        <script>
          window.onload = function() {
            window.print();
            // window.close(); // اختياري: لغلق النافذة بعد الطباعة
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(tableHtml);
  printWindow.document.close();
};
