
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Invoice } from '@/types';
import { formatDate } from '@/utils/formatters';
import { FileText, Search } from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
}

const InvoiceList = ({ invoices, onSelectInvoice }: InvoiceListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredInvoices = invoices.filter(invoice => 
    invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia faktur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Szukaj faktury..."
            className="pl-9"
          />
        </div>
        
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {searchTerm ? 'Brak wyników wyszukiwania' : 'Brak zapisanych faktur'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-md p-3 hover:bg-secondary/20 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {invoice.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.date} • {invoice.client.name}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <div className="text-sm text-muted-foreground">Suma</div>
                      <div className="font-medium">{invoice.total.gross.toFixed(2)} zł</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onSelectInvoice(invoice)}>
                      Podgląd
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
