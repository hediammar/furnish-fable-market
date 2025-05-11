import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Package, ShoppingBag, Users, Tag, LayoutDashboard, LogOut, Image, Mail, FileText, Briefcase, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

const AdminDashboard = () => {
  const { signOut, profile, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  
  // Debug logging
  useEffect(() => {
    console.log('AdminDashboard: User:', user);
    console.log('AdminDashboard: Profile:', profile);
    console.log('AdminDashboard: Is Admin:', isAdmin);
  }, [user, profile, isAdmin]);
  
  // Redirect non-admin users
  useEffect(() => {
    if (profile && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to access the admin dashboard.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [profile, isAdmin, navigate, toast]);
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to access the admin dashboard.</p>
        <Link to="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const navItems = [
    { title: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { title: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { title: 'Materials', icon: <Tag size={20} />, path: '/admin/materials' },
    { title: 'Textiles', icon: <Image size={20} />, path: '/admin/textiles' },
    { title: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { title: 'Categories', icon: <Tag size={20} />, path: '/admin/categories' },
    { title: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { title: 'Appointments', icon: <Calendar size={20} />, path: '/admin/appointments' },
    { title: 'Hero Sections', icon: <Image size={20} />, path: '/admin/hero' },
    { title: 'Newsletter', icon: <Mail size={20} />, path: '/admin/newsletter' },
    { title: 'Partners', icon: <Briefcase size={20} />, path: '/admin/partners' },
    { title: 'Estimates', icon: <FileText size={20} />, path: '/admin/estimates' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <Helmet>
        <title>Admin Dashboard | Meubles Karim</title>
      </Helmet>
      
      {/* Mobile header with menu toggle */}
      {isMobile && (
        <header className="bg-white p-4 flex justify-between items-center shadow-sm z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? 'Close Menu' : 'Menu'}
          </Button>
          <h1 className="font-serif text-xl font-medium">Admin Dashboard</h1>
          <div className="w-8"></div> {/* For balance */}
        </header>
      )}
      
      {/* Sidebar navigation */}
      <aside className={`
        ${isMobile ? (isSidebarOpen ? 'block fixed inset-0 z-50 bg-white w-64' : 'hidden') : 'w-64 min-h-screen'}
        bg-white shadow-sm p-6 flex flex-col
      `}>
        {isMobile && isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="self-end mb-4"
            onClick={() => setIsSidebarOpen(false)}
          >
            Close
          </Button>
        )}
        
        <div className="font-serif text-2xl font-bold mb-8 text-furniture-brown">
          Admin Panel
        </div>
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => isMobile && setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        
        <div className="pt-6 mt-auto">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Signed in as: <span className="font-medium">{profile?.email}</span>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
