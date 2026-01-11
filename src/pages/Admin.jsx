import React, { useState, useEffect } from 'react';
import { getCurrentUser, setUserRole } from '@/services/auth';
import { list as listCars, update as updateCar, remove as removeCar } from '@/services/cars';
import { list as listBusinesses, update as updateBusiness, remove as removeBusiness } from '@/services/businesses';
import { list as listMessages, markAsRead } from '@/services/messages';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { collection, getDocs, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { uploadFile } from '@/services/storage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Briefcase, Check, X, Eye, ShieldCheck, Download, Upload, FileJson, Database, TrendingUp, Loader2, FileSpreadsheet, Copy, Link as LinkIcon, Trash2, Edit, Star, ArrowUp, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function Admin() {
  // URL parameter-аас tab-ийг уншаад activeTab тохируулах
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'cars');
  
  // URL parameter өөрчлөгдөхөд activeTab шинэчлэх
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [catalogDownloadLink, setCatalogDownloadLink] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [permanentCatalogLink, setPermanentCatalogLink] = useState(null);
  const [isUpdatingCatalog, setIsUpdatingCatalog] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [editingBusinessId, setEditingBusinessId] = useState(null);
  const [deletingCarId, setDeletingCarId] = useState(null);
  const [deletingBusinessId, setDeletingBusinessId] = useState(null);
  const [vipingCarId, setVipingCarId] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Scroll to top button харагдах эсэхийг шалгах
  useEffect(() => {
    const handleScroll = () => {
      // "Бүх зар" талбар дээр байгаа эсэхийг шалгах
      if (activeTab === 'all-cars') {
        setShowScrollToTop(window.scrollY > 300);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Scroll to top функц
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
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

  const { data: pendingCars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['pendingCars'],
    queryFn: async () => {
      console.log('=== Fetching pending cars ===');
      try {
        const cars = await listCars({ status: 'pending' });
        console.log('Pending cars found:', cars.length);
        console.log('Pending cars data:', cars);
        
        // Debug: Check all cars to see their status
        const allCars = await listCars({});
        console.log('All cars count:', allCars.length);
        console.log('All cars status breakdown:', {
          pending: allCars.filter(c => c.status === 'pending').length,
          approved: allCars.filter(c => c.status === 'approved').length,
          rejected: allCars.filter(c => c.status === 'rejected').length,
          noStatus: allCars.filter(c => !c.status).length,
        });
        console.log('Sample cars with status:', allCars.slice(0, 3).map(c => ({ id: c.id, status: c.status, created_at: c.created_at })));
        
        return cars;
      } catch (error) {
        console.error('Error fetching pending cars:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: pendingBusinesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['pendingBusinesses'],
    queryFn: async () => {
      console.log('=== Fetching pending businesses ===');
      try {
        const businesses = await listBusinesses({ status: 'pending' });
        console.log('Pending businesses found:', businesses.length);
        console.log('Pending businesses data:', businesses);
        
        // Debug: Check all businesses to see their status
        const allBusinesses = await listBusinesses({});
        console.log('All businesses count:', allBusinesses.length);
        console.log('All businesses status breakdown:', {
          pending: allBusinesses.filter(b => b.status === 'pending').length,
          approved: allBusinesses.filter(b => b.status === 'approved').length,
          rejected: allBusinesses.filter(b => b.status === 'rejected').length,
          noStatus: allBusinesses.filter(b => !b.status).length,
        });
        console.log('Sample businesses with status:', allBusinesses.slice(0, 3).map(b => ({ id: b.id, status: b.status, created_at: b.created_at })));
        
        return businesses;
      } catch (error) {
        console.error('Error fetching pending businesses:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: topViewedCars = [] } = useQuery({
    queryKey: ['topViewedCars'],
    queryFn: async () => {
      const allCars = await listCars({ status: 'approved' });
      return allCars
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 10);
    }
  });

  // Хамгийн сүүлд баталсан зарууд (Facebook каталог зориулалттай)
  const { data: recentlyApprovedCars = [], isLoading: catalogLoading } = useQuery({
    queryKey: ['recentlyApprovedCars'],
    queryFn: async () => {
      const allCars = await listCars({ status: 'approved' });
      // created_at эсвэл updated_at дагуу эрэмбэлэх (сүүлд нэмэгдсэн эсвэл баталгаажсан)
      return allCars
        .sort((a, b) => {
          const aDate = a.updated_at || a.created_at || '';
          const bDate = b.updated_at || b.created_at || '';
          return bDate.localeCompare(aDate); // Шинэ нь эхэнд
        })
        .slice(0, 10); // Хамгийн сүүлийн 10 зар
    }
  });

  // Бүх зарууд
  const { data: allCars = [], isLoading: allCarsLoading } = useQuery({
    queryKey: ['allCars'],
    queryFn: async () => {
      return await listCars({});
    }
  });

  // Бүх бизнесүүд
  const { data: allBusinesses = [], isLoading: allBusinessesLoading } = useQuery({
    queryKey: ['allBusinesses'],
    queryFn: async () => {
      return await listBusinesses({});
    }
  });

  // VIP зарууд (is_featured === true)
  const { data: vipCars = [], isLoading: vipCarsLoading } = useQuery({
    queryKey: ['vipCars'],
    queryFn: async () => {
      const allCars = await listCars({});
      // VIP заруудыг шүүх (is_featured === true эсвэл 'true' эсвэл 1)
      return allCars.filter(car => {
        const isFeatured = 
          car.is_featured === true || 
          car.is_featured === 'true' || 
          car.is_featured === 1 ||
          car.is_featured === '1' ||
          String(car.is_featured).toLowerCase() === 'true';
        return isFeatured;
      });
    }
  });

  // Админ руу ирсэн мессежүүд
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['adminMessages', user?.email],
    queryFn: () => listMessages({ receiver_email: user?.email, orderBy: '-created_date' }),
    enabled: !!user?.email
  });

  // Мессеж уншсан гэж тэмдэглэх
  const markMessageAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      await markAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMessages', user?.email]);
    }
  });

  // Тогтмол каталогийн линк ачаалах
  const { data: catalogConfig } = useQuery({
    queryKey: ['catalogConfig'],
    queryFn: async () => {
      const configDoc = await getDoc(doc(db, 'config', 'facebook_catalog'));
      if (configDoc.exists()) {
        return configDoc.data();
      }
      return null;
    }
  });

  // Каталогийн линкийг Firestore дээр хадгалах
  useEffect(() => {
    if (catalogConfig?.permanent_link) {
      setPermanentCatalogLink(catalogConfig.permanent_link);
    }
  }, [catalogConfig]);

  // Каталогийг автоматаар шинэчлэх функц
  const updateCatalogAutomatically = async () => {
    try {
      // Бүх баталгаажсан машинуудыг авах
      const allCars = await listCars({ status: 'approved' });
      const sortedCars = allCars
        .sort((a, b) => {
          const aDate = a.updated_at || a.created_at || '';
          const bDate = b.updated_at || b.created_at || '';
          return bDate.localeCompare(aDate);
        }); // Бүх баталгаажсан машинуудыг авна

      if (sortedCars.length === 0) {
        return;
      }

      // Excel форматтай каталог үүсгэх
      const catalogData = sortedCars.map((car, index) => ({
        '№': index + 1,
        'Гарчиг': car.title || '',
        'Марк': car.make || '',
        'Загвар': car.model || '',
        'Он': car.year || '',
        'Үнэ': car.price ? new Intl.NumberFormat('mn-MN').format(car.price) + '₮' : '',
        'Гүйлт': car.mileage ? new Intl.NumberFormat('mn-MN').format(car.mileage) + ' км' : '',
        'Түлш': car.fuel_type === 'gasoline' ? 'Бензин' : car.fuel_type === 'diesel' ? 'Дизель' : car.fuel_type || '',
        'Хурдны хайрцаг': car.transmission === 'automatic' ? 'Автомат' : car.transmission === 'manual' ? 'Механик' : car.transmission || '',
        'Бие': car.body_type || '',
        'Өнгө': car.exterior_color || '',
        'Утас': car.contact_phone || '',
        'WhatsApp': car.contact_whatsapp || '',
        'Байршил': car.location === 'ulaanbaatar' ? 'Улаанбаатар' : car.location || '',
        'Зургийн URL': car.images?.[0] || '',
        'Дэлгэрэнгүй линк': `${window.location.origin}/CarDetails?id=${car.id}`,
        'Харагдсан тоо': car.view_count || 0,
        'Бүртгэгдсэн огноо': car.created_at ? new Date(car.created_at).toLocaleDateString('mn-MN') : '',
      }));

      // Excel файл үүсгэх
      const ws = XLSX.utils.json_to_sheet(catalogData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Каталог');
      
      // Column width тохируулах
      const colWidths = [
        { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 8 },
        { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 50 },
        { wch: 50 }, { wch: 12 }, { wch: 15 },
      ];
      ws['!cols'] = colWidths;
      
      // Excel файлыг blob болгох
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Тогтмол нэртэй файл руу upload хийх (шинэчлэгдэх боломжтой)
      const fileName = 'facebook_catalog_latest.xlsx';
      const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const uploadResult = await uploadFile(file, 'catalogs');
      const downloadURL = uploadResult.file_url;
      
      // Firestore дээр хадгалах
      await setDoc(doc(db, 'config', 'facebook_catalog'), {
        permanent_link: downloadURL,
        updated_at: new Date().toISOString(),
        car_count: sortedCars.length
      }, { merge: true });
      
      setPermanentCatalogLink(downloadURL);
      console.log('Каталог автоматаар шинэчлэгдлээ:', downloadURL);
    } catch (error) {
      console.error('Каталог шинэчлэхэд алдаа:', error);
      // Алдаа гарвал ч дуугарахгүй (background процесс)
    }
  };

  const approveCarMutation = useMutation({
    mutationFn: async (carId) => {
      await updateCar(carId, { status: 'approved' });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['topViewedCars']);
      queryClient.invalidateQueries(['recentlyApprovedCars']);
      
      // Каталогийг автоматаар шинэчлэх
      if (permanentCatalogLink) {
        setIsUpdatingCatalog(true);
        await updateCatalogAutomatically();
        setIsUpdatingCatalog(false);
      }
      
      toast.success('Зар баталгаажлаа');
    }
  });

  const rejectCarMutation = useMutation({
    mutationFn: async (carId) => {
      await updateCar(carId, { status: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']);
      toast.success('Зар цуцлагдлаа');
    }
  });

  const approveBusinessMutation = useMutation({
    mutationFn: async (businessId) => {
      await updateBusiness(businessId, { status: 'approved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingBusinesses']);
      queryClient.invalidateQueries(['businesses']);
      toast.success('Бизнес баталгаажлаа');
    }
  });

  const rejectBusinessMutation = useMutation({
    mutationFn: async (businessId) => {
      await updateBusiness(businessId, { status: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingBusinesses']);
      queryClient.invalidateQueries(['businesses']);
      toast.success('Бизнес цуцлагдлаа');
    }
  });

  // Бүх зарууд устгах
  const deleteCarMutation = useMutation({
    mutationFn: async (carId) => {
      await removeCar(carId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allCars']);
      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']);
      toast.success('Зар амжилттай устгагдлаа');
      setDeletingCarId(null);
    },
    onError: (error) => {
      toast.error('Зар устгахэд алдаа гарлаа: ' + error.message);
      setDeletingCarId(null);
    }
  });

  // Бүх бизнесүүд устгах
  const deleteBusinessMutation = useMutation({
    mutationFn: async (businessId) => {
      await removeBusiness(businessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allBusinesses']);
      queryClient.invalidateQueries(['pendingBusinesses']);
      queryClient.invalidateQueries(['businesses']);
      toast.success('Бизнес амжилттай устгагдлаа');
      setDeletingBusinessId(null);
    },
    onError: (error) => {
      toast.error('Бизнес устгахэд алдаа гарлаа: ' + error.message);
      setDeletingBusinessId(null);
    }
  });

  // Бүх зарууд засах
  const handleEditCar = (carId) => {
    // AddCar хуудас руу edit mode-оор шилжих, буцахад одоогийн талбар руу буцах
    const returnTo = activeTab || 'all-cars';
    window.location.href = createPageUrl(`AddCar?edit=${carId}&returnTo=${returnTo}`);
  };

  // Бүх бизнесүүд засах
  const handleEditBusiness = (businessId) => {
    // AddBusiness хуудас руу edit mode-оор шилжих
    window.location.href = createPageUrl(`AddBusiness?edit=${businessId}`);
  };

  // Бүх зарууд устгах
  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Та энэ зарыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.')) {
      return;
    }
    setDeletingCarId(carId);
    deleteCarMutation.mutate(carId);
  };

  // Бүх бизнесүүд устгах
  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm('Та энэ бизнесийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.')) {
      return;
    }
    setDeletingBusinessId(businessId);
    deleteBusinessMutation.mutate(businessId);
  };

  // Бүх зарууд VIP болгох/арилгах
  const vipCarMutation = useMutation({
    mutationFn: async ({ carId, isVip }) => {
      await updateCar(carId, { is_featured: isVip });
    },
    onSuccess: (_, variables) => {
      // Бүх query-уудыг шинэчлэх (Home хуудас дээрх query-г багтаасан)
      queryClient.invalidateQueries(['allCars']);
      queryClient.invalidateQueries(['vipCars']); // VIP зарууд query
      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']); // Home хуудас дээрх query
      queryClient.invalidateQueries(['cars', 'ADMIN']); // Admin-ийн query
      queryClient.invalidateQueries(['latestCarsHero']); // HeroSection query
      queryClient.invalidateQueries(['featuredCarsHero']); // Featured cars query
      toast.success(variables.isVip ? 'Зар VIP болгогдлоо!' : 'VIP арилгагдлаа!');
      setVipingCarId(null);
    },
    onError: (error) => {
      toast.error('VIP тохиргоо өөрчлөхөд алдаа гарлаа: ' + error.message);
      setVipingCarId(null);
    }
  });

  // Бүх зарууд VIP болгох handler
  const handleVipCar = async (carId, isVip = true) => {
    setVipingCarId(carId);
    vipCarMutation.mutate({ carId, isVip });
  };

  const exportCarsToFile = async () => {
    setIsExporting(true);
    try {
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      const carsData = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const dataStr = JSON.stringify(carsData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cars_export_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`${carsData.length} зар экспорт хийгдлээ`);
    } catch (error) {
      toast.error('Экспорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsExporting(false);
  };

  const importCarsFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const carsData = JSON.parse(text);
      
      if (!Array.isArray(carsData)) {
        throw new Error('Файлын формат буруу байна');
      }

      let imported = 0;
      for (const car of carsData) {
        const { id, ...carData } = car;
        await addDoc(collection(db, 'cars'), carData);
        imported++;
      }

      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']);
      toast.success(`${imported} зар амжилттай импорт хийгдлээ`);
      event.target.value = '';
    } catch (error) {
      toast.error('Импорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsImporting(false);
  };

  const exportBusinessesToFile = async () => {
    setIsExporting(true);
    try {
      const businessesSnapshot = await getDocs(collection(db, 'businesses'));
      const businessesData = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const dataStr = JSON.stringify(businessesData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `businesses_export_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`${businessesData.length} бизнес экспорт хийгдлээ`);
    } catch (error) {
      toast.error('Экспорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsExporting(false);
  };

  const importBusinessesFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const businessesData = JSON.parse(text);
      
      if (!Array.isArray(businessesData)) {
        throw new Error('Файлын формат буруу байна');
      }

      let imported = 0;
      for (const business of businessesData) {
        const { id, ...businessData } = business;
        await addDoc(collection(db, 'businesses'), businessData);
        imported++;
      }

      queryClient.invalidateQueries(['pendingBusinesses']);
      queryClient.invalidateQueries(['businesses']);
      toast.success(`${imported} бизнес амжилттай импорт хийгдлээ`);
      event.target.value = '';
    } catch (error) {
      toast.error('Импорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsImporting(false);
  };

  // Excel экспорт/импорт функцүүд
  const exportCarsToExcel = async () => {
    setIsExporting(true);
    try {
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      const carsData = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Excel формат руу хөрвүүлэх
      const excelData = carsData.map(car => ({
        'ID': car.id || '',
        'Гарчиг': car.title || '',
        'Марк': car.make || '',
        'Загвар': car.model || '',
        'Он': car.year || '',
        'Үнэ': car.price || '',
        'Гүйлт': car.mileage || '',
        'Түлш': car.fuel_type === 'gasoline' ? 'Бензин' : car.fuel_type === 'diesel' ? 'Дизель' : car.fuel_type || '',
        'Хурдны хайрцаг': car.transmission === 'automatic' ? 'Автомат' : car.transmission === 'manual' ? 'Механик' : car.transmission || '',
        'Бие': car.body_type || '',
        'Хөдөлгүүрийн багтаамж': car.engine_capacity || '',
        'Хөтлөх төрөл': car.drive_type || '',
        'Гарал үүсэл': car.origin_country || '',
        'Гадаад өнгө': car.exterior_color || '',
        'Дотоод өнгө': car.interior_color || '',
        'Тайлбар': car.description || '',
        'Зургууд': car.images ? car.images.join('; ') : '',
        'Байршил': car.location || '',
        'Утас': car.contact_phone || '',
        'WhatsApp': car.contact_whatsapp || '',
        'Төлөв': car.status || '',
        'Харагдсан тоо': car.view_count || 0,
        'Бүртгэгдсэн огноо': car.created_at || '',
        'Шинэчлэгдсэн огноо': car.updated_at || '',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Зарууд');
      
      // Column width тохируулах
      ws['!cols'] = [
        { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 8 },
        { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 50 }, { wch: 50 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
      ];
      
      const fileName = `cars_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`${carsData.length} зар Excel форматтай экспорт хийгдлээ`);
    } catch (error) {
      toast.error('Excel экспорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsExporting(false);
  };

  const importCarsFromExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('Файл хоосон эсвэл формат буруу байна');
      }

      let imported = 0;
      for (const row of jsonData) {
        // Excel-ээс Firestore формат руу хөрвүүлэх
        const carData = {
          title: row['Гарчиг'] || row['title'] || '',
          make: row['Марк'] || row['make'] || '',
          model: row['Загвар'] || row['model'] || '',
          year: row['Он'] || row['year'] || null,
          price: row['Үнэ'] || row['price'] || null,
          mileage: row['Гүйлт'] || row['mileage'] || null,
          fuel_type: row['Түлш'] === 'Бензин' ? 'gasoline' : row['Түлш'] === 'Дизель' ? 'diesel' : row['Түлш'] || row['fuel_type'] || '',
          transmission: row['Хурдны хайрцаг'] === 'Автомат' ? 'automatic' : row['Хурдны хайрцаг'] === 'Механик' ? 'manual' : row['Хурдны хайрцаг'] || row['transmission'] || '',
          body_type: row['Бие'] || row['body_type'] || '',
          engine_capacity: row['Хөдөлгүүрийн багтаамж'] || row['engine_capacity'] || null,
          drive_type: row['Хөтлөх төрөл'] || row['drive_type'] || '',
          origin_country: row['Гарал үүсэл'] || row['origin_country'] || '',
          exterior_color: row['Гадаад өнгө'] || row['exterior_color'] || '',
          interior_color: row['Дотоод өнгө'] || row['interior_color'] || '',
          description: row['Тайлбар'] || row['description'] || '',
          images: row['Зургууд'] ? String(row['Зургууд']).split(';').map(url => url.trim()).filter(Boolean) : [],
          location: row['Байршил'] || row['location'] || '',
          contact_phone: row['Утас'] || row['contact_phone'] || '',
          contact_whatsapp: row['WhatsApp'] || row['contact_whatsapp'] || '',
          status: row['Төлөв'] || row['status'] || 'pending',
          view_count: row['Харагдсан тоо'] || row['view_count'] || 0,
          created_at: row['Бүртгэгдсэн огноо'] || row['created_at'] || new Date().toISOString(),
          updated_at: row['Шинэчлэгдсэн огноо'] || row['updated_at'] || new Date().toISOString(),
        };

        await addDoc(collection(db, 'cars'), carData);
        imported++;
      }

      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']);
      toast.success(`${imported} зар Excel файлаас амжилттай импорт хийгдлээ`);
      event.target.value = '';
    } catch (error) {
      toast.error('Excel импорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsImporting(false);
  };

  const importCarsFromCSV = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // XLSX сан нь CSV файлыг ч уншиж чадна
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_json(worksheet);

      if (!Array.isArray(csvData) || csvData.length === 0) {
        throw new Error('CSV файл хоосон эсвэл формат буруу байна');
      }

      // Debug: Баганы нэрийг хэвлэх
      if (csvData.length > 0) {
        console.log('CSV баганы нэрүүд:', Object.keys(csvData[0]));
        console.log('Эхний мөр:', csvData[0]);
      }

      let imported = 0;
      let skipped = 0;

      for (const row of csvData) {
        try {
          // CSV баганауудыг машин зарын талбаруудтай холбох
          // Шинэ формат: model, year, mileage_kr, fuel, price_krw, image_link, image_linkonal_image_link
          // Хуучин формат: title, price_krw, cover_image_url, images_sample (pipe-separated)
          
          // Зургуудыг боловсруулах (comma эсвэл pipe-separated URLs)
          let images = [];
          
          // image_link-г нүүрний зураг (эхний зураг) болгох
          if (row['image_link']) {
            const coverImage = String(row['image_link']).trim();
            if (coverImage && (coverImage.startsWith('http') || coverImage.startsWith('https'))) {
              images.push(coverImage);
              console.log('Added cover image from image_link:', coverImage.substring(0, 50));
            }
          }
          
          // additional_image_link-г нэмэлт зургууд болгох
          const rowKeys = Object.keys(row);
          const additionalImageKey = rowKeys.find(key => 
            key.toLowerCase() === 'additional_image_link' ||
            key.toLowerCase().includes('additional_image')
          );
          
          if (additionalImageKey) {
            const additionalImagesStr = String(row[additionalImageKey] || '').trim();
            if (additionalImagesStr) {
              console.log('Found additional_image_link:', additionalImageKey, 'Value length:', additionalImagesStr.length);
              
              // Comma эсвэл pipe-separated URLs-г массив болгох
              const separator = additionalImagesStr.includes('|') ? '|' : ',';
              const rawImages = additionalImagesStr.split(separator);
              console.log('Split into', rawImages.length, 'parts');
              
              const additionalImages = rawImages
                .map(url => url.trim())
                .filter(url => {
                  const isValid = url && (url.startsWith('http') || url.startsWith('https'));
                  if (!isValid && url) {
                    console.log('Filtered out invalid URL:', url.substring(0, 50));
                  }
                  return isValid;
                });
              
              // Нэмэлт зургуудыг нэмэх (нүүрний зургийн дараа)
              images = [...images, ...additionalImages];
              console.log('Final images count:', images.length);
            }
          } else if (row['image_linkonal_image_link']) {
            // Хуучин формат: image_linkonal_image_link
            const imageLinkValue = String(row['image_linkonal_image_link'] || '').trim();
            if (imageLinkValue) {
              const separator = imageLinkValue.includes('|') ? '|' : ',';
              const additionalImages = imageLinkValue
                .split(separator)
                .map(url => url.trim())
                .filter(url => url && (url.startsWith('http') || url.startsWith('https')));
              
              // Хэрэв нүүрний зураг байхгүй бол эхний зургийг нүүрний зураг болгох
              if (images.length === 0 && additionalImages.length > 0) {
                images.push(additionalImages[0]);
                if (additionalImages.length > 1) {
                  images = [...images, ...additionalImages.slice(1)];
                }
              } else {
                images = [...images, ...additionalImages];
              }
            }
          }
          
          // Хуучин формат: images_sample (pipe-separated)
          if (images.length === 0 && row['images_sample']) {
            images = String(row['images_sample'])
              .split('|')
              .map(url => url.trim())
              .filter(url => url && url.startsWith('http'));
          }
          
          // cover_image_url-г эхний зураг болгох (хэрэв images_sample байхгүй бол)
          if (images.length === 0 && row['cover_image_url']) {
            const coverUrl = String(row['cover_image_url']).trim();
            if (coverUrl && coverUrl.startsWith('http')) {
              images.push(coverUrl);
            }
          }

          // Үнэг боловсруулах (Korean Won-г төгрөг рүү хөрвүүлэх)
          let price = null;
          if (row['price_krw']) {
            const priceValue = parseFloat(String(row['price_krw']).replace(/[^0-9.-]/g, ''));
            if (!isNaN(priceValue) && priceValue > 0) {
              // Korean Won-г төгрөг рүү хөрвүүлэх (1 KRW ≈ 1.5 MNT)
              price = Math.round(priceValue * 1.5);
            }
          }

          // Гүйлт боловсруулах (mileage_km, mileage_kr, эсвэл mileage)
          let mileage = null;
          const mileageValue = row['mileage_km'] || row['mileage_kr'] || row['mileage'] || row['mileage_km'];
          if (mileageValue !== undefined && mileageValue !== null && mileageValue !== '') {
            const mileageNum = parseFloat(String(mileageValue).replace(/[^0-9.-]/g, ''));
            if (!isNaN(mileageNum) && mileageNum >= 0) {
              mileage = Math.round(mileageNum);
            }
          }

          // Түлшний төрөл боловсруулах (fuel)
          let fuel_type = 'gasoline';
          if (row['fuel']) {
            const fuelStr = String(row['fuel']).toLowerCase();
            if (fuelStr.includes('gasoline') || fuelStr.includes('бензин')) {
              fuel_type = 'gasoline';
            } else if (fuelStr.includes('diesel') || fuelStr.includes('дизель')) {
              fuel_type = 'diesel';
            } else if (fuelStr.includes('hybrid')) {
              fuel_type = 'hybrid';
            } else if (fuelStr.includes('electric')) {
              fuel_type = 'electric';
            } else if (fuelStr.includes('lpg')) {
              fuel_type = 'lpg';
            }
          }

          // Он боловсруулах (year)
          let year = null;
          if (row['year']) {
            const yearValue = parseInt(String(row['year']));
            if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= new Date().getFullYear() + 1) {
              year = yearValue;
            }
          }

          // Загвар, марк, гарчиг боловсруулах
          let modelStr = String(row['model'] || '').trim();
          
          // "Encar - Dream Car Platform Encar" гэх текстийг арилгах
          modelStr = modelStr
            .replace(/:\s*Encar\s*-\s*Dream\s*Car\s*Platform\s*Encar/gi, '')
            .replace(/Encar\s*-\s*Dream\s*Car\s*Platform\s*Encar/gi, '')
            .replace(/\s*:\s*Encar.*$/gi, '')
            .trim();
          
          let make = '';
          let model = '';
          let title = '';

          // Model-аас марк, загварыг олж авах
          if (modelStr) {
            const makes = [
              'Toyota', 'Honda', 'Lexus', 'BMW', 'Mercedes-Benz', 'Mercedes', 'Audi', 
              'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Ford', 'Chevrolet', 'Volkswagen', 
              'Subaru', 'Mitsubishi', 'Suzuki', 'Jeep', 'Wrangler', 'Tiguan', 'Cooper', 
              'Mini', 'MKZ', 'Lincoln', 'S-Class', 'GLC-Class', 'C-Class', 'XC90', 
              'Volvo', 'Bentley', 'Flying Spur', '5 Series'
            ];
            
            for (const m of makes) {
              if (modelStr.toLowerCase().includes(m.toLowerCase())) {
                make = m;
                // Загварыг model-аас олох
                const modelParts = modelStr.split(' ');
                const makeIndex = modelParts.findIndex(part => part.toLowerCase().includes(m.toLowerCase()));
                if (makeIndex >= 0 && makeIndex < modelParts.length - 1) {
                  model = modelParts.slice(makeIndex + 1).join(' ').substring(0, 50);
                } else {
                  model = modelStr.substring(0, 50);
                }
                break;
              }
            }
            
            // Хэрэв марк олдохгүй бол model-г бүхэлд нь ашиглах
            if (!make) {
              model = modelStr.substring(0, 50);
            }
            
            // Гарчиг үүсгэх
            title = year ? `${year} ${modelStr}` : modelStr;
          }

          // Хуучин формат: title багана байвал ашиглах
          if (row['title']) {
            let titleStr = String(row['title']).trim();
            
            // "Encar - Dream Car Platform Encar" гэх текстийг арилгах
            titleStr = titleStr
              .replace(/:\s*Encar\s*-\s*Dream\s*Car\s*Platform\s*Encar/gi, '')
              .replace(/Encar\s*-\s*Dream\s*Car\s*Platform\s*Encar/gi, '')
              .replace(/\s*:\s*Encar.*$/gi, '')
              .trim();
            
            title = titleStr;
            
            // Title-аас марк, загварыг олж авах
            if (title && !make) {
              const makes = ['Toyota', 'Honda', 'Lexus', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Ford', 'Chevrolet', 'Volkswagen', 'Subaru', 'Mitsubishi', 'Suzuki', 'Jeep', 'Wrangler', 'Tiguan', 'Cooper', 'MKZ', 'S-Class', 'GLC-Class', 'C-Class', 'XC90'];
              for (const m of makes) {
                if (title.toLowerCase().includes(m.toLowerCase())) {
                  make = m;
                  break;
                }
              }
            }
          }

          // Машин зарын өгөгдөл үүсгэх
          const carData = {
            title: title || 'Зар',
            make: make || '',
            model: model || '',
            year: year || new Date().getFullYear(),
            price: price || 0,
            mileage: mileage || null,
            has_license_plate: false,
            fuel_type: fuel_type,
            transmission: 'automatic',
            body_type: 'sedan',
            engine_capacity: null,
            drive_type: 'fwd',
            origin_country: 'korea',
            exterior_color: '',
            interior_color: '',
            description: title || '',
            images: images,
            features: [],
            location: 'ulaanbaatar',
            contact_phone: '',
            contact_whatsapp: '',
            status: user?.role === 'ADMIN' ? 'approved' : 'pending',
            view_count: 0,
            created_at: new Date().toISOString(),
            created_by: user?.email || '',
          };

          // Хэрэв title эсвэл model байхгүй бол алгасах
          if ((!carData.title || carData.title === 'Зар') && !modelStr) {
            skipped++;
            continue;
          }

          await addDoc(collection(db, 'cars'), carData);
          imported++;
        } catch (rowError) {
          console.error('Error importing row:', rowError, row);
          skipped++;
        }
      }

      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['allCars']);
      
      if (skipped > 0) {
        toast.success(`${imported} зар импорт хийгдлээ, ${skipped} мөр алгасагдлаа`);
      } else {
        toast.success(`${imported} зар CSV файлаас амжилттай импорт хийгдлээ`);
      }
      
      event.target.value = '';
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error('CSV импорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsImporting(false);
  };

  const exportBusinessesToExcel = async () => {
    setIsExporting(true);
    try {
      const businessesSnapshot = await getDocs(collection(db, 'businesses'));
      const businessesData = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Excel формат руу хөрвүүлэх
      const excelData = businessesData.map(business => ({
        'ID': business.id || '',
        'Нэр': business.name || '',
        'Төрөл': business.type || '',
        'Ангилал': business.category || '',
        'Тайлбар': business.description || '',
        'Утас': business.phone || '',
        'WhatsApp': business.whatsapp || '',
        'Хаяг': business.address || '',
        'Дугуйны өргөн': business.tire_width || '',
        'Дугуйны профиль': business.tire_profile || '',
        'Дугуйны обод': business.tire_rim || '',
        'Үнэ': business.price || '',
        'Зургууд': business.images ? business.images.join('; ') : '',
        'Төлөв': business.status || '',
        'Харагдсан тоо': business.view_count || 0,
        'Бүртгэгдсэн огноо': business.created_at || '',
        'Шинэчлэгдсэн огноо': business.updated_at || '',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Бизнесүүд');
      
      // Column width тохируулах
      ws['!cols'] = [
        { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 50 },
        { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 50 }, { wch: 12 }, { wch: 12 },
        { wch: 20 }, { wch: 20 },
      ];
      
      const fileName = `businesses_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`${businessesData.length} бизнес Excel форматтай экспорт хийгдлээ`);
    } catch (error) {
      toast.error('Excel экспорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsExporting(false);
  };

  const importBusinessesFromExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('Файл хоосон эсвэл формат буруу байна');
      }

      let imported = 0;
      for (const row of jsonData) {
        // Excel-ээс Firestore формат руу хөрвүүлэх
        const businessData = {
          name: row['Нэр'] || row['name'] || '',
          type: row['Төрөл'] || row['type'] || '',
          category: row['Ангилал'] || row['category'] || '',
          description: row['Тайлбар'] || row['description'] || '',
          phone: row['Утас'] || row['phone'] || '',
          whatsapp: row['WhatsApp'] || row['whatsapp'] || '',
          address: row['Хаяг'] || row['address'] || '',
          tire_width: row['Дугуйны өргөн'] || row['tire_width'] || null,
          tire_profile: row['Дугуйны профиль'] || row['tire_profile'] || null,
          tire_rim: row['Дугуйны обод'] || row['tire_rim'] || null,
          price: row['Үнэ'] || row['price'] || null,
          images: row['Зургууд'] ? String(row['Зургууд']).split(';').map(url => url.trim()).filter(Boolean) : [],
          status: row['Төлөв'] || row['status'] || 'pending',
          view_count: row['Харагдсан тоо'] || row['view_count'] || 0,
          created_at: row['Бүртгэгдсэн огноо'] || row['created_at'] || new Date().toISOString(),
          updated_at: row['Шинэчлэгдсэн огноо'] || row['updated_at'] || new Date().toISOString(),
        };

        await addDoc(collection(db, 'businesses'), businessData);
        imported++;
      }

      queryClient.invalidateQueries(['pendingBusinesses']);
      queryClient.invalidateQueries(['businesses']);
      toast.success(`${imported} бизнес Excel файлаас амжилттай импорт хийгдлээ`);
      event.target.value = '';
    } catch (error) {
      toast.error('Excel импорт хийхэд алдаа гарлаа: ' + error.message);
    }
    setIsImporting(false);
  };

  const loadSampleData = async () => {
    setIsLoadingSamples(true);
    try {
      const sampleCars = [
        { title: "2020 Toyota Camry XLE", make: "Toyota", model: "Camry", year: 2020, price: 45000000, mileage: 35000, has_license_plate: true, fuel_type: "gasoline", transmission: "automatic", body_type: "sedan", engine_capacity: 2500, drive_type: "fwd", origin_country: "japan", exterior_color: "Цагаан", interior_color: "Хар", description: "Маш сайн байдалтай, нэг эзэмшигчтэй машин", images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"], features: ["Арын камер", "Цахилгаан суудал", "Салон халаагуур", "Smart Key"], location: "ulaanbaatar", contact_phone: "99001122", contact_whatsapp: "99001122", status: "approved", view_count: 234, created_at: new Date().toISOString() },
        { title: "2019 Lexus RX350", make: "Lexus", model: "RX350", year: 2019, price: 75000000, mileage: 28000, has_license_plate: true, fuel_type: "gasoline", transmission: "automatic", body_type: "suv", engine_capacity: 3500, drive_type: "awd", origin_country: "japan", exterior_color: "Хар", interior_color: "Бор", description: "VIP машин, бүх тохижилт байгаа", images: ["https://images.unsplash.com/photo-1623520527569-fee1da87c01a?w=800", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"], features: ["Арын камер", "Панорам дээвэр", "Навигаци", "Савны халаагуур", "Massage суудал"], location: "ulaanbaatar", contact_phone: "88112233", contact_whatsapp: "88112233", status: "approved", view_count: 456, created_at: new Date().toISOString() },
        { title: "2021 Hyundai Palisade", make: "Hyundai", model: "Palisade", year: 2021, price: 65000000, mileage: 15000, has_license_plate: true, fuel_type: "diesel", transmission: "automatic", body_type: "suv", engine_capacity: 2200, drive_type: "awd", origin_country: "korea", exterior_color: "Саарал", interior_color: "Хар", description: "7 суудалтай гэр бүлийн машин", images: ["https://images.unsplash.com/photo-1619976215249-c32998c87ae0?w=800"], features: ["7 суудал", "Арын камер", "Smart Key", "Халаадаг суудал"], location: "ulaanbaatar", contact_phone: "99887766", status: "approved", view_count: 189, created_at: new Date().toISOString() },
        { title: "2018 BMW X5", make: "BMW", model: "X5", year: 2018, price: 58000000, mileage: 45000, has_license_plate: true, fuel_type: "diesel", transmission: "automatic", body_type: "suv", engine_capacity: 3000, drive_type: "awd", origin_country: "germany", exterior_color: "Цэнхэр", interior_color: "Цагаан", description: "Спорт хувилбар, гайхалтай хурдатай", images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"], features: ["M Sport Package", "Панорам дээвэр", "HUD Display", "Харман Кардон"], location: "ulaanbaatar", contact_phone: "99123456", status: "approved", view_count: 312, created_at: new Date().toISOString() },
        { title: "2022 Kia K5", make: "Kia", model: "K5", year: 2022, price: 42000000, mileage: 8000, has_license_plate: true, fuel_type: "gasoline", transmission: "automatic", body_type: "sedan", engine_capacity: 2000, drive_type: "fwd", origin_country: "korea", exterior_color: "Улаан", interior_color: "Хар", description: "Шинэ машин, баталгаатай", images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"], features: ["Арын камер", "Smart Key", "LED гэрэл"], location: "ulaanbaatar", contact_phone: "88998877", status: "approved", view_count: 145, created_at: new Date().toISOString() }
      ];

      const sampleBusinesses = [
        { name: "Токио Авто Сэлбэг", type: "parts", category: "Хөдөлгүүр", description: "Япон машины сэлбэг хэрэгслийн дэлгүүр. Бүх төрлийн сэлбэг нөөцтэй.", phone: "77112233", whatsapp: "77112233", address: "Улаанбаатар хот, Баянзүрх дүүрэг", status: "approved", view_count: 89, created_at: new Date().toISOString() },
        { name: "БМВ Мастер", type: "repair", category: "Хөдөлгүүрийн засвар", description: "Герман машины мэргэжлийн засварын газар. 15 жилийн туршлагатай.", phone: "99887744", whatsapp: "99887744", address: "Улаанбаатар хот, Сүхбаатар дүүрэг", status: "approved", view_count: 123, created_at: new Date().toISOString() },
        { name: "Дугуй Маркет", type: "tires", category: "Зуны дугуй", description: "Michelin, Bridgestone, Continental дугуй борлуулна.", phone: "88776655", address: "Улаанбаатар хот, Чингэлтэй дүүрэг", tire_width: 225, tire_profile: 55, tire_rim: 17, price: 350000, status: "approved", view_count: 67, created_at: new Date().toISOString() },
        { name: "Авто Спа", type: "service", category: "Угаалга", description: "Детайлинг үйлчилгээ, VIP угаалга, полироль", phone: "99112288", whatsapp: "99112288", address: "Улаанбаатар хот, Хан-Уул дүүрэг", status: "approved", view_count: 45, created_at: new Date().toISOString() },
        { name: "Корей Сэлбэг Төв", type: "parts", category: "Явах эд анги", description: "Hyundai, Kia машины анхны сэлбэг", phone: "88991122", address: "Улаанбаатар хот, Баянгол дүүрэг", status: "approved", view_count: 78, created_at: new Date().toISOString() }
      ];

      let carsAdded = 0;
      for (const car of sampleCars) {
        await addDoc(collection(db, 'cars'), car);
        carsAdded++;
      }

      let businessesAdded = 0;
      for (const business of sampleBusinesses) {
        await addDoc(collection(db, 'businesses'), business);
        businessesAdded++;
      }

      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['businesses']);
      queryClient.invalidateQueries(['pendingCars']);
      queryClient.invalidateQueries(['pendingBusinesses']);
      queryClient.invalidateQueries(['topViewedCars']);
      toast.success(`${carsAdded} машин ба ${businessesAdded} бизнес нэмэгдлээ!`);
    } catch (error) {
      toast.error('Алдаа гарлаа: ' + error.message);
    }
    setIsLoadingSamples(false);
  };

  // Facebook каталог үүсгэх
  const generateFacebookCatalog = async () => {
    setIsGeneratingCatalog(true);
    try {
      const cars = recentlyApprovedCars;
      
      if (cars.length === 0) {
        toast.error('Баталгаажсан зар байхгүй байна');
        setIsGeneratingCatalog(false);
        return;
      }

      // Excel форматтай каталог үүсгэх
      const catalogData = cars.map((car, index) => ({
        '№': index + 1,
        'Гарчиг': car.title || '',
        'Марк': car.make || '',
        'Загвар': car.model || '',
        'Он': car.year || '',
        'Үнэ': car.price ? new Intl.NumberFormat('mn-MN').format(car.price) + '₮' : '',
        'Гүйлт': car.mileage ? new Intl.NumberFormat('mn-MN').format(car.mileage) + ' км' : '',
        'Түлш': car.fuel_type === 'gasoline' ? 'Бензин' : car.fuel_type === 'diesel' ? 'Дизель' : car.fuel_type || '',
        'Хурдны хайрцаг': car.transmission === 'automatic' ? 'Автомат' : car.transmission === 'manual' ? 'Механик' : car.transmission || '',
        'Бие': car.body_type || '',
        'Өнгө': car.exterior_color || '',
        'Утас': car.contact_phone || '',
        'WhatsApp': car.contact_whatsapp || '',
        'Байршил': car.location === 'ulaanbaatar' ? 'Улаанбаатар' : car.location || '',
        'Зургийн URL': car.images?.[0] || '',
        'Дэлгэрэнгүй линк': `${window.location.origin}/CarDetails?id=${car.id}`,
        'Харагдсан тоо': car.view_count || 0,
        'Бүртгэгдсэн огноо': car.created_at ? new Date(car.created_at).toLocaleDateString('mn-MN') : '',
      }));

      // Excel файл үүсгэх
      const ws = XLSX.utils.json_to_sheet(catalogData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Каталог');
      
      // Column width тохируулах
      const colWidths = [
        { wch: 5 },   // №
        { wch: 30 },  // Гарчиг
        { wch: 15 },  // Марк
        { wch: 15 },  // Загвар
        { wch: 8 },   // Он
        { wch: 15 },  // Үнэ
        { wch: 12 },  // Гүйлт
        { wch: 10 },  // Түлш
        { wch: 12 },  // Хурдны хайрцаг
        { wch: 12 },  // Бие
        { wch: 10 },  // Өнгө
        { wch: 12 },  // Утас
        { wch: 12 },  // WhatsApp
        { wch: 15 },  // Байршил
        { wch: 50 },  // Зургийн URL
        { wch: 50 },  // Дэлгэрэнгүй линк
        { wch: 12 },  // Харагдсан тоо
        { wch: 15 },  // Бүртгэгдсэн огноо
      ];
      ws['!cols'] = colWidths;
      
      const fileName = `facebook_catalog_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`${cars.length} зарын каталог амжилттай үүсгэгдлээ!`);
    } catch (error) {
      console.error('Catalog generation error:', error);
      toast.error('Каталог үүсгэхэд алдаа гарлаа: ' + error.message);
    }
    setIsGeneratingCatalog(false);
  };

  // Тогтмол каталогийн линк үүсгэх (Facebook page-д холбох)
  const generatePermanentCatalogLink = async () => {
    setIsGeneratingLink(true);
    try {
      await updateCatalogAutomatically();
      toast.success('Тогтмол каталогийн линк үүсгэгдлээ! Энэ линкийг Facebook page дээр ашиглана уу.');
    } catch (error) {
      console.error('Permanent link generation error:', error);
      toast.error('Линк үүсгэхэд алдаа гарлаа: ' + error.message);
    }
    setIsGeneratingLink(false);
  };

  // Каталог татах линк үүсгэх (түр хувилбар)
  const generateCatalogDownloadLink = async () => {
    setIsGeneratingLink(true);
    try {
      const cars = recentlyApprovedCars;
      
      if (cars.length === 0) {
        toast.error('Баталгаажсан зар байхгүй байна');
        setIsGeneratingLink(false);
        return;
      }

      // Excel форматтай каталог үүсгэх
      const catalogData = cars.map((car, index) => ({
        '№': index + 1,
        'Гарчиг': car.title || '',
        'Марк': car.make || '',
        'Загвар': car.model || '',
        'Он': car.year || '',
        'Үнэ': car.price ? new Intl.NumberFormat('mn-MN').format(car.price) + '₮' : '',
        'Гүйлт': car.mileage ? new Intl.NumberFormat('mn-MN').format(car.mileage) + ' км' : '',
        'Түлш': car.fuel_type === 'gasoline' ? 'Бензин' : car.fuel_type === 'diesel' ? 'Дизель' : car.fuel_type || '',
        'Хурдны хайрцаг': car.transmission === 'automatic' ? 'Автомат' : car.transmission === 'manual' ? 'Механик' : car.transmission || '',
        'Бие': car.body_type || '',
        'Өнгө': car.exterior_color || '',
        'Утас': car.contact_phone || '',
        'WhatsApp': car.contact_whatsapp || '',
        'Байршил': car.location === 'ulaanbaatar' ? 'Улаанбаатар' : car.location || '',
        'Зургийн URL': car.images?.[0] || '',
        'Дэлгэрэнгүй линк': `${window.location.origin}/CarDetails?id=${car.id}`,
        'Харагдсан тоо': car.view_count || 0,
        'Бүртгэгдсэн огноо': car.created_at ? new Date(car.created_at).toLocaleDateString('mn-MN') : '',
      }));

      // Excel файл үүсгэх
      const ws = XLSX.utils.json_to_sheet(catalogData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Каталог');
      
      // Column width тохируулах
      const colWidths = [
        { wch: 5 },   // №
        { wch: 30 },  // Гарчиг
        { wch: 15 },  // Марк
        { wch: 15 },  // Загвар
        { wch: 8 },   // Он
        { wch: 15 },  // Үнэ
        { wch: 12 },  // Гүйлт
        { wch: 10 },  // Түлш
        { wch: 12 },  // Хурдны хайрцаг
        { wch: 12 },  // Бие
        { wch: 10 },  // Өнгө
        { wch: 12 },  // Утас
        { wch: 12 },  // WhatsApp
        { wch: 15 },  // Байршил
        { wch: 50 },  // Зургийн URL
        { wch: 50 },  // Дэлгэрэнгүй линк
        { wch: 12 },  // Харагдсан тоо
        { wch: 15 },  // Бүртгэгдсэн огноо
      ];
      ws['!cols'] = colWidths;
      
      // Excel файлыг blob болгох
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Firebase Storage руу upload хийх
      const fileName = `facebook_catalog_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const uploadResult = await uploadFile(file, 'catalogs');
      const downloadURL = uploadResult.file_url;
      
      setCatalogDownloadLink(downloadURL);
      toast.success('Каталог татах линк үүсгэгдлээ! Линкийг хуваалцаж болно.');
    } catch (error) {
      console.error('Link generation error:', error);
      toast.error('Линк үүсгэхэд алдаа гарлаа: ' + error.message);
    }
    setIsGeneratingLink(false);
  };

  // Линкийг хуулах
  const copyCatalogLink = async () => {
    if (!catalogDownloadLink) {
      toast.error('Эхлээд линк үүсгэх хэрэгтэй');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(catalogDownloadLink);
      toast.success('Линк хуулагдлаа!');
    } catch (error) {
      // Fallback: textarea ашиглах
      const textarea = document.createElement('textarea');
      textarea.value = catalogDownloadLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Линк хуулагдлаа!');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Хандах эрхгүй</h2>
            <p className="text-gray-500 mb-6">Энэ хуудас зөвхөн админд зориулагдсан</p>
            <Link to={createPageUrl('Home')}>
              <Button>Нүүр хуудас руу буцах</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ удирдлага</h1>
              <p className="text-gray-500">Зар болон бизнесүүдийг батлах/цуцлах</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={exportCarsToFile} disabled={isExporting} variant="outline" className="gap-2" size="sm">
                <FileJson className="w-4 h-4" />
                Зарууд (JSON)
              </Button>
              <Button onClick={exportCarsToExcel} disabled={isExporting} variant="outline" className="gap-2" size="sm">
                <FileSpreadsheet className="w-4 h-4" />
                Зарууд (Excel)
              </Button>
              <Button asChild variant="outline" className="gap-2" size="sm">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Зарууд (JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={importCarsFromFile}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </Button>
              <Button asChild variant="outline" className="gap-2" size="sm">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Зарууд (Excel)
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={importCarsFromExcel}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </Button>
              <Button asChild variant="outline" className="gap-2 bg-blue-50" size="sm">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Зарууд (CSV)
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importCarsFromCSV}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </Button>
              <Button onClick={exportBusinessesToFile} disabled={isExporting} variant="outline" className="gap-2 bg-green-50" size="sm">
                <FileJson className="w-4 h-4" />
                Бизнес (JSON)
              </Button>
              <Button onClick={exportBusinessesToExcel} disabled={isExporting} variant="outline" className="gap-2 bg-green-50" size="sm">
                <FileSpreadsheet className="w-4 h-4" />
                Бизнес (Excel)
              </Button>
              <Button asChild variant="outline" className="gap-2 bg-green-50" size="sm">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Бизнес (JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={importBusinessesFromFile}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </Button>
              <Button asChild variant="outline" className="gap-2 bg-green-50" size="sm">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Бизнес (Excel)
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={importBusinessesFromExcel}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <TabsList className="inline-flex w-auto min-w-full lg:w-auto lg:inline-grid lg:grid-cols-8">
            <TabsTrigger value="cars" className="gap-2">
              <Car className="w-4 h-4" />
              Машины зарууд ({pendingCars.length})
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Бизнесүүд ({pendingBusinesses.length})
            </TabsTrigger>
            <TabsTrigger value="all-cars" className="gap-2">
              <Car className="w-4 h-4" />
              Бүх зар ({allCars.length})
            </TabsTrigger>
            <TabsTrigger value="all-businesses" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Бүх Бизнес ({allBusinesses.length})
            </TabsTrigger>
            <TabsTrigger value="vip-cars" className="gap-2">
              <Star className="w-4 h-4" />
              VIP зарууд ({vipCars.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Мессеж ({messages.filter(m => !m.is_read).length})
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Facebook Каталог
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Database className="w-4 h-4" />
              Статистик
            </TabsTrigger>
          </TabsList>
          </div>

          {/* Pending Cars */}
          <TabsContent value="cars" className="space-y-4">
            {carsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : pendingCars.length > 0 ? (
              <div className="space-y-4">
                {pendingCars.map((car) => (
                  <Card key={car.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {car.images?.[0] ? (
                            <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{car.title}</h3>
                              <p className="text-gray-500 text-sm">{car.make} {car.model} • {car.year}</p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Хүлээгдэж байна
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-blue-600 mb-3">
                            {new Intl.NumberFormat('mn-MN').format(car.price)}₮
                          </p>
                          <div className="flex items-center gap-2">
                            <Link to={createPageUrl(`CarDetails?id=${car.id}`)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Үзэх
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveCarMutation.mutate(car.id)}
                              disabled={approveCarMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Батлах
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectCarMutation.mutate(car.id)}
                              disabled={rejectCarMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Цуцлах
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Хүлээгдэж буй зар байхгүй</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Businesses */}
          <TabsContent value="businesses" className="space-y-4">
            {businessesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : pendingBusinesses.length > 0 ? (
              <div className="space-y-4">
                {pendingBusinesses.map((business) => (
                  <Card key={business.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {business.images?.[0] ? (
                            <img src={business.images[0]} alt={business.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Briefcase className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{business.name}</h3>
                              <p className="text-gray-500 text-sm">{business.type} • {business.category}</p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Хүлээгдэж байна
                            </Badge>
                          </div>
                          {business.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{business.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Link to={createPageUrl(`BusinessDetails?id=${business.id}`)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Үзэх
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveBusinessMutation.mutate(business.id)}
                              disabled={approveBusinessMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Батлах
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectBusinessMutation.mutate(business.id)}
                              disabled={rejectBusinessMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Цуцлах
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Хүлээгдэж буй бизнес байхгүй</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Бүх зарууд */}
          <TabsContent value="all-cars" className="space-y-4">
            {allCarsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : allCars.length > 0 ? (
              <div className="space-y-4">
                {allCars.map((car) => (
                  <Card key={car.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {car.images?.[0] ? (
                            <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{car.title}</h3>
                              <p className="text-gray-500 text-sm">{car.make} {car.model} • {car.year}</p>
                            </div>
                            <Badge variant="outline" className={
                              car.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              car.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }>
                              {car.status === 'approved' ? 'Баталгаажсан' :
                               car.status === 'rejected' ? 'Цуцлагдсан' :
                               'Хүлээгдэж байна'}
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-blue-600 mb-3">
                            {new Intl.NumberFormat('mn-MN').format(car.price)}₮
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link to={createPageUrl(`CarDetails?id=${car.id}&returnTo=all-cars`)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Үзэх
                              </Button>
                            </Link>
                            {car.status === 'approved' && (
                              <>
                                {!car.is_featured ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                    onClick={() => handleVipCar(car.id, true)}
                                    disabled={vipingCarId === car.id}
                                  >
                                    <Star className="w-4 h-4 mr-2" />
                                    {vipingCarId === car.id ? 'VIP болгож байна...' : 'VIP болгох'}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => handleVipCar(car.id, false)}
                                    disabled={vipingCarId === car.id}
                                  >
                                    <Star className="w-4 h-4 mr-2 fill-current" />
                                    {vipingCarId === car.id ? 'VIP арилгаж байна...' : 'VIP арилгах'}
                                  </Button>
                                )}
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCar(car.id)}
                              disabled={editingCarId === car.id}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {editingCarId === car.id ? 'Засаж байна...' : 'Засах'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCar(car.id)}
                              disabled={deletingCarId === car.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingCarId === car.id ? 'Устгаж байна...' : 'Устгах'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Зар байхгүй байна</p>
                </CardContent>
              </Card>
            )}
            
            {/* Scroll to Top Button - "Бүх зар" талбар дээр */}
            {showScrollToTop && activeTab === 'all-cars' && (
              <Button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-50 rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            )}
          </TabsContent>

          {/* Бүх бизнесүүд */}
          <TabsContent value="all-businesses" className="space-y-4">
            {allBusinessesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : allBusinesses.length > 0 ? (
              <div className="space-y-4">
                {allBusinesses.map((business) => (
                  <Card key={business.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {business.images?.[0] ? (
                            <img src={business.images[0]} alt={business.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Briefcase className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{business.name}</h3>
                              <p className="text-gray-500 text-sm">{business.type} • {business.category}</p>
                            </div>
                            <Badge variant="outline" className={
                              business.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              business.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }>
                              {business.status === 'approved' ? 'Баталгаажсан' :
                               business.status === 'rejected' ? 'Цуцлагдсан' :
                               'Хүлээгдэж байна'}
                            </Badge>
                          </div>
                          {business.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{business.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Link to={createPageUrl(`BusinessDetails?id=${business.id}`)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Үзэх
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBusiness(business.id)}
                              disabled={editingBusinessId === business.id}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {editingBusinessId === business.id ? 'Засаж байна...' : 'Засах'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBusiness(business.id)}
                              disabled={deletingBusinessId === business.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingBusinessId === business.id ? 'Устгаж байна...' : 'Устгах'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Бизнес байхгүй байна</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* VIP зарууд */}
          <TabsContent value="vip-cars" className="space-y-4">
            {vipCarsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : vipCars.length > 0 ? (
              <div className="space-y-4">
                {vipCars.map((car) => (
                  <Card key={car.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {car.images?.[0] ? (
                            <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{car.title}</h3>
                              <p className="text-gray-500 text-sm">{car.make} {car.model} • {car.year}</p>
                              {(() => {
                                const carDate = car.updated_at || car.created_at;
                                if (carDate) {
                                  const date = new Date(carDate);
                                  const now = new Date();
                                  const diffTime = Math.abs(now - date);
                                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                  return (
                                    <p className="text-gray-400 text-xs mt-1">{diffDays} хоног</p>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              VIP
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-blue-600 mb-3">
                            {new Intl.NumberFormat('mn-MN').format(car.price)}₮
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link to={createPageUrl(`CarDetails?id=${car.id}&returnTo=vip-cars`)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Үзэх
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleVipCar(car.id, false)}
                              disabled={vipingCarId === car.id}
                            >
                              <Star className="w-4 h-4 mr-2 fill-current" />
                              {vipingCarId === car.id ? 'VIP арилгаж байна...' : 'VIP арилгах'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCar(car.id)}
                              disabled={editingCarId === car.id}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {editingCarId === car.id ? 'Засаж байна...' : 'Засах'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCar(car.id)}
                              disabled={deletingCarId === car.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingCarId === car.id ? 'Устгаж байна...' : 'Устгах'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">VIP зар байхгүй байна</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-xl font-semibold">Мессежүүд</h2>

            {messagesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`border-0 shadow-sm cursor-pointer transition-colors ${!message.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      if (!message.is_read) {
                        markMessageAsReadMutation.mutate(message.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{message.sender_email}</p>
                            <p className="text-xs text-gray-500">{new Date(message.created_date).toLocaleDateString('mn-MN')}</p>
                            {message.car_id && (
                              <Link to={createPageUrl(`CarDetails?id=${message.car_id}`)} className="text-xs text-blue-600 hover:underline">
                                Зарыг харах →
                              </Link>
                            )}
                          </div>
                        </div>
                        {!message.is_read && (
                          <Badge className="bg-blue-600">Шинэ</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Танд мессеж байхгүй байна</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Facebook Каталог */}
          <TabsContent value="catalog" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Facebook Каталог</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Хамгийн сүүлд баталгаажсан {recentlyApprovedCars.length} зар
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generatePermanentCatalogLink}
                      disabled={isGeneratingLink || catalogLoading || recentlyApprovedCars.length === 0}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Үүсгэж байна...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          Тогтмол линк үүсгэх
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={generateFacebookCatalog}
                      disabled={isGeneratingCatalog || catalogLoading || recentlyApprovedCars.length === 0}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isGeneratingCatalog ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Үүсгэж байна...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel каталог татах
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {catalogLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : recentlyApprovedCars.length > 0 ? (
                  <div className="space-y-4">
                    {permanentCatalogLink ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 mb-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-600 text-white">Facebook Page Линк</Badge>
                              {isUpdatingCatalog && (
                                <Badge variant="outline" className="text-xs">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
                                  Шинэчлэж байна...
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-green-900 mb-2">
                              Энэ линкийг Facebook page дээр холбоно уу. Шинэ машин баталгаажсаны дараа автоматаар шинэчлэгдэнэ.
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={permanentCatalogLink}
                                readOnly
                                className="flex-1 px-3 py-2 text-sm border-2 border-green-400 rounded-md bg-white text-gray-700 font-mono"
                                onClick={(e) => e.target.select()}
                              />
                              <Button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(permanentCatalogLink);
                                    toast.success('Линк хуулагдлаа!');
                                  } catch (error) {
                                    const textarea = document.createElement('textarea');
                                    textarea.value = permanentCatalogLink;
                                    document.body.appendChild(textarea);
                                    textarea.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(textarea);
                                    toast.success('Линк хуулагдлаа!');
                                  }
                                }}
                                size="sm"
                                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Copy className="w-4 h-4" />
                                Хуулах
                              </Button>
                              <Button
                                onClick={() => window.open(permanentCatalogLink, '_blank')}
                                size="sm"
                                variant="outline"
                                className="gap-2 border-green-400"
                              >
                                <Download className="w-4 h-4" />
                                Татах
                              </Button>
                            </div>
                            {catalogConfig?.updated_at && (
                              <p className="text-xs text-gray-500 mt-2">
                                Сүүлд шинэчлэгдсэн: {new Date(catalogConfig.updated_at).toLocaleString('mn-MN')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-900">
                          <strong>Анхаар:</strong> Тогтмол каталогийн линк үүсгээгүй байна. 
                          "Тогтмол линк үүсгэх" товч дараад Facebook page дээр ашиглах линк аваарай.
                        </p>
                      </div>
                    )}
                    {catalogDownloadLink && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Түр каталог татах линк:</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={catalogDownloadLink}
                                readOnly
                                className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md bg-white text-gray-700 truncate"
                                onClick={(e) => e.target.select()}
                              />
                              <Button
                                onClick={copyCatalogLink}
                                size="sm"
                                variant="outline"
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                              >
                                <Copy className="w-4 h-4" />
                                Хуулах
                              </Button>
                              <Button
                                onClick={() => window.open(catalogDownloadLink, '_blank')}
                                size="sm"
                                variant="outline"
                                className="gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Татах
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-900">
                        <strong>Заавар:</strong> Тогтмол линк нь Facebook page дээр холбох зориулалттай. 
                        Шинэ машин баталгаажсаны дараа каталог автоматаар шинэчлэгдэнэ. 
                        Excel файл татаад Facebook Catalog Manager дээр ашиглана уу.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {recentlyApprovedCars.slice(0, 20).map((car, index) => (
                        <div key={car.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {car.images?.[0] ? (
                              <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg truncate">{car.title}</h3>
                                <p className="text-gray-500 text-sm">{car.make} {car.model} • {car.year}</p>
                                <p className="text-blue-600 font-bold text-lg mt-1">
                                  {car.price ? new Intl.NumberFormat('mn-MN').format(car.price) + '₮' : 'Үнэ тодорхойгүй'}
                                </p>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <p>#{index + 1}</p>
                                {car.created_at && (
                                  <p className="text-xs">
                                    {new Date(car.created_at).toLocaleDateString('mn-MN')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {car.mileage && <span>Гүйлт: {new Intl.NumberFormat('mn-MN').format(car.mileage)} км</span>}
                              {car.fuel_type && <span>Түлш: {car.fuel_type === 'gasoline' ? 'Бензин' : car.fuel_type === 'diesel' ? 'Дизель' : car.fuel_type}</span>}
                              {car.view_count !== undefined && <span>Харагдсан: {car.view_count}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Баталгаажсан зар байхгүй байна</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Car className="w-8 h-8 opacity-80" />
                    <Badge className="bg-white/20 text-white">Нийт</Badge>
                  </div>
                  <p className="text-3xl font-bold">{pendingCars.length}</p>
                  <p className="text-blue-100 text-sm">Хүлээгдэж буй зарууд</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="w-8 h-8 opacity-80" />
                    <Badge className="bg-white/20 text-white">Нийт</Badge>
                  </div>
                  <p className="text-3xl font-bold">{pendingBusinesses.length}</p>
                  <p className="text-green-100 text-sm">Хүлээгдэж буй бизнесүүд</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="w-8 h-8 opacity-80" />
                    <Badge className="bg-white/20 text-white">Firebase</Badge>
                  </div>
                  <p className="text-3xl font-bold">✓</p>
                  <p className="text-purple-100 text-sm">Өгөгдлийн сан холбогдсон</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileJson className="w-8 h-8 opacity-80" />
                    <Badge className="bg-white/20 text-white">JSON</Badge>
                  </div>
                  <p className="text-3xl font-bold">Import/Export</p>
                  <p className="text-orange-100 text-sm">Файлаар солилцох</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Тохиргоо ба Менежмент</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Жишээ өгөгдөл оруулах</p>
                      <p className="text-sm text-gray-500">5 машин ба 5 бизнес жишээгээр нэмнэ</p>
                    </div>
                  </div>
                  <Button 
                    onClick={loadSampleData} 
                    disabled={isLoadingSamples}
                    size="sm" 
                    className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isLoadingSamples ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Database className="w-4 h-4 mr-1" />}
                    Оруулах
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Машины зарууд</p>
                      <p className="text-sm text-gray-500">JSON болон Excel файлаар экспорт/импорт хийх</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportCarsToFile} disabled={isExporting} size="sm" variant="outline" className="bg-white">
                      <FileJson className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                    <Button onClick={exportCarsToExcel} disabled={isExporting} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-white">
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        JSON
                        <input
                          type="file"
                          accept=".json"
                          onChange={importCarsFromFile}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </label>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-white">
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        Excel
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={importCarsFromExcel}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Бизнесүүд</p>
                      <p className="text-sm text-gray-500">JSON болон Excel файлаар экспорт/импорт хийх</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportBusinessesToFile} disabled={isExporting} size="sm" variant="outline" className="bg-white">
                      <FileJson className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                    <Button onClick={exportBusinessesToExcel} disabled={isExporting} size="sm" className="bg-green-600 hover:bg-green-700">
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-white">
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        JSON
                        <input
                          type="file"
                          accept=".json"
                          onChange={importBusinessesFromFile}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </label>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-white">
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        Excel
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={importBusinessesFromExcel}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Хамгийн их үзэлттэй машинууд
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topViewedCars.map((car, index) => (
                    <Link key={car.id} to={createPageUrl(`CarDetails?id=${car.id}`)}>
                      <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {car.images?.[0] ? (
                            <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{car.title}</p>
                          <p className="text-xs text-gray-500">{car.make} {car.model} • {car.year}</p>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-blue-600">{car.view_count || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {topViewedCars.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Одоогоор мэдээлэл байхгүй
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}