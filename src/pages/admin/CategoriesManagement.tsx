
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Helmet } from 'react-helmet-async';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CategoriesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  // Reset form when editing category changes
  React.useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [editingCategory, form]);
  
  // Query to fetch categories
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Category[];
    },
  });
  
  // Mutation to add a new category
  const addMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Make sure name is required in the values
      if (!values.name) {
        throw new Error('Category name is required');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: values.name,
          description: values.description
        })
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Category added',
        description: 'The category has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to add category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to update a category
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(values)
        .eq('id', id)
        .select();
        
      if (error) throw error;
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
    },
    onError: (error) => {
      toast({
        title: 'Failed to update category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to delete a category
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
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, values });
    } else {
      addMutation.mutate(values);
    }
  };
  
  // Handle edit button click
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };
  
  // Handle delete button click
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };
  
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Categories Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories Management</h1>
      </div>
      
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
                    <FormDescription>
                      The name of the product category.
                    </FormDescription>
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
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
                
                {editingCategory && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            Manage your product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : isError ? (
            <div className="text-center py-4 text-red-500">Error loading categories</div>
          ) : categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(category.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No categories found. Add your first category above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesManagement;
