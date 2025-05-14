
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { CountryVat, AppSettings, SellerDetails } from '@/types';
import { DEFAULT_SETTINGS, saveSettings, getSettings } from '@/utils/storage';
import { toast } from '@/components/ui/use-toast';

interface SettingsPanelProps {
  onSettingsChange: (settings: AppSettings) => void;
}

const SettingsPanel = ({ onSettingsChange }: SettingsPanelProps) => {
  const [countryVatRates, setCountryVatRates] = useState<CountryVat[]>([]);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [newCountry, setNewCountry] = useState<CountryVat>({ name: '', vatRate: 0 });
  const [sellerDetails, setSellerDetails] = useState<SellerDetails>(DEFAULT_SETTINGS.sellerDetails);
  const [defaultProducts, setDefaultProducts] = useState<{ name: string }[]>([]);
  const [newProduct, setNewProduct] = useState<string>('');
  const [editProductMode, setEditProductMode] = useState<number | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const settings = getSettings();
    setCountryVatRates(settings.countryVatRates);
    setSellerDetails(settings.sellerDetails);
    setDefaultProducts(settings.defaultProducts || DEFAULT_SETTINGS.defaultProducts);
  }, []);

  // Update parent when settings change
  useEffect(() => {
    const settings: AppSettings = { 
      countryVatRates, 
      sellerDetails,
      defaultProducts
    };
    onSettingsChange(settings);
  }, [countryVatRates, sellerDetails, defaultProducts, onSettingsChange]);

  const handleAddCountry = () => {
    if (!newCountry.name.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa kraju nie może być pusta",
        variant: "destructive"
      });
      return;
    }
    
    // Check if country already exists
    if (countryVatRates.some(country => country.name === newCountry.name)) {
      toast({
        title: "Błąd",
        description: "Kraj o tej nazwie już istnieje",
        variant: "destructive"
      });
      return;
    }
    
    const updatedRates = [...countryVatRates, newCountry];
    setCountryVatRates(updatedRates);
    saveSettings({ 
      countryVatRates: updatedRates,
      sellerDetails,
      defaultProducts
    });
    setNewCountry({ name: '', vatRate: 0 });
    
    toast({
      title: "Sukces",
      description: `Dodano kraj: ${newCountry.name} ze stawką VAT: ${newCountry.vatRate}%`,
    });
  };

  const handleUpdateCountry = (index: number) => {
    const updatedRates = [...countryVatRates];
    saveSettings({ 
      countryVatRates: updatedRates,
      sellerDetails,
      defaultProducts
    });
    setEditMode(null);
    
    toast({
      title: "Sukces",
      description: `Zaktualizowano stawkę VAT dla kraju: ${countryVatRates[index].name}`,
    });
  };

  const handleDeleteCountry = (index: number) => {
    // Don't allow deletion of default countries
    const countryToDelete = countryVatRates[index];
    if (['Polska', 'Niemcy', 'Inne'].includes(countryToDelete.name)) {
      toast({
        title: "Błąd",
        description: "Nie można usunąć domyślnego kraju",
        variant: "destructive"
      });
      return;
    }
    
    const updatedRates = countryVatRates.filter((_, i) => i !== index);
    setCountryVatRates(updatedRates);
    saveSettings({ 
      countryVatRates: updatedRates,
      sellerDetails,
      defaultProducts
    });
    
    toast({
      title: "Sukces",
      description: `Usunięto kraj: ${countryToDelete.name}`,
    });
  };

  const handleRateChange = (index: number, value: string) => {
    const vatRate = parseFloat(value) || 0;
    const updatedRates = [...countryVatRates];
    updatedRates[index] = {
      ...updatedRates[index],
      vatRate
    };
    setCountryVatRates(updatedRates);
  };

  const handleResetDefault = () => {
    setCountryVatRates(DEFAULT_SETTINGS.countryVatRates);
    setSellerDetails(DEFAULT_SETTINGS.sellerDetails);
    setDefaultProducts(DEFAULT_SETTINGS.defaultProducts);
    
    const settings: AppSettings = { 
      countryVatRates: DEFAULT_SETTINGS.countryVatRates, 
      sellerDetails: DEFAULT_SETTINGS.sellerDetails,
      defaultProducts: DEFAULT_SETTINGS.defaultProducts
    };
    
    saveSettings(settings);
    
    toast({
      title: "Sukces",
      description: "Przywrócono domyślne ustawienia",
    });
  };

  const handleSellerDetailsChange = (field: keyof SellerDetails, value: string) => {
    setSellerDetails(prev => {
      const updated = { ...prev, [field]: value };
      saveSettings({ 
        countryVatRates, 
        sellerDetails: updated,
        defaultProducts
      });
      return updated;
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa produktu nie może być pusta",
        variant: "destructive"
      });
      return;
    }
    
    if (defaultProducts.some(product => product.name === newProduct)) {
      toast({
        title: "Błąd",
        description: "Produkt o tej nazwie już istnieje",
        variant: "destructive"
      });
      return;
    }
    
    const updatedProducts = [...defaultProducts, { name: newProduct }];
    setDefaultProducts(updatedProducts);
    saveSettings({ countryVatRates, sellerDetails, defaultProducts: updatedProducts });
    setNewProduct('');
    
    toast({
      title: "Sukces",
      description: `Dodano produkt: ${newProduct}`,
    });
  };

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = defaultProducts.filter((_, i) => i !== index);
    setDefaultProducts(updatedProducts);
    saveSettings({ countryVatRates, sellerDetails, defaultProducts: updatedProducts });
    
    toast({
      title: "Sukces",
      description: `Usunięto produkt: ${defaultProducts[index].name}`,
    });
  };

  const handleProductNameChange = (index: number, value: string) => {
    const updatedProducts = [...defaultProducts];
    updatedProducts[index] = { name: value };
    setDefaultProducts(updatedProducts);
  };

  const handleUpdateProduct = (index: number) => {
    if (!defaultProducts[index].name.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa produktu nie może być pusta",
        variant: "destructive"
      });
      return;
    }
    
    saveSettings({ countryVatRates, sellerDetails, defaultProducts });
    setEditProductMode(null);
    
    toast({
      title: "Sukces",
      description: `Zaktualizowano nazwę produktu`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia</CardTitle>
        <CardDescription>
          Zarządzaj ustawieniami aplikacji do fakturowania
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vat" className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="vat">Stawki VAT</TabsTrigger>
            <TabsTrigger value="seller">Dane sprzedawcy</TabsTrigger>
            <TabsTrigger value="products">Produkty</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vat" className="space-y-4">
            <div className="space-y-4">
              {countryVatRates.map((country, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-grow">{country.name}</div>
                  
                  {editMode === index ? (
                    <>
                      <Input
                        type="number"
                        value={country.vatRate}
                        onChange={(e) => handleRateChange(index, e.target.value)}
                        className="w-20"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleUpdateCountry(index)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditMode(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 text-right">{country.vatRate}%</div>
                      <Button size="icon" variant="ghost" onClick={() => setEditMode(index)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDeleteCountry(index)}
                        disabled={['Polska', 'Niemcy', 'Inne'].includes(country.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Dodaj nowy kraj</h4>
              <div className="flex items-end space-x-2">
                <div className="space-y-2 flex-grow">
                  <Label htmlFor="countryName">Nazwa kraju</Label>
                  <Input
                    id="countryName"
                    value={newCountry.name}
                    onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2 w-24">
                  <Label htmlFor="vatRate">VAT %</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    value={newCountry.vatRate}
                    onChange={(e) => setNewCountry({...newCountry, vatRate: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <Button onClick={handleAddCountry}>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="seller" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Nazwa firmy</Label>
                <Input
                  id="sellerName"
                  value={sellerDetails.name}
                  onChange={(e) => handleSellerDetailsChange('name', e.target.value)}
                  placeholder="Nazwa Twojej Firmy"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellerAddress">Adres</Label>
                <Textarea
                  id="sellerAddress"
                  value={sellerDetails.address}
                  onChange={(e) => handleSellerDetailsChange('address', e.target.value)}
                  placeholder="ul. Przykładowa 1, 00-001 Warszawa"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellerTaxId">NIP</Label>
                <Input
                  id="sellerTaxId"
                  value={sellerDetails.taxId}
                  onChange={(e) => handleSellerDetailsChange('taxId', e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellerPhone">Telefon</Label>
                <Input
                  id="sellerPhone"
                  value={sellerDetails.phone || ''}
                  onChange={(e) => handleSellerDetailsChange('phone', e.target.value)}
                  placeholder="+48 123 456 789"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellerEmail">Email</Label>
                <Input
                  id="sellerEmail"
                  value={sellerDetails.email || ''}
                  onChange={(e) => handleSellerDetailsChange('email', e.target.value)}
                  placeholder="kontakt@twojafirma.pl"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <div className="space-y-2">
              {defaultProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {editProductMode === index ? (
                    <>
                      <Input
                        value={product.name}
                        onChange={(e) => handleProductNameChange(index, e.target.value)}
                        className="flex-grow"
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleUpdateProduct(index)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditProductMode(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-grow">{product.name}</div>
                      <Button size="icon" variant="ghost" onClick={() => setEditProductMode(index)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDeleteProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="space-y-2 flex-grow">
                <Label htmlFor="newProduct">Nazwa produktu</Label>
                <Input
                  id="newProduct"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="Nowy produkt"
                />
              </div>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <Button variant="outline" onClick={handleResetDefault} className="w-full">
          Przywróć domyślne ustawienia
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
