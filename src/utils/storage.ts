
import { Invoice, AppSettings } from '@/types';

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  countryVatRates: [
    { name: 'Polska', vatRate: 23 },
    { name: 'Niemcy', vatRate: 19 },
    { name: 'Inne', vatRate: 0 }
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
export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem('invoiceAppSettings', JSON.stringify(settings));
};

// Get settings from localStorage
export const getSettings = (): AppSettings => {
  const settingsJson = localStorage.getItem('invoiceAppSettings');
  return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
};
