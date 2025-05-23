
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { detectCountry } from '@/utils/vatCalculator';
import { ClipboardPaste } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ClientFormProps {
  onClientChange: (client: Client) => void;
}

const ClientForm = ({ onClientChange }: ClientFormProps) => {
  const [clientText, setClientText] = useState<string>('');
  
  useEffect(() => {
    // Parse client text into structured client object
    const parsedClient = parseClientText(clientText);
    onClientChange(parsedClient);
  }, [clientText, onClientChange]);

  const parseClientText = (text: string): Client => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Default values
    const client: Client = {
      name: '',
      address: '',
      country: '',
      taxId: ''
    };
    
    if (lines.length > 0) {
      // First line is typically the name
      client.name = lines[0];
      
      // Last line often contains the country
      const potentialCountry = lines[lines.length - 1].trim();
      const detectedCountry = detectCountry(potentialCountry);
      
      if (detectedCountry) {
        client.country = detectedCountry;
        
        // Remove the country from address lines
        lines.pop();
      }
      
      // Check for tax ID (NIP)
      const taxIdLine = lines.find(line => 
        line.toLowerCase().includes('nip') || 
        line.toLowerCase().includes('tax') ||
        line.match(/[a-z]{2}\d+/i) // Format like ES12345678
      );
      
      if (taxIdLine) {
        const taxMatch = taxIdLine.match(/(?:NIP|TAX|VAT)[:\s]*([\w\d]+)/i) || 
                         taxIdLine.match(/([a-z]{2}\d+)/i);
        
        if (taxMatch) {
          client.taxId = taxMatch[1];
          
          // Remove the tax ID from address lines
          const taxIdIndex = lines.indexOf(taxIdLine);
          if (taxIdIndex > -1) {
            lines.splice(taxIdIndex, 1);
          }
        }
      }
      
      // Rest of lines (excluding first line/name) form the address
      if (lines.length > 1) {
        client.address = lines.slice(1).join('\n');
      }
    }
    
    return client;
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setClientText(clipboardText);
        toast({
          title: "Wklejono dane",
          description: "Dane klienta zostały wklejone ze schowka",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wkleić danych ze schowka. Sprawdź uprawnienia przeglądarki.",
        variant: "destructive"
      });
      console.error("Clipboard error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane klienta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientDetails">Wszystkie dane klienta</Label>
          <Textarea
            id="clientDetails"
            value={clientText}
            onChange={(e) => setClientText(e.target.value)}
            placeholder="Wprowadź dane klienta (nazwa, adres, kraj, NIP)"
            rows={6}
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={handlePasteFromClipboard} 
          className="w-full flex items-center justify-center"
        >
          <ClipboardPaste className="mr-2" size={16} />
          Wklej
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
