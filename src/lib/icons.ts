import { 
  FaInstagram, 
  FaTiktok, 
  FaXTwitter, 
  FaFacebook, 
  FaYoutube, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe, 
  FaLink 
} from 'react-icons/fa6';

export const getIconForUrl = (url: string) => {
  if (!url) return FaLink;
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('instagram.com')) return FaInstagram;
  if (lowerUrl.includes('tiktok.com')) return FaTiktok;
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return FaXTwitter;
  if (lowerUrl.includes('facebook.com')) return FaFacebook;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return FaYoutube;
  if (lowerUrl.includes('linkedin.com')) return FaLinkedin;
  if (lowerUrl.includes('github.com')) return FaGithub;
  
  return FaGlobe;
};

export const getIconName = (url: string) => {
  if (!url) return 'link';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  if (lowerUrl.includes('facebook.com')) return 'facebook';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('linkedin.com')) return 'linkedin';
  if (lowerUrl.includes('github.com')) return 'github';
  
  return 'globe';
};