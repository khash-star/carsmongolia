import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
// QPay integration - requires backend API
// TODO: Implement QPay API calls via Firebase Functions or external API

export default function QPayButton({ amount, description, onSuccess, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, pending, success, error

  const initiatePayment = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual QPay API call
      // Example: const response = await fetch('/api/qpay/create', { method: 'POST', body: JSON.stringify({ amount, description }) });
      toast.error('QPay интеграци хараахан бэлэн биш. Админтай холбогдоно уу.');
      setStatus('error');
      
      // Placeholder for future implementation
      // const response = await qpayAPI.createInvoice({ amount, description });
      // if (response.success) {
      //   setQrCode(response.qr_image);
      //   setStatus('pending');
      //   pollPaymentStatus(response.invoice_id);
      // }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('QPay холболт амжилтгүй. Админтай холбогдоно уу.');
      setStatus('error');
    }
    setLoading(false);
  };

  const pollPaymentStatus = async (invoiceId) => {
    // TODO: Implement payment status polling
    // const interval = setInterval(async () => {
    //   const response = await qpayAPI.checkStatus({ invoice_id: invoiceId });
    //   if (response.status === 'PAID') {
    //     clearInterval(interval);
    //     setStatus('success');
    //     toast.success('Төлбөр амжилттай!');
    //     if (onSuccess) onSuccess();
    //     setTimeout(() => setIsOpen(false), 2000);
    //   }
    // }, 3000);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStatus('idle');
    setQrCode(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        {children || (
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <CreditCard className="w-4 h-4" />
            QPay-ээр төлөх
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            QPay төлбөр
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {status === 'idle' && (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {new Intl.NumberFormat('mn-MN').format(amount)}₮
                </p>
                <p className="text-sm text-gray-500">Төлбөрийн дүн</p>
              </div>
              
              <Button
                onClick={initiatePayment}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Уншиж байна...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    QR код үүсгэх
                  </>
                )}
              </Button>
            </div>
          )}

          {status === 'pending' && qrCode && (
            <div className="text-center space-y-4">
              <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
                <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">QPay апп-аар QR кодыг уншуулна уу</p>
                <p className="text-sm text-gray-500">Төлбөр хийгдэхийг хүлээж байна...</p>
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4 py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Амжилттай!</h3>
                <p className="text-gray-500">Төлбөр амжилттай төлөгдлөө</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4 py-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Алдаа гарлаа</h3>
                <p className="text-gray-500 mb-4">Төлбөр төлөхөд алдаа гарлаа. Дахин оролдоно уу.</p>
                <Button onClick={() => setStatus('idle')} variant="outline">
                  Дахин оролдох
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}