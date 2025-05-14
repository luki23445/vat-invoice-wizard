
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileDown, Printer } from 'lucide-react';
import { Invoice } from '@/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { formatDate } from '@/utils/formatters';

interface InvoicePreviewProps {
  invoice: Invoice;
  sellerDetails: any;
}

const InvoicePreview = ({ invoice, sellerDetails }: InvoicePreviewProps) => {
  const handleDownloadPDF = () => {
    generateInvoicePDF(invoice, sellerDetails);
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="flex flex-row items-center justify-between print:hidden">
        <CardTitle>Podgląd faktury</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Drukuj
          </Button>
          <Button onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Pobierz PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="invoice-preview space-y-6">
          <div className="text-xl font-bold text-center">Faktura VAT</div>
          
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Data wystawienia</div>
              <div>{invoice.date}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Numer faktury</div>
              <div>{invoice.id}</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-1">Sprzedawca:</div>
              <div>{sellerDetails.name}</div>
              <div className="whitespace-pre-line">{sellerDetails.address}</div>
              <div>NIP: {sellerDetails.taxId}</div>
              {sellerDetails.phone && <div>Tel: {sellerDetails.phone}</div>}
              {sellerDetails.email && <div>Email: {sellerDetails.email}</div>}
            </div>
            <div>
              <div className="font-medium mb-1">Nabywca:</div>
              <div>{invoice.client.name}</div>
              <div className="whitespace-pre-line">{invoice.client.address}</div>
              <div>{invoice.client.country}</div>
              {invoice.client.taxId && <div>NIP: {invoice.client.taxId}</div>}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-muted-foreground">
                  <th className="py-2">Produkt</th>
                  <th className="py-2 text-right">Ilość</th>
                  <th className="py-2 text-right">Cena netto</th>
                  <th className="py-2 text-right">VAT</th>
                  <th className="py-2 text-right">Wartość VAT</th>
                  <th className="py-2 text-right">Cena brutto</th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{product.name}</td>
                    <td className="py-2 text-right">{product.quantity}</td>
                    <td className="py-2 text-right">{product.netPrice.toFixed(2)} zł</td>
                    <td className="py-2 text-right">{product.vatRate}%</td>
                    <td className="py-2 text-right">{product.vatAmount.toFixed(2)} zł</td>
                    <td className="py-2 text-right">{product.grossPrice.toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end space-y-1 text-right">
            <div className="w-40">
              <div className="flex justify-between">
                <span>Razem netto:</span>
                <span className="font-medium">{invoice.total.net.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between">
                <span>Razem VAT:</span>
                <span className="font-medium">{invoice.total.vat.toFixed(2)} zł</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="font-medium">Razem brutto:</span>
                <span className="font-bold">{invoice.total.gross.toFixed(2)} zł</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;
