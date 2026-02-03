# Project Context: Bucktown Squares

## Overview
**Bucktown Squares** is a digital implementation of the classic Super Bowl Squares game. It features a 10x10 grid where users can claim squares in real-time. The application is built with a modern, glassmorphic UI ("Aurora" style) and leverages Supabase for real-time data synchronization.

## Tech Stack & Architecture
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **State Management:** React Server Components (initial fetch) + Supabase Realtime (live updates)
- **Deployment:** Vercel (implied)

## Key Directories & Files
- **Documentation**: `.dev-docs/plan.md` contains the architectural plan and user flow.
- **Database**: `supabase/schema.sql` defines the `squares` and `game_state` tables and RLS policies.
- **App Entry**: `app/page.tsx` is the main server component that fetches initial grid data.
- **Components**:
  - `components/Grid.tsx`: The interactive 10x10 grid component.
  - `components/Square.tsx`: Individual grid cell.
  - `components/ClaimModal.tsx`: Dialog for users to claim a square.
- **Utilities**: `utils/supabase/` contains client and server Supabase clients.

## Database Schema
### `squares` Table
Represents the 100 grid cells (10x10).
- `id` (uuid): Primary Key.
- `x`, `y` (int): Grid coordinates (0-9).
- `user_name` (text): Visible name of the claimant.
- `user_email` (text): Contact info (RLS should ideally protect this).
- `color` (text): Optional visual identifier.

### `game_state` Table
Manages global game settings.
- `row_numbers` (int[]): 10 random numbers for rows.
- `col_numbers` (int[]): 10 random numbers for columns.
- `is_locked` (boolean): Prevents new claims when true.

## Development Workflow
### Prerequisites
- Node.js & npm/pnpm
- Supabase project credentials (environment variables)

### Common Commands
- **Start Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

### Design System
The project follows a "Glassmorphism" aesthetic:
- **Background:** Colorful "Aurora" gradients.
- **Components:** High transparency, blur filters (`backdrop-filter: blur(12px)`), and subtle white borders/shadows to simulate glass.
- **Typography:** Inter (Geist) font family.
