# 📺 IPTV Web Application

A modern, full-stack web IPTV streaming platform built with Next.js 15, TypeScript, MongoDB, and TailwindCSS. Stream live TV, movies, and series with a beautiful, TV-optimized interface.

![IPTV App](public/images/starry-night-bg.jpg)

## ✨ Features

### 🎯 Core Functionality
- **Mandatory Activation Flow**: Secure playlist activation before accessing content
- **Multiple Input Methods**: 
  - 🔗 URL input (M3U/M3U8 links with query parameter support)
  - 📝 Raw M3U content paste
  - 📁 File upload (.m3u, .m3u8)
  - 📱 QR code scanning for mobile activation
  - 🔑 Device key authentication
- **Real-time Playlist Preview**: View channel count and samples before saving
- **Smart M3U Parser**: Server-side parsing with validation, error handling, and sanitization

### 📺 Content Management
- **Live TV**: Browse and watch live television channels
- **Movies**: Dedicated section for on-demand movies
- **Series**: Organized TV shows and series content
- **Smart Categorization**: Automatic content type detection from M3U groups
- **Advanced Search**: Search across all channels (200k+ supported)
- **Client-side Pagination**: Display 50 items per page with smooth navigation
- **Multiple View Modes**: Grid and list view options
- **Category Filtering**: Filter by channel groups

### 🎬 Video Player
- **HLS Support**: Adaptive bitrate streaming with HLS.js
- **Direct Stream Playback**: Fallback for non-HLS streams
- **Quality Selection**: Manual and automatic quality switching
- **Full Controls**: Play/pause, volume, seek, fullscreen
- **Picture-in-Picture**: Watch while browsing
- **Subtitle Support**: Toggle subtitles on/off
- **Stream Proxy**: Server-side proxy for CORS-restricted streams
- **Error Recovery**: Automatic retry and fallback mechanisms

### ⚙️ Settings & Management
- **Playlist Management**: Add, switch, and delete playlists
- **Parental Controls**: PIN protection for restricted content
- **Playback Settings**: Autoplay and quality preferences
- **Theme Customization**: Dark mode with pink accent theme
- **Language Options**: Multi-language support
- **Device Management**: Track and manage connected devices

### 👨‍💼 Admin Panel
- **Playlist Overview**: View all playlists with statistics
- **Device Monitoring**: Track active devices and usage
- **System Logs**: View application logs and errors
- **Bulk Management**: Delete and manage multiple playlists

### 🎨 Design
- **Modern UI**: Beautiful glassmorphism effects with starry night background
- **Responsive Design**: Works on desktop, tablet, and mobile
- **TV-Optimized**: Keyboard and remote navigation support
- **Dark Theme**: Eye-friendly dark mode with pink accents
- **Smooth Animations**: Polished transitions and interactions

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Video Player**: [HLS.js](https://github.com/video-dev/hls.js/)
- **QR Codes**: [qrcode](https://www.npmjs.com/package/qrcode)

### Backend
- **Runtime**: Node.js 18+
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **API**: Next.js API Routes (REST)
- **Authentication**: Device-based (no accounts required)

### Deployment
- **Platform**: [Vercel](https://vercel.com/) (optimized)
- **Database**: MongoDB Atlas compatible
- **CDN**: Vercel Edge Network

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB instance (local or cloud)
- npm, yarn, or pnpm package manager


### First Time Setup

1. You'll be redirected to the activation page
2. Choose one of the input methods:
   - **Try Demo**: Click "Try Demo Playlist" for instant testing
   - **URL**: Paste your M3U playlist URL
   - **Content**: Paste raw M3U content
   - **File**: Upload an M3U file
   - **QR Code**: Scan the QR code with your mobile device
3. Preview the parsed channels
4. Click "Confirm & Continue" to save
5. Start streaming!

## 📖 Usage Guide

### Adding a Playlist

#### Method 1: URL Input
\`\`\`
http://your-provider.com/get.php?username=xxx&password=xxx&type=m3u_plus&output=ts
\`\`\`

#### Method 2: Raw M3U Content
```m3u
#EXTM3U
#EXTINF:-1 tvg-id="channel1" tvg-logo="logo.png" group-title="Live TV",Channel Name
http://stream-url.com/channel1
