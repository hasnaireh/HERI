'use client';

import { useState, useEffect } from 'react';
import { getSettings, getSocialLinks, getPromoLinks, getPortfolioItems } from '@/lib/firestore';
import { getIconForUrl } from '@/lib/icons';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';

interface Settings {
  siteTitle: string;
  profileName: string;
  profileBio: string;
  profilePicture: string;
}

interface SocialLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface PromoLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  order: number;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [promoLinks, setPromoLinks] = useState<PromoLink[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedPromoLink, setSelectedPromoLink] = useState<PromoLink | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [showVisitButton, setShowVisitButton] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (settings?.siteTitle) {
      document.title = settings.siteTitle;
    }
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && selectedPromoLink) {
      setShowVisitButton(true);
    }
    return () => clearInterval(interval);
  }, [countdown, selectedPromoLink]);

  const fetchData = async () => {
    try {
      const [settingsData, socialData, promoData, portfolioData] = await Promise.all([
        getSettings(),
        getSocialLinks(),
        getPromoLinks(),
        getPortfolioItems()
      ]);

      setSettings(settingsData);
      setSocialLinks(socialData || []);
      setPromoLinks(promoData || []);
      setPortfolioItems(portfolioData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePromoLinkClick = (promoLink: PromoLink) => {
    if (!promoLink.url || promoLink.url === '#') return;
    
    setSelectedPromoLink(promoLink);
    setCountdown(30);
    setShowVisitButton(false);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLinkAvailable = (url: string) => {
    return url && url !== '#';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#F9F9F9]'} -z-10`} />
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-6 right-6 p-3 rounded-full glassmorphism z-50 ${
          theme === 'dark' 
            ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' 
            : 'bg-black/10 border border-black/20 text-black hover:bg-black/20'
        } transition-all duration-300`}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Section */}
        {settings && (
          <div className={`glassmorphism rounded-2xl p-8 mb-8 text-center ${
            theme === 'dark' 
              ? 'bg-white/5 border border-white/10 text-white' 
              : 'bg-black/5 border border-black/10 text-black'
          }`}>
            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={settings.profilePicture || '/placeholder-avatar.png'}
                alt={settings.profileName}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold mb-2">{settings.profileName}</h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {settings.profileBio}
            </p>
          </div>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className={`glassmorphism rounded-2xl p-6 mb-8 ${
            theme === 'dark' 
              ? 'bg-white/5 border border-white/10 text-white' 
              : 'bg-black/5 border border-black/10 text-black'
          }`}>
            <h2 className="text-2xl font-semibold mb-4">Social Links</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {socialLinks.map((link) => {
                const Icon = getIconForUrl(link.url);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-black/10 hover:bg-black/20 text-black'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Promo Links */}
        {promoLinks.length > 0 && (
          <div className={`glassmorphism rounded-2xl p-6 mb-8 ${
            theme === 'dark' 
              ? 'bg-white/5 border border-white/10 text-white' 
              : 'bg-black/5 border border-black/10 text-black'
          }`}>
            <h2 className="text-2xl font-semibold mb-4">Promo Links</h2>
            <div className="space-y-3">
              {promoLinks.map((promoLink) => {
                const available = isLinkAvailable(promoLink.url);
                return (
                  <div key={promoLink.id} className="flex items-center justify-between">
                    <Button
                      onClick={() => handlePromoLinkClick(promoLink)}
                      disabled={!available}
                      className={`flex-1 mr-4 ${
                        available
                          ? theme === 'dark'
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-black/20 hover:bg-black/30 text-black'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {promoLink.title}
                    </Button>
                    <Badge variant={available ? 'default' : 'destructive'}>
                      {available ? 'Tersedia' : 'Tidak Tersedia'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Portfolio Gallery */}
        {portfolioItems.length > 0 && (
          <div className={`glassmorphism rounded-2xl p-6 ${
            theme === 'dark' 
              ? 'bg-white/5 border border-white/10 text-white' 
              : 'bg-black/5 border border-black/10 text-black'
          }`}>
            <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioItems.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 hover:bg-white/20'
                      : 'bg-black/10 border-black/20 hover:bg-black/20'
                  }`}
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <CardContent className="p-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Promo Link Modal */}
      <Dialog open={!!selectedPromoLink} onOpenChange={() => setSelectedPromoLink(null)}>
        <DialogContent className={`glassmorphism ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-black/10 border-black/20 text-black'
        }`}>
          <DialogHeader>
            <DialogTitle>Ikuti Creator untuk mendapatkan info Promo Links Lainnya</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => window.open('https://www.tiktok.com/@harihariheri', '_blank')}
              className="w-full"
            >
              Follow TikTok @harihariheri
            </Button>
            
            {!showVisitButton ? (
              <div className="text-center">
                <p className="text-sm mb-2">Link akan tersedia dalam:</p>
                <p className="text-2xl font-bold">{formatCountdown(countdown)}</p>
              </div>
            ) : (
              <Button
                onClick={() => {
                  if (selectedPromoLink?.url) {
                    window.open(selectedPromoLink.url, '_blank');
                    setSelectedPromoLink(null);
                  }
                }}
                className="w-full"
                variant="outline"
              >
                Kunjungi Link
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .glassmorphism {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
}