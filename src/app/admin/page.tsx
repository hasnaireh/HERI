'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  getSettings, 
  updateSettings,
  getSocialLinks, 
  addSocialLink, 
  updateSocialLink, 
  deleteSocialLink,
  getPromoLinks, 
  addPromoLink, 
  updatePromoLink, 
  deletePromoLink,
  getPortfolioItems, 
  addPortfolioItem, 
  updatePortfolioItem, 
  deletePortfolioItem
} from '@/lib/firestore';
import { getIconForUrl } from '@/lib/icons';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaEdit, FaTrash, FaPlus, FaGripVertical } from 'react-icons/fa';
import { LogOut } from 'lucide-react';
import { DragDropList } from '@/components/drag-drop-list';
import { arrayMove } from '@dnd-kit/sortable';

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

export default function AdminPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [settings, setSettings] = useState<Settings>({
    siteTitle: '',
    profileName: '',
    profileBio: '',
    profilePicture: ''
  });
  
  // Social Links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLinkForm, setSocialLinkForm] = useState({ title: '', url: '' });
  
  // Promo Links state
  const [promoLinks, setPromoLinks] = useState<PromoLink[]>([]);
  const [promoLinkForm, setPromoLinkForm] = useState({ title: '', url: '' });
  
  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioForm, setPortfolioForm] = useState({ 
    title: '', 
    description: '', 
    image: '', 
    url: '' 
  });
  const [portfolioPreview, setPortfolioPreview] = useState<any>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [portfolioView, setPortfolioView] = useState<'list' | 'grid'>('grid'); // New state for view mode

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchData();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const fetchData = async () => {
    try {
      const [settingsData, socialData, promoData, portfolioData] = await Promise.all([
        getSettings(),
        getSocialLinks(),
        getPromoLinks(),
        getPortfolioItems()
      ]);

      if (settingsData) setSettings(settingsData);
      setSocialLinks(socialData || []);
      setPromoLinks(promoData || []);
      setPortfolioItems(portfolioData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      await updateSettings(settings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  const handleAddSocialLink = async () => {
    try {
      const newLink = {
        ...socialLinkForm,
        order: socialLinks.length
      };
      await addSocialLink(newLink);
      setSocialLinkForm({ title: '', url: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding social link:', error);
    }
  };

  const handleUpdateSocialLink = async (id: string, data: any) => {
    try {
      await updateSocialLink(id, data);
      fetchData();
    } catch (error) {
      console.error('Error updating social link:', error);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    try {
      await deleteSocialLink(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting social link:', error);
    }
  };

  const handleReorderSocialLinks = async (oldIndex: number, newIndex: number) => {
    const reorderedItems = arrayMove(socialLinks, oldIndex, newIndex);
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setSocialLinks(updatedItems);
    
    // Update each item in Firestore
    try {
      await Promise.all(
        updatedItems.map(item => updateSocialLink(item.id, { order: item.order }))
      );
    } catch (error) {
      console.error('Error reordering social links:', error);
      fetchData(); // Revert on error
    }
  };

  const handleAddPromoLink = async () => {
    try {
      const newLink = {
        ...promoLinkForm,
        order: promoLinks.length
      };
      await addPromoLink(newLink);
      setPromoLinkForm({ title: '', url: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding promo link:', error);
    }
  };

  const handleUpdatePromoLink = async (id: string, data: any) => {
    try {
      await updatePromoLink(id, data);
      fetchData();
    } catch (error) {
      console.error('Error updating promo link:', error);
    }
  };

  const handleDeletePromoLink = async (id: string) => {
    try {
      await deletePromoLink(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting promo link:', error);
    }
  };

  const handleReorderPromoLinks = async (oldIndex: number, newIndex: number) => {
    const reorderedItems = arrayMove(promoLinks, oldIndex, newIndex);
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setPromoLinks(updatedItems);
    
    // Update each item in Firestore
    try {
      await Promise.all(
        updatedItems.map(item => updatePromoLink(item.id, { order: item.order }))
      );
    } catch (error) {
      console.error('Error reordering promo links:', error);
      fetchData(); // Revert on error
    }
  };

  const fetchPortfolioPreview = async () => {
    if (!portfolioForm.url) return;
    
    setLoadingPortfolio(true);
    try {
      const response = await fetch(`/api/scrape-meta?url=${encodeURIComponent(portfolioForm.url)}`);
      const data = await response.json();
      setPortfolioPreview(data);
    } catch (error) {
      console.error('Error fetching portfolio preview:', error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleAddPortfolioItem = async () => {
    try {
      // Use preview data if available, otherwise use form data
      const finalData = {
        title: portfolioForm.title || portfolioPreview?.title || '',
        description: portfolioForm.description || portfolioPreview?.description || '',
        image: portfolioForm.image || portfolioPreview?.image || '',
        url: portfolioForm.url || '',
        order: portfolioItems.length
      };
      
      await addPortfolioItem(finalData);
      setPortfolioForm({ title: '', description: '', image: '', url: '' });
      setPortfolioPreview(null);
      fetchData();
    } catch (error) {
      console.error('Error adding portfolio item:', error);
    }
  };

  const handleUpdatePortfolioItem = async (id: string, data: any) => {
    try {
      await updatePortfolioItem(id, data);
      fetchData();
    } catch (error) {
      console.error('Error updating portfolio item:', error);
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    try {
      await deletePortfolioItem(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
    }
  };

  const handleReorderPortfolioItems = async (oldIndex: number, newIndex: number) => {
    const reorderedItems = arrayMove(portfolioItems, oldIndex, newIndex);
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setPortfolioItems(updatedItems);
    
    // Update each item in Firestore
    try {
      await Promise.all(
        updatedItems.map(item => updatePortfolioItem(item.id, { order: item.order }))
      );
    } catch (error) {
      console.error('Error reordering portfolio items:', error);
      fetchData(); // Revert on error
    }
  };

  const isLinkAvailable = (url: string) => {
    return url && url !== '#';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#F9F9F9]'} -z-10`} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Admin Dashboard
          </h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className={`glassmorphism ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="promo">Promo Links</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className={`glassmorphism ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
              <CardHeader>
                <CardTitle>Site & Profile Settings</CardTitle>
                <CardDescription>Manage your site and profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileName">Profile Name</Label>
                  <Input
                    id="profileName"
                    value={settings.profileName}
                    onChange={(e) => setSettings({ ...settings, profileName: e.target.value })}
                    className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileBio">Profile Bio</Label>
                  <Textarea
                    id="profileBio"
                    value={settings.profileBio}
                    onChange={(e) => setSettings({ ...settings, profileBio: e.target.value })}
                    className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    value={settings.profilePicture}
                    onChange={(e) => setSettings({ ...settings, profilePicture: e.target.value })}
                    className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                  />
                  {settings.profilePicture && (
                    <img 
                      src={settings.profilePicture} 
                      alt="Profile preview" 
                      className="w-20 h-20 rounded-lg object-cover mt-2"
                    />
                  )}
                </div>
                
                <Button onClick={handleSettingsUpdate}>Update Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <Card className={`glassmorphism ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
              <CardHeader>
                <CardTitle>Social Links Management</CardTitle>
                <CardDescription>Manage your social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new social link */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={socialLinkForm.title}
                      onChange={(e) => setSocialLinkForm({ ...socialLinkForm, title: e.target.value })}
                      className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={socialLinkForm.url}
                      onChange={(e) => setSocialLinkForm({ ...socialLinkForm, url: e.target.value })}
                      className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                    />
                  </div>
                  <Button onClick={handleAddSocialLink}>
                    <FaPlus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Existing social links */}
                <DragDropList
                  items={socialLinks}
                  onReorder={handleReorderSocialLinks}
                  renderItem={(link, index) => {
                    const Icon = getIconForUrl(link.url);
                    return (
                      <>
                        <Icon className="w-5 h-5" />
                        <Input
                          value={link.title}
                          onChange={(e) => handleUpdateSocialLink(link.id, { title: e.target.value })}
                          className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(link.id, { url: e.target.value })}
                          className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                        />
                        <Button
                          onClick={() => handleDeleteSocialLink(link.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </>
                    );
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promo Links Tab */}
          <TabsContent value="promo">
            <Card className={`glassmorphism ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
              <CardHeader>
                <CardTitle>Promo Links Management</CardTitle>
                <CardDescription>Manage your promotional links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new promo link */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={promoLinkForm.title}
                      onChange={(e) => setPromoLinkForm({ ...promoLinkForm, title: e.target.value })}
                      className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>URL (optional)</Label>
                    <Input
                      value={promoLinkForm.url}
                      onChange={(e) => setPromoLinkForm({ ...promoLinkForm, url: e.target.value })}
                      className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                    />
                  </div>
                  <Button onClick={handleAddPromoLink}>
                    <FaPlus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Existing promo links */}
                <DragDropList
                  items={promoLinks}
                  onReorder={handleReorderPromoLinks}
                  renderItem={(link, index) => (
                    <>
                      <Input
                        value={link.title}
                        onChange={(e) => handleUpdatePromoLink(link.id, { title: e.target.value })}
                        className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => handleUpdatePromoLink(link.id, { url: e.target.value })}
                        className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                      />
                      <Badge variant={isLinkAvailable(link.url) ? 'default' : 'destructive'}>
                        {isLinkAvailable(link.url) ? 'Tersedia' : 'Tidak Tersedia'}
                      </Badge>
                      <Button
                        onClick={() => handleDeletePromoLink(link.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card className={`glassmorphism ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Portfolio Management</CardTitle>
                    <CardDescription>Manage your portfolio items</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={portfolioView === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPortfolioView('list')}
                    >
                      <FaGripVertical className="w-4 h-4 mr-2" />
                      List (Drag)
                    </Button>
                    <Button
                      variant={portfolioView === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPortfolioView('grid')}
                    >
                      <div className="grid grid-cols-2 gap-0.5 mr-2">
                        <div className="w-2 h-2 border border-current"></div>
                        <div className="w-2 h-2 border border-current"></div>
                        <div className="w-2 h-2 border border-current"></div>
                        <div className="w-2 h-2 border border-current"></div>
                      </div>
                      Grid View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* View Toggle Info */}
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    💡 <strong>List View (Drag)</strong>: Drag items to reorder • <strong>Grid View</strong>: Visual card layout
                  </p>
                </div>

                {/* Add new portfolio item */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={portfolioForm.url}
                          onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                          className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                        />
                        <Button 
                          onClick={fetchPortfolioPreview}
                          disabled={!portfolioForm.url || loadingPortfolio}
                        >
                          {loadingPortfolio ? 'Loading...' : 'Fetch'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {portfolioPreview && (
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                      <h3 className="font-semibold mb-2">Preview:</h3>
                      <div className="flex gap-4">
                        {portfolioPreview.image && (
                          <img 
                            src={portfolioPreview.image} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <Input
                            placeholder="Title"
                            value={portfolioForm.title || portfolioPreview.title}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                            className={theme === 'dark' ? 'bg-white/10 border-white/20 mb-2' : 'bg-black/10 border-black/20 mb-2'}
                          />
                          <Textarea
                            placeholder="Description"
                            value={portfolioForm.description || portfolioPreview.description}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                            className={theme === 'dark' ? 'bg-white/10 border-white/20 mb-2' : 'bg-black/10 border-black/20 mb-2'}
                          />
                          <Input
                            placeholder="Image URL"
                            value={portfolioForm.image || portfolioPreview.image}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, image: e.target.value })}
                            className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleAddPortfolioItem}
                        className="mt-4"
                        disabled={!(portfolioForm.title || portfolioPreview?.title)}
                      >
                        Add to Portfolio
                      </Button>
                    </div>
                  )}
                </div>

                {/* Existing portfolio items */}
                {portfolioView === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioItems.map((item) => (
                      <Card key={item.id} className={theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}>
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDeletePortfolioItem(item.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <FaTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <DragDropList
                      items={portfolioItems}
                      onReorder={handleReorderPortfolioItems}
                      renderItem={(item, index) => (
                        <>
                          <div className="flex-1 flex items-center">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{item.title}</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {item.description.length > 100 
                                  ? `${item.description.substring(0, 100)}...` 
                                  : item.description
                                }
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeletePortfolioItem(item.id)}
                            variant="destructive"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <FaTrash className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}