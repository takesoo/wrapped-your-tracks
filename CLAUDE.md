# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application that creates a Spotify Wrapped-style interface for displaying weekly music listening statistics. The app simulates a Spotify integration with a landing page that connects users, a loading animation, and a summary page showing mock music data and AI-generated personas.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Architecture

### Frontend Framework
- **Next.js 15** with App Router architecture
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with custom gradient color scheme
- **shadcn/ui** components library (New York style)

### Key Dependencies
- **Recharts** for data visualization charts
- **Lucide React** for icons
- **Radix UI** components as base for shadcn/ui
- **Class Variance Authority** for component styling patterns

### UI Theme
The app uses a dark theme with Spotify-inspired colors:
- Primary green: `#1DB954` 
- Accent cyan: `#00FFC2`
- Accent blue: `#33BBFF`
- Background: `#0D0D0D` (very dark)
- Text: White with `#A1A1A1` for muted text

### Route Structure
- `/` - Landing page with hero section and feature cards
- `/loading` - Animated loading page that simulates data processing
- `/summary` - Main results page with mock music statistics, charts, and AI persona

### Component Architecture
- Uses shadcn/ui components (Button, Card, Badge) with custom styling
- Components are located in `components/ui/` 
- Path aliases configured: `@/components`, `@/lib/utils`
- All components use Tailwind for styling with heavy use of gradients and glassmorphism effects

### Data Flow
Currently uses mock data embedded in components. The loading page simulates a 5-second process before redirecting to summary. The summary page displays hardcoded top artists, tracks, and AI-generated music persona.

## Personal Preferences
- 日本語で会話してください (Please talk to me in Japanese)