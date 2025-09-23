# 🔧 Troubleshooting Blank Page Issues
## CCIC Camp Meeting 2025 App

If your GitHub Pages deployment shows a blank page, follow these steps to diagnose and fix the issue.

## 🚨 Quick Fixes (Try These First)

### 1. Check GitHub Pages Settings
1. Go to your repository on GitHub: `https://github.com/dacoolguy1/cm`
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Ensure:
   - **Source**: "Deploy from a branch"
   - **Branch**: "gh-pages" 
   - **Folder**: "/ (root)"
5. Click **Save** if you made changes
6. Wait 5-10 minutes for changes to take effect

### 2. Force Browser Refresh
- **Windows/Linux**: Ctrl + F5 or Ctrl + Shift + R
- **Mac**: Cmd + Shift + R
- **Mobile**: Clear browser cache or try private/incognito mode

### 3. Check Your Live URL
Your app should be at: `https://dacoolguy1.github.io/cm`

## 🔍 Debug Steps

### Step 1: Check Browser Console
1. Open your GitHub Pages URL
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for error messages

**Common Errors:**
- `404` errors → Asset path issues
- `CORS` errors → Cross-origin issues
- `Module` errors → JavaScript loading issues

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for failed requests (red entries)

**What to check:**
- Are CSS/JS files loading? (should show 200 status)
- Are images loading from `/cm/images/back.png`?

### Step 3: Verify File Structure
Your `gh-pages` branch should contain:
```
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── images/
    └── back.png
```

## 🛠️ Common Issues & Solutions

### Issue 1: Assets Not Loading (404 Errors)
**Symptoms:** Blank page, CSS/JS 404 errors in console

**Solution:** Check base path configuration
1. Open `vite.config.js`
2. Ensure `base: "/cm/"` matches your repository name
3. Rebuild and redeploy:
   ```bash
   npm run build
   npm run deploy
   ```

### Issue 2: Background Image Not Loading
**Symptoms:** App loads but no background image

**Solution:** Verify image path
1. Check if `/images/back.png` exists in your deployed files
2. Try accessing: `https://dacoolguy1.github.io/cm/images/back.png`
3. If 404, ensure image is in `public/images/back.png` before building

### Issue 3: React Router Issues
**Symptoms:** App loads on homepage but breaks on refresh

**Solution:** GitHub Pages doesn't support client-side routing by default
1. Add `404.html` that redirects to `index.html`
2. Or use hash routing instead

### Issue 4: Build Path Issues
**Symptoms:** Inconsistent loading, some assets work, others don't

**Solution:** Clean rebuild
```bash
# Clean everything
rm -rf dist node_modules

# Reinstall and rebuild
npm install
npm run build
npm run deploy
```

## 🧪 Test Your Deployment

### Local Testing
```bash
# Build and preview locally
npm run build
npm run preview
```

If it works locally but not on GitHub Pages, it's a deployment configuration issue.

### Manual Asset Check
Test these URLs directly in your browser:
- Main page: `https://dacoolguy1.github.io/cm`
- CSS file: `https://dacoolguy1.github.io/cm/assets/index-xxxxx.css`
- JS file: `https://dacoolguy1.github.io/cm/assets/index-xxxxx.js`
- Background image: `https://dacoolguy1.github.io/cm/images/back.png`

## 🔧 Advanced Troubleshooting

### Check GitHub Actions (if using)
1. Go to **Actions** tab in your repository
2. Check if any workflows failed
3. Look at build logs for errors

### Verify Repository Settings
1. Repository must be **Public** (for free GitHub Pages)
2. Check if GitHub Pages is enabled
3. Verify the correct branch is selected

### Alternative: Use Relative Paths
If absolute paths aren't working, try relative paths:

1. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: "./", // Use relative paths
   });
   ```

2. Update `package.json`:
   ```json
   {
     "homepage": "."
   }
   ```

3. Rebuild and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

## 📱 Mobile Troubleshooting

### iOS Safari Issues
- Clear Safari cache
- Try private browsing mode
- Check if it works on other iOS devices

### Android Chrome Issues
- Clear browser data
- Disable data saver mode
- Try incognito mode

## 🆘 Still Not Working?

### Create a Simple Test Page
1. Create a simple `test.html` in your `public` folder:
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>Test</title></head>
   <body><h1>GitHub Pages is working!</h1></body>
   </html>
   ```

2. Deploy and test: `https://dacoolguy1.github.io/cm/test.html`

3. If this works, the issue is with your React app configuration

### Check Repository Permissions
- Ensure you have push access to the repository
- Verify the `gh-pages` branch exists and has content
- Check if there are any branch protection rules

## 🎯 Quick Redeploy Commands

```bash
# Full clean redeploy
rm -rf dist
npm run build
npm run deploy

# Force push to gh-pages
npx gh-pages -d dist -f

# Deploy with custom message
npx gh-pages -d dist -m "Fix blank page issue"
```

## 📊 Success Indicators

✅ **Working correctly:**
- App loads at `https://dacoolguy1.github.io/cm`
- No console errors
- Background image appears
- Can click circle to upload photos
- Generated flyers download properly

❌ **Still broken:**
- Blank white page
- Console shows 404 errors
- Assets fail to load
- Background image missing

## 💡 Prevention Tips

1. **Always test locally** before deploying
2. **Use consistent naming** for repositories and configurations
3. **Check console** for errors during development
4. **Keep backups** of working configurations
5. **Document changes** when modifying deployment settings

## 🏆 Alternative Deployment Options

If GitHub Pages continues to cause issues, consider:

### Netlify (Drag & Drop)
1. Run `npm run build`
2. Go to netlify.com
3. Drag the `dist` folder to deploy

### Vercel (Zero Config)
1. Connect your GitHub repository
2. Vercel auto-detects Vite configuration
3. Deploys automatically

### GitHub Codespaces (Preview)
1. Open repository in Codespaces
2. Run `npm run dev`
3. Use the preview URL for testing

---

**Need more help?** Check the browser console and share any error messages for specific troubleshooting assistance.

Happy debugging! 🚀