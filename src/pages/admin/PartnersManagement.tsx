import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchPartners, createPartner, updatePartner, deletePartner } from '@/services/partnerService';
import { fetchProducts } from '@/services/productService';
import { Partner, Project } from '@/types/partner';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Link, Image, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PartnersManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    logo: '',
    website: '',
    description: '',
    projects: [],
  });
  const [projectFormData, setProjectFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    images: [],
    products: [],
  });
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { t } = useTranslation();

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  // Fetch products
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const products = await fetchProducts({});
      return products;
    },
  });

  // Upload logo to Supabase Storage
  const uploadLogo = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      const fileName = `partner-logo-${Date.now()}.${file.name.split('.').pop()}`;
      
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

  // Upload project images
  const uploadProjectImages = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileName = `project-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('partnerprojects')
          .upload(`images/${fileName}`, file, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw uploadError;
        }
        
        const { data: urlData } = supabase.storage
          .from('partnerprojects')
          .getPublicUrl(`images/${fileName}`);
          
        uploadedUrls.push(urlData.publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error in project images upload process:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Mutation function called with data:', partnerData);
      let data = { ...partnerData };
      
      if (logoFile) {
        try {
          console.log('Uploading logo file...');
          const publicUrl = await uploadLogo(logoFile);
          data.logo = publicUrl;
          console.log('Logo uploaded successfully:', publicUrl);
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast({ 
            title: 'Error', 
            description: 'Failed to upload logo image', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      
      console.log('Creating partner with data:', data);
      return createPartner(data);
    },
    onSuccess: () => {
      console.log('Partner created successfully');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner has been created successfully' });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error in createPartnerMutation:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to create partner', 
        variant: 'destructive' 
      });
    }
  });

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      let updatedData = { ...data };
      
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

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: async ({ partnerId, project }: { partnerId: string; project: Omit<Project, 'id'> }) => {
      console.log('Project mutation function called');
      console.log('Partner ID:', partnerId);
      console.log('Project data:', project);
      
      let projectData = { ...project };
      
      if (projectImages.length > 0) {
        try {
          console.log('Uploading project images...');
          const imageUrls = await uploadProjectImages(projectImages);
          projectData.images = imageUrls;
          console.log('Images uploaded successfully:', imageUrls);
        } catch (error) {
          console.error('Error uploading project images:', error);
          toast({ 
            title: 'Error', 
            description: 'Failed to upload project images', 
            variant: 'destructive' 
          });
          throw error;
        }
      }

      console.log('Creating project with data:', projectData);
      // Insert the project into the projects table
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          partner_id: partnerId,
          title: projectData.title,
          description: projectData.description,
          images: projectData.images,
          products: projectData.products,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Project added successfully');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Project has been added successfully' });
      setIsProjectDialogOpen(false);
      resetProjectForm();
    },
    onError: (error) => {
      console.error('Error in addProjectMutation:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to add project', 
        variant: 'destructive' 
      });
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

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, project }: { projectId: string; project: Partial<Project> }) => {
      let projectData = { ...project };
      
      if (projectImages.length > 0) {
        try {
          const imageUrls = await uploadProjectImages(projectImages);
          projectData.images = [...(projectData.images || []), ...imageUrls];
        } catch (error) {
          toast({ 
            title: 'Error', 
            description: 'Failed to upload project images', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Project has been updated successfully' });
      setIsProjectDialogOpen(false);
      resetProjectForm();
      setSelectedProject(null);
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update project', 
        variant: 'destructive' 
      });
      console.error('Update project error:', error);
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Project has been deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete project', 
        variant: 'destructive' 
      });
      console.error('Delete project error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      website: '',
      description: '',
      projects: [],
    });
    setLogoFile(null);
    setLogoPreview(null);
    setSelectedPartnerId(null);
  };

  const resetProjectForm = () => {
    setProjectFormData({
      title: '',
      description: '',
      images: [],
      products: [],
    });
    setProjectImages([]);
    setSelectedPartnerId(null);
  };

  const handleAddPartner = () => {
    console.log('handleAddPartner called');
    console.log('Form data:', formData);
    console.log('Logo file:', logoFile);
    
    if (!formData.name) {
      console.log('Name is required');
      toast({
        title: 'Error',
        description: 'Partner name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!logoFile && !formData.logo) {
      console.log('Logo is required');
      toast({
        title: 'Error',
        description: 'Partner logo is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Starting partner creation...');
      createPartnerMutation.mutate(formData);
    } catch (error) {
      console.error('Error in handleAddPartner:', error);
      toast({
        title: 'Error',
        description: 'Failed to create partner',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePartner = () => {
    if (selectedPartnerId) {
      updatePartnerMutation.mutate({
        id: selectedPartnerId,
        data: formData
      });
    }
  };

  const handleAddProjectClick = (partnerId: string) => {
    console.log('Setting selected partner ID:', partnerId);
    setSelectedPartnerId(partnerId);
    setProjectFormData({
      title: '',
      description: '',
      images: [],
      products: [],
    });
    setProjectImages([]);
    setIsProjectDialogOpen(true);
  };

  const handleAddProject = () => {
    console.log('handleAddProject called');
    console.log('Project form data:', projectFormData);
    console.log('Selected partner ID:', selectedPartnerId);
    console.log('Project images:', projectImages);

    if (!selectedPartnerId) {
      console.log('No partner selected');
      toast({
        title: 'Error',
        description: 'No partner selected',
        variant: 'destructive'
      });
      return;
    }

    if (!projectFormData.title || !projectFormData.description) {
      console.log('Title and description are required');
      toast({
        title: 'Error',
        description: 'Project title and description are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Starting project creation...');
      addProjectMutation.mutate({
        partnerId: selectedPartnerId,
        project: projectFormData
      });
    } catch (error) {
      console.error('Error in handleAddProject:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive'
      });
    }
  };

  const handleEditClick = (partner: Partner) => {
    setFormData({
      name: partner.name,
      logo: partner.logo,
      website: partner.website || '',
      description: partner.description || '',
      projects: partner.projects || [],
    });
    setLogoPreview(partner.logo);
    setSelectedPartnerId(partner.id);
    setIsEditDialogOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProjectImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProjectImages(Array.from(e.target.files));
    }
  };

  const handleEditProjectClick = (project: Project) => {
    setSelectedProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description,
      images: project.images,
      products: project.products,
    });
    setProjectImages([]);
    setIsProjectDialogOpen(true);
  };

  const handleUpdateProject = () => {
    if (!selectedProject) return;

    if (!projectFormData.title || !projectFormData.description) {
      toast({
        title: 'Error',
        description: 'Project title and description are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      updateProjectMutation.mutate({
        projectId: selectedProject.id,
        project: projectFormData
      });
    } catch (error) {
      console.error('Error in handleUpdateProject:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
    }
  };

  return (
    <div>
      <Helmet>
        <title>{t('partners.title')} | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-medium">{t('partners.title')}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" /> {t('partners.addPartner')}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('partners.partnersList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-muted-foreground">{t('partners.loading')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('partners.logo')}</TableHead>
                    <TableHead>{t('partners.name')}</TableHead>
                    <TableHead>{t('partners.website')}</TableHead>
                    <TableHead>{t('partners.description')}</TableHead>
                    <TableHead>{t('partners.projects')}</TableHead>
                    <TableHead className="text-right">{t('partners.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {t('partners.noPartners')}
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
                              {t('partners.website')}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">{t('partners.noWebsite')}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {partner.description ? (
                            <div className="max-w-xs truncate">{partner.description}</div>
                          ) : (
                            <span className="text-muted-foreground">{t('partners.noDescription')}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{partner.projects?.length || 0}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddProjectClick(partner.id);
                              }}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                          {partner.projects && partner.projects.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {partner.projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-1 bg-gray-50 rounded text-sm">
                                  <span className="truncate">{project.title}</span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditProjectClick(project);
                                      }}
                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Edit size={14} />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>{t('partners.deleteConfirm')}</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {t('partners.deleteProjectWarning', { title: project.title })}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>{t('partners.cancel')}</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-500 hover:bg-red-600"
                                            onClick={() => deleteProjectMutation.mutate(project.id)}
                                          >
                                            {t('partners.delete')}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              ))}
                            </div>
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
                                  <AlertDialogTitle>{t('partners.deleteConfirm')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('partners.deleteWarning', { name: partner.name })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('partners.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deletePartnerMutation.mutate(partner.id)}
                                  >
                                    {t('partners.delete')}
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
            <DialogTitle>{t('partners.addPartner')}</DialogTitle>
            <DialogDescription>
              {t('partners.addPartnerDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddPartner();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('partners.name')}
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
                  {t('partners.logo')}
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
                  {t('partners.website')}
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
                  {t('partners.description')}
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
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
              >
                {t('partners.cancel')}
              </Button>
              <Button 
                type="submit"
                disabled={!formData.name || (!logoFile && !formData.logo) || isUploading}
              >
                {isUploading ? t('partners.uploading') : (
                  <>
                    <Save size={16} className="mr-2" /> {t('partners.save')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Project Dialog */}
      <Dialog 
        open={isProjectDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPartnerId(null);
            setSelectedProject(null);
            resetProjectForm();
          }
          setIsProjectDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProject 
                ? `${t('partners.editProject')} - ${selectedProject.title}`
                : `${t('partners.addProject')} - ${partners.find(p => p.id === selectedPartnerId)?.name}`
              }
            </DialogTitle>
            <DialogDescription>
              {selectedProject 
                ? t('partners.editProjectDescription')
                : t('partners.addProjectDescription')
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            selectedProject ? handleUpdateProject() : handleAddProject();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-title" className="text-right">
                  {t('partners.projectTitle')}
                </Label>
                <Input
                  id="project-title"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-description" className="text-right">
                  {t('partners.projectDescription')}
                </Label>
                <Textarea
                  id="project-description"
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-images" className="text-right">
                  {t('partners.projectImages')}
                </Label>
                <div className="col-span-3 space-y-4">
                  <Input
                    id="project-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProjectImagesChange}
                    className="col-span-3"
                  />
                  {/* Show existing images when editing */}
                  {selectedProject?.images && selectedProject.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProject.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Project image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProjectFormData({
                                ...projectFormData,
                                images: projectFormData.images.filter((_, i) => i !== index)
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Show new images being uploaded */}
                  {projectImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {projectImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProjectImages(projectImages.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-products" className="text-right">
                  {t('partners.projectProducts')}
                </Label>
                <div className="col-span-3">
                  <Select
                    value={projectFormData.products?.[0] || ''}
                    onValueChange={(value: string) => {
                      if (!projectFormData.products?.includes(value)) {
                        setProjectFormData({
                          ...projectFormData,
                          products: [...(projectFormData.products || []), value]
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select products used in this project" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {projectFormData.products && projectFormData.products.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {projectFormData.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-sm"
                        >
                          {product}
                          <button
                            type="button"
                            onClick={() => {
                              setProjectFormData({
                                ...projectFormData,
                                products: projectFormData.products.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  resetProjectForm();
                  setSelectedProject(null);
                  setIsProjectDialogOpen(false);
                }}
              >
                {t('partners.cancel')}
              </Button>
              <Button 
                type="submit"
                disabled={!projectFormData.title || !projectFormData.description || isUploading}
              >
                {isUploading ? t('partners.uploading') : (
                  <>
                    <Save size={16} className="mr-2" /> {t('partners.save')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManagement;
