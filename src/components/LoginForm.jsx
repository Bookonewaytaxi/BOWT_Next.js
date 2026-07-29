import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Car, User, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export default function LoginForm() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Map User ID to Email
      let emailToUse = userId;
      if (userId === 'BookOneWayTaxi') {
        emailToUse = 'admin@bookonewaytaxi.com';
      }

      console.log('Attempting login with:', emailToUse);

      // 2. Attempt Sign In
      const { error: signInError } = await signIn(emailToUse, password);

      if (signInError) {
        console.error('Sign in error:', signInError);

        // 3. If login failed specifically for our specific admin user, try to auto-create
        if (userId === 'BookOneWayTaxi' && password === 'Bowt@2020') {
          console.log('Admin user not found or login failed. Attempting to create user...');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailToUse,
            password: password,
          });

          if (signUpError) {
            console.error('Sign up error:', signUpError);
            setErrorMsg(`Setup failed: ${signUpError.message}`);
            toast({
              variant: "destructive",
              title: "Setup Failed",
              description: signUpError.message
            });
          } else {
             console.log('Admin user created successfully:', signUpData);
             // Verify if we can sign in now (sometimes email confirmation is required)
             if (signUpData.user && !signUpData.session) {
                setErrorMsg('Account created. Please check email for confirmation link if enabled in Supabase.');
                toast({
                  title: "Account Created",
                  description: "Please check your email to confirm the account."
                });
             } else {
                toast({ title: "Welcome", description: "Admin account initialized and logged in." });
                // The auth state change listener in AuthContext should handle the redirect/state update
             }
          }
        } else {
          // Normal user login failure
          setErrorMsg('Invalid User ID or Password.');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Invalid credentials provided."
          });
        }
      } else {
        console.log('Login successful');
        toast({ title: "Welcome Back", description: "Successfully logged in." });
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - Penta Cab</title>
      </Head>

      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-700/50"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20 transform rotate-3">
               <Car className="h-10 w-10 text-[#0B1120]" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Penta Cab</h1>
            <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 py-1 px-3 rounded-full mx-auto w-fit">
               <ShieldCheck className="h-4 w-4" />
               <span className="text-xs font-bold tracking-widest uppercase">Admin Portal</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userid" className="flex items-center gap-2 text-slate-300 text-sm uppercase tracking-wider font-bold">
                <User className="h-4 w-4 text-amber-500" />
                User ID
              </Label>
              <Input
                id="userid"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-600 h-12 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-slate-300 text-sm uppercase tracking-wider font-bold">
                <Lock className="h-4 w-4 text-amber-500" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-600 h-12 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                 <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                 <span>{errorMsg}</span>
              </div>
            )}

            <Button 
              type="submit" 
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-[#0B1120] font-black h-12 text-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all border-none disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin"></div>
                  VERIFYING...
                </span>
              ) : (
                <span className="flex items-center gap-2">LOGIN TO DASHBOARD <ArrowRight className="h-5 w-5" /></span>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
             <p className="text-xs text-slate-500 font-medium">Secured by Penta Cab Enterprise Systems &copy; {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}