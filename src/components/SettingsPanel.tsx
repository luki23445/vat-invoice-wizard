
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { CountryVat, AppSettings } from '@/types';
import { DEFAULT_SETTINGS, saveSettings, getSettings } from '@/utils/storage';
import { toast } from '@/components/ui/use-toast';

interface SettingsPanelProps {
  onSettingsChange: (settings: AppSettings) => void;
}

const SettingsPanel = ({ onSettingsChange }: SettingsPanelProps) => {
  const [countryVatRates, setCountryVatRates] = useState<CountryVat[]>([]);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [newCountry, setNewCountry] = useState<CountryVat>({ name: '', vatRate: 0 });

  // Load settings from localStorage
  useEffect(() => {
    const settings = getSettings();
    setCountryVatRates(settings.countryVatRates);
  }, []);

  // Update parent when settings change
  useEffect(() => {
    const settings: AppSettings = { countryVatRates };
    onSettingsChange(settings);
  }, [countryVatRates, onSettingsChange]);

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
    saveSettings({ countryVatRates: updatedRates });
    setNewCountry({ name: '', vatRate: 0 });
    
    toast({
      title: "Sukces",
      description: `Dodano kraj: ${newCountry.name} ze stawką VAT: ${newCountry.vatRate}%`,
    });
  };

  const handleUpdateCountry = (index: number) => {
    const updatedRates = [...countryVatRates];
    saveSettings({ countryVatRates: updatedRates });
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
    saveSettings({ countryVatRates: updatedRates });
    
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
    saveSettings(DEFAULT_SETTINGS);
    
    toast({
      title: "Sukces",
      description: "Przywrócono domyślne ustawienia",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia stawek VAT</CardTitle>
        <CardDescription>
          Dodaj lub zmień domyślne stawki VAT dla poszczególnych krajów
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <Separator />
        
        <Button variant="outline" onClick={handleResetDefault} className="w-full">
          Przywróć domyślne ustawienia
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
