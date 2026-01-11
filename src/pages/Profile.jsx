import React, { useState } from 'react';
import { getCurrentUser, logout } from '@/services/auth';
import { list as listCars, remove as removeCar } from '@/services/cars';
import { list as listFavorites } from '@/services/favorites';
import { list as listMessages, create as createMessage } from '@/services/messages';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Car, Heart, MessageSquare, LogOut, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CarCard from '@/components/cars/CarCard.jsx';
import VipUpgradeButton from '@/components/cars/VipUpgradeButton.jsx';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('my-cars');
  const [deletingCarId, setDeletingCarId] = useState(null);
  const [sendingMessageCarId, setSendingMessageCarId] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const { data: myCars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['myCars', user?.email],
    queryFn: async () => {
      const q = query(collection(db, 'cars'), where('created_by', '==', user.email));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    },
    enabled: !!user?.email
  });

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['myFavorites', user?.email],
    queryFn: async () => {
      const favs = await listFavorites({ user_email: user.email });
      const carIds = favs.map(f => f.car_id);
      if (carIds.length === 0) return [];
      
      const allCars = await listCars({ status: 'approved' });
      return allCars.filter(car => carIds.includes(car.id));
    },
    enabled: !!user?.email
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['myMessages', user?.email],
    queryFn: () => listMessages({ receiver_email: user.email, orderBy: '-created_date' }),
    enabled: !!user?.email
  });

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const deleteCarMutation = useMutation({
    mutationFn: async (carId) => {
      await removeCar(carId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myCars', user?.email]);
      queryClient.invalidateQueries(['cars']);
      toast.success('Зар амжилттай устгагдлаа');
      setDeletingCarId(null);
    },
    onError: (error) => {
      toast.error('Зар устгахэд алдаа гарлаа: ' + error.message);
      setDeletingCarId(null);
    }
  });

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Та энэ зарыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.')) {
      return;
    }
    setDeletingCarId(carId);
    deleteCarMutation.mutate(carId);
  };

  // Get admin email
  const getAdminEmail = async () => {
    // Use fallback admin email to avoid Firestore permission issues
    // If you need to dynamically fetch admin email, add users collection read permission in Firestore rules
    return 'khashpay@gmail.com';
  };

  // Open message dialog
  const handleOpenMessageDialog = (car) => {
    setSelectedCar(car);
    const defaultContent = `Миний зарын талаар: ${car.title || car.make || ''} ${car.model || ''} (${car.year || ''})\nЗар ID: ${car.id}\n\nХолбогдох утас: ${car.contact_phone || 'Оруулаагүй'}`;
    setMessageContent(defaultContent);
    setMessageDialogOpen(true);
  };

  // Send message to admin
  const handleSendMessageToAdmin = async () => {
    if (!user?.email || !selectedCar) {
      toast.error('Нэвтэрсэн хэрэглэгч олдсонгүй');
      return;
    }
    
    if (!messageContent.trim()) {
      toast.error('Мессеж бичнэ үү');
      return;
    }
    
    try {
      setSendingMessageCarId(selectedCar.id);
      const adminEmail = await getAdminEmail();
      
      await createMessage({
        sender_email: user.email,
        receiver_email: adminEmail,
        content: messageContent,
        car_id: selectedCar.id
      });
      
      toast.success('Админ рүү мессеж илгээгдлээ');
      queryClient.invalidateQueries(['myMessages', user.email]);
      setSendingMessageCarId(null);
      setMessageDialogOpen(false);
      setSelectedCar(null);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Мессеж илгээхэд алдаа гарлаа: ' + error.message);
      setSendingMessageCarId(null);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-32 w-full rounded-2xl mb-8" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* User Info Card */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || 'Хэрэглэгч'}</h1>
                  <p className="text-gray-500">{user?.email}</p>
                  {user?.role === 'ADMIN' && (
                    <Badge className="mt-2 bg-purple-600">Админ</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Гарах
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="my-cars" className="gap-2">
              <Car className="w-4 h-4" />
              Миний зарууд ({myCars.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              Дуртай ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Мессеж ({messages.filter(m => !m.is_read).length})
            </TabsTrigger>
          </TabsList>

          {/* My Cars */}
          <TabsContent value="my-cars" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Миний зарууд</h2>
              <Link to={createPageUrl('AddCar')}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Зар нэмэх
                </Button>
              </Link>
            </div>

            {carsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : myCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCars.map((car, index) => (
                  <div key={car.id} className="space-y-2">
                    <CarCard car={car} index={index} />
                    <div className="flex items-center gap-2">
                      {car.status === 'approved' && !car.is_featured && (
                        <VipUpgradeButton car={car} />
                      )}
                      {car.is_featured && (
                        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-medium flex-1">
                          <Star className="w-4 h-4 fill-current" />
                          VIP зар
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenMessageDialog(car);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Мессеж
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDeleteCar(car.id)}
                        disabled={deletingCarId === car.id}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingCarId === car.id ? 'Устгаж байна...' : 'Устгах'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Танд одоогоор зар байхгүй байна</p>
                  <Link to={createPageUrl('AddCar')}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Эхний зараа нэмэх
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-xl font-semibold">Дуртай зарууд</h2>

            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((car, index) => (
                  <CarCard key={car.id} car={car} index={index} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Танд дуртай зар байхгүй байна</p>
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
                  <Card key={message.id} className={`border-0 shadow-sm ${!message.is_read ? 'bg-blue-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{message.sender_email}</p>
                            <p className="text-xs text-gray-500">{new Date(message.created_date).toLocaleDateString('mn-MN')}</p>
                          </div>
                        </div>
                        {!message.is_read && (
                          <Badge className="bg-blue-600">Шинэ</Badge>
                        )}
                      </div>
                      <p className="text-gray-700">{message.content}</p>
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
        </Tabs>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Админ руу мессеж илгээх</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCar && (
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-1">Зарын мэдээлэл:</p>
                <p>{selectedCar.title || `${selectedCar.make} ${selectedCar.model}`} ({selectedCar.year})</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="message-content">Мессеж *</Label>
              <Textarea
                id="message-content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Мессежээ бичнэ үү..."
                rows={6}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMessageDialogOpen(false);
                setSelectedCar(null);
                setMessageContent('');
              }}
            >
              Цуцлах
            </Button>
            <Button
              onClick={handleSendMessageToAdmin}
              disabled={sendingMessageCarId === selectedCar?.id || !messageContent.trim()}
            >
              {sendingMessageCarId === selectedCar?.id ? 'Илгээж байна...' : 'Илгээх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}