import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/services/auth';
import { create as createBusiness } from '@/services/businesses';
import { uploadFiles } from '@/services/storage';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wrench, CircleDot, Settings, Headphones, Loader2, CheckCircle, Upload, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const SERVICE_TYPES = {
  parts: { label: 'Сэлбэг', icon: Wrench, color: 'bg-orange-500', categories: ['Хөдөлгүүр', 'Явах эд анги', 'Тоормос', 'Цахилгаан', 'Дотор эд анги', 'Гадна эд анги', 'Бусад'] },
  tires: { label: 'Дугуй', icon: CircleDot, color: 'bg-green-500', categories: ['Зуны дугуй', 'Өвлийн дугуй', '4 улирлын дугуй', 'Обуд', 'Дугуйн засвар', 'Бусад'] },
  repair: { label: 'Засвар', icon: Settings, color: 'bg-red-500', categories: ['Хөдөлгүүрийн засвар', 'Хурдны хайрцаг', 'Тоормосны засвар', 'Цахилгааны засвар', 'Бүхээгийн засвар', 'Будаг', 'Бусад'] },
  service: { label: 'Үйлчилгээ', icon: Headphones, color: 'bg-purple-500', categories: ['Угаалга', 'Тос солих', 'Оношилгоо', 'Гүйцэтгэл тохируулах', 'Даатгал', 'Зээл', 'Бусад'] }
};

