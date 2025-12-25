# Login Credentials Setup Guide

## Quick Setup (Recommended)

I've created a setup page that allows you to create your store owner account directly from the application.

### Steps:

1. **Start your development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Navigate to the setup page**:
   - Go to: http://localhost:3000/setup
   - Or click "Create Store Owner Account" link on the login page

3. **Enter your credentials**:
   - Email: Your email address (e.g., `owner@jewellerystore.com`)
   - Password: A secure password (minimum 6 characters)
   - Confirm Password: Re-enter your password

4. **Click "Create Account"**

5. **Login automatically**:
   - After account creation, you'll be automatically logged in
   - If email confirmation is enabled, check your email first

## Alternative: Create via Supabase Dashboard

If you prefer to create the user via Supabase Dashboard:

1. **Go to Supabase Auth Dashboard**:
   - Direct link: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx/auth/users

2. **Create New User**:
   - Click "Add user" button (top right)
   - Select "Create new user"
   - Enter:
     - **Email**: Your email address
     - **Password**: Your secure password
     - **Auto Confirm User**: ✅ Enable this (so you can login immediately)
   - Click "Create user"

3. **Login to Application**:
   - Go to: http://localhost:3000/login
   - Use the email and password you just created

## Disable Email Confirmation (Optional)

If you want to login immediately without email confirmation:

1. Go to: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx/auth/providers
2. Find "Email" provider
3. Toggle off "Confirm email" (or set "Enable email confirmations" to false)
4. Save changes

This allows users to login immediately after signup without confirming their email.

## Default Test Credentials (Example)

You can create an account with these credentials:

- **Email**: `admin@jewellerystore.com`
- **Password**: `Admin123!` (or any secure password you prefer)

**Note**: These credentials don't exist yet - you need to create them using one of the methods above.

## Troubleshooting

### "User already exists" error
- This means an account with that email already exists
- Try logging in with that email instead
- Or use a different email address

### "Email not confirmed" error
- Check your email inbox for a confirmation link
- Click the link to confirm your account
- Or disable email confirmation in Supabase settings (see above)

### Can't access Supabase Dashboard
- Make sure you're logged into the correct Supabase account
- Try the direct project link: https://supabase.com/dashboard/project/frhzrhxjdkxyjpbpyyxx
- Check if the project is in a different organization

## After Creating Account

Once you've created your account and logged in:

1. ✅ You'll be redirected to the Dashboard
2. ✅ Go to Settings to configure your store information
3. ✅ Start adding inventory items
4. ✅ Begin using the POS system

---

**The setup page at `/setup` is the easiest way to create your first account!**

