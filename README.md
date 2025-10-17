# IPTV Web Application

A full-stack IPTV streaming application built with Next.js, TypeScript, MongoDB, and TailwindCSS.

## Features

- **Mandatory Activation Flow**: Users must add a playlist before accessing the app
- **Multiple Playlist Input Methods**:
  - URL input (M3U/M3U8 links)
  - Raw M3U content paste
  - File upload
  - Device key activation
- **Playlist Preview**: See channel count and sample channels before saving
- **MongoDB Persistence**: All playlists and channels saved to database
- **Device-based Storage**: Each device gets a unique key for playlist management
- **M3U Parser**: Server-side parsing with error handling and validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/iptv-app
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iptv-app
\`\`\`

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

### Testing the Activation Flow

1. Click "Try Demo Playlist" to test with mock data
2. Or add your own M3U playlist URL
3. Preview the parsed channels
4. Confirm to save and proceed to the main app

## Project Structure

\`\`\`
├── app/
│   ├── activate/          # Activation page (first screen)
│   ├── main/              # Main app (coming next)
│   ├── api/
│   │   ├── playlists/     # Playlist CRUD endpoints
│   │   └── channels/      # Channel fetch endpoints
│   └── layout.tsx
├── components/
│   └── activation/        # Activation form components
├── lib/
│   ├── models/            # Mongoose models
│   ├── m3u-parser.ts      # M3U parsing logic
│   ├── device-utils.ts    # Device key management
│   └── mongodb.ts         # Database connection
└── types/
    └── global.d.ts        # TypeScript declarations
\`\`\`

## Database Models

- **Device**: Stores device keys and associated playlists
- **Playlist**: Stores playlist metadata and content
- **Channel**: Individual channels parsed from playlists
- **WatchHistory**: User viewing history (coming soon)

## API Endpoints

- `POST /api/playlists/parse` - Parse and preview playlist
- `POST /api/playlists` - Save playlist to database
- `GET /api/playlists?deviceKey=xxx` - Get device playlists
- `GET /api/channels?playlistId=xxx` - Get playlist channels

## Next Steps

This is Task 1 of 6. Coming next:
- Main navigation page with Live/Movies/Series sections
- Video player with HLS support
- Settings and playlist management
- Admin panel

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Deployment**: Vercel-ready
\`\`\`
