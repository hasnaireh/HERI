# Portfolio Web Application

A complete, multi-file Next.js web application with Firebase Firestore backend, featuring a public portfolio page and admin dashboard.

## Features

### Core Features
- **Next.js 15** with App Router and TypeScript
- **Firebase Firestore** for content database
- **Firebase Authentication** for admin login
- **Tailwind CSS** with glassmorphism design
- **Dark/Light mode** toggle
- **Responsive design** for all screen sizes

### Public Page (/)
- **Profile Section**: Large rounded-square profile photo, name, and bio
- **Social Links**: Horizontal list with dynamic icons (Instagram, TikTok, Twitter, etc.)
- **Promo Links**: Interactive buttons with "Tersedia/Tidak Tersedia" status
- **30-Second Countdown**: Modal system for promo links with countdown timer
- **Portfolio Gallery**: Grid of rich preview cards with automatic metadata fetching

### Admin Dashboard (/admin)
- **Protected Route**: Firebase Authentication required
- **Settings Management**: Site title, profile name, bio, and profile picture URL
- **Social Links CRUD**: Create, read, update, delete with drag-and-drop reordering
- **Promo Links CRUD**: Management with availability status
- **Portfolio Management**: Automatic metadata fetching with preview
- **Drag-and-Drop**: Reorder social links and promo links

### Advanced API Route
- **3-Step Hybrid Strategy** for link metadata scraping:
  1. **oEmbed API** (YouTube, TikTok, Twitter, Instagram, etc.)
  2. **Static HTML Scraping** with Cheerio
  3. **Headless Browser Fallback** for SPA sites
- **Caching System**: 24-hour cache in Firestore
- **Timeout Protection**: 5-15 second timeouts for all requests

## Database Collections

### Firestore Collections
- `settings`: Site configuration (siteTitle, profileName, profileBio, profilePicture)
- `socialLinks`: Social media links with order field
- `promoLinks`: Promotional links with availability status
- `portfolioItems`: Portfolio items with rich metadata
- `linkCache`: 24-hour cache for scraped metadata

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── scrape-meta/
│   │       └── route.ts          # Advanced metadata scraping API
│   ├── admin/
│   │   └── page.tsx             # Admin dashboard
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Public portfolio page
│   └── globals.css              # Glassmorphism styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── drag-drop-list.tsx       # Drag-and-drop component
│   └── theme-provider.tsx       # Dark/light mode context
├── lib/
│   ├── firebase.js              # Firebase configuration
│   ├── firestore.js             # Database operations
│   ├── icons.ts                 # Dynamic icon utilities
│   └── utils.ts                 # Utility functions
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore enabled
- Firebase Authentication configured

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication (Email/Password method)
4. Update Firebase configuration in `src/lib/firebase.js` if needed

### Environment Variables
No additional environment variables required - Firebase config is included in the code.

### Development
```bash
npm run dev
```

### Deployment to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy - Vercel will automatically detect and build the Next.js application

## Key Features Explained

### Glassmorphism Design
- Frosted glass effect with backdrop-filter
- Distinct floating panels for each section
- High contrast text for readability
- Smooth transitions and hover effects

### Dynamic Icon System
- Automatic icon detection based on URL
- Support for major social platforms
- Fallback to generic link icon
- Uses react-icons library

### Promo Link Modal System
- "Tidak Tersedia" status for empty/invalid URLs
- 30-second countdown before enabling visit button
- Follow TikTok call-to-action
- Glassmorphism modal design

### Admin Dashboard Features
- Real-time updates without page refresh
- Drag-and-drop reordering with visual feedback
- Profile picture URL with live thumbnail preview
- Portfolio metadata fetching with loading states

### API Scraping Strategy
1. **oEmbed Priority**: Checks against known providers (YouTube, TikTok, etc.)
2. **Static Scraping**: Parses HTML meta tags with Cheerio
3. **Headless Fallback**: Enhanced fetch for JavaScript-rendered content
4. **Caching**: 24-hour Firestore cache to reduce API calls

## Security Features
- Firebase Authentication for admin access
- Protected routes with automatic redirects
- Input validation and sanitization
- Timeout protection for external requests
- CORS handling for API routes

## Performance Optimizations
- Firestore caching for metadata
- Optimistic updates in admin dashboard
- Lazy loading for portfolio images
- Efficient re-rendering with React hooks
- Glassmorphism effects using CSS transforms

## Browser Support
- Modern browsers with CSS backdrop-filter support
- Responsive design for mobile, tablet, and desktop
- Touch-friendly interface elements
- Accessible semantic HTML structure

## License
This project is open source and available under the MIT License.