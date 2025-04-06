
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Try to refresh the profile once when the component loads if it's null
  useEffect(() => {
    if (user && !profile) {
      const timeoutId = setTimeout(() => {
        refreshProfile();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, profile, refreshProfile]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">Please sign in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>My Profile | Meubles Karim</title>
        <meta name="description" content="View and manage your Meubles Karim profile" />
      </Helmet>
      
      <h1 className="font-serif text-3xl font-medium mb-8 text-center">My Profile</h1>
      
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-base">{profile?.email || user.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
              <p className="text-base">{profile?.is_admin || profile?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
              <p className="text-base">{formatDate(profile?.created_at)}</p>
            </div>
            
            {!profile && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                <p>Profile data is still loading...</p>
              </div>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => navigate('/estimates')}>
              {language === 'fr' ? 'Voir Mes Devis' : 'View My Estimates'}
            </Button>
            <Button variant="destructive" onClick={handleSignOut} disabled={isLoading}>
              {isLoading ? 'Signing out...' : (language === 'fr' ? 'Se déconnecter' : 'Sign Out')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
