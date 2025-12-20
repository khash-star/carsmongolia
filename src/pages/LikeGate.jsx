import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

export default function LikeGate() {
  const [countdown, setCountdown] = useState(5);
  const linkRef = useRef(null);

  useEffect(() => {
    // 5 секундын дараа санамж хүсэлт харуулах
    const timer = setTimeout(() => {
      toast.info('Facebook хуудас дээр Like/Follow дарж, шинэ заруудыг үзээрэй!', {
        duration: 2000,
      });
      
      // Санамж хүсэлт харуулсны дараа шинэ tab дээр Facebook page нээх
      setTimeout(() => {
        // Link элемент ашиглан programmatically click хийх (popup blocker-ийг даван туулах)
        // Энэ нь user interaction-тэй холбоотой байдаг тул popup blocker ажиллахгүй
        if (linkRef.current) {
          linkRef.current.click();
        } else {
          // Fallback: window.open (шинэ tab дээр нээх)
          const newWindow = window.open('https://www.facebook.com/HASH.AUTO', '_blank', 'noopener,noreferrer');
          // Хэрэв popup blocker байвал зөвхөн console дээр мэдэгдэх (одоогийн tab дээр нээхгүй)
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            console.warn('Popup blocker detected. Please allow popups for this site.');
          }
        }
      }, 500);
    }, 5000);

    // Countdown харуулах
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      margin: 0,
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)',
      }}>
        <div style={{
          background: '#1877F2',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 20px',
          color: 'white',
          fontSize: '30px',
          boxShadow: '0 5px 15px rgba(24, 119, 242, 0.4)',
        }}>
          <i className="fas fa-car"></i>
        </div>
        
        <h1 style={{
          color: '#1d1e21',
          fontSize: '22px',
          marginBottom: '10px',
        }}>
          AutoZar Facebook
        </h1>
        
        <p style={{
          color: '#606770',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '30px',
        }}>
          Манай хуудсыг дагаж авто ертөнцийн хамгийн сүүлийн үеийн мэдээ, шинэ заруудыг цаг алдалгүй аваарай.
        </p>

        <div style={{
          background: '#f0f2f5',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '25px',
        }}>
          <span style={{
            display: 'block',
            fontWeight: 600,
            color: '#4b4f56',
            marginBottom: '10px',
          }}>
            Манай хуудсанд нэгдэх
          </span>
          <a 
            ref={linkRef}
            href="https://www.facebook.com/HASH.AUTO"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1877F2',
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Facebook хуудас руу орох
          </a>
        </div>

        {countdown > 0 && (
          <div style={{
            marginBottom: '20px',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1877F2',
          }}>
            {countdown}
          </div>
        )}

      </div>

    </div>
  );
}

