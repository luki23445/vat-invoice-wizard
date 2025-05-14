
import { Invoice, AppSettings } from '@/types';

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  countryVatRates: [
    { name: 'Polska', vatRate: 23 },
    { name: 'Niemcy', vatRate: 19 },
    { name: 'Inne', vatRate: 0 }
  ],
  sellerDetails: {
    name: 'Nazwa Twojej Firmy',
    address: 'ul. Przykładowa 1, 00-001 Warszawa',
    taxId: '1234567890',
    phone: '+48 123 456 789',
    email: 'kontakt@twojafirma.pl'
  },
  defaultProducts: [
    { name: 'Spoiler' },
    { name: 'Wysyłka' }
  ]
};

// Save invoice to localStorage
export const saveInvoice = (invoice: Invoice): void => {
  const savedInvoices = getInvoices();
  savedInvoices.push(invoice);
  localStorage.setItem('invoices', JSON.stringify(savedInvoices));
};

// Get all invoices from localStorage
export const getInvoices = (): Invoice[] => {
  const invoicesJson = localStorage.getItem('invoices');
  return invoicesJson ? JSON.parse(invoicesJson) : [];
};

// Get invoice by ID
export const getInvoiceById = (id: string): Invoice | null => {
  const invoices = getInvoices();
  return invoices.find(invoice => invoice.id === id) || null;
};

// Save settings to localStorage
export const saveSettings = (settings: Partial<AppSettings>): void => {
  // Get current settings first
  const currentSettings = getSettings();
  
  // Merge with new settings, ensuring we don't lose any properties
  const updatedSettings: AppSettings = {
    countryVatRates: settings.countryVatRates || currentSettings.countryVatRates,
    sellerDetails: settings.sellerDetails || currentSettings.sellerDetails,
    defaultProducts: settings.defaultProducts || currentSettings.defaultProducts
  };
  
  localStorage.setItem('invoiceAppSettings', JSON.stringify(updatedSettings));
};

// Get settings from localStorage with proper fallbacks
export const getSettings = (): AppSettings => {
  try {
    const settingsJson = localStorage.getItem('invoiceAppSettings');
    
    if (!settingsJson) {
      return DEFAULT_SETTINGS;
    }
    
    const parsedSettings = JSON.parse(settingsJson) as Partial<AppSettings>;
    
    // Ensure all required properties are present
    return {
      countryVatRates: parsedSettings.countryVatRates || DEFAULT_SETTINGS.countryVatRates,
      sellerDetails: parsedSettings.sellerDetails || DEFAULT_SETTINGS.sellerDetails,
      defaultProducts: parsedSettings.defaultProducts || DEFAULT_SETTINGS.defaultProducts
    };
  } catch (error) {
    console.error('Error parsing settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
};
