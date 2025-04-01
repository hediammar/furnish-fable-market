
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  if (!user || !profile) {
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
              <p className="text-base">{profile.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
              <p className="text-base">{profile.is_admin ? 'Administrator' : 'Customer'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
              <p className="text-base">{formatDate(profile.created_at)}</p>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => navigate('/orders')}>
              View My Orders
            </Button>
            <Button variant="destructive" onClick={handleSignOut} disabled={isLoading}>
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
