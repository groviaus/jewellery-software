# Create New Supabase Project for Jewellery Store

## Issue
The jewellery store tables were accidentally created in your restaurant-pos project. We need to create a **separate Supabase project** for the jewellery store software.

## Steps to Create New Project

### Step 1: Create New Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click **"New Project"** button (top right)
3. Fill in the project details:
   - **Name**: `jewellery-store` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., `ap-south-1` for India)
   - **Pricing Plan**: Free tier is fine for MVP
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

### Step 2: Get Your Project Credentials

Once the project is ready:

1. Go to: **Settings** → **API** (in the left sidebar)
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Update Environment Variables

Update your `.env.local` file with the NEW project credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
```

### Step 4: Create Database Schema

After you have the new project, I can help you create the database schema in the new project. Just let me know the new project reference ID or URL.

---

## Alternative: Use Existing Project (If You Want)

If you prefer to keep everything in one project, we can:
1. Keep the jewellery tables in the current project (they won't interfere)
2. Use the same Supabase project for both applications
3. The tables are already prefixed with `jewellery_` so they're separate

**However, it's recommended to use a separate project for better organization and isolation.**

---

## What I Need From You

Please either:
1. **Create a new Supabase project** and share the project URL/reference ID, OR
2. **Tell me if you want to use the existing project** (restaurant-pos) for both

Once you have the new project, I'll:
- Create all the database tables
- Set up RLS policies
- Update the environment configuration
- Verify everything works

