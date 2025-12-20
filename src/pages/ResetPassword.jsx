import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode || mode !== 'resetPassword') {
        setError('Нууц үг сэргээх линк буруу эсвэл хугацаа дууссан байна.');
        setIsVerifying(false);
        setIsValid(false);
        return;
      }

      try {
        // Verify the password reset code
        await verifyPasswordResetCode(auth, oobCode);
        setIsValid(true);
        setError('');
      } catch (error) {
        console.error('Verify code error:', error);
        let errorMessage = 'Нууц үг сэргээх линк буруу эсвэл хугацаа дууссан байна.';
        if (error.code === 'auth/expired-action-code') {
          errorMessage = 'Нууц үг сэргээх линк хугацаа дууссан байна. Дахин нууц үг сэргээх email илгээнэ үү.';
        } else if (error.code === 'auth/invalid-action-code') {
          errorMessage = 'Нууц үг сэргээх линк буруу байна.';
        }
        setError(errorMessage);
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Нууц үг оруулна уу');
      return;
    }

    if (password.length < 6) {
      toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Нууц үг таарахгүй байна');
      return;
    }

    if (!oobCode) {
      toast.error('Нууц үг сэргээх код олдсонгүй');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setIsSuccess(true);
      toast.success('Нууц үг амжилттай солигдлоо!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      let errorMessage = 'Нууц үг солиход алдаа гарлаа';
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Нууц үг сэргээх линк хугацаа дууссан байна. Дахин нууц үг сэргээх email илгээнэ үү.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Нууц үг сэргээх линк буруу байна.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Нууц үг хэт сул байна. Хамгийн багадаа 6 тэмдэгт байх ёстой.';
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Нууц үг сэргээх линк шалгаж байна...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Амжилттай!</h2>
            <p className="text-gray-600 mb-6">Таны нууц үг амжилттай солигдлоо. Нэвтрэх хуудас руу шилжиж байна...</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Нэвтрэх хуудас руу орох
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Алдаа</h2>
            <p className="text-gray-600 mb-6">{error || 'Нууц үг сэргээх линк буруу эсвэл хугацаа дууссан байна.'}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/login')} className="w-full">
                Нэвтрэх хуудас руу буцах
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="w-full"
              >
                Дахин нууц үг сэргээх email илгээх
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Шинэ нууц үг тохируулах</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Шинэ нууц үг</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Хамгийн багадаа 6 тэмдэгт"
                className="mt-1"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Нууц үг баталгаажуулах</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Нууц үг дахин оруулах"
                className="mt-1"
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Хадгалж байна...
                </>
              ) : (
                'Нууц үг солих'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

