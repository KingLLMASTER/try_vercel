# Flux Plan - Analysis, Feedback & Implementation Plan

## 1. Analysis & "PhD" Feedback (Math & Architecture)

### 1.1 Scheduling Algorithm Optimization (The "Math" Part)
The proposed algorithm (Section 6.4) is a **Greedy Heuristic**. While simple to implement, it often produces sub-optimal results for complex constraints.
**Critique:**
- **Fairness:** Sorting purely by seniority (veterans first) creates a "rich get richer" problem where veterans always get the best shifts/hours, potentially violating "Distribution équitable des heures" (6.3).
- **Constraint Satisfaction:** A simple loop might hit a dead end (e.g., the last shift has no available employees because they were all greedily assigned earlier), requiring backtracking which isn't described.

**Proposed Optimization (Constraint Satisfaction Problem - CSP):**
We should model this as a **Weighted Cost Function** minimization problem.
$$ Minimize \ Cost = \sum (w_c \cdot C_{conflict} + w_f \cdot C_{fairness} + w_p \cdot C_{preference}) $$

**Algorithm Strategy:**
1.  **Hard Constraints (Must satisfy):**
    - Availability (Time ranges).
    - Max hours (Contractual limits).
    - No overlapping shifts.
    - Site capacity.
2.  **Soft Constraints (Optimize for):**
    - Employee Preferences (Preferred hours).
    - Fairness (Variance in total hours worked among similar contracts).
    - Affinity/Conflict relationships.
    - Veteran presence (at least 1 per shift).

**Implementation Approach:**
- **Initial:** Enhanced Greedy with "Lookahead". Instead of just picking the first available, score all candidates based on the Cost Function and pick the best.
- **Advanced:** **Simulated Annealing** or **Tabu Search**. Generate a random valid schedule (or a greedy one), then randomly swap assignments to see if the Cost decreases. Repeat for $N$ iterations. This finds a "near-global" optimum.
- **Tech:** Implement this logic in a Supabase Edge Function (TypeScript) to keep the heavy computation off the client and ensure data consistency.

### 1.2 Database & Architecture (Supabase)
- **RBAC (Role-Based Access Control):**
    - Use **Custom Claims** in Supabase Auth or a public `profiles` table with a `role` column.
    - **RLS (Row Level Security):** Critical.
        - `admin`: `true` for all.
        - `manager`: `true` for their `site_id` (Need to link Managers to Sites).
        - `employee`: `read` only for public schedule, `read/write` for their own profile/requests.
- **Performance:**
    - **Indexes:** Essential on `shifts(start_time, end_time, site_id)` and `availability(user_id, date)`.
    - **Real-time:** Use Supabase Realtime for the "Notifications" and "Live Schedule Updates" (e.g., if two managers edit the same day).

### 1.3 UI/UX Optimizations
- **Virtualization:** The "Vue Horaire" (Grid) and "Vue Mois" will be heavy. Use `react-window` or `tanstack-virtual` to render only visible items.
- **Optimistic Updates:** When dragging a shift, update the UI immediately. If the server rejects it (RLS or conflict), revert it. This makes the app feel "native".
- **Offline Support:** Use `tanstack-query`'s persistence to allow viewing the schedule even when offline (crucial for employees checking shifts in bad signal areas).

---

## 2. Implementation Plan

### Phase 1: Foundation & Auth
- **Tech:** React, Vite, Tailwind, Supabase.
- **Schema:**
    - `profiles` (extends auth.users)
    - `sites`
    - `enums` (roles, contract_types)
- **Deliverable:** Login screen, Dashboard skeleton, User Profile management.

### Phase 2: Core Resources (Sites & Employees)
- **Features:**
    - CRUD for Sites.
    - CRUD for Employees (with complex forms for contracts/skills).
    - "Archive" functionality (Soft delete: `deleted_at` column).
- **Deliverable:** Fully populated database of resources.

### Phase 3: The Scheduler (Complex UI)
- **Tech:** `dnd-kit` (for accessible drag-and-drop) + CSS Grid (for the timeline).
- **Features:**
    - Visualizing Shifts.
    - Drag & Drop assignments.
    - Visual cues for "Conflicts" and "Availability".
- **Deliverable:** Interactive Planning Board.

### Phase 4: Automation & Rules
- **Features:**
    - Leave Requests (Approval workflow).
    - **The Generator Algorithm** (TypeScript implementation of the Weighted Cost strategy).
- **Deliverable:** "Magic Button" to fill the schedule.

### Phase 5: Polish
- **Features:**
    - Notifications.
    - i18n (French/English).
    - Dark Mode.
- **Deliverable:** Production-ready app.

## 3. Immediate Next Steps
1.  Initialize the codebase.
2.  Set up the Supabase project (I will provide the SQL schema).
3.  Build the Layout and Authentication flow.
