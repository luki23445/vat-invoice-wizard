
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

import ClientForm from '@/components/ClientForm';
import ProductForm from '@/components/ProductForm';
import InvoicePreview from '@/components/InvoicePreview';
import SettingsPanel from '@/components/SettingsPanel';
import InvoiceList from '@/components/InvoiceList';

import { Client, Product, Invoice, AppSettings } from '@/types';
import { DEFAULT_SETTINGS, saveSettings, getSettings, saveInvoice, getInvoices } from '@/utils/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [client, setClient] = useState<Client>({
    name: '',
    address: '',
    country: '',
    taxId: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([]);

  // Load settings and invoices on component mount
  useEffect(() => {
    const savedSettings = getSettings();
    setSettings(savedSettings);
    
    const invoicesList = getInvoices();
    setSavedInvoices(invoicesList);
  }, []);

  const handleClientChange = (updatedClient: Client) => {
    setClient(updatedClient);
  };

  const handleProductsChange = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleSettingsChange = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const handleSelectInvoice = (selectedInvoice: Invoice) => {
    setInvoice(selectedInvoice);
    setActiveTab('preview');
  };

  const handleGenerateInvoice = () => {
    if (!client.name || !client.address || !client.country) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie wymagane pola klienta",
        variant: "destructive"
      });
      return;
    }

    if (products.length === 0 || products.every(p => p.grossPrice === 0)) {
      toast({
        title: "Błąd",
        description: "Dodaj co najmniej jeden produkt z ceną",
        variant: "destructive"
      });
      return;
    }

    // Generate invoice ID
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    
    // Calculate totals
    const total = {
      gross: products.reduce((sum, product) => sum + product.grossPrice, 0),
      net: products.reduce((sum, product) => sum + product.netPrice, 0),
      vat: products.reduce((sum, product) => sum + product.vatAmount, 0)
    };

    const newInvoice: Invoice = {
      id: invoiceId,
      client,
      products: products.filter(p => p.grossPrice > 0),
      date: invoiceDate,
      total
    };

    setInvoice(newInvoice);
    
    // Save invoice to localStorage
    saveInvoice(newInvoice);
    
    // Update list of saved invoices
    setSavedInvoices([...savedInvoices, newInvoice]);
    
    toast({
      title: "Sukces",
      description: `Wygenerowano fakturę nr ${invoiceId}`,
    });
    
    setActiveTab('preview');
  };

  const handleNewInvoice = () => {
    setClient({
      name: '',
      address: '',
      country: '',
      taxId: '',
    });
    
    // Reset products to default
    const defaultProductsList = settings.defaultProducts.map(p => ({
      name: p.name,
      grossPrice: 0,
      netPrice: 0,
      vatAmount: 0,
      vatRate: 0,
      quantity: 1
    }));
    
    setProducts(defaultProductsList);
    setInvoiceDate(new Date().toISOString().substring(0, 10));
    setActiveTab('create');
  };

  return (
    <div className="container py-8 print:py-0">
      <h1 className="text-3xl font-bold mb-6 text-center print:mb-2">Generator Faktury VAT</h1>
      
      <div className="print:hidden">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Dane faktury</TabsTrigger>
            <TabsTrigger value="settings">Ustawienia</TabsTrigger>
            <TabsTrigger value="history">Historia</TabsTrigger>
            <TabsTrigger value="preview" disabled={!invoice}>Podgląd faktury</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ClientForm onClientChange={handleClientChange} />
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <label className="block">
                        <span className="font-medium block mb-1">Data wystawienia</span>
                        <input 
                          type="date" 
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </label>
                      
                      <Button className="w-full" onClick={handleGenerateInvoice}>
                        Generuj fakturę
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <ProductForm 
                client={client} 
                countryVatRates={settings.countryVatRates} 
                onProductsChange={handleProductsChange}
                defaultProducts={settings.defaultProducts}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsPanel onSettingsChange={handleSettingsChange} />
          </TabsContent>
          
          <TabsContent value="history">
            <InvoiceList 
              invoices={savedInvoices} 
              onSelectInvoice={handleSelectInvoice} 
            />
          </TabsContent>
          
          <TabsContent value="preview">
            {invoice && <InvoicePreview invoice={invoice} sellerDetails={settings.sellerDetails} />}
            
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={handleNewInvoice} className="mx-2">
                Nowa faktura
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('create')} className="mx-2">
                Powrót do edycji
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="hidden print:block">
        {invoice && <InvoicePreview invoice={invoice} sellerDetails={settings.sellerDetails} />}
      </div>
    </div>
  );
};

export default Index;
