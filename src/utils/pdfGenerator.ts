
import { Invoice } from '@/types';
import jsPDF from "jspdf";
import 'jspdf-autotable';

// Need to add the declaration for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Faktura VAT', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Numer faktury: ${invoice.id}`, 15, 40);
  doc.text(`Data wystawienia: ${invoice.date}`, 15, 45);
  
  // Add client details
  doc.text('Dane klienta:', 15, 55);
  doc.text(`Nazwa: ${invoice.client.name}`, 15, 60);
  doc.text(`Adres: ${invoice.client.address}`, 15, 65);
  doc.text(`Kraj: ${invoice.client.country}`, 15, 70);
  if (invoice.client.taxId) {
    doc.text(`NIP: ${invoice.client.taxId}`, 15, 75);
  }
  
  // Add products table
  const tableData = invoice.products.map(product => [
    product.name,
    product.quantity,
    `${product.netPrice.toFixed(2)} zł`,
    `${product.vatRate}%`,
    `${product.vatAmount.toFixed(2)} zł`,
    `${product.grossPrice.toFixed(2)} zł`
  ]);
  
  doc.autoTable({
    startY: 85,
    head: [['Produkt', 'Ilość', 'Cena netto', 'VAT', 'Kwota VAT', 'Cena brutto']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 175] }
  });
  
  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Suma netto: ${invoice.total.net.toFixed(2)} zł`, 140, finalY);
  doc.text(`Suma VAT: ${invoice.total.vat.toFixed(2)} zł`, 140, finalY + 5);
  doc.text(`Suma brutto: ${invoice.total.gross.toFixed(2)} zł`, 140, finalY + 10);
  
  // Save PDF
  doc.save(`faktura_${invoice.id}.pdf`);
};
