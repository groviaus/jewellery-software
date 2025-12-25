# Setup Instructions for Jewellery Store Management Software

## 🔍 Finding Your Supabase Project

Your Supabase project is already created and connected! Here's how to find it:

### Project Details:
- **Project Reference ID**: `frhzrhxjdkxyjpbpyyxx`
- **Project URL**: https://frhzrhxjdkxyjpbpyyxx.supabase.co
- **Dashboard URL**: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx

### How to Access:

1. **Direct Link Method**:
   - Go to: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx
   - This will take you directly to your project dashboard

2. **Search in Dashboard**:
   - Go to: https://supabase.com/dashboard
   - Click on "Projects" in the sidebar
   - Search for project reference: `frhzrhxjdkxyjpbpyyxx`
   - Or look for a project with the URL containing `frhzrhxjdkxyjpbpyyxx`

3. **Check All Organizations**:
   - The project might be in a different organization
   - Click on your organization name (top left)
   - Check if there are other organizations you're part of
   - Switch organizations if needed

## ✅ Environment Variables Setup

I've created a `.env.local` file with your Supabase credentials. The file contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://frhzrhxjdkxyjpbpyyxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Make sure `.env.local` is in your `.gitignore` file (it should be by default in Next.js projects).

## 🗄️ Database Status

Your database is **already set up** with all required tables:

✅ `jewellery_store_settings`
✅ `jewellery_items`
✅ `jewellery_customers`
✅ `jewellery_invoices`
✅ `jewellery_invoice_items`

All tables have Row Level Security (RLS) enabled and are ready to use.

## 🚀 Next Steps

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Create Your First User**:
   - Go to: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx/auth/users
   - Click "Add user" → "Create new user"
   - Enter email and password
   - This will be your store owner account

4. **Access the Application**:
   - Open: http://localhost:3000
   - Login with the user you just created
   - Start using the jewellery store management system!

## 🔐 Authentication Setup

Since this is a single-user system (owner only), you need to:

1. Create a user in Supabase Auth dashboard
2. Use that email/password to login to the application
3. The system will automatically create store settings when you first access the settings page

## 📊 Verify Database Connection

To verify everything is working:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to see your tables:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'jewellery_%';
   ```

You should see all 5 tables listed.

## 🆘 Troubleshooting

### If you can't find the project:

1. **Check if you're logged into the correct Supabase account**
2. **Try the direct project URL**: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx
3. **Check your email** - You might have received a project invitation
4. **Contact Supabase support** if the project reference doesn't work

### If the app doesn't connect:

1. Verify `.env.local` file exists and has correct values
2. Restart your development server after creating `.env.local`
3. Check browser console for any connection errors
4. Verify the API keys are correct in Supabase dashboard

## 📝 Project Information

- **Project Name**: Jewellery Store Management (MVP)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Status**: ✅ Ready for use

---

**Note**: The project is already fully configured and ready to use. You just need to:
1. Find it in your Supabase dashboard (or use the direct link)
2. Create a user account
3. Start the development server
4. Begin using the application!

