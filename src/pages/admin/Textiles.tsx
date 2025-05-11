import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTextiles } from '@/services/materialService';
import { Textile } from '@/types/textile';
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

const Textiles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [editingTextile, setEditingTextile] = useState<Textile | null>(null);
  const [newTextile, setNewTextile] = useState({ name: '', image_url: '' });

  const { data: textiles = [], isLoading } = useQuery({
    queryKey: ['textiles'],
    queryFn: fetchTextiles,
  });

  const createMutation = useMutation({
    mutationFn: async (textile: Omit<Textile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('textiles')
        .insert([textile])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textiles'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Textile ajouté avec succès' : 'Textile added successfully',
      });
      setNewTextile({ name: '', image_url: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (textile: Textile) => {
      const { data, error } = await supabase
        .from('textiles')
        .update({ name: textile.name, image_url: textile.image_url })
        .eq('id', textile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textiles'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Textile mis à jour avec succès' : 'Textile updated successfully',
      });
      setEditingTextile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('textiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textiles'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Textile supprimé avec succès' : 'Textile deleted successfully',
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `images/textiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('textile')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('textile')
        .getPublicUrl(filePath);

      if (editingTextile) {
        setEditingTextile({ ...editingTextile, image_url: publicUrl });
      } else {
        setNewTextile({ ...newTextile, image_url: publicUrl });
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
    if (editingTextile) {
      updateMutation.mutate(editingTextile);
    } else {
      createMutation.mutate(newTextile);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'fr' ? 'Gestion des Textiles' : 'Textiles Management'}
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Ajouter un Textile' : 'Add Textile'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'fr' ? 'Ajouter un Textile' : 'Add Textile'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Nom' : 'Name'}
                </label>
                <Input
                  value={newTextile.name}
                  onChange={(e) => setNewTextile({ ...newTextile, name: e.target.value })}
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
                {newTextile.image_url && (
                  <img
                    src={newTextile.image_url}
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
            {textiles.map((textile) => (
              <TableRow key={textile.id}>
                <TableCell>
                  <img
                    src={textile.image_url}
                    alt={textile.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{textile.name}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingTextile(textile)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {language === 'fr' ? 'Modifier le Textile' : 'Edit Textile'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {language === 'fr' ? 'Nom' : 'Name'}
                            </label>
                            <Input
                              value={editingTextile?.name || ''}
                              onChange={(e) => setEditingTextile(editingTextile ? { ...editingTextile, name: e.target.value } : null)}
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
                            {editingTextile?.image_url && (
                              <img
                                src={editingTextile.image_url}
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
                      onClick={() => deleteMutation.mutate(textile.id)}
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

export default Textiles; 