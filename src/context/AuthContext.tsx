
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
  const initialLoadDoneRef = useRef<boolean>(false);
  const authChangeHandledRef = useRef<boolean>(false);
  const profileFetchInProgressRef = useRef<boolean>(false);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    if (profileFetchInProgressRef.current) {
      console.log('Profile fetch already in progress, skipping');
      return;
    }

    const now = Date.now();
    // Increase the throttle time to prevent too frequent refreshes
    if (now - lastRefreshTimeRef.current < 5000) { // 5 seconds throttle
      console.log('Skipping profile refresh - too soon since last refresh');
      return;
    }
    
    lastRefreshTimeRef.current = now;
    profileFetchInProgressRef.current = true;

    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        profileFetchInProgressRef.current = false;
        return;
      }

      console.log('Profile data fetched:', data);
      
      setProfile(data);
      
      // Check both role and is_admin flag
      const isAdminRole = data?.role === 'admin';
      const isAdminFlag = data?.is_admin === true;
      
      console.log('Admin checks:', { isAdminRole, isAdminFlag, role: data?.role, is_admin: data?.is_admin });
      
      setIsAdmin(isAdminRole || isAdminFlag);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      profileFetchInProgressRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    const initialize = async () => {
      if (initialLoadDoneRef.current) {
        return; // Prevent multiple initializations
      }
      
      setIsLoading(true);
      
      // Get initial session first
      const { data } = await supabase.auth.getSession();
      console.log('Initial session check:', data.session?.user?.id);
      
      // Only set the session and user if we haven't already from an auth change event
      if (!authChangeHandledRef.current) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          // Use setTimeout to allow React to finish rendering before fetching profile
          setTimeout(() => {
            refreshProfile();
          }, 100);
        }
      }
      
      // After initial session check, set up the auth change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.id);
          authChangeHandledRef.current = true;
          
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === 'SIGNED_OUT') {
            setProfile(null);
            setIsAdmin(false);
          } else if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // Clear any pending profile refresh
            if (profileRefreshTimeoutRef.current) {
              clearTimeout(profileRefreshTimeoutRef.current);
            }
            
            // Schedule profile refresh, but with a delay to avoid rapid successive calls
            profileRefreshTimeoutRef.current = setTimeout(() => {
              refreshProfile();
            }, 500);
          }
        }
      );
      
      setIsLoading(false);
      initialLoadDoneRef.current = true;
      
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
