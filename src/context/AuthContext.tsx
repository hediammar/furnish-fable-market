import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const profileRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 2000) {
      console.log('Skipping profile refresh - too soon since last refresh');
      return;
    }
    
    lastRefreshTimeRef.current = now;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile data fetched:', data); // Debug log
      
      setProfile(data);
      
      const adminRole = data?.role === 'admin';
      const adminFlag = data?.is_admin === true;
      
      console.log('Admin checks:', { adminRole, adminFlag, role: data?.role, is_admin: data?.is_admin });
      
      setIsAdmin(adminRole || adminFlag);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.id);
          
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === 'SIGNED_OUT') {
            setProfile(null);
            setIsAdmin(false);
          }
          
          if (newSession?.user) {
            if (profileRefreshTimeoutRef.current) {
              clearTimeout(profileRefreshTimeoutRef.current);
            }
            
            profileRefreshTimeoutRef.current = setTimeout(() => {
              refreshProfile();
            }, 300);
          }
        }
      );
      
      const { data } = await supabase.auth.getSession();
      console.log('Initial session check:', data.session?.user?.id);
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        await refreshProfile();
      }
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
        if (profileRefreshTimeoutRef.current) {
          clearTimeout(profileRefreshTimeoutRef.current);
        }
      };
    };
    
    initialize();
  }, [refreshProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return Promise.reject(error);
      }

      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return Promise.reject(error);
      }

      toast({
        title: 'Signed up successfully',
        description: 'Welcome to Meubles Karim!',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        return Promise.reject(error);
      }

      toast({
        title: 'Signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
