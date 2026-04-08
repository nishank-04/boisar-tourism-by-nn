# Boisar Tourism - Vercel Deployment Guide

This guide will help you deploy your Boisar Tourism application to Vercel so everyone can access it.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: You'll need a MongoDB Atlas account for the database
3. **Environment Variables**: Set up all required environment variables

## Step 1: Prepare Your Database

### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/boisar_tourism`)

### Option B: Other MongoDB Services
- Railway, or any MongoDB hosting service

## Step 2: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project**:
   ```bash
   cd "boisar-tourism"
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Follow the prompts**:
   - Link to existing project? → No
   - Project name → `boisar-tourism` (or your preferred name)
   - Directory → `.` (current directory)
   - Override settings? → No

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository (if connected) or drag and drop your project folder
4. Configure the project settings

## Step 3: Set Environment Variables

In your Vercel dashboard, go to your project → Settings → Environment Variables and add:

### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boisar_tourism
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

### Optional Variables (for full functionality):
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@boisartourism.com

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

FRONTEND_URL=https://your-app-name.vercel.app
ADMIN_EMAIL=admin@boisartourism.com
ADMIN_PASSWORD=admin123
```

## Step 4: Redeploy

After setting environment variables:
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment

## Step 5: Test Your Deployment

1. Visit your deployed URL (e.g., `https://boisar-tourism.vercel.app`)
2. Test the main features:
   - Homepage loads with photo carousel
   - User registration/login works
   - Destination cards are visible
   - Contact form submits correctly
   - Chatbot responds to queries
   - Google Maps loads in the Explore section

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check your MongoDB URI
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify database name is `boisar_tourism`

2. **API Routes Not Working**:
   - Check that environment variables are set correctly
   - Verify the `vercel.json` configuration

3. **Static Files Not Loading**:
   - Ensure all HTML, CSS, JS files are in the root directory
   - Check file paths in your HTML files

4. **Google Maps Not Showing**:
   - Verify your Google Maps API key is set in `index.html`
   - Ensure Maps JavaScript API is enabled in Google Cloud Console

### Getting Help:

1. Check Vercel deployment logs in your dashboard
2. Use browser developer tools to check for errors
3. Test API endpoints directly (e.g., `https://your-app.vercel.app/api/health`)

## Features Available After Deployment:

✅ **Frontend**: Complete Boisar Tourism website with modern UI
✅ **User Authentication**: Registration, login, profile management
✅ **Destinations**: Browse beaches, forts, waterfalls, and hills
✅ **Bookings**: Make and manage travel bookings
✅ **Trip Planning**: AI-powered trip itinerary generation
✅ **Contact System**: Contact form with admin management
✅ **Chatbot**: Interactive Boisar Tourism assistant
✅ **Blockchain Payments**: Crypto booking via Ethereum
✅ **Verified Guides**: Blockchain-verified local guide listings

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain (e.g., `boisartourism.com`)
3. Update DNS settings as instructed
4. Update `FRONTEND_URL` environment variable

## Monitoring and Analytics

- Vercel provides built-in analytics
- Check deployment logs for any issues
- Monitor API usage and performance

---

**Your Boisar Tourism platform is now live and accessible to everyone! 🎉**

Share your deployed URL with friends, family, and potential visitors to showcase the beautiful coastal and cultural destinations of Boisar — *Where Industry Meets Nature* 🌊
