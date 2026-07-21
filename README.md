# Hiresapien Data Scientist Industry Simulation 🚀

This is a premium, interactive simulation platform built with **Next.js**, **React**, **MongoDB**, and **Gemini AI**. It is designed as a standalone marketing tool to assess candidates dynamically and provide detailed readiness reports.

## Features ✨
- **Multi-Step Onboarding**: Captures candidate details, education background, and experience levels with a sleek UI.
- **Simulation Hub**: A centralized dashboard to launch different industry simulations.
- **Dynamic Interaction Engine**: Renders interactive tasks (Single Select, Multi Select, Sliders, Short Text) directly from a highly configurable JSON structure (`lib/simulation-data.json`).
- **Gemini AI Evaluation**: Uses Google's `@google/generative-ai` to dynamically evaluate short-text responses against expected keywords and context. It includes an automatic fallback to pure keyword matching if an API key is missing.
- **Grand Premium UI**: Built with TailwindCSS and Lucide React, featuring smooth gradients, dynamic SVG progress rings, and step-by-step progress bars.
- **Institution Dashboard**: A clean admin interface (`/admin`) to view candidate attempts and their readiness levels.

## Getting Started 🛠

### Prerequisites
Make sure you have Node.js and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
To enable database persistence and AI evaluation, create a `.env.local` file in the root directory and add your credentials:
```env
# Required for Saving Attempts and Results
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/hiresapien?retryWrites=true&w=majority"

# Optional (for AI Short Text Evaluation). Will fallback to keyword matching if empty.
GEMINI_API_KEY="AIzaSy..."
```

### 3. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to begin the simulation flow!

## Project Structure 📁
- `/app`: The core Next.js App Router (Pages & API Routes).
  - `/app/api/simulation/*`: Backend endpoints handling start, interaction submissions, and final grading algorithms.
  - `/app/simulation/mission/[id]/page.tsx`: The dynamic interaction engine.
- `/components/simulation`: Reusable premium UI components (Cards, Mission Steppers, Sliders, etc.).
- `/models`: Mongoose database schemas (`SimulationAttempt.ts`).
- `/lib/simulation-data.json`: The core JSON engine that powers the content of the missions.

## Production Ready 🚀
This repository has been fully sanitized of legacy code and compiles with zero errors. 
To build for production:
```bash
npm run build
npm start
```
