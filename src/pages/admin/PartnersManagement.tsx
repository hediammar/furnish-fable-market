import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchPartners, createPartner, updatePartner, deletePartner } from '@/services/partnerService';
import { Partner } from '@/types/partner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Link, Image, Save, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const PartnersManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    logo: '',
    website: '',
    description: '',
  });
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  // Upload logo to Supabase Storage
  const uploadLogo = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      // Create a unique file name to avoid collisions
      const fileName = `partner-logo-${Date.now()}.${file.name.split('.').pop()}`;
      
      // Upload directly to the existing partners bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('partners')
        .upload(`logos/${fileName}`, file, {
          upsert: true,
          cacheControl: '3600'
        });
        
      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('partners')
        .getPublicUrl(`logos/${fileName}`);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in logo upload process:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
      let data = { ...partnerData };
      
      // If there's a logo file, upload it first
      if (logoFile) {
        try {
          const publicUrl = await uploadLogo(logoFile);
          data.logo = publicUrl;
        } catch (error) {
          toast({ 
            title: 'Error', 
            description: 'Failed to upload logo image', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      
      return createPartner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner has been created successfully' });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to create partner', 
        variant: 'destructive' 
      });
      console.error('Create partner error:', error);
    }
  });

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      let updatedData = { ...data };
      
      // If there's a logo file, upload it first
      if (logoFile) {
        try {
          const publicUrl = await uploadLogo(logoFile);
          updatedData.logo = publicUrl;
        } catch (error) {
          toast({ 
            title: 'Error', 
            description: 'Failed to upload logo image', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      
      return updatePartner(id, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner has been updated successfully' });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update partner', 
        variant: 'destructive' 
      });
      console.error('Update partner error:', error);
    }
  });

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner has been deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete partner', 
        variant: 'destructive' 
      });
      console.error('Delete partner error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      website: '',
      description: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
    setSelectedPartnerId(null);
  };

  const handleAddPartner = () => {
    createPartnerMutation.mutate(formData);
  };

  const handleUpdatePartner = () => {
    if (selectedPartnerId) {
      updatePartnerMutation.mutate({
        id: selectedPartnerId,
        data: formData
      });
    }
  };

  const handleEditClick = (partner: Partner) => {
    setFormData({
      name: partner.name,
      logo: partner.logo,
      website: partner.website || '',
      description: partner.description || '',
    });
    setLogoPreview(partner.logo);
    setSelectedPartnerId(partner.id);
    setIsEditDialogOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Partners Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-medium">Partners Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" /> Add Partner
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-muted-foreground">Loading partners...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No partners found. Add your first partner to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain p-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{partner.name}</div>
                        </TableCell>
                        <TableCell>
                          {partner.website ? (
                            <a 
                              href={partner.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <Link size={14} className="mr-1" />
                              Website
                            </a>
                          ) : (
                            <span className="text-muted-foreground">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {partner.description ? (
                            <div className="max-w-xs truncate">{partner.description}</div>
                          ) : (
                            <span className="text-muted-foreground">No description</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(partner)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Button>
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
                                    This will permanently delete the partner "{partner.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deletePartnerMutation.mutate(partner.id)}
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
          )}
        </CardContent>
      </Card>
      
      {/* Add Partner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>
              Add a new partner to showcase on your website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo" className="text-right">
                Logo
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="col-span-3"
                  required
                />
                {logoPreview && (
                  <div className="w-24 h-24 rounded-md bg-gray-50 p-2 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsAddDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleAddPartner} 
              disabled={!formData.name || (!logoFile && !formData.logo) || isUploading}
            >
              {isUploading ? 'Uploading...' : (
                <>
                  <Save size={16} className="mr-2" /> Save Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Partner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-logo" className="text-right">
                Logo
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="edit-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="col-span-3"
                />
                {logoPreview && (
                  <div className="w-24 h-24 rounded-md bg-gray-50 p-2 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-website" className="text-right">
                Website
              </Label>
              <Input
                id="edit-website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleUpdatePartner} 
              disabled={!formData.name || isUploading}
            >
              {isUploading ? 'Uploading...' : (
                <>
                  <Save size={16} className="mr-2" /> Update Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManagement;
