import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMaterials } from '@/services/materialService';
import { Material } from '@/types/material';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from '@/context/LanguageContext';

const Materials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', image_url: '' });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: fetchMaterials,
  });

  const createMutation = useMutation({
    mutationFn: async (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('materials')
        .insert([material])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Matériau ajouté avec succès' : 'Material added successfully',
      });
      setNewMaterial({ name: '', image_url: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (material: Material) => {
      const { data, error } = await supabase
        .from('materials')
        .update({ name: material.name, image_url: material.image_url })
        .eq('id', material.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Matériau mis à jour avec succès' : 'Material updated successfully',
      });
      setEditingMaterial(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Matériau supprimé avec succès' : 'Material deleted successfully',
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `images/materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('material')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('material')
        .getPublicUrl(filePath);

      if (editingMaterial) {
        setEditingMaterial({ ...editingMaterial, image_url: publicUrl });
      } else {
        setNewMaterial({ ...newMaterial, image_url: publicUrl });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du téléchargement de l\'image' : 'Error uploading image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      updateMutation.mutate(editingMaterial);
    } else {
      createMutation.mutate(newMaterial);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'fr' ? 'Gestion des Matériaux' : 'Materials Management'}
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Ajouter un Matériau' : 'Add Material'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'fr' ? 'Ajouter un Matériau' : 'Add Material'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Nom' : 'Name'}
                </label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Image' : 'Image'}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                  {isUploading && <Upload className="animate-spin" />}
                </div>
                {newMaterial.image_url && (
                  <img
                    src={newMaterial.image_url}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded"
                  />
                )}
              </div>
              <Button type="submit" className="w-full">
                {language === 'fr' ? 'Ajouter' : 'Add'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'fr' ? 'Image' : 'Image'}</TableHead>
              <TableHead>{language === 'fr' ? 'Nom' : 'Name'}</TableHead>
              <TableHead>{language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>
                  <img
                    src={material.image_url}
                    alt={material.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{material.name}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {language === 'fr' ? 'Modifier le Matériau' : 'Edit Material'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {language === 'fr' ? 'Nom' : 'Name'}
                            </label>
                            <Input
                              value={editingMaterial?.name || ''}
                              onChange={(e) => setEditingMaterial(editingMaterial ? { ...editingMaterial, name: e.target.value } : null)}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {language === 'fr' ? 'Image' : 'Image'}
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                              />
                              {isUploading && <Upload className="animate-spin" />}
                            </div>
                            {editingMaterial?.image_url && (
                              <img
                                src={editingMaterial.image_url}
                                alt="Preview"
                                className="mt-2 w-20 h-20 object-cover rounded"
                              />
                            )}
                          </div>
                          <Button type="submit" className="w-full">
                            {language === 'fr' ? 'Mettre à jour' : 'Update'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Materials; 