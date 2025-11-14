# Railway Backend Deployment Guide

## Important: MongoDB Configuration

Since you're deploying to Railway (a cloud platform), your local MongoDB won't be accessible. You have these options:

### Option 1: Use Railway's MongoDB Service (Recommended)
1. After deploying to Railway, add a MongoDB service
2. Railway will automatically provide the `MONGO_URI` environment variable

### Option 2: Use MongoDB Atlas (Cloud)
1. Create a free MongoDB Atlas account
2. Create a cluster and get the connection string
3. Set it as `MONGO_URI` in Railway environment variables

### Option 3: Use a Different Cloud MongoDB Service
- MongoDB Atlas (free tier available)
- MongoDB Cloud
- Other cloud database providers

## Deployment Steps

### 1. Deploy to Railway

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project**:
   ```bash
   railway init
   ```

4. **Deploy your backend**:
   ```bash
   railway up
   ```

### 2. Add MongoDB Service

1. **Go to your Railway dashboard**
2. **Click "New Service"**
3. **Select "Database" → "MongoDB"**
4. **Railway will automatically:**
   - Create a MongoDB instance
   - Set the `MONGO_URI` environment variable
   - Connect your backend to the database

### 3. Set Environment Variables

In your Railway dashboard, go to your backend service and set these environment variables:

```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-railway-deployment
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### 4. Update Frontend Configuration

Update your frontend to use the Railway backend URL:
- Your Railway backend URL will be something like: `https://your-project-name-production.up.railway.app`
- Update your frontend API calls to use this URL

## File Structure for Railway

Your current structure is perfect for Railway deployment:
- `index.js` - Main server file
- `railway.json` - Railway configuration
- `package.json` - Dependencies and scripts
- `routes/` - API routes
- `controllers/` - Route controllers
- `models/` - Database models
- `db/index.js` - Database connection

## Commands

- **Local development**: `npm run server`
- **Production deployment**: `npm run server:prod` (used by Railway)
- **Railway deployment**: `railway up`

## Troubleshooting

1. **Database connection issues**: Make sure MongoDB service is added to Railway
2. **CORS issues**: Check that your frontend domain is in the CORS origins
3. **Environment variables**: Ensure all required variables are set in Railway dashboard

## Next Steps

1. Deploy to Railway using the commands above
2. Add MongoDB service in Railway dashboard
3. Set environment variables
4. Test your API endpoints
5. Update your frontend to use the new backend URL

