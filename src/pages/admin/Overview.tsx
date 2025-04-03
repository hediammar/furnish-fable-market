
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for charts
const salesData = [
  { name: 'Jan', total: 3500 },
  { name: 'Feb', total: 4800 },
  { name: 'Mar', total: 4100 },
  { name: 'Apr', total: 6400 },
  { name: 'May', total: 5800 },
  { name: 'Jun', total: 7200 },
];

const categoryData = [
  { name: 'Living Room', value: 35 },
  { name: 'Bedroom', value: 25 },
  { name: 'Dining', value: 20 },
  { name: 'Office', value: 15 },
  { name: 'Kitchen', value: 5 },
];

const COLORS = ['#9F8E7D', '#5D4037', '#00695C', '#BF360C', '#8D6E63'];

const productPerformance = [
  { name: 'Modern Sofa', sales: 24, revenue: 12000, growth: 12 },
  { name: 'Wooden Dining Table', sales: 18, revenue: 9000, growth: -5 },
  { name: 'Office Chair', sales: 16, revenue: 4800, growth: 8 },
  { name: 'Bedside Table', sales: 14, revenue: 3500, growth: 15 },
  { name: 'Coffee Table', sales: 12, revenue: 3000, growth: 2 },
];

const DashboardCard = ({ title, value, icon, description, trend = 0 }: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <div className="flex items-center mt-1">
          <p className={`text-xs ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'} flex items-center`}>
            {trend > 0 ? <ArrowUpRight size={12} className="mr-1" /> : trend < 0 ? <ArrowDownRight size={12} className="mr-1" /> : null}
            {Math.abs(trend)}% {trend > 0 ? 'increase' : trend < 0 ? 'decrease' : ''} {description}
          </p>
        </div>
      )}
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
      maximumFractionDigits: 0
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
          trend={5}
          description="from last month"
        />
        <DashboardCard
          title="Total Orders"
          value={ordersCount}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
          trend={12}
          description="from last month"
        />
        <DashboardCard
          title="Active Users"
          value={usersCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={8}
          description="from last month"
        />
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={15}
          description="from last month"
        />
      </div>
      
      <Tabs defaultValue="sales" className="mt-8">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#9F8E7D"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard
              title="Average Order Value"
              value={formatCurrency(325)}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
              trend={3}
              description="from last month"
            />
            <DashboardCard
              title="Conversion Rate"
              value="3.2%"
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              trend={0.5}
              description="from last month"
            />
            <DashboardCard
              title="Customer Satisfaction"
              value="4.8/5"
              icon={<Star className="h-4 w-4 text-muted-foreground" />}
              trend={0.2}
              description="from last month"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={productPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#9F8E7D" name="Units Sold" />
                  <Bar dataKey="revenue" fill="#5D4037" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="font-medium text-lg mb-4">Product Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Units Sold</th>
                      <th className="pb-2 font-medium">Revenue</th>
                      <th className="pb-2 font-medium">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPerformance.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{product.name}</td>
                        <td className="py-3">{product.sales}</td>
                        <td className="py-3">{formatCurrency(product.revenue)}</td>
                        <td className="py-3">
                          <span className={`flex items-center ${product.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.growth > 0 ? 
                              <ArrowUpRight size={16} className="mr-1" /> : 
                              <ArrowDownRight size={16} className="mr-1" />
                            }
                            {Math.abs(product.growth)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New vs. Returning Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'New Customers', value: 65 },
                        { name: 'Returning Customers', value: 35 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#9F8E7D" />
                      <Cell fill="#5D4037" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={[
                      { month: 'Jan', organic: 20, paid: 15, referral: 5 },
                      { month: 'Feb', organic: 25, paid: 18, referral: 8 },
                      { month: 'Mar', organic: 22, paid: 20, referral: 12 },
                      { month: 'Apr', organic: 30, paid: 22, referral: 15 },
                      { month: 'May', organic: 28, paid: 25, referral: 18 },
                      { month: 'Jun', organic: 35, paid: 30, referral: 20 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="organic" stroke="#9F8E7D" name="Organic" />
                    <Line type="monotone" dataKey="paid" stroke="#5D4037" name="Paid" />
                    <Line type="monotone" dataKey="referral" stroke="#00695C" name="Referral" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Lifetime Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { segment: 'New', value: 120 },
                    { segment: '2-3 Purchases', value: 350 },
                    { segment: '4-6 Purchases', value: 780 },
                    { segment: '7+ Purchases', value: 1200 },
                    { segment: 'VIP', value: 2500 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" name="Average Customer Value" fill="#9F8E7D">
                    {[0, 1, 2, 3, 4].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
