import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '@/services/productService';
import { fetchCategories, fetchSubcategories } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, ArrowLeft, Loader2, Save, Upload, X, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Subcategory } from '@/types/category';

const AVAILABLE_MATERIALS = [
  'Wood',
  'Metal',
  'Leather',
  'Fabric',
  'Glass',
  'Plastic',
  'Stone',
  'Ceramic',
  'Bamboo',
  'Rattan'
];

const productSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  discount: z.coerce.number().min(0).max(100).optional(),
  category: z.string().min(1, { message: 'Please select a category' }),
  subcategory: z.string().min(1, { message: 'Please select a subcategory' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock must be a non-negative integer' }),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  image_nobg: z.string().optional(),
  images: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  new: z.boolean().default(false),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  weight: z.string().optional(),
  assembly: z.string().optional(),
  warranty: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const AddProductForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingNoBg, setIsUploadingNoBg] = useState(false);
  const [uploadProgressNoBg, setUploadProgressNoBg] = useState(0);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discount: 0,
      category: '',
      subcategory: '',
      stock: 0,
      material: '',
      dimensions: '',
      image_nobg: '',
      images: [],
      inStock: true,
      featured: false,
      new: true,
      colors: [],
      sizes: [],
      weight: '',
      assembly: '',
      warranty: '',
    },
  });
  
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });
  
  const selectedCategory = form.watch('category');
  const selectedCategoryId = categories.find(cat => cat.name === selectedCategory)?.id || '';
  const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ['subcategories', selectedCategoryId],
    queryFn: () => selectedCategoryId ? fetchSubcategories(selectedCategoryId) : Promise.resolve([]),
    enabled: !!selectedCategoryId,
  });
  
  const productMutation = useMutation({
    mutationFn: (data: ProductFormValues) => {
      const productData: Omit<Product, 'id'> = {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount,
        category: data.category,
        subcategory: data.subcategory,
        image_nobg: data.image_nobg,
        images: data.images || [],
        inStock: data.inStock ?? true,
        stock: data.stock,
        material: data.material,
        dimensions: data.dimensions,
        featured: data.featured,
        new: data.new,
        colors: data.colors || [],
        sizes: data.sizes || [],
        weight: data.weight,
        assembly: data.assembly,
        warranty: data.warranty,
      };
      return createProduct(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({
        title: 'Product created',
        description: 'The product has been successfully added.',
      });
      navigate('/admin/products');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create the product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: ProductFormValues) => {
    if (!values.images || !Array.isArray(values.images)) {
      values.images = [];
    }
    
    if (values.images.length === 0) {
      values.images = ['/placeholder.svg'];
    }
    
    productMutation.mutate(values);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const uploadedUrls: string[] = [];
    let completedUploads = 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Error uploading file:', error);
          throw new Error(`Error uploading file: ${error.message}`);
        }
        
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        if (urlData) {
          uploadedUrls.push(urlData.publicUrl);
        }
        
        completedUploads++;
        setUploadProgress(Math.round((completedUploads / files.length) * 100));
      }
      
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, ...uploadedUrls]);
      
      toast({
        title: 'Images uploaded',
        description: `Successfully uploaded ${uploadedUrls.length} images.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload error',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleNoBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingNoBg(true);
    setUploadProgressNoBg(0);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `nobg-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Error uploading file: ${error.message}`);
      }
      
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
      
      if (urlData) {
        form.setValue('image_nobg', urlData.publicUrl);
        toast({
          title: 'Image uploaded',
          description: 'Successfully uploaded the no background image.',
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingNoBg(false);
    }
  };
  
  return (
    <div>
      <Helmet>
        <title>Add New Product | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-serif font-medium">Add New Product</h1>
      </div>
      
      <div className="bg-white rounded-md shadow-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description" 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="0.00" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          min="0"
                          max="100"
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={isCategoriesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory*</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedCategory || isSubcategoriesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.map((subcategory: Subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="1"
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_MATERIALS.map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 120x80x75 cm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value.map((color, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => {
                                  const newColors = [...field.value];
                                  newColors[index] = e.target.value;
                                  field.onChange(newColors);
                                }}
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                              <Input
                                value={color}
                                onChange={(e) => {
                                  const newColors = [...field.value];
                                  newColors[index] = e.target.value;
                                  field.onChange(newColors);
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newColors = field.value.filter((_, i) => i !== index);
                                  field.onChange(newColors);
                                }}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange([...field.value, '#000000'])}
                          >
                            <Plus size={16} className="mr-2" />
                            Add Color
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value.map((size, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={size}
                                onChange={(e) => {
                                  const newSizes = [...field.value];
                                  newSizes[index] = e.target.value;
                                  field.onChange(newSizes);
                                }}
                                className="flex-1"
                                placeholder="e.g., Small, Medium, Large"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newSizes = field.value.filter((_, i) => i !== index);
                                  field.onChange(newSizes);
                                }}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange([...field.value, ''])}
                          >
                            <Plus size={16} className="mr-2" />
                            Add Size
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assembly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assembly</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Required, Not Required" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1 Year Warranty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="image_nobg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image (No Background)</FormLabel>
                      <FormControl>
                        <div className="border border-input rounded-md p-4 space-y-4">
                          <div>
                            <label 
                              htmlFor="nobg-file-upload" 
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:bg-muted/50"
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <Upload size={24} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Drag & drop or click to upload
                                </span>
                              </div>
                              <input
                                id="nobg-file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleNoBgFileUpload}
                                disabled={isUploadingNoBg}
                              />
                            </label>
                            
                            {isUploadingNoBg && (
                              <div className="mt-2">
                                <div className="w-full bg-muted h-2 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className="bg-furniture-teal h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgressNoBg}%` }}
                                  />
                                </div>
                                <p className="text-xs text-center text-muted-foreground mt-1">
                                  Uploading... {uploadProgressNoBg}%
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {field.value && (
                            <div className="relative group">
                              <img 
                                src={field.value} 
                                alt="No background preview" 
                                className="h-20 w-20 object-cover rounded-md"
                                onError={(e) => {
                                  console.log('Image failed to load:', field.value);
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  form.setValue('image_nobg', '');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <FormLabel>Product Images</FormLabel>
                  <div className="border border-input rounded-md p-4 space-y-4">
                    <div>
                      <label 
                        htmlFor="file-upload" 
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:bg-muted/50"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Upload size={24} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Drag & drop or click to upload
                          </span>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                      
                      {isUploading && (
                        <div className="mt-2">
                          <div className="w-full bg-muted h-2 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="bg-furniture-teal h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-1">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {form.getValues('images')?.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Product preview ${index + 1}`} 
                            className="h-20 w-20 object-cover rounded-md"
                            onError={(e) => {
                              console.log('Image failed to load:', url);
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const images = [...form.getValues('images')];
                              images.splice(index, 1);
                              form.setValue('images', images);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>In Stock</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Trending Product</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="new"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>New Arrival</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={productMutation.isPending || isUploading}
              >
                {productMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
            
            {productMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {productMutation.error.message || 'An error occurred while creating the product.'}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddProductForm;
