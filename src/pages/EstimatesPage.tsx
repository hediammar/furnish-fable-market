import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchUserEstimates, Estimate } from '@/services/estimateService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const EstimatesPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch user's estimates
  const { data: estimates = [], isLoading, error } = useQuery({
    queryKey: ['user', 'estimates', user?.id],
    queryFn: () => user?.id ? fetchUserEstimates(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: Estimate['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: language === 'fr' ? fr : enUS
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setViewingEstimate(estimate);
    setIsViewDialogOpen(true);
  };

  const formatShippingAddress = (address: string | { street: string; city: string; state: string; zip: string; country: string; }): string => {
    if (typeof address === 'string') {
      return address;
    } else {
      return `${address.street || ''}\n${address.city || ''}, ${address.state || ''} ${address.zip || ''}\n${address.country || ''}`.trim();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your estimates.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>My Estimates | Meubles Karim</title>
        <meta name="description" content="View and track your furniture estimates" />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8 text-center">My Estimates</h1>
      
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Estimate Requests</CardTitle>
            <CardDescription>
              {language === 'fr' 
                ? 'Suivez le statut de vos demandes de devis mobilier'
                : 'Track the status of your furniture estimate requests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading your estimates...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading your estimates. Please try again.</p>
              </div>
            ) : estimates.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No estimates yet</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'fr'
                    ? "Vous n'avez pas encore demandé de devis pour des meubles."
                    : "You haven't requested any furniture estimates yet."}
                </p>
                <Button onClick={() => navigate('/contact')}>
                  {language === 'fr' ? 'Demander un devis' : 'Request an Estimate'}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimates.map((estimate) => (
                      <TableRow key={estimate.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(estimate.created_at)}</TableCell>
                        <TableCell>{estimate.items?.length || 0} items</TableCell>
                        <TableCell>{getStatusBadge(estimate.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewEstimate(estimate)}
                          >
                            <Eye size={16} className="mr-2" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Estimate Details</DialogTitle>
          </DialogHeader>
          
          {viewingEstimate && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimate ID</h3>
                    <p className="font-mono">{viewingEstimate.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <div>{getStatusBadge(viewingEstimate.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                    <p>{formatDate(viewingEstimate.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Email</h3>
                    <p>{viewingEstimate.contact_email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Phone</h3>
                    <p>{viewingEstimate.contact_phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h3>
                    <p className="whitespace-pre-line">
                      {formatShippingAddress(viewingEstimate.shipping_address)}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Requested Items</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        {viewingEstimate.status === 'approved' && (
                          <TableHead className="text-right">Price</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingEstimate.items && viewingEstimate.items.length > 0 ? (
                        viewingEstimate.items.map((item, index) => (
                          <TableRow key={`${item.product_id}-${index}`}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            {viewingEstimate.status === 'approved' && (
                              <TableCell className="text-right">
                                {language === 'fr' 
                                  ? `${(item.price || 0).toLocaleString('fr-FR')} DT`
                                  : `${(item.price || 0).toLocaleString('en-US')} TND`
                                }
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={viewingEstimate.status === 'approved' ? 3 : 2} className="text-center py-4 text-muted-foreground">
                            No items in this estimate
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {viewingEstimate.status === 'approved' && (
                  <div className="mt-4 flex justify-end">
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center font-medium">
                        <span className="mr-8">Total Amount:</span>
                        <span className="text-lg">
                          {language === 'fr' 
                            ? `${(viewingEstimate.total_amount || 0).toLocaleString('fr-FR')} DT`
                            : `${(viewingEstimate.total_amount || 0).toLocaleString('en-US')} TND`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimatesPage;
