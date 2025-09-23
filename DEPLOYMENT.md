# 🚀 CCIC Camp Meeting 2025 - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy (Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CCIC Camp Meeting 2025 app"
   git branch -M main
   git remote add origin https://github.com/yourusername/ccic-camp-meeting-2025.git
   git push -u origin main
   ```

2. **Deploy with Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

### Option 2: CLI Deploy

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd camp-meeting-app
   vercel --prod
   ```

4. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name? `ccic-camp-meeting-2025`
   - In which directory? `./`
   - Want to override settings? `N`

## Alternative Deployment Options

### Netlify Deploy

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to the deploy area
   - Or connect your GitHub repo

### GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/ccic-camp-meeting-2025",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## Configuration Files Already Set Up

✅ `vercel.json` - Vercel configuration
✅ `vite.config.js` - Build configuration  
✅ `package.json` - Scripts and dependencies

## After Deployment

1. **Test the app:** Upload a photo and verify it generates correctly
2. **Custom domain:** Add your domain in Vercel dashboard if needed
3. **Analytics:** Enable Vercel Analytics for usage tracking

## Adjusting Photo Position

If user photos don't appear in the right spot in your background image:

1. Open browser developer tools (F12)
2. Upload a test photo
3. Check console for positioning debug info
4. Adjust these constants in `src/App.jsx`:

```javascript
const CIRCLE_CENTER_X = 540; // Horizontal center
const CIRCLE_CENTER_Y = 450; // Vertical center  
const CIRCLE_RADIUS = 120;   // Photo circle size
```

## Troubleshooting

**Background image not showing:**
- Ensure `back.png` is in `public/images/` folder
- Check browser console for loading errors
- Verify image path is `/images/back.png`

**Build fails:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Deployment fails:**
- Check all files are committed to Git
- Ensure `dist` folder is not in `.gitignore`
- Verify Node.js version compatibility

## Project Structure

```
camp-meeting-app/
├── public/
│   └── images/
│       └── back.png          # Your background image
├── src/
│   ├── App.jsx              # Main component
│   ├── App.css              # Styles
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
├── package.json
├── vite.config.js
└── vercel.json              # Vercel config
```

## 🎉 Your App Features

✅ Click circle to upload photo
✅ Real-time flyer generation
✅ Download personalized flyer
✅ No server storage needed
✅ Mobile responsive
✅ Professional UI/UX

Happy deploying! 🚀