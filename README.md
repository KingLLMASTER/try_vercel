# Flux Plan 📅

Flux Plan is a modern, multi-tenant workforce management and scheduling application. It allows organizations to manage employees, sites, and shifts with an intuitive drag-and-drop interface.

## 🚀 Features

-   **Multi-Tenant Architecture:** Secure data isolation for multiple organizations.
-   **Planning View:** Interactive timeline grid for managing shifts.
-   **Drag-and-Drop:** Easily reassign shifts between employees.
-   **Employee Management:** comprehensive profiles and role management.
-   **Site Management:** Manage multiple work locations.
-   **Authentication:** Secure login and signup with Supabase Auth.

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Styling:** Tailwind CSS, Shadcn UI
-   **State Management:** TanStack Query
-   **Backend:** Supabase (PostgreSQL, Auth, Realtime)
-   **Drag & Drop:** @dnd-kit

## 📦 Setup

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file based on `.env.example` and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  **Run locally:**
    ```bash
    npm run dev
    ```

## 🔒 Security

This project uses Row Level Security (RLS) to ensure users can only access data belonging to their organization.
