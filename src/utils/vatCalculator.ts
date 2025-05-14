
import { CountryVat, Product } from '@/types';

export const detectCountry = (address: string): string => {
  const normalizedAddress = address.toLowerCase();
  
  if (normalizedAddress.includes('polska') || normalizedAddress.includes('poland')) {
    return 'Polska';
  } else if (normalizedAddress.includes('niemcy') || normalizedAddress.includes('germany')) {
    return 'Niemcy';
  }
  
  return 'Inne';
};

export const getVatRate = (country: string, countryVatRates: CountryVat[]): number => {
  const foundCountry = countryVatRates.find(item => item.name === country);
  return foundCountry ? foundCountry.vatRate : 0;
};

export const calculatePrices = (grossPrice: number, vatRate: number, quantity: number): Product => {
  const netPrice = Number((grossPrice / (1 + vatRate / 100)).toFixed(2));
  const vatAmount = Number((grossPrice - netPrice).toFixed(2));
  
  return {
    name: '',
    grossPrice: grossPrice * quantity,
    netPrice: netPrice * quantity,
    vatAmount: vatAmount * quantity,
    vatRate,
    quantity
  };
};
