# MCP Configuration Guide for New Jewellery Store Project

## Current Issue
The Supabase MCP is currently connected to the old project (`frhzrhxjdkxyjpbpyyxx`). We need to reconfigure it to point to your new jewellery-store project (`eiepxzwxifbudcnxxceg`).

## Your New Project Credentials
- **Project URL**: `https://eiepxzwxifbudcnxxceg.supabase.co`
- **Publishable API Key**: `sb_publishable_vGt0Egt_RWRumQBiKOtLuQ_VBoI58G7`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZXB4end4aWZidWRjbnh4Y2VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY3NDc1NCwiZXhwIjoyMDgyMjUwNzU0fQ.Dj_RcoZXymAQa_jT9n3lqvFHiTPMj5zAb5KyocRDXPY`

## How to Update MCP Configuration in Cursor

1. **Open Cursor Settings**:
   - Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
   - Or go to: Cursor → Settings → Preferences

2. **Find MCP Settings**:
   - Search for "MCP" or "Model Context Protocol" in settings
   - Look for Supabase MCP server configuration

3. **Update Supabase MCP Configuration**:
   The configuration typically looks like this in your settings file (usually `.cursor/mcp.json` or similar):

   ```json
   {
     "mcpServers": {
       "supabase": {
         "url": "https://eiepxzwxifbudcnxxceg.supabase.co",
         "serviceRoleKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZXB4end4aWZidWRjbnh4Y2VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY3NDc1NCwiZXhwIjoyMDgyMjUwNzU0fQ.Dj_RcoZXymAQa_jT9n3lqvFHiTPMj5zAb5KyocRDXPY"
       }
     }
   }
   ```

4. **Restart Cursor**:
   - After updating the configuration, restart Cursor completely
   - This ensures the MCP server reconnects with the new credentials

## Alternative: Run SQL Directly in Supabase Dashboard

If you prefer not to reconfigure MCP right now, you can run the SQL migration directly:

1. Go to: https://supabase.com/dashboard/project/eiepxzwxifbudcnxxceg/sql/new
2. Copy the SQL from `create_jewellery_tables.sql` file
3. Paste and run it in the SQL Editor

This will create all tables, RLS policies, and triggers in your new project.

## After Configuration

Once the MCP is reconfigured, I can:
- Verify the connection to the new project
- Create all tables using MCP migrations
- Set up RLS policies
- Create triggers and functions

Let me know once you've updated the MCP configuration, and I'll proceed with creating the tables!

