
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types';
import { detectCountry } from '@/utils/vatCalculator';

interface ClientFormProps {
  onClientChange: (client: Client) => void;
}

const ClientForm = ({ onClientChange }: ClientFormProps) => {
  const [client, setClient] = useState<Client>({
    name: '',
    address: '',
    country: '',
    taxId: ''
  });

  useEffect(() => {
    onClientChange(client);
  }, [client, onClientChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedClient = { ...client, [name]: value };
    
    // Auto-detect country from address
    if (name === 'address' && value.trim() !== '') {
      const detectedCountry = detectCountry(value);
      updatedClient.country = detectedCountry;
    }
    
    setClient(updatedClient);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane klienta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nazwa klienta</Label>
          <Input
            id="name"
            name="name"
            value={client.name}
            onChange={handleChange}
            placeholder="Nazwa firmy lub imię i nazwisko"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Adres</Label>
          <Input
            id="address"
            name="address"
            value={client.address}
            onChange={handleChange}
            placeholder="Pełny adres klienta"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Kraj</Label>
          <Input
            id="country"
            name="country"
            value={client.country}
            onChange={handleChange}
            placeholder="Kraj klienta (auto-wykrywanie z adresu)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="taxId">NIP (opcjonalnie)</Label>
          <Input
            id="taxId"
            name="taxId"
            value={client.taxId || ''}
            onChange={handleChange}
            placeholder="NIP lub inny identyfikator podatkowy"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
