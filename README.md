# Open Anatomy Explorer (Prototype)

**A standardized, open-source 3D interface for patient-doctor communication.**

*Current Status: Phase 1 (UI & Architecture Validation)*

---


---

## 🛠️ The Tech Stack

This project is built on a modern, type-safe, and scalable open-source stack designed for medical data integrity and cross-platform performance.

### 1. The Core (Frontend)
* **Framework:** React (v18+) with Vite
* **Language:** TypeScript (Strict typing for medical data safety)
* **Routing:** React Router DOM

### 2. The 3D Engine (Visualization)
* **Core:** Three.js
* **React Adapter:** @react-three/fiber (R3F)
* **Toolkit:** @react-three/drei
* **Assets:** Optimized .GLB (derived from Z-Anatomy)

### 3. The Brain (State & Logic)
* **State Management:** Zustand (Session tracking & anatomical selection state)
* **Data Fetching:** Custom Hooks

### 4. The Backend (Infrastructure)
* **Platform:** Supabase (Open Source Firebase alternative)
* **Database:** PostgreSQL (Structured medical data storage)
* **Auth:** Supabase Auth (Secure user/patient sessions)
* **Storage:** Supabase Storage (Future: Image uploads for injuries)

### 5. Styling & UI
* **Framework:** Tailwind CSS (Utility-first styling)
* **Icons:** Lucide-React
* **UI Primitives:** Radix UI / Shadcn

### 6. Delivery
* **Web:** Vercel
* **Mobile:** Capacitor (Native wrappers for iOS/Android)

---

## 🗺️ Project Roadmap & Funding Goals

We are currently seeking funding (Prototype Fund / Research Grants) to complete **Phase 2**.

### ✅ Phase 1: Architecture & UI (Completed)
* [x]  Secure TypeScript + React architecture setup.
* [x]  Responsive UI workflow (Landing -> Intake -> Summary).
* [x]  Supabase backend connection for user sessions.
* [x]  State management for pain tracking.

### 🚧 Phase 2: 3D Integration (Current Goal)
* [ ]  **Z-Anatomy Optimization:** Converting high-poly MRI meshes into web-optimized Draco-compressed GLB files.
* [ ]  **Interactive Rigging:** Connecting 3D bone clicks to the React state.
* [ ]  **Semantic Mapping:** Linking Mesh IDs to Terminologia Anatomica 2 names.


---

## 🚀 Getting Started

### Prerequisites
* Node.js (LTS version)

### Installation
1.  Clone the repository:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    ```
2.  Navigate to the project folder:
    ```bash
    cd YOUR_REPO_NAME
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

---

## ⚖️ License & Attribution

This project operates under a **Dual License** structure to comply with medical data requirements.

### 1. The Software (Code)
The source code (React components, logic, UI, Supabase definitions) is licensed under the **MIT License**.
You are free to use, modify, and distribute the code for personal or commercial use.
*See the `LICENSE` file for details.*

### 2. The Anatomical Models (Assets)
The 3D anatomical models (`.glb` files) used in this application are derived from **Z-Anatomy**.
* **Source:** [Z-Anatomy](https://www.z-anatomy.com/)
* **License:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

**Attribution:**
*"Anatomical data derived from Z-Anatomy (CC BY-SA). Optimized for web use by the Institute of Musicians' Medicine (IMM) Dresden."*

If you extract or modify the 3D files from this repository, you must share them under the same **CC BY-SA 4.0** license.

---

**Developed at the Institute of Musicians' Medicine (IMM) Dresden.**