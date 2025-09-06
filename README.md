
# Kniyotes – Family Shopping List

Kniyotes is a playful, minimal, real-time family shopping list app built with Expo, React Native, and Supabase.

## Features
- Onboarding: Create or join a family list with a code
- Real-time shared shopping list (Supabase sync)
- Invite family members with a code (copy/share)
- Sign out and switch families
- Minimal, playful UI (inspired by Duolingo/Not Boring Weather)

## Getting Started

### 1. Prerequisites
- Node.js (18+ recommended)
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (see below for schema)

### 2. Install dependencies
```sh
npm install
```

### 3. Configure Supabase
Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Supabase SQL (run in SQL editor):
```sql
create table families (
   id text primary key
);

create table members (
   id bigserial primary key,
   family_id text references families(id) on delete cascade,
   name text not null
);

create table items (
   id text primary key,
   family_id text references families(id) on delete cascade,
   title text not null,
   done boolean not null default false,
   added_by text,
   created_at timestamptz default now()
);
```

#### Enable Realtime
- In Supabase dashboard, go to "Database" > "Replication" and enable realtime for the `items` table.

### 4. Run the app
```sh
npm start
```
- Press `i` for iOS, `a` for Android, or `w` for web.

## Usage
- **Onboarding:** Enter your name and create or join a family with a code.
- **List:** Add, check, or remove items. All changes sync instantly for all family members.
- **Invite:** Tap "Invite" to copy/share your family code.
- **Sign Out:** Tap "Sign Out" to leave the family and return to onboarding.

## Tech Stack
- React Native (Expo)
- Supabase (Postgres, Realtime)
- TypeScript

## Customization
- UI is easy to theme and extend (see `components/` and `constants/Colors.ts`).
- Add avatars, notifications, or more with Supabase and Expo APIs.

