# Super Bowl Squares App Plan

## 1. Architecture
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 (Glassmorphism/Apple-style)
- **Hosting**: Vercel (Implied/Compatible)

## 2. Database Schema

### Table: `squares`
Stores the 100 squares (10x10 grid).
- `id`: uuid (PK)
- `x`: integer (0-9) - Grid coordinate
- `y`: integer (0-9) - Grid coordinate
- `user_name`: text (nullable) - Visible to everyone
- `user_email`: text (nullable) - Private, for admin use/claiming
- `color`: text (nullable) - Optional: random color for user avatar/bg
- `created_at`: timestamp

*RLS Policies:*
- `SELECT`: Public (anon), but EXCLUDE `user_email` if possible (or just don't select it in the client).
- `UPDATE`: Public (anon), but strictly `CHECK (user_name IS NULL)`. Users can only claim empty squares.

### Table: `game_state`
Stores the row/column numbers and game status.
- `id`: uuid (PK)
- `row_numbers`: int[] (Array of 10 integers) - Generated later
- `col_numbers`: int[] (Array of 10 integers) - Generated later
- `is_locked`: boolean - Defaults to false.

## 3. User Flow
1.  **Landing**: User sees a beautiful 10x10 glass grid.
2.  **View**:
    - Empty squares are semi-transparent glass.
    - Taken squares show the `user_name`.
    - Axis labels (numbers) are hidden (or "?") until generated.
3.  **Action**:
    - User clicks an empty square.
    - A Glass Modal appears: "Claim this Square".
    - Inputs: Full Name, Email.
    - Button: "Confirm".
4.  **Backend**:
    - Next.js Server Action receives request.
    - Validates square is still empty.
    - Updates row in Supabase.
5.  **Realtime**:
    - All connected clients receive the update via Supabase Realtime and the grid updates instantly.

## 4. Admin Flow (Manual/Seed)
- A hidden or database-triggered function to "Generate Numbers" once the grid is full or game starts.
- This assigns random 0-9 arrays to `game_state`.

## 5. UI/UX Design (Glassmorphism)
- **Background**: Abstract, colorful gradient mesh (aurora style) to emphasize the glass effect.
- **Grid**:
    - `backdrop-filter: blur(12px)`
    - `background: rgba(255, 255, 255, 0.1)`
    - `border: 1px solid rgba(255, 255, 255, 0.2)`
    - `shadow: 0 4px 30px rgba(0, 0, 0, 0.1)`
- **Typography**: Inter (default Next.js), clean, thin weights.

## 6. Implementation Steps
1.  **Setup Supabase**: Create tables and policies.
2.  **Seed Data**: Insert the 100 empty square rows.
3.  **Frontend Components**:
    - `Grid`: The main 10x10 layout.
    - `Square`: Individual cell.
    - `ClaimModal`: Dialog for input.
4.  **Server Actions**: `claimSquare` function.
5.  **Realtime Hooks**: `useRealtimeSquares` to listen for updates.
6.  **Polishing**: Animations, error handling, mobile responsiveness.
