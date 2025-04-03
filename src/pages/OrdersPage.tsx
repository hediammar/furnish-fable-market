
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchOrdersByUserId } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['userOrders', user?.id],
    queryFn: () => fetchOrdersByUserId(user!.id),
    enabled: !!user?.id,
  });
  
  // Filter orders based on selected tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });
  
  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>My Orders | Meubles Karim</title>
        <meta name="description" content="View and manage your orders at Meubles Karim" />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8">My Orders</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No orders found</h2>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `You don't have any ${activeTab} orders.`}
              </p>
              {activeTab !== 'all' ? (
                <Button variant="outline" onClick={() => setActiveTab('all')}>
                  View all orders
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{formatPrice(order.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <Button variant="outline" asChild size="sm" className="gap-1">
                    <Link to={`/order/${order.id}`}>
                      View Details <ChevronRight size={16} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
