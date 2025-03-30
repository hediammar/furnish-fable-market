
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const DashboardCard = ({ title, value, icon, description }: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const Overview = () => {
  // Fetch dashboard data
  const { data: productsCount = 0 } = useQuery({
    queryKey: ['admin', 'products-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });
  
  const { data: ordersCount = 0 } = useQuery({
    queryKey: ['admin', 'orders-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });
  
  const { data: usersCount = 0 } = useQuery({
    queryKey: ['admin', 'users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });
  
  const { data: totalRevenue = 0 } = useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');
      
      if (error) throw error;
      
      return data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    },
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div>
      <Helmet>
        <title>Dashboard Overview | Admin Dashboard</title>
      </Helmet>
      
      <h1 className="text-2xl font-serif font-medium mb-6">Dashboard Overview</h1>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Products"
          value={productsCount}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Total Orders"
          value={ordersCount}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Total Users"
          value={usersCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="From completed orders"
        />
      </div>
      
      <div className="mt-8 bg-white rounded-md shadow-sm p-6">
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Package className="h-8 w-8 mb-2" />
                <h3 className="text-lg font-medium mb-2">Manage Products</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add, edit, or remove products from your inventory
                </p>
                <div className="mt-auto">
                  <a 
                    href="/admin/products" 
                    className="text-sm text-primary hover:underline"
                  >
                    Go to Products →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <ShoppingBag className="h-8 w-8 mb-2" />
                <h3 className="text-lg font-medium mb-2">Manage Orders</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View and process customer orders
                </p>
                <div className="mt-auto">
                  <a 
                    href="/admin/orders" 
                    className="text-sm text-primary hover:underline"
                  >
                    Go to Orders →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 mb-2" />
                <h3 className="text-lg font-medium mb-2">Manage Users</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View user accounts and manage permissions
                </p>
                <div className="mt-auto">
                  <a 
                    href="/admin/users" 
                    className="text-sm text-primary hover:underline"
                  >
                    Go to Users →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;
