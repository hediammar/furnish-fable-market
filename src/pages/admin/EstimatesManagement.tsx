import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchEstimates, updateEstimateStatus, deleteEstimate, Estimate } from '@/services/estimateService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, AlertCircle, Clock, Trash2, Eye, CheckCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

const EstimatesManagement: React.FC = () => {
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Fetch estimates
  const { data: estimates = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'estimates'],
    queryFn: fetchEstimates,
  });

  // Log any errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Error fetching estimates:', error);
    }
  }, [error]);

  // Update estimate status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Estimate['status'] }) => {
      // First update the status in the database
      await updateEstimateStatus(id, status);
      
      // Then notify the customer via email
      try {
        const { error } = await supabase.functions.invoke('notify-estimate-status', {
          body: { id, status },
        });
        
        if (error) {
          console.error('Error sending notification:', error);
          throw error;
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
        // We don't throw the error here to avoid preventing the status update
        // but we do log it and show a toast
        toast({
          title: 'Warning',
          description: 'Status updated but notification email could not be sent.',
          variant: 'destructive',
        });
      }
      
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'estimates'] });
      toast({
        title: 'Status updated',
        description: 'The estimate status has been successfully updated and customer notified.',
      });
    },
    onError: (error) => {
      console.error('Error updating estimate status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the estimate status.',
        variant: 'destructive',
      });
    },
  });

  // Delete estimate mutation
  const deleteEstimateMutation = useMutation({
    mutationFn: deleteEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'estimates'] });
      toast({
        title: 'Estimate deleted',
        description: 'The estimate has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting estimate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the estimate.',
        variant: 'destructive',
      });
    },
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

  const handleUpdateStatus = (id: string, status: Estimate['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteEstimate = (id: string) => {
    deleteEstimateMutation.mutate(id);
  };

  // We need to ensure estimates is an array
  const estimatesArray = Array.isArray(estimates) ? estimates : [];
  
  // Filter estimates by status
  const pendingEstimates = estimatesArray.filter(e => e.status === 'pending');
  const approvedEstimates = estimatesArray.filter(e => e.status === 'approved');
  const rejectedEstimates = estimatesArray.filter(e => e.status === 'rejected');
  const completedEstimates = estimatesArray.filter(e => e.status === 'completed');

  const renderEstimateTable = (filteredEstimates: Estimate[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEstimates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No estimates found
              </TableCell>
            </TableRow>
          ) : (
            filteredEstimates.map((estimate) => (
              <TableRow key={estimate.id}>
                <TableCell className="font-mono text-xs">{estimate.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{estimate.contact_email}</div>
                    <div className="text-sm text-muted-foreground">{estimate.contact_phone}</div>
                  </div>
                </TableCell>
                <TableCell>{estimate.items?.length || 0} items</TableCell>
                <TableCell className="text-sm">{formatDate(estimate.created_at)}</TableCell>
                <TableCell>{getStatusBadge(estimate.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewEstimate(estimate)}>
                      <Eye size={16} />
                    </Button>
                    {estimate.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(estimate.id, 'approved')}
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(estimate.id, 'rejected')}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                    {estimate.status === 'approved' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleUpdateStatus(estimate.id, 'completed')}
                      >
                        <CheckCircle size={16} />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this estimate request. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteEstimate(estimate.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <Helmet>
        <title>Estimates Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-medium">Estimates Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="relative">
            Pending
            {pendingEstimates.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {pendingEstimates.length}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Estimate Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-muted-foreground">Loading estimates...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="mx-auto h-8 w-8" />
              <p className="mt-4">Error loading estimates. Please try again.</p>
            </div>
          ) : estimatesArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No estimates found. Waiting for customers to submit requests.</p>
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingEstimates.length > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {pendingEstimates.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-0">
                {renderEstimateTable(pendingEstimates)}
              </TabsContent>
              
              <TabsContent value="approved" className="mt-0">
                {renderEstimateTable(approvedEstimates)}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                {renderEstimateTable(completedEstimates)}
              </TabsContent>
              
              <TabsContent value="rejected" className="mt-0">
                {renderEstimateTable(rejectedEstimates)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Estimate details dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Estimate Details</DialogTitle>
            <DialogDescription>
              Review the estimate request details.
            </DialogDescription>
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Email</h3>
                    <p>{viewingEstimate.contact_email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Phone</h3>
                    <p>{viewingEstimate.contact_phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</h3>
                    <p className="whitespace-pre-line">{viewingEstimate.shipping_address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Requested Items</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingEstimate.items && viewingEstimate.items.length > 0 ? (
                        viewingEstimate.items.map((item, index) => (
                          <TableRow key={`${item.product_id}-${index}`}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                            No items in this estimate
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <div className="space-x-2">
                  {viewingEstimate.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() => {
                          handleUpdateStatus(viewingEstimate.id, 'rejected');
                          setIsViewDialogOpen(false);
                        }}
                      >
                        <X size={16} className="mr-1" /> Reject
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          handleUpdateStatus(viewingEstimate.id, 'approved');
                          setIsViewDialogOpen(false);
                        }}
                      >
                        <Check size={16} className="mr-1" /> Approve
                      </Button>
                    </>
                  )}
                  {viewingEstimate.status === 'approved' && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        handleUpdateStatus(viewingEstimate.id, 'completed');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle size={16} className="mr-1" /> Mark as Completed
                    </Button>
                  )}
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimatesManagement;
