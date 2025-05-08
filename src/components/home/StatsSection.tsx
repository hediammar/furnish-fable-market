import React from 'react';

const stats = [
  { value: '500+', label: 'Products' },
  { value: '20+', label: 'Projects' },
  { value: '50+', label: 'Satisfied Customers' },
  { value: '1st', label: 'Top Local Brand' },
];

const StatsSection: React.FC = () => (
  <section className="py-10 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</span>
            <span className="text-base md:text-lg text-gray-600">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection; 