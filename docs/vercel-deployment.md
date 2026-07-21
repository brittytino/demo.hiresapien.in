# Vercel Deployment Guide - HireSapien

This guide details how to deploy and host the **HireSapien** Next.js simulator on Vercel. Since the project builds with clean static and dynamic server endpoints, it is fully optimized for Vercel's serverless environment.

---

## Prerequisites

1. A **GitHub**, **GitLab**, or **Bitbucket** repository containing your pushed project code.
2. A free **Vercel** account (sign up at [vercel.com](https://vercel.com)).
3. An active **MongoDB Atlas** database cluster (free M0 tier is sufficient).
4. A **Google Gemini API Key** (from Google AI Studio).

---

## Step 1: MongoDB Atlas Network Access configuration (Crucial)

Because Vercel runs on serverless functions with dynamic IP addresses, you **must** configure your MongoDB Atlas cluster to accept connections from any IP:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Security** → **Network Access** in the left sidebar.
3. Click **Add IP Address**.
4. Set the IP Address to **`0.0.0.0/0`** (this allows access from anywhere, required for Vercel's serverless functions).
5. Set the entry comment to `Vercel Serverless Functions` and click **Confirm**.

---

## Step 2: Push Your Code to Git

Make sure your local changes are committed and pushed to your remote repository:

```bash
git add .
git commit -m "Configure HireSapien for Vercel deployment"
git push origin main
```

---

## Step 3: Import Project to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** → **Project**.
2. Select your git provider, find your `hiresapien.v2` repository, and click **Import**.
3. In the **Configure Project** window:
   * **Framework Preset**: Vercel will automatically detect **Next.js**.
   * **Root Directory**: Keep it as `./` (default).
   * **Build and Output Settings**: Keep them default.

---

## Step 4: Add Environment Variables

In the **Environment Variables** section on Vercel, copy the keys from your `.env` or `.env.local` file:

| Key | Description / Example |
|---|---|
| `MONGO_URI` | Your MongoDB connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.lw8lapo.mongodb.net/hiresapien`) |
| `GEMINI_API_KEY` | Your Google Gemini developer API Key |
| `NEXT_PUBLIC_APP_NAME` | `HireSapien` |

*Click **Add** after entering each key-value pair.*

---

## Step 5: Deploy

1. Click the **Deploy** button.
2. Vercel will clone your repository, run `npm run build`, and generate the optimized production bundles.
3. Once complete, you will receive a secure `https://your-project-name.vercel.app` domain link!

---

## Step 6: Verify Runtime Health

Once deployed:
1. Access your Vercel deployment URL.
2. Fill out the registration step on the landing page and click **Begin Assessment** to verify that a MongoDB session attempt is generated.
3. To monitor proctoring, API logging, and model evaluations, you can view real-time runtime logs in the **Logs** tab of your Vercel project dashboard.
