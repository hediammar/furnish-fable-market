
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, deleteProduct } from '@/services/productService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Helmet } from 'react-helmet-async';

const ProductsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchProducts(),
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete the product.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle product deletion
  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };
  
  // Filter products based on search query
  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <div>
      <Helmet>
        <title>Products Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-medium">Products Management</h1>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus size={16} className="mr-1" /> Add Product
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search products..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No products found.</p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded mr-3 flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                        <span className="line-clamp-1">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category || 'Uncategorized'}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.stock ?? 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={product.stock > 0} disabled />
                        <span>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/products/edit/${product.id}`}>
                            <Edit size={16} />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the product "{product.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
