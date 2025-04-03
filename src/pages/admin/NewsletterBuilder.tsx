
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Copy, Eye, ImagePlus, Plus, Trash, X, Save, SendHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types/product';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewsletterFormData {
  subject: string;
  preheader: string;
  heading: string;
  bodyText: string;
  buttonText: string;
  buttonUrl: string;
  featuredProducts: string[];
}

type BlockType = 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'products';

interface NewsletterBlock {
  id: string;
  type: BlockType;
  content: any;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader: string;
}

const templates: EmailTemplate[] = [
  { id: 'new-arrivals', name: 'New Arrivals', subject: 'Check out our latest products!', preheader: 'Exclusive new arrivals just for you' },
  { id: 'sale', name: 'Sale Announcement', subject: 'SALE! Up to 50% off', preheader: 'Limited time offer - Don\'t miss out!' },
  { id: 'holiday', name: 'Holiday Special', subject: 'Holiday Specials Just For You', preheader: 'Celebrate the season with these exclusive offers' },
  { id: 'welcome', name: 'Welcome Series', subject: 'Welcome to Meubles Karim', preheader: 'Thanks for joining our family' },
];

const NewsletterBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('design');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [blocks, setBlocks] = useState<NewsletterBlock[]>([
    { id: '1', type: 'text', content: { text: 'Welcome to our newsletter!' } },
    { id: '2', type: 'image', content: { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&h=400&fit=crop', alt: 'Newsletter header' } },
    { id: '3', type: 'text', content: { text: 'Check out our latest products and offers.' } },
  ]);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-newsletter'],
    queryFn: () => fetchProducts({ featured: true }),
  });
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<NewsletterFormData>({
    defaultValues: {
      subject: 'Our Latest Newsletter',
      preheader: 'Check out our latest news and offers',
      heading: 'Welcome to Meubles Karim',
      bodyText: 'We\'re excited to share our latest collection with you. Discover beautiful furniture pieces for your home.',
      buttonText: 'Shop Now',
      buttonUrl: '/products',
      featuredProducts: [],
    }
  });

  const addBlock = (type: BlockType) => {
    const newBlock: NewsletterBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContentForBlockType(type)
    };
    
    setBlocks([...blocks, newBlock]);
  };
  
  const getDefaultContentForBlockType = (type: BlockType) => {
    switch(type) {
      case 'text':
        return { text: 'New text block' };
      case 'image':
        return { src: 'https://via.placeholder.com/600x300', alt: 'Image description' };
      case 'button':
        return { text: 'Click Me', url: '/products' };
      case 'spacer':
        return { height: 20 };
      case 'divider':
        return { color: '#EEEEEE' };
      case 'products':
        return { ids: [] };
      default:
        return {};
    }
  };
  
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };
  
  const updateBlockContent = (id: string, content: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content: { ...block.content, ...content } } : block
    ));
  };
  
  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };
  
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };
  
  const onSubmit = (data: NewsletterFormData) => {
    // In a real implementation, this would send the newsletter data to the backend
    console.log('Newsletter data:', data, blocks);
    
    toast({
      title: 'Newsletter saved!',
      description: 'Your newsletter has been saved successfully.',
    });
  };
  
  const sendTestEmail = () => {
    toast({
      title: 'Test email sent!',
      description: 'A test email has been sent to your address.',
    });
  };
  
  const applyTemplate = (template: EmailTemplate) => {
    setValue('subject', template.subject);
    setValue('preheader', template.preheader);
    setSelectedTemplate(template);
    
    // Add template-specific blocks
    if (template.id === 'sale') {
      setBlocks([
        { id: '1', type: 'text', content: { text: 'SALE! Up to 50% off' } },
        { id: '2', type: 'image', content: { src: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=800&h=400&fit=crop', alt: 'Sale banner' } },
        { id: '3', type: 'text', content: { text: 'Hurry! Limited time offer on our most popular items.' } },
        { id: '4', type: 'button', content: { text: 'Shop the Sale', url: '/products' } },
      ]);
    } else if (template.id === 'new-arrivals') {
      setBlocks([
        { id: '1', type: 'text', content: { text: 'New Arrivals Just In!' } },
        { id: '2', type: 'image', content: { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&h=400&fit=crop', alt: 'New arrivals' } },
        { id: '3', type: 'text', content: { text: 'Be the first to shop our latest collection.' } },
        { id: '4', type: 'products', content: { ids: ['1', '2', '3'] } },
        { id: '5', type: 'button', content: { text: 'View All New Arrivals', url: '/products' } },
      ]);
    }
    
    toast({
      title: 'Template applied',
      description: `The "${template.name}" template has been applied.`,
    });
  };
  
  const renderBlockEditor = (block: NewsletterBlock, index: number) => {
    const renderContentEditor = () => {
      switch(block.type) {
        case 'text':
          return (
            <Textarea
              value={block.content.text}
              onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
              className="min-h-[100px]"
            />
          );
        case 'image':
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={block.content.src}
                  onChange={(e) => updateBlockContent(block.id, { src: e.target.value })}
                  placeholder="Image URL"
                />
                <Button variant="outline" size="icon">
                  <ImagePlus size={18} />
                </Button>
              </div>
              <Input
                value={block.content.alt}
                onChange={(e) => updateBlockContent(block.id, { alt: e.target.value })}
                placeholder="Alt text"
              />
              {block.content.src && (
                <img 
                  src={block.content.src} 
                  alt={block.content.alt} 
                  className="max-h-40 object-contain mx-auto border rounded"
                />
              )}
            </div>
          );
        case 'button':
          return (
            <div className="space-y-3">
              <Input
                value={block.content.text}
                onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                placeholder="Button text"
              />
              <Input
                value={block.content.url}
                onChange={(e) => updateBlockContent(block.id, { url: e.target.value })}
                placeholder="Button URL"
              />
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="bg-furniture-taupe text-white hover:bg-furniture-brown"
                  disabled
                >
                  {block.content.text || 'Button'}
                </Button>
              </div>
            </div>
          );
        case 'spacer':
          return (
            <div className="space-y-3">
              <Label>Height (px)</Label>
              <Input
                type="number"
                value={block.content.height}
                onChange={(e) => updateBlockContent(block.id, { height: parseInt(e.target.value) })}
                min={5}
                max={100}
              />
            </div>
          );
        case 'divider':
          return (
            <div className="space-y-3">
              <Label>Color</Label>
              <Input
                type="color"
                value={block.content.color}
                onChange={(e) => updateBlockContent(block.id, { color: e.target.value })}
                className="h-10 w-full"
              />
            </div>
          );
        case 'products':
          return (
            <div className="space-y-3">
              <Label>Select Products (up to 4)</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (block.content.ids.length < 4) {
                    updateBlockContent(block.id, { 
                      ids: [...block.content.ids, value] 
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add products" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: Product) => (
                    <SelectItem 
                      key={product.id} 
                      value={product.id}
                      disabled={block.content.ids.includes(product.id)}
                    >
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {block.content.ids.map((id: string) => {
                  const product = products.find((p: Product) => p.id === id);
                  if (!product) return null;
                  
                  return (
                    <div key={id} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate">{product.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => updateBlockContent(block.id, { 
                          ids: block.content.ids.filter((i: string) => i !== id) 
                        })}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        default:
          return null;
      }
    };
    
    return (
      <Card key={block.id} className="mb-4 border-l-4" style={{ borderLeftColor: '#9F8E7D' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{block.type} Block</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={index === 0}
                onClick={() => moveBlockUp(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={index === blocks.length - 1}
                onClick={() => moveBlockDown(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeBlock(block.id)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            {renderContentEditor()}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderBlockPreview = (block: NewsletterBlock, index: number) => {
    switch(block.type) {
      case 'text':
        return (
          <div key={block.id} className="mb-4 px-2 text-center">
            {block.content.text}
          </div>
        );
      case 'image':
        return (
          <div key={block.id} className="mb-4 text-center">
            <img 
              src={block.content.src} 
              alt={block.content.alt} 
              className="max-w-full inline-block"
            />
          </div>
        );
      case 'button':
        return (
          <div key={block.id} className="mb-4 text-center">
            <a 
              href={block.content.url} 
              className="inline-block bg-furniture-taupe hover:bg-furniture-brown text-white px-6 py-2 rounded text-center no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.content.text}
            </a>
          </div>
        );
      case 'spacer':
        return (
          <div key={block.id} style={{ height: `${block.content.height}px` }}></div>
        );
      case 'divider':
        return (
          <div key={block.id} className="my-4">
            <hr style={{ borderTop: `1px solid ${block.content.color}` }} />
          </div>
        );
      case 'products':
        const selectedProducts = products.filter((p: Product) => 
          block.content.ids.includes(p.id)
        ).slice(0, 4);
        
        return (
          <div key={block.id} className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {selectedProducts.map((product: Product) => (
                <div key={product.id} className="border rounded p-2">
                  {product.images?.[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-32 object-cover mb-2 rounded"
                    />
                  )}
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-sm">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Newsletter Builder | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-medium">Newsletter Builder</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestEmail}
          >
            <SendHorizontal size={16} className="mr-2" />
            Send Test
          </Button>
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            size="sm"
          >
            {previewMode ? (
              <>
                <X size={16} className="mr-2" />
                Close Preview
              </>
            ) : (
              <>
                <Eye size={16} className="mr-2" />
                Preview
              </>
            )}
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            size="sm"
          >
            <Save size={16} className="mr-2" />
            Save Newsletter
          </Button>
        </div>
      </div>
      
      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Template Selection */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Newsletter Templates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a template to get started quickly. The template will replace your current design.
                </p>
                
                <div className="space-y-3">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => applyTemplate(template)}
                    >
                      {selectedTemplate?.id === template.id && (
                        <Check size={16} className="mr-2" />
                      )}
                      {template.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Add Content Blocks</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => addBlock('text')}
                  >
                    <span className="mr-2">Aa</span>
                    Text
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={() => addBlock('image')}
                  >
                    <ImagePlus size={16} className="mr-2" />
                    Image
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={() => addBlock('button')}
                  >
                    <span className="mr-2 border rounded px-1 text-xs">BTN</span>
                    Button
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={() => addBlock('spacer')}
                  >
                    <span className="mr-2">⋮</span>
                    Spacer
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={() => addBlock('divider')}
                  >
                    <span className="mr-2">—</span>
                    Divider
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={() => addBlock('products')}
                  >
                    <span className="mr-2">⊞</span>
                    Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Middle Column - Newsletter Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Newsletter Settings</h3>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input 
                        id="subject"
                        {...register('subject', { required: 'Subject is required' })}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm">{errors.subject.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preheader">Preheader Text</Label>
                      <Input 
                        id="preheader"
                        {...register('preheader')}
                        placeholder="Brief summary shown in email clients"
                      />
                    </div>
                  </div>
                </form>
                
                <Separator className="my-6" />
                
                <h3 className="font-medium text-lg mb-4">Email Content</h3>
                
                {blocks.map((block, index) => renderBlockEditor(block, index))}
                
                {blocks.length === 0 && (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-4">Add a block to start building your newsletter</p>
                    <Button variant="outline" onClick={() => addBlock('text')}>
                      <Plus size={16} className="mr-2" />
                      Add First Block
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Email Preview Header */}
            <div className="bg-gray-100 p-4 border-b">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-sm text-gray-500">Email Preview</div>
              </div>
            </div>
            
            {/* Email Preview Content */}
            <div className="p-6">
              {/* Email Header */}
              <div className="text-center mb-6">
                <img 
                  src="/logo.svg" 
                  alt="Meubles Karim" 
                  className="h-12 mx-auto mb-4" 
                />
              </div>
              
              {/* Email Body */}
              <div className="space-y-4">
                {blocks.map((block, index) => renderBlockPreview(block, index))}
              </div>
              
              {/* Email Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Meubles Karim. All rights reserved.</p>
                <p className="mt-2">
                  <a href="#" className="text-furniture-taupe hover:underline">Unsubscribe</a> • 
                  <a href="#" className="text-furniture-taupe hover:underline ml-1">View in browser</a> • 
                  <a href="#" className="text-furniture-taupe hover:underline ml-1">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterBuilder;
