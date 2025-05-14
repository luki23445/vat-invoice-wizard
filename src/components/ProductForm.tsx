
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Client, Product, CountryVat } from '@/types';
import { getVatRate, calculatePrices } from '@/utils/vatCalculator';
import { Calculator } from 'lucide-react';

interface ProductFormProps {
  client: Client;
  countryVatRates: CountryVat[];
  onProductsChange: (products: Product[]) => void;
}

const ProductForm = ({ client, countryVatRates, onProductsChange }: ProductFormProps) => {
  const initialProducts = [
    { name: 'Spoiler', grossPrice: 0, netPrice: 0, vatAmount: 0, vatRate: 0, quantity: 1 },
    { name: 'Wysyłka', grossPrice: 0, netPrice: 0, vatAmount: 0, vatRate: 0, quantity: 1 }
  ];

  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    if (client.country) {
      const vatRate = getVatRate(client.country, countryVatRates);
      
      const updatedProducts = products.map(product => ({
        ...product,
        vatRate
      }));
      
      setProducts(updatedProducts);
    }
  }, [client.country, countryVatRates]);

  useEffect(() => {
    onProductsChange(products);
  }, [products, onProductsChange]);

  const handlePriceChange = (index: number, grossPrice: string) => {
    const price = parseFloat(grossPrice) || 0;
    
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      grossPrice: price
    };
    
    setProducts(updatedProducts);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const qty = parseInt(quantity) || 1;
    
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: qty
    };
    
    setProducts(updatedProducts);
  };

  const handleVatRateChange = (index: number, vatRate: string) => {
    const rate = parseFloat(vatRate) || 0;
    
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      vatRate: rate
    };
    
    setProducts(updatedProducts);
  };

  const calculateProduct = (index: number) => {
    const product = products[index];
    const calculated = calculatePrices(
      product.grossPrice / product.quantity, 
      product.vatRate,
      product.quantity
    );

    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...product,
      netPrice: calculated.netPrice,
      vatAmount: calculated.vatAmount,
      grossPrice: calculated.grossPrice
    };
    
    setProducts(updatedProducts);
  };

  const calculateAll = () => {
    const updatedProducts = products.map(product => {
      const calculated = calculatePrices(
        product.grossPrice / product.quantity,
        product.vatRate,
        product.quantity
      );
      
      return {
        ...product,
        netPrice: calculated.netPrice,
        vatAmount: calculated.vatAmount,
        grossPrice: calculated.grossPrice
      };
    });
    
    setProducts(updatedProducts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produkty</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((product, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4">
            <div className="font-medium">{product.name}</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`grossPrice-${index}`}>Cena brutto</Label>
                <Input
                  id={`grossPrice-${index}`}
                  type="number"
                  value={product.grossPrice || ''}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`quantity-${index}`}>Ilość</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  value={product.quantity || 1}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`vatRate-${index}`}>Stawka VAT (%)</Label>
                <Input
                  id={`vatRate-${index}`}
                  type="number"
                  value={product.vatRate || 0}
                  onChange={(e) => handleVatRateChange(index, e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Oblicz</Label>
                <Button 
                  className="w-full"
                  onClick={() => calculateProduct(index)}
                  variant="outline"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Przelicz
                </Button>
              </div>
            </div>
            
            {product.netPrice > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="bg-secondary p-2 rounded flex justify-between">
                  <span>Netto:</span>
                  <span className="font-medium">{product.netPrice.toFixed(2)} zł</span>
                </div>
                <div className="bg-secondary p-2 rounded flex justify-between">
                  <span>VAT ({product.vatRate}%):</span>
                  <span className="font-medium">{product.vatAmount.toFixed(2)} zł</span>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <Button onClick={calculateAll} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Oblicz wszystko
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
