import { useEffect } from 'react';

const GoogleReviews = () => {
  useEffect(() => {
    // Load the Elfsight platform script
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove the script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">Read testimonials from our satisfied customers</p>
        <div 
          className="elfsight-app-b3cd453e-13eb-43cb-9297-6febb9557b0b" 
          data-elfsight-app-lazy
        />
      </div>
    </div>
  );
};

export default GoogleReviews;