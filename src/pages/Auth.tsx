
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
      }
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} | Meubles Karim</title>
        <meta name="description" content={isLogin ? 'Sign in to your Meubles Karim account' : 'Create a new Meubles Karim account'} />
      </Helmet>
      
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="font-serif text-2xl font-medium text-center mb-6">
          {isLogin ? 'Sign In to Your Account' : 'Create a New Account'}
        </h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-furniture-brown hover:text-furniture-teal text-sm"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
