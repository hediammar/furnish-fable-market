
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, Eye } from 'lucide-react';
import { HeroContent } from '@/types/hero';
import { getAllHeroContent, saveHeroContent, uploadHeroImage } from '@/services/heroService';

const HeroManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  
  const [homeHero, setHomeHero] = useState<HeroContent>({
    id: 'home',
    title: 'Elegant Furniture for Modern Living',
    subtitle: 'Discover our curated collection of high-quality furniture that combines style, comfort, and craftsmanship.',
    primary_button_text: 'Shop Now',
    primary_button_link: '/products',
    secondary_button_text: 'Our Story',
    secondary_button_link: '/about',
    background_image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    page: 'home',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  const [aboutHero, setAboutHero] = useState<HeroContent>({
    id: 'about',
    title: 'Our Story',
    subtitle: 'Discover the passion and craftsmanship behind every piece of furniture we create.',
    primary_button_text: '',
    primary_button_link: '',
    secondary_button_text: '',
    secondary_button_link: '',
    background_image: '',
    page: 'about',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  const [contactHero, setContactHero] = useState<HeroContent>({
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'Have questions or need assistance? We\'re here to help.',
    primary_button_text: '',
    primary_button_link: '',
    secondary_button_text: '',
    secondary_button_link: '',
    background_image: '',
    page: 'contact',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  useEffect(() => {
    const fetchHeroContent = async () => {
      setIsLoading(true);
      
      try {
        // Fetch hero content from the database
        const data = await getAllHeroContent();
        
        if (data && data.length > 0) {
          data.forEach((item: HeroContent) => {
            if (item.page === 'home') {
              setHomeHero(item);
            } else if (item.page === 'about') {
              setAboutHero(item);
            } else if (item.page === 'contact') {
              setContactHero(item);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load hero content. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHeroContent();
  }, [toast]);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const activeContent = 
        activeTab === 'home' ? homeHero : 
        activeTab === 'about' ? aboutHero : contactHero;
      
      // Save the content
      const savedContent = await saveHeroContent(activeContent);
      
      // Update the local state with the saved content
      if (activeTab === 'home') {
        setHomeHero(savedContent);
      } else if (activeTab === 'about') {
        setAboutHero(savedContent);
      } else {
        setContactHero(savedContent);
      }
      
      toast({
        title: 'Success',
        description: 'Hero content has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save hero content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Upload the image
      const publicUrl = await uploadHeroImage(file);
      
      // Update the corresponding hero content
      if (activeTab === 'home') {
        setHomeHero({ ...homeHero, background_image: publicUrl });
      } else if (activeTab === 'about') {
        setAboutHero({ ...aboutHero, background_image: publicUrl });
      } else {
        setContactHero({ ...contactHero, background_image: publicUrl });
      }
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Get the active hero content based on the active tab
  const activeContent = 
    activeTab === 'home' ? homeHero : 
    activeTab === 'about' ? aboutHero : contactHero;
  
  // Function to handle updating the active hero content
  const updateActiveContent = (field: keyof HeroContent, value: string) => {
    if (activeTab === 'home') {
      setHomeHero({ ...homeHero, [field]: value });
    } else if (activeTab === 'about') {
      setAboutHero({ ...aboutHero, [field]: value });
    } else {
      setContactHero({ ...contactHero, [field]: value });
    }
  };
  
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Hero Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-medium">Hero Section Management</h1>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
          >
            <Eye size={16} className="mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
          <TabsTrigger value="contact">Contact Page</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          {previewMode ? (
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="relative h-80 flex items-center"
                style={{ 
                  backgroundImage: `url(${activeContent.background_image || 'https://via.placeholder.com/1920x1080'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 container-custom text-white">
                  <h1 className="text-4xl font-serif mb-4">{activeContent.title}</h1>
                  <p className="text-lg mb-6 max-w-xl">{activeContent.subtitle}</p>
                  
                  {activeContent.primary_button_text && (
                    <div className="flex gap-4">
                      <button className="bg-white text-gray-900 px-6 py-2 rounded">
                        {activeContent.primary_button_text}
                      </button>
                      
                      {activeContent.secondary_button_text && (
                        <button className="border border-white px-6 py-2 rounded">
                          {activeContent.secondary_button_text}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hero Content</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        value={activeContent.title}
                        onChange={(e) => updateActiveContent('title', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Textarea 
                        id="subtitle" 
                        rows={3}
                        value={activeContent.subtitle}
                        onChange={(e) => updateActiveContent('subtitle', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Buttons</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary_button_text">Primary Button Text</Label>
                        <Input 
                          id="primary_button_text" 
                          value={activeContent.primary_button_text || ''}
                          onChange={(e) => updateActiveContent('primary_button_text', e.target.value)}
                          placeholder="e.g., Shop Now"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="primary_button_link">Primary Button Link</Label>
                        <Input 
                          id="primary_button_link" 
                          value={activeContent.primary_button_link || ''}
                          onChange={(e) => updateActiveContent('primary_button_link', e.target.value)}
                          placeholder="e.g., /products"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="secondary_button_text">Secondary Button Text</Label>
                        <Input 
                          id="secondary_button_text" 
                          value={activeContent.secondary_button_text || ''}
                          onChange={(e) => updateActiveContent('secondary_button_text', e.target.value)}
                          placeholder="e.g., Learn More"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="secondary_button_link">Secondary Button Link</Label>
                        <Input 
                          id="secondary_button_link" 
                          value={activeContent.secondary_button_link || ''}
                          onChange={(e) => updateActiveContent('secondary_button_link', e.target.value)}
                          placeholder="e.g., /about"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Background Image</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="background_image">Image URL</Label>
                      <Input 
                        id="background_image" 
                        value={activeContent.background_image || ''}
                        onChange={(e) => updateActiveContent('background_image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Or Upload a New Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {activeContent.background_image && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Current Background Image:</p>
                        <img 
                          src={activeContent.background_image} 
                          alt="Background Preview" 
                          className="max-h-40 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeroManagement;
