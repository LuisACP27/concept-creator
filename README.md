# Concept Creator

A Next.js application for creating and visualizing music album concepts.

## Features

- ✨ Create detailed album concepts with comprehensive information
- 🎨 Upload custom cover images
- 🎵 Add tracklist with audio files
- 📱 Responsive design for mobile and desktop
- 🌙 Modern dark theme
- 💾 Local storage for data persistence
- 🎯 Intuitive and easy-to-use interface

## Technologies

- **Next.js 15** - React Framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility styles
- **shadcn/ui** - UI Components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icons

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:9002](http://localhost:9002) in your browser

## Usage

1. **Main Page**: View all your album concepts
2. **Create Album**: Click "+" to create a new concept
3. **Edit**: Click on any album to edit it
4. **Delete**: Use the delete button on the edit page

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
├── hooks/              # Custom hooks
├── lib/                # Utilities
└── types/              # Type definitions
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run start` - Production server
- `npm run lint` - Linter
- `npm run typecheck` - Type checking 