
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Package } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  return (
    <main className="container-custom py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="mb-8 flex justify-center">
            <CheckCircle size={80} className="text-green-500" />
          </div>
          
          <h1 className="text-3xl font-serif mb-4">Thank You for Your Order!</h1>
          
          <p className="text-muted-foreground mb-6">
            Your order has been successfully placed and is being processed. 
            You will receive a confirmation email shortly with your order details.
          </p>
          
          <div className="bg-muted p-6 rounded-md mb-8">
            <p className="font-medium mb-2">Order Number: <span className="text-furniture-taupe">MK-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p>
            <p className="text-sm text-muted-foreground">Use this number to track your order or for any inquiries.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-furniture-taupe hover:bg-furniture-brown">
              <Link to="/">
                <Home size={18} className="mr-2" />
                Return to Home
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/estimates">
                <Package size={18} className="mr-2" />
                View My Estimates
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutSuccess;
