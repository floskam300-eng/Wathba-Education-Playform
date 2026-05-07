
import React from 'react';
import { Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PrintReportButton = ({ 
  data, 
  columns, 
  title, 
  fileName = 'report.pdf',
  className = '' 
}) => {
  const handlePrintPDF = () => {
    // إنشاء نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لاستخدام ميزة الطباعة');
      return;
    }

    // إعداد البيانات للجدول مع معالجة التواريخ والأرقام
    const tableData = data.map((row, rowIndex) => 
      columns.map(col => {
        let value = col.accessor ? row[col.accessor] : col.render ? col.render(row) : '';
        
        // معالجة التواريخ
        if (col.accessor === 'created_at' || col.accessor === 'updated_at' || col.accessor?.includes('date')) {
          try {
            value = new Date(value).toLocaleDateString('ar-EG');
          } catch (e) {
            value = value;
          }
        }
        
        // معالجة الأرقام العشرية
        if (typeof value === 'number' && !Number.isInteger(value)) {
          value = value.toFixed(2);
        }
        
        return value;
      })
    );

    // إعداد عناوين الأعمدة
    const headers = columns.map(col => col.header);

    // إنشاء محتوى HTML للطباعة
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            direction: rtl;
          }
          .report-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #1A2E4A;
            padding-bottom: 10px;
          }
          .report-title {
            color: #1A2E4A;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .report-date {
            color: #666;
            font-size: 14px;
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
            font-weight: bold;
          }
          td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
          }
          tr:nth-child(even) {
            background-color: #f5f7fa;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">${title}</div>
          <div class="report-date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableData.map(row => 
              `<tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>`
            ).join('')}
          </tbody>
        </table>
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #FF8C00; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">طباعة التقرير</button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">إغلاق</button>
        </div>
      </body>
      </html>
    `;

    // كتابة المحتوى في النافذة الجديدة
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrintPDF}
      className={`flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${className}`}
    >
      <Printer className="w-4 h-4" />
      طباعة التقرير
    </button>
  );
};

export default PrintReportButton;
