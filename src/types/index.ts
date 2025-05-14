
export interface Client {
  name: string;
  address: string;
  country: string;
  taxId?: string;
}

export interface Product {
  name: string;
  grossPrice: number;
  netPrice: number;
  vatAmount: number;
  vatRate: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  client: Client;
  products: Product[];
  date: string;
  total: {
    gross: number;
    net: number;
    vat: number;
  }
}

export interface CountryVat {
  name: string;
  vatRate: number;
}

export interface SellerDetails {
  name: string;
  address: string;
  taxId: string;
  phone?: string;
  email?: string;
}

export interface AppSettings {
  countryVatRates: CountryVat[];
  sellerDetails: SellerDetails;
  defaultProducts: { name: string }[];
}
