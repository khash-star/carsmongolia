import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, resetPassword, loginWithFacebook } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, LogIn, Loader2, UserPlus, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Check if user is already logged in (only on mount)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const { getCurrentUser } = await import('@/services/auth');
          const currentUser = await getCurrentUser();
          if (currentUser) {
            // User is already logged in, redirect to home or intended page
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          }
        }
      } catch (error) {
        // User not authenticated, stay on login page
        console.log('User not authenticated');
      }
    };
    checkAuth();
  }, [navigate, location]); // Run on mount and when location changes

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Имэйл болон нууц үг оруулна уу');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Invalidate queries to refresh user data
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries(['currentUser']);
      
      toast.success(`Амжилттай нэвтэрлээ! ${user.role === 'ADMIN' ? '(Админ)' : ''}`);
      
      // Clear any old state
      queryClient.clear();
      
      // Redirect to intended page or home with full page reload to ensure fresh state
      const from = location.state?.from?.pathname || '/';
      
      // Use window.location for full page reload to ensure all state is reset
      setTimeout(() => {
        window.location.href = from;
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = error.message || 'Нэвтрэхэд алдаа гарлаа';
      
      // Provide more helpful error messages
      if (errorMessage.includes('буруу') || errorMessage.includes('invalid-credential')) {
        toast.error(errorMessage, {
          description: 'Нууц үг мартсан бол "Нууц үг мартсан уу?" линк дээр дарах эсвэл Firebase Console дээр сэргээнэ үү'
        });
      } else if (errorMessage.includes('Хэт олон оролдлого') || errorMessage.includes('too-many-requests')) {
        toast.error(errorMessage, {
          description: '15-30 минутын дараа дахин оролдоно уу. Эсвэл browser cache цэвэрлэж дахин оролдоно уу.'
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error('Бүх талбаруудыг бөглөнө үү');
      return;
    }

    if (password.length < 6) {
      toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }

    setIsRegistering(true);
    try {
      const user = await register(email, password, fullName);
      
      if (!user || !user.uid) {
        throw new Error('Бүртгэл үүсгэхэд алдаа гарлаа');
      }
      
      console.log('Registration successful, user:', user);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Invalidate queries to refresh user data
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries(['currentUser']);
      
      toast.success('Бүртгэл амжилттай үүслээ!');
      
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      
      // Redirect immediately - use window.location for full page reload
      // This ensures all state is properly reset
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'Бүртгэл үүсгэхэд алдаа гарлаа';
      const errorCode = error.code || '';
      
      // If email already exists, switch to login tab immediately
      if (errorMessage.includes('аль хэдийн бүртгэлтэй') || 
          errorMessage.includes('already') || 
          errorMessage.includes('email-already-in-use') ||
          errorCode === 'auth/email-already-in-use') {
        toast.error('Энэ имэйл аль хэдийн бүртгэлтэй байна');
        // Switch to login tab immediately
        setActiveTab('login');
        // Keep email in the form for login
        setTimeout(() => {
          toast.info('Энэ имэйлээр нэвтрэх нууц үгээ оруулна уу');
        }, 1500);
      } else {
        toast.error(errorMessage);
      }
      
      setIsRegistering(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Имэйл оруулна уу');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Нууц үг сэргээх линк таны имэйл руу илгээгдлээ. Email-ээ шалгана уу.');
      setResetEmail('');
      setShowResetPassword(false);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Нууц үг сэргээх email илгээхэд алдаа гарлаа');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Нэвтрэх / Бүртгүүлэх</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Нэвтрэх</TabsTrigger>
              <TabsTrigger value="register">Бүртгүүлэх</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="login-email">Имэйл</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Нууц үг</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(true);
                      setResetEmail(email);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Нууц үг мартсан уу?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2" />
                  )}
                  Нэвтрэх
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Эсвэл</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const user = await loginWithFacebook();
                      
                      // Store user in localStorage
                      localStorage.setItem('user', JSON.stringify(user));
                      
                      // Invalidate queries to refresh user data
                      queryClient.setQueryData(['currentUser'], user);
                      queryClient.invalidateQueries(['currentUser']);
                      
                      toast.success(`Facebook-ээр амжилттай нэвтэрлээ! ${user.role === 'ADMIN' ? '(Админ)' : ''}`);
                      
                      // Clear any old state
                      queryClient.clear();
                      
                      // Redirect to intended page or home with full page reload
                      const from = location.state?.from?.pathname || '/';
                      
                      // Use window.location for full page reload to ensure all state is reset
                      setTimeout(() => {
                        window.location.href = from;
                      }, 500);
                    } catch (error) {
                      console.error('Facebook login error:', error);
                      toast.error(error.message || 'Facebook-ээр нэвтрэхэд алдаа гарлаа');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full h-12 relative flex items-center justify-center rounded-md text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(to bottom, #5B7FCC 0%, #3B5998 100%)',
                    boxShadow: '0 2px 6px rgba(59, 89, 152, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Facebook лого - цагаан дөрвөлжин дотор */}
                  <div className="absolute left-3 flex items-center justify-center w-8 h-8 bg-white rounded-md shadow-sm">
                    <i className="fab fa-facebook-f text-[#3B5998] text-base leading-none"></i>
                  </div>
                  
                  {/* Текст */}
                  <span className="text-sm tracking-wide">
                    <span className="font-normal">Login with </span>
                    <span className="font-semibold">facebook</span>
                  </span>
                </button>
              </form>
              
              {/* Reset Password Dialog */}
              {showResetPassword && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-sm font-medium mb-2">Нууц үг сэргээх</h3>
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Имэйл оруулах"
                      className="text-sm"
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isResetting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isResetting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Илгээх
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetEmail('');
                        }}
                      >
                        Цуцлах
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-name">Нэр</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Таны нэр"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-email">Имэйл</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-password">Нууц үг (хамгийн багадаа 6 тэмдэгт)</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-5 h-5 mr-2" />
                  )}
                  Бүртгүүлэх
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

