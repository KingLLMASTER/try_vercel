# Deployment Guide for Flux Plan

This application is built with **Vite**, **React**, **TypeScript**, and **Supabase**.

## Prerequisites

1.  **Node.js**: Version 18 or higher.
2.  **Supabase Project**: You need a Supabase project set up.

## Environment Variables

Create a `.env` file in the root directory (or configure these in your hosting provider's dashboard) with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1.  Go to your Supabase Dashboard -> SQL Editor.
2.  Run the contents of `supabase/schema.sql` to create the necessary tables and policies.
3.  (Optional) Seed initial data if needed.

## Build & Deploy

### Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Vercel should automatically detect Vite.
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  Add your Environment Variables in the Vercel Project Settings.
5.  Deploy!

### Netlify

1.  Push your code to GitHub.
2.  New Site from Git -> Select repository.
3.  **Build Command**: `npm run build`
4.  **Publish Directory**: `dist`
5.  Add Environment Variables in Site Settings -> Build & Deploy -> Environment.
6.  Deploy site.

### Manual / Static Hosting

1.  Run `npm install` to install dependencies.
2.  Run `npm run build` to create the production bundle.
3.  The `dist` folder contains the static assets. Upload this folder to any static hosting service (Apache, Nginx, S3, etc.).
    - *Note*: Ensure your server is configured to redirect all requests to `index.html` for client-side routing to work (SPA fallback).

## Troubleshooting

- **Build Errors**: Ensure all TypeScript types are correct. Run `npm run build` locally to debug.
- **Supabase Connection**: Check that your `.env` variables are correct and that you have enabled Row Level Security (RLS) policies if data isn't showing up.
