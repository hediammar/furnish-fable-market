import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories } from '@/services/categoryService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Category, Subcategory } from '@/types/category';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Helmet } from 'react-helmet-async';
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CategoriesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      image: undefined,
    },
  });
  
  const subcategoryForm = useForm<{ category_id: string; name: string; description?: string }>({
    defaultValues: { category_id: '', name: '', description: '' },
  });
  
  React.useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description || '',
      });
      if (editingCategory.image) {
        setImagePreview(editingCategory.image);
      } else {
        setImagePreview(null);
      }
    } else {
      form.reset({
        name: '',
        description: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editingCategory, form]);
  
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set the image in the form values as well
      form.setValue('image', file);
    }
  };
  
  const clearImage = () => {
    console.log('Clearing image');
    setImageFile(null);
    setImagePreview(null);
    form.setValue('image', null);
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return null;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Only image files are allowed',
          variant: 'destructive',
        });
        return null;
      }
      
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;
      
      console.log('Preparing to upload file:', fileName);
      
      // Try to upload to the products bucket instead (which we know exists)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('categories')
        .upload(`${fileName}`, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful, data:', uploadData);
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('categories')
        .getPublicUrl(`${fileName}`);
      
      console.log('Public URL:', urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Image upload failed',
        description: 'There was an error uploading the image. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const addMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!values.name) {
        throw new Error('Category name is required');
      }
      
      let imageUrl = null;
      
      // Only attempt to upload if there's a file
      if (imageFile) {
        console.log('Processing image file for upload:', imageFile.name, imageFile.size, imageFile.type);
        
        // Upload the image and get the URL
        imageUrl = await uploadImage(imageFile);
        console.log('Received image URL after upload:', imageUrl);
        
        if (!imageUrl) {
          console.error('Image upload failed, URL is null');
          throw new Error('Failed to upload image');
        }
      } else {
        console.log('No image file selected for this category');
      }
      
      // Prepare the category data with the image URL
      const categoryData = {
        name: values.name,
        description: values.description || null,
        image: imageUrl
      };
      
      console.log('Inserting category with data:', JSON.stringify(categoryData));
      
      // Insert the category into the database
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select();
        
      if (error) {
        console.error('Error inserting category:', error);
        throw error;
      }
      
      console.log('Category inserted successfully:', data);
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Category added',
        description: 'The category has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to add category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      // Start with the current image URL if available
      let imageUrl = editingCategory?.image || null;
      
      // If there's a new image file, upload it
      if (imageFile) {
        console.log('Updating with new image file:', imageFile.name, imageFile.size, imageFile.type);
        
        // Upload the new image
        imageUrl = await uploadImage(imageFile);
        console.log('New image URL for update:', imageUrl);
        
        if (!imageUrl) {
          console.error('Image upload failed during update, URL is null');
          throw new Error('Failed to upload image');
        }
      } else if (imagePreview === null && editingCategory?.image) {
        // If the image preview is null but the category had an image, it means the user cleared the image
        console.log('Image was cleared, setting to null');
        imageUrl = null;
      } else {
        console.log('Keeping existing image URL:', imageUrl);
      }
      
      // Prepare the update data
      const updateData = {
        name: values.name,
        description: values.description || null,
        image: imageUrl,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating category with data:', JSON.stringify(updateData));
      
      // Update the category in the database
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }
      
      console.log('Category updated successfully:', data);
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Category updated',
        description: 'The category has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    console.log('Form submitted with values:', values);
    console.log('Current image file state:', imageFile);
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, values });
    } else {
      addMutation.mutate(values);
    }
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
    setImageFile(null);
    setImagePreview(null);
  };
  
  const handleAddSubcategory = async (values: { category_id: string; name: string; description?: string }) => {
    try {
      const { error } = await supabase.from('subcategories').insert({
        category_id: values.category_id,
        name: values.name,
        description: values.description || null,
      });
      if (error) throw error;
      toast({ title: 'Subcategory added', description: 'Subcategory created successfully.' });
      setShowSubcategoryModal(false);
      subcategoryForm.reset();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Categories Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories Management</h1>
      </div>
      
      <Button onClick={() => setShowSubcategoryModal(true)} className="mb-4" variant="outline">
        <Plus size={16} className="mr-2" /> Add Subcategory
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
          <CardDescription>
            {editingCategory ? 'Edit the details of an existing category' : 'Create a new product category'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description (optional)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Category Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('category-image')?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload size={16} />
                            {imageFile ? 'Change Image' : 'Upload Image'}
                          </Button>
                          
                          {imagePreview && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={clearImage}
                              className="flex items-center gap-2 text-destructive"
                            >
                              <X size={16} />
                              Remove Image
                            </Button>
                          )}
                          
                          <input
                            id="category-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleImageChange(e);
                              onChange(e.target.files?.[0] || null);
                            }}
                            {...rest}
                          />
                        </div>
                        
                        {imagePreview && (
                          <div className="relative w-40 h-40 rounded-md overflow-hidden border">
                            <img 
                              src={imagePreview} 
                              alt="Category preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for this category. Recommended size: 800x600px.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                {editingCategory && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isUploading || addMutation.isPending || updateMutation.isPending}
                >
                  {isUploading ? 'Uploading...' : editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : isError ? (
            <div className="text-center py-4 text-destructive">Error loading categories</div>
          ) : categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil size={16} />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No categories found. Create your first category above.
            </div>
          )}
        </CardContent>
      </Card>
      
      {showSubcategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={() => setShowSubcategoryModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Subcategory</h2>
            <Form {...subcategoryForm}>
              <form onSubmit={subcategoryForm.handleSubmit(handleAddSubcategory)} className="space-y-4">
                <FormField
                  control={subcategoryForm.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border rounded p-2">
                          <option value="">Select a category</option>
                          {categories?.map((cat: Category) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={subcategoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter subcategory name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={subcategoryForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter subcategory description (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowSubcategoryModal(false)}>Cancel</Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
