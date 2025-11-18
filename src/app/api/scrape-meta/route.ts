import { NextRequest, NextResponse } from 'next/server';
import { getCachedLink, cacheLink } from '@/lib/firestore';
import * as cheerio from 'cheerio';

// oEmbed providers configuration
const OEMBED_PROVIDERS = {
  youtube: {
    patterns: [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/],
    endpoint: 'https://www.youtube.com/oembed',
  },
  tiktok: {
    patterns: [/tiktok\.com\/@([^\/]+)\/video\/([^\/]+)/],
    endpoint: 'https://www.tiktok.com/oembed',
  },
  twitter: {
    patterns: [/twitter\.com\/[^\/]+\/status\/([^\/]+)/, /x\.com\/[^\/]+\/status\/([^\/]+)/],
    endpoint: 'https://publish.twitter.com/oembed',
  },
  instagram: {
    patterns: [/instagram\.com\/p\/([^\/]+)/, /instagram\.com\/reel\/([^\/]+)/],
    endpoint: 'https://api.instagram.com/oembed',
  },
  vimeo: {
    patterns: [/vimeo\.com\/([^\/]+)/],
    endpoint: 'https://vimeo.com/api/oembed.json',
  },
  spotify: {
    patterns: [/spotify\.com\/track\/([^\/]+)/, /spotify\.com\/album\/([^\/]+)/],
    endpoint: 'https://open.spotify.com/oembed/',
  },
};

// Step 1: Try oEmbed
async function tryOEmbed(url: string) {
  for (const [provider, config] of Object.entries(OEMBED_PROVIDERS)) {
    for (const pattern of config.patterns) {
      const match = url.match(pattern);
      if (match) {
        try {
          const oembedUrl = `${config.endpoint}?url=${encodeURIComponent(url)}&format=json`;
          const response = await fetch(oembedUrl, {
            headers: {
              'User-Agent': 'HERIANSAH-LinkPreview-Bot/1.0',
            },
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            const data = await response.json();
            return {
              title: data.title || '',
              description: data.description || data.author_name || '',
              image: data.thumbnail_url || data.author_icon || '',
              siteName: provider.charAt(0).toUpperCase() + provider.slice(1),
              type: 'oembed',
            };
          }
        } catch (error) {
          console.log(`oEmbed failed for ${provider}:`, error);
        }
      }
    }
  }
  return null;
}

// Step 2: Static HTML scraping
async function tryStaticScraping(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HERIANSAH-LinkPreview-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract Open Graph tags with fallbacks
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  $('title').text() || '';

    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';

    const image = $('meta[property="og:image"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content') || 
                  $('link[rel="image_src"]').attr('href') || '';

    const siteName = $('meta[property="og:site_name"]').attr('content') || 
                    $('meta[name="twitter:site"]').attr('content') || 
                    new URL(url).hostname;

    // For Instagram, try to extract additional data from embedded JSON
    let extractedData: any = {};
    if (url.includes('instagram.com')) {
      const scriptTags = $('script[type="application/ld+json"]');
      scriptTags.each((_, element) => {
        try {
          const jsonContent = $(element).html();
          if (jsonContent) {
            const parsed = JSON.parse(jsonContent);
            if (parsed.image && parsed.image.url) {
              extractedData.image = parsed.image.url;
            }
            if (parsed.name) {
              extractedData.title = parsed.name;
            }
            if (parsed.description) {
              extractedData.description = parsed.description;
            }
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      });

      // Also try to extract from window._sharedData
      const scriptText = $('script').filter((_, el) => {
        const text = $(el).html() || '';
        return text.includes('window._sharedData');
      }).html();

      if (scriptText) {
        try {
          const match = scriptText.match(/window\._sharedData = ({.+});/);
          if (match && match[1]) {
            const sharedData = JSON.parse(match[1]);
            const mediaData = sharedData?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
            if (mediaData) {
              extractedData.image = mediaData.display_url || extractedData.image;
              extractedData.title = mediaData.owner?.full_name || extractedData.title;
              extractedData.description = mediaData.edge_media_to_caption?.edges?.[0]?.node?.text || extractedData.description;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    return {
      title: (extractedData.title || title).trim(),
      description: (extractedData.description || description).trim(),
      image: (extractedData.image || image).trim(),
      siteName: siteName.trim(),
      type: 'static',
    };
  } catch (error) {
    console.log('Static scraping failed:', error);
    return null;
  }
}

// Step 3: Headless browser (simplified for Vercel compatibility)
async function tryHeadlessBrowser(url: string) {
  // For Vercel deployment, we'll use a different approach
  // since Puppeteer with chrome-aws-lambda can be complex
  try {
    // Try a more aggressive fetch with additional headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      // Try to extract data from JavaScript-rendered content
      let title = $('title').text() || 
                  $('h1').first().text() || 
                  $('meta[property="og:title"]').attr('content') || '';

      let description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('p').first().text().substring(0, 160) || '';

      let image = $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="twitter:image"]').attr('content') || 
                    $('img').first().attr('src') || '';

      // For Instagram, try additional extraction methods
      if (url.includes('instagram.com')) {
        // Try to find the main image from various selectors
        const selectors = [
          'meta[property="og:image"]',
          'meta[name="twitter:image"]',
          'link[rel="image_src"]',
          'img[src*="cdninstagram"]',
          'img[alt*="photo"]'
        ];
        
        for (const selector of selectors) {
          const found = $(selector).first();
          if (found.length) {
            const src = found.attr('content') || found.attr('href') || found.attr('src');
            if (src && src.startsWith('http')) {
              image = src;
              break;
            }
          }
        }

        // Try to extract caption text
        const captionSelectors = [
          'meta[property="og:description"]',
          'meta[name="twitter:description"]',
          '.Caption',
          '[data-testid="post-caption"]',
          'h2'
        ];
        
        for (const selector of captionSelectors) {
          const found = $(selector).first();
          if (found.length) {
            const text = found.attr('content') || found.text();
            if (text && text.length > 10) {
              description = text.substring(0, 200);
              break;
            }
          }
        }

        // Try to get a better title
        const titleSelectors = [
          'meta[property="og:title"]',
          'meta[name="twitter:title"]',
          'title',
          'h1'
        ];
        
        for (const selector of titleSelectors) {
          const found = $(selector).first();
          if (found.length) {
            const text = found.attr('content') || found.text();
            if (text && text.length > 0) {
              title = text;
              break;
            }
          }
        }
      }

      const siteName = $('meta[property="og:site_name"]').attr('content') || 
                      new URL(url).hostname;

      return {
        title: title.trim(),
        description: description.trim(),
        image: image.startsWith('http') ? image : new URL(url, image).href,
        siteName: siteName.trim(),
        type: 'headless',
      };
    }
  } catch (error) {
    console.log('Headless browser fallback failed:', error);
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Check cache first
    const cached = await getCachedLink(url);
    if (cached) {
      return NextResponse.json(cached);
    }

    let result = null;

    // Step 1: Try oEmbed
    result = await tryOEmbed(url);
    
    // Step 2: Try static scraping
    if (!result) {
      result = await tryStaticScraping(url);
    }
    
    // Step 3: Try headless browser fallback
    if (!result) {
      result = await tryHeadlessBrowser(url);
    }

    if (!result) {
      // Return basic info if all methods fail
      result = {
        title: new URL(url).hostname,
        description: 'No description available',
        image: '',
        siteName: new URL(url).hostname,
        type: 'fallback',
      };
    }

    // Cache the result
    await cacheLink(url, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Meta scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape metadata' },
      { status: 500 }
    );
  }
}