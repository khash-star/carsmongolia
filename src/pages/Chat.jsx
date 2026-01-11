import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/auth';
import { list as listMessages, create as createMessage, markAsRead } from '@/services/messages';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const otherUserEmail = urlParams.get('otherUserEmail');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');
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

  const adminEmail = user?.email || 'khashpay@gmail.com';

  // Мессежүүдийг ачаалах (admin болон otherUser хооронд)
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', adminEmail, otherUserEmail],
    queryFn: async () => {
      if (!adminEmail || !otherUserEmail) return [];
      
      // Админий хүлээн авсан мессежүүд
      const received = await listMessages({ 
        receiver_email: adminEmail, 
        sender_email: otherUserEmail,
        orderBy: '-created_date' 
      });
      
      // Админий илгээсэн мессежүүд
      const sent = await listMessages({ 
        sender_email: adminEmail, 
        receiver_email: otherUserEmail,
        orderBy: '-created_date' 
      });
      
      // Нэгтгэж, эрэмбэлэх
      const allMessages = [...received, ...sent].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
      
      return allMessages;
    },
    enabled: !!adminEmail && !!otherUserEmail && !userLoading,
    refetchInterval: 3000 // 3 секунд тутамд шинэчилнэ
  });

  // Мессеж илгээх
  const sendMutation = useMutation({
    mutationFn: async (messageText) => {
      if (!adminEmail || !otherUserEmail) return;
      
      const result = await createMessage({
        sender_email: adminEmail,
        receiver_email: otherUserEmail,
        content: messageText,
        car_id: null
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatMessages', adminEmail, otherUserEmail]);
      queryClient.invalidateQueries(['adminMessages', adminEmail]);
      setMessage('');
      // Scroll доош
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error) => {
      toast.error('Мессеж илгээхэд алдаа гарлаа: ' + error.message);
    }
  });

  // Мессеж уншсан гэж тэмдэглэх
  useEffect(() => {
    if (messages.length > 0 && adminEmail) {
      const unreadMessages = messages.filter(
        msg => msg.receiver_email === adminEmail && !msg.is_read
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(msg.id).catch(console.error);
      });
      
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries(['chatMessages', adminEmail, otherUserEmail]);
        queryClient.invalidateQueries(['adminMessages', adminEmail]);
      }
    }
  }, [messages, adminEmail, otherUserEmail, queryClient]);

  // Scroll доош (шинэ мессеж ирэхэд)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!otherUserEmail) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Хэрэглэгч олдсонгүй</p>
              <Button onClick={() => navigate(createPageUrl('Admin?tab=messages'))} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Буцах
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl('Admin?tab=messages'))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
            {otherUserEmail[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{otherUserEmail}</h1>
            <p className="text-xs text-gray-500">Мессеж бичилцэх</p>
          </div>
        </div>

        {/* Messages */}
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {messagesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_email === adminEmail;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-amber-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.created_date).toLocaleTimeString('mn-MN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Мессеж байхгүй байна</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Мессеж бичих..."
              className="flex-1 min-h-[44px] max-h-32 rounded-xl resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMutation.isPending}
              className="h-11 w-11 rounded-xl bg-amber-500 hover:bg-amber-600 flex-shrink-0"
              size="icon"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