export default function AddBusiness() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return await getCurrentUser();
        }
      }
      return await getCurrentUser();
    },
    retry: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showExcelFormat, setShowExcelFormat] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'parts',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    images: []
  });



  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Нэвтэрнэ үү. Зураг upload хийхэд нэвтрэх шаардлагатай.');
      return;
    }

    // Double check Firebase auth state
    const { auth } = await import('@/config/firebase');
    if (!auth.currentUser) {
      console.warn('User in localStorage but not in Firebase Auth. Redirecting to login...');
      toast.error('Нэвтэрсэн төлөв алдаатай байна. Дахин нэвтэрнэ үү.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    console.log('Uploading images as:', {
      user: user.email,
      firebaseAuth: auth.currentUser?.email,
      filesCount: files.length
    });

    setUploadingImages(true);
    try {
      const results = await uploadFiles(files, 'businesses');
      const imageUrls = results.map(r => r.file_url);
      setFormData({ ...formData, images: [...formData.images, ...imageUrls] });
      toast.success(`${imageUrls.length} зураг амжилттай орлоо`);
    } catch (error) {
      console.error('Image upload error:', {
        error,
        message: error.message,
        code: error.code,
        user: user?.email,
        authState: auth.currentUser?.email
      });
      
      let errorMsg = error.message || 'Зураг оруулахад алдаа гарлаа';
      
      // Provide specific guidance for 403 errors
      if (error.message?.includes('403') || error.code === 'storage/permission-denied') {
        errorMsg = '403 Алдаа: Firebase Console → Storage → Rules дээр "Publish" хийх шаардлагатай.';
      }
      
      toast.error(errorMsg);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const importFromExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      console.log('Importing from Excel:', file.name);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        toast.error('Excel файл буруу форматтай байна');
        return;
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('Excel файл хоосон байна');
        return;
      }

      console.log('Excel data:', jsonData);
      
      const row = jsonData[0]; // Эхний мөр
      
      // Type mapping (label -> key)
      const typeMap = {};
      Object.entries(SERVICE_TYPES).forEach(([key, { label }]) => {
        typeMap[label] = key;
      });

      const importedData = {
        name: row['Бизнесийн нэр'] || '',
        type: typeMap[row['Төрөл']] || formData.type || 'parts',
        category: row['Ангилал'] || '',
        description: row['Тайлбар'] || '',
        phone: row['Утас'] || '',
        whatsapp: row['WhatsApp'] || '',
        address: row['Хаяг'] || '',
        images: row['Зургуудын URL'] ? row['Зургуудын URL'].toString().split('; ').filter(Boolean) : []
      };

      console.log('Imported data:', importedData);
      
      setFormData(importedData);
      toast.success('Excel файлаас мэдээлэл амжилттай импорт хийгдлээ');
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Excel import error:', error);
      toast.error('Excel файл уншихад алдаа гарлаа: ' + (error.message || 'Тодорхойгүй алдаа'));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.type) newErrors.type = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== Submit started ===');
    console.log('Form data:', formData);
    console.log('User:', user);
    
    // Validate form
    if (!validate()) {
      console.error('Validation failed:', errors);
      toast.error('Шаардлагатай талбаруудыг бөглөнө үү');
      return;
    }

    // Check user authentication
    if (!user || !user.email) {
      console.error('User not authenticated');
      toast.error('Нэвтэрнэ үү. Бизнес бүртгүүлэхэд нэвтрэх шаардлагатай.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    // Double check Firebase Auth state
    const { auth } = await import('@/config/firebase');
    if (!auth.currentUser) {
      console.error('Firebase Auth state not synced. User in localStorage but not in Firebase Auth.');
      toast.error('Нэвтэрсэн төлөв алдаатай байна. Дахин нэвтэрнэ үү.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    console.log('Firebase Auth verified:', {
      email: auth.currentUser.email,
      uid: auth.currentUser.uid
    });
    
    setIsSubmitting(true);
    try {
      const businessData = {
        name: formData.name.trim(),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        address: formData.address.trim() || null,
        images: formData.images || [],
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: user.email,
        view_count: 0
      };

      console.log('Creating business with data:', businessData);

      const result = await createBusiness(businessData);

      console.log('Business created successfully:', result);
      
      setIsSuccess(true);
      toast.success('Бизнес амжилттай бүртгэгдлээ!');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          type: 'parts',
          category: '',
          description: '',
          phone: '',
          whatsapp: '',
          address: '',
          images: []
        });
      }, 2000);
    } catch (error) {
      console.error('Submit error details:', {
        error,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Алдаа гарлаа: ' + (error.message || 'Тодорхойгүй алдаа');
      
      // Provide specific error messages
      if (error.message?.includes('permission') || error.code === 'permission-denied') {
        errorMessage = 'Эрхгүй байна. Нэвтэрнэ үү эсвэл админтай холбогдоно уу.';
      } else if (error.message?.includes('network') || error.code === 'unavailable') {
        errorMessage = 'Сүлжээний алдаа. Интернэт холболтоо шалгана уу.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Амжилттай!</h2>
          <p className="text-gray-500 mb-6">Таны бизнес бүртгэгдлээ. Админ баталгаажуулсны дараа харагдах болно.</p>
          <Button onClick={() => navigate(createPageUrl('Services?type=' + formData.type))} className="w-full">
            Бизнесүүд руу буцах
          </Button>
        </Card>
      </div>
    );
  }

  const TypeIcon = SERVICE_TYPES[formData.type]?.icon || Wrench;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`w-12 h-12 ${SERVICE_TYPES[formData.type]?.color} rounded-xl flex items-center justify-center`}>
                <TypeIcon className="w-6 h-6 text-white" />
              </div>
              Бизнес бүртгүүлэх
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(SERVICE_TYPES).map(([key, { label, icon: Icon, color }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: key, category: '' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === key ? `${color} text-white border-transparent` : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className={errors.name ? 'text-red-500' : ''}>Бизнесийн нэр *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Жишээ: Авто сэлбэг дэлгүүр"
                  />
                </div>

                <div>
                  <Label className={errors.category ? 'text-red-500' : ''}>Ангилал *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Ангилал сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES[formData.type]?.categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Тайлбар</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                    placeholder="Бизнесийн талаар товч тайлбар..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.phone ? 'text-red-500' : ''}>Утас *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="99001122"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="mt-1"
                      placeholder="99001122"
                    />
                  </div>
                </div>

                <div>
                  <Label>Хаяг</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1"
                    placeholder="Байршлын хаяг"
                  />
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Зургууд</Label>
                    <div className="flex gap-2">
                      <Dialog open={showExcelFormat} onOpenChange={setShowExcelFormat}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Info className="w-4 h-4" />
                            Загвар
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Excel файлын загвар</DialogTitle>
                            <DialogDescription>
                              Excel файл дараах баганатай байх ёстой:
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="bg-gray-50 rounded-lg p-4 border">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-2 font-semibold">Багана</th>
                                    <th className="text-left p-2 font-semibold">Тайлбар</th>
                                    <th className="text-left p-2 font-semibold">Шаардлагатай</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">Бизнесийн нэр</td>
                                    <td className="p-2 text-gray-600">Бизнесийн бүрэн нэр</td>
                                    <td className="p-2 text-red-600">✓</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">Төрөл</td>
                                    <td className="p-2 text-gray-600">Сэлбэг, Дугуй, Засвар, Үйлчилгээ</td>
                                    <td className="p-2 text-gray-400">-</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">Ангилал</td>
                                    <td className="p-2 text-gray-600">Төрөлд тохирох ангилал</td>
                                    <td className="p-2 text-red-600">✓</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">Тайлбар</td>
                                    <td className="p-2 text-gray-600">Бизнесийн тайлбар</td>
                                    <td className="p-2 text-gray-400">-</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">Утас</td>
                                    <td className="p-2 text-gray-600">Утасны дугаар</td>
                                    <td className="p-2 text-red-600">✓</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">WhatsApp</td>
                                    <td className="p-2 text-gray-600">WhatsApp дугаар</td>
                                    <td className="p-2 text-gray-400">-</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-2 font-medium">Хаяг</td>
                                    <td className="p-2 text-gray-600">Байршлын хаяг</td>
                                    <td className="p-2 text-gray-400">-</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 font-medium">Зургуудын URL</td>
                                    <td className="p-2 text-gray-600">Зургуудын URL (; -аар тусгаарлагдсан)</td>
                                    <td className="p-2 text-gray-400">-</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-900 font-medium mb-2">Жишээ:</p>
                              <div className="text-xs text-blue-800 font-mono bg-white p-2 rounded border">
                                <div>Бизнесийн нэр | Төрөл | Ангилал | Тайлбар | Утас | WhatsApp | Хаяг | Зургуудын URL</div>
                                <div className="mt-1">Авто сэлбэг | Сэлбэг | Хөдөлгүүр | Маш сайн | 99001122 | 99001122 | УБ | url1; url2</div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Label htmlFor="excel-import" className="cursor-pointer">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4" />
                            Excel импорт
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="excel-import"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={importFromExcel}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <Label htmlFor="images" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Зураг оруулах</p>
                      {uploadingImages && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-2" />}
                    </div>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className={`w-full h-12 ${SERVICE_TYPES[formData.type]?.color}`}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Бүртгүүлэх
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}