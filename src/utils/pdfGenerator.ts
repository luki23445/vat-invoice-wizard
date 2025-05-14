
import { Invoice, SellerDetails } from '@/types';
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

export const generateInvoicePDF = (invoice: Invoice, sellerDetails: SellerDetails): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Faktura VAT', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Numer faktury: ${invoice.id}`, 15, 35);
  doc.text(`Data wystawienia: ${invoice.date}`, 15, 40);
  
  // Add seller details
  doc.setFontSize(9);
  doc.text('Sprzedawca:', 15, 50);
  doc.text(sellerDetails.name, 15, 55);
  
  // Handle multiline address
  const sellerAddressLines = sellerDetails.address.split('\n');
  sellerAddressLines.forEach((line, i) => {
    doc.text(line, 15, 60 + (i * 4));
  });
  
  const sellerYPos = 60 + (sellerAddressLines.length * 4);
  doc.text(`NIP: ${sellerDetails.taxId}`, 15, sellerYPos);
  
  if (sellerDetails.phone) {
    doc.text(`Tel: ${sellerDetails.phone}`, 15, sellerYPos + 4);
  }
  
  if (sellerDetails.email) {
    doc.text(`Email: ${sellerDetails.email}`, 15, sellerYPos + (sellerDetails.phone ? 8 : 4));
  }
  
  // Add client details
  doc.text('Nabywca:', 105, 50);
  doc.text(invoice.client.name, 105, 55);
  
  // Handle multiline address
  const clientAddressLines = invoice.client.address.split('\n');
  clientAddressLines.forEach((line, i) => {
    doc.text(line, 105, 60 + (i * 4));
  });
  
  const clientYPos = 60 + (clientAddressLines.length * 4);
  doc.text(invoice.client.country, 105, clientYPos);
  
  if (invoice.client.taxId) {
    doc.text(`NIP: ${invoice.client.taxId}`, 105, clientYPos + 4);
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
  
  const tableYPos = Math.max(sellerYPos, clientYPos) + 15;
  
  doc.autoTable({
    startY: tableYPos,
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
