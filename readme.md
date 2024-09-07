// server.js or app.js
import express from 'express';
import { generateSalesReport, downloadSalesReportPDF, downloadSalesReportExcel } from './controllers/salesController.js';

const app = express();

// ... other middleware and routes ...

app.get('/api/sales-report', generateSalesReport);
app.get('/api/sales-report/pdf', downloadSalesReportPDF);
app.get('/api/sales-report/excel', downloadSalesReportExcel);

// salesController.js
import { generateReport } from "../utils/generateReport.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// ... existing generateSalesReport function ...

export const downloadSalesReportPDF = async (req, res) => {
  try {
    const { filter, fromDate, toDate } = req.query;
    const { startDate, endDate } = calculateDateRange(filter, fromDate, toDate);
    const report = await generateReport(startDate, endDate);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Sales Report', { align: 'center' });
    doc.moveDown();

    // Add summary
    doc.fontSize(14).text('Summary');
    doc.fontSize(12).text(`Total Revenue: $${report.summary.totalRevenue.toFixed(2)}`);
    doc.text(`Total Quantity: ${report.summary.totalQuantity}`);
    doc.text(`Total Orders: ${report.summary.totalOrders}`);
    doc.moveDown();

    // Add daily data
    doc.fontSize(14).text('Daily Data');
    report.dailyData.forEach(day => {
      doc.fontSize(12).text(`Date: ${day.date}`);
      doc.text(`Revenue: $${day.revenue.toFixed(2)}`);
      doc.text(`Quantity: ${day.quantity}`);
      doc.text(`Order Count: ${day.orderCount}`);
      doc.moveDown();
    });

    // Add top products
    doc.fontSize(14).text('Top Products');
    report.topProducts.forEach(product => {
      doc.fontSize(12).text(`Product: ${product.productName}`);
      doc.text(`Brand: ${product.productBrand}`);
      doc.text(`Total Revenue: $${product.totalRevenue.toFixed(2)}`);
      doc.text(`Total Quantity: ${product.totalQuantity}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF report" });
  }
};

export const downloadSalesReportExcel = async (req, res) => {
  try {
    const { filter, fromDate, toDate } = req.query;
    const { startDate, endDate } = calculateDateRange(filter, fromDate, toDate);
    const report = await generateReport(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add summary
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Revenue', report.summary.totalRevenue]);
    worksheet.addRow(['Total Quantity', report.summary.totalQuantity]);
    worksheet.addRow(['Total Orders', report.summary.totalOrders]);
    worksheet.addRow([]);

    // Add daily data
    worksheet.addRow(['Daily Data']);
    worksheet.addRow(['Date', 'Revenue', 'Quantity', 'Order Count']);
    report.dailyData.forEach(day => {
      worksheet.addRow([day.date, day.revenue, day.quantity, day.orderCount]);
    });
    worksheet.addRow([]);

    // Add top products
    worksheet.addRow(['Top Products']);
    worksheet.addRow(['Product Name', 'Brand', 'Total Revenue', 'Total Quantity']);
    report.topProducts.forEach(product => {
      worksheet.addRow([product.productName, product.productBrand, product.totalRevenue, product.totalQuantity]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate Excel report" });
  }
};

// Helper function to calculate date range
const calculateDateRange = (filter, fromDate, toDate) => {
  // ... existing date range calculation logic ...
};