
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { fetchCategories } from '@/services/categoryService';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, X, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { mapDatabaseProductToAppProduct } from '@/services/productMappers';

// Define DB product type to handle the direct data from database
interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[] | null;
  category: string | null;
  material: string | null;
  dimensions: string | null;
  stock: number | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  discount: number | null;
  image: string | null;
  colors: string[] | null;
  created_at: string;
  updated_at: string;
  weight: string | null;
  warranty: string | null;
  assembly: string | null;
  rating: number | null;
  review_count: number | null;
  full_description: string | null;
  sizes: string[] | null;
}

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer').optional(),
  inStock: z.boolean().default(true),
  category: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  featured: z.boolean().default(false),
  new: z.boolean().default(false),
  color: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const EditProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [dbProduct, setDbProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      inStock: true,
      category: '',
      material: '',
      dimensions: '',
      featured: false,
      new: false,
      color: '#000000',
    },
  });
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Save the raw DB data
          setDbProduct(data as DBProduct);
          
          // Convert to app product format
          const appProduct = mapDatabaseProductToAppProduct(data);
          setProduct(appProduct);
          setImages(appProduct.images || []);
          
          form.reset({
            name: appProduct.name,
            description: appProduct.description || '',
            price: appProduct.price,
            stock: appProduct.stock || 0,
            inStock: appProduct.inStock,
            category: appProduct.category || '',
            material: appProduct.material || '',
            dimensions: appProduct.dimensions || '',
            featured: appProduct.featured || false,
            new: appProduct.new || false,
            color: data.colors && data.colors[0] ? data.colors[0] : '#000000',
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch product details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast, form]);
  
  const onSubmit = async (values: ProductFormValues) => {
    if (!id) return;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: values.name,
          description: values.description,
          price: values.price,
          stock: values.stock,
          category: values.category,
          material: values.material,
          dimensions: values.dimensions,
          is_featured: values.featured,
          is_new: values.new,
          images: images,
          colors: values.color ? [values.color] : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    
    setImages(prev => [...prev, newImageUrl]);
    setNewImageUrl('');
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <Helmet>
        <title>Edit Product | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')}>
            <ArrowLeft size={16} className="mr-1" /> Back to Products
          </Button>
          <h1 className="text-2xl font-serif font-medium">Edit Product</h1>
        </div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    className="mt-1"
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      {...form.register('price')}
                      className="mt-1"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...form.register('stock')}
                      className="mt-1"
                    />
                    {form.formState.errors.stock && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.stock.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={form.watch('inStock')}
                      onCheckedChange={(checked) => form.setValue('inStock', checked as boolean)}
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={form.watch('featured')}
                      onCheckedChange={(checked) => form.setValue('featured', checked as boolean)}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new"
                      checked={form.watch('new')}
                      onCheckedChange={(checked) => form.setValue('new', checked as boolean)}
                    />
                    <Label htmlFor="new">Mark as New</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Details & Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.watch('category')}
                    onValueChange={(value) => form.setValue('category', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    {...form.register('material')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    {...form.register('dimensions')}
                    className="mt-1"
                    placeholder="e.g., 120cm x 80cm x 75cm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center space-x-3 mt-1">
                    <input
                      type="color"
                      id="color"
                      {...form.register('color')}
                      className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={form.watch('color')}
                      onChange={(e) => form.setValue('color', e.target.value)}
                      className="w-28"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Add New Image</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImage}
                      disabled={!newImageUrl.trim()}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                {images.length === 0 && (
                  <div className="text-center py-8 border border-dashed rounded-md border-gray-300">
                    <Trash2 className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No images added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
