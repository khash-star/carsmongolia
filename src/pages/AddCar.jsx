import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/services/auth';
import { create as createCar } from '@/services/cars';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Upload, X, Loader2, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { update as updateCar } from '@/services/cars';
import QPayButton from '@/components/payment/QPayButton.jsx';

const MAKES = ['Toyota', 'Honda', 'Lexus', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Ford', 'Chevrolet', 'Volkswagen', 'Subaru', 'Mitsubishi', 'Suzuki'];
const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'wagon', 'van', 'truck', 'crossover'];
const FUEL_TYPES = ['gasoline', 'diesel', 'hybrid', 'electric', 'lpg'];
const TRANSMISSIONS = ['automatic', 'manual'];
const DRIVE_TYPES = ['fwd', 'rwd', 'awd', '4wd'];
const ORIGINS = ['korea', 'japan', 'usa', 'germany', 'china', 'other'];
const LOCATIONS = ['ulaanbaatar', 'darkhan', 'erdenet', 'choibalsan', 'murun', 'other'];

export default function AddCar() {
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
  const [createdCarId, setCreatedCarId] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    has_license_plate: false,
    fuel_type: 'gasoline',
    transmission: 'automatic',
    body_type: 'sedan',
    engine_capacity: '',
    drive_type: 'fwd',
    origin_country: 'korea',
    exterior_color: '',
    interior_color: '',
    description: '',
    images: [],
    features: [],
    location: 'ulaanbaatar',
    contact_phone: '',
    contact_whatsapp: ''
  });

  const [newFeature, setNewFeature] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Нэвтэрнэ үү. Зураг upload хийхэд нэвтрэх шаардлагатай.');
      return;
    }

    setUploadingImages(true);
    try {
      const results = await uploadFiles(files, 'cars');
      const imageUrls = results.map(r => r.file_url);
      setFormData({ ...formData, images: [...formData.images, ...imageUrls] });
      toast.success(`${imageUrls.length} зураг амжилттай орлоо`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const validate = () => {
    const newErrors = {};
    const errorMessages = [];
    
    if (!formData.title.trim()) {
      newErrors.title = true;
      errorMessages.push('Зарын гарчиг');
    }
    if (!formData.make) {
      newErrors.make = true;
      errorMessages.push('Үйлдвэрлэгч');
    }
    if (!formData.model.trim()) {
      newErrors.model = true;
      errorMessages.push('Загвар');
    }
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = true;
      errorMessages.push('Он');
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = true;
      errorMessages.push('Үнэ');
    }
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = true;
      errorMessages.push('Утасны дугаар');
    }
    
    setErrors(newErrors);
    
    if (errorMessages.length > 0) {
      toast.error(`Дутуу бөглөсөн талбарууд: ${errorMessages.join(', ')}`);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== Car Submit started ===');
    console.log('Form data:', formData);
    console.log('User:', user);
    
    if (!validate()) {
      console.error('Validation failed:', errors);
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error('Шаардлагатай талбаруудыг бөглөнө үү');
      return;
    }

    // Check user authentication
    if (!user || !user.email) {
      console.error('User not authenticated');
      toast.error('Нэвтэрнэ үү. Зар нэмэхэд нэвтрэх шаардлагатай.');
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
      const carData = {
        ...formData,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: formData.mileage ? Number(formData.mileage) : 0,
        engine_capacity: formData.engine_capacity ? Number(formData.engine_capacity) : 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: user.email,
        view_count: 0
      };

      console.log('Creating car with data:', carData);

      const result = await createCar(carData);

      console.log('Car created successfully:', result);
      
      setCreatedCarId(result.id);
      setIsSuccess(true);
      toast.success('Зар амжилттай нэмэгдлээ!');
    } catch (error) {
      console.error('Error adding car details:', {
        error,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Алдаа гарлаа: ' + (error.message || 'Тодорхойгүй алдаа');
      
      // Provide specific error messages
      if (error.message?.includes('permission') || error.code === 'permission-denied') {
        errorMessage = 'Эрхгүй байна. Firebase Console → Firestore Database → Rules дээр "Publish" хийх шаардлагатай.';
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
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleVipUpgrade = async () => {
    try {
      await updateCar(createdCarId, { is_featured: true });
      toast.success('VIP болгогдлоо! Таны зар одоо онцлох байрлалд байна.');
      setTimeout(() => navigate(createPageUrl('Profile')), 2000);
    } catch (error) {
      toast.error('Алдаа гарлаа: ' + error.message);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Амжилттай!</h2>
          <p className="text-gray-500 mb-6">Таны зар бүртгэгдлээ. Админ баталгаажуулсны дараа харагдах болно.</p>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <h3 className="font-semibold text-gray-900">VIP зар болгох уу?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Таны зар онцлох байрлалд гарч илүү их үзэлттэй болно</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">50,000₮</p>
            
            <QPayButton 
              amount={50000} 
              description={`VIP зар: ${formData.title}`}
              onSuccess={handleVipUpgrade}
            >
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                <Star className="w-4 h-4 mr-2" />
                VIP болгох
              </Button>
            </QPayButton>
          </div>

          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl('Profile'))} 
            className="w-full"
          >
            Профайл руу буцах
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              Машины зар нэмэх
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Үндсэн мэдээлэл</h3>
                
                <div>
                  <Label className={errors.title ? 'text-red-500' : ''}>Зарын гарчиг *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Жишээ: 2020 Toyota Camry"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.make ? 'text-red-500' : ''}>Үйлдвэрлэгч *</Label>
                    <Select value={formData.make} onValueChange={(v) => setFormData({ ...formData, make: v })}>
                      <SelectTrigger className={`mt-1 ${errors.make ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAKES.map(make => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={errors.model ? 'text-red-500' : ''}>Загвар *</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className={`mt-1 ${errors.model ? 'border-red-500' : ''}`}
                      placeholder="Camry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className={errors.year ? 'text-red-500' : ''}>Он *</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className={`mt-1 ${errors.year ? 'border-red-500' : ''}`}
                    />
                  </div>

                  <div>
                    <Label className={errors.price ? 'text-red-500' : ''}>Үнэ (₮) *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`mt-1 ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="10000000"
                    />
                  </div>

                  <div>
                    <Label>Гүйлт (км)</Label>
                    <Input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="mt-1"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.has_license_plate}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_license_plate: checked })}
                  />
                  <Label>Дугаар авсан эсэх</Label>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Техникийн үзүүлэлт</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Түлшний төрөл</Label>
                    <Select value={formData.fuel_type} onValueChange={(v) => setFormData({ ...formData, fuel_type: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Хурдны хайрцаг</Label>
                    <Select value={formData.transmission} onValueChange={(v) => setFormData({ ...formData, transmission: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSMISSIONS.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Төрөл</Label>
                    <Select value={formData.body_type} onValueChange={(v) => setFormData({ ...formData, body_type: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Хөтлөгч</Label>
                    <Select value={formData.drive_type} onValueChange={(v) => setFormData({ ...formData, drive_type: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Хөдөлгүүрийн багтаамж (cc)</Label>
                    <Input
                      type="number"
                      value={formData.engine_capacity}
                      onChange={(e) => setFormData({ ...formData, engine_capacity: e.target.value })}
                      className="mt-1"
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <Label>Орж ирсэн улс</Label>
                    <Select value={formData.origin_country} onValueChange={(v) => setFormData({ ...formData, origin_country: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORIGINS.map(origin => (
                          <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Гадна өнгө</Label>
                    <Input
                      value={formData.exterior_color}
                      onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                      className="mt-1"
                      placeholder="Цагаан"
                    />
                  </div>

                  <div>
                    <Label>Дотор өнгө</Label>
                    <Input
                      value={formData.interior_color}
                      onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })}
                      className="mt-1"
                      placeholder="Хар"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Зургууд</h3>
                
                <div>
                  <Label htmlFor="images" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Зураг оруулах</p>
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
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Онцлог, тоноглол</h3>

                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Жишээ: Цахилгаан суудал"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>Нэмэх</Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, idx) => (
                      <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {feature}
                        <button type="button" onClick={() => removeFeature(idx)}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Дэлгэрэнгүй тайлбар</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={4}
                  placeholder="Машины талаар дэлгэрэнгүй мэдээлэл..."
                />
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Холбоо барих</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Байршил</Label>
                    <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.contact_phone ? 'text-red-500' : ''}>Утас *</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className={`mt-1 ${errors.contact_phone ? 'border-red-500' : ''}`}
                      placeholder="99001122"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input
                      value={formData.contact_whatsapp}
                      onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                      className="mt-1"
                      placeholder="99001122"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Зар нэмэх
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}