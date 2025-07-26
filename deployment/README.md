# Deployment Guide

## Association-Retraining Tool Deployment

This guide covers the deployment of the Association-Retraining Tool, a privacy-first therapeutic application that runs entirely client-side.

## Prerequisites

- Node.js 16+ for development and build processes
- A static hosting service (GitHub Pages, Netlify, Vercel, etc.)
- Python 3 for local development server (optional)

## Pre-Deployment Checklist

### 1. Asset Optimization

- [ ] All JavaScript modules are properly minified
- [ ] CSS is optimized and compressed
- [ ] Images are optimized for web delivery
- [ ] ML model files are properly cached
- [ ] JSON content files are validated and minified

### 2. Security Headers

The following security headers should be configured on your hosting service:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 3. Privacy Compliance

- [ ] No external tracking scripts
- [ ] No persistent storage of user data
- [ ] All processing happens client-side
- [ ] ML models are self-hosted
- [ ] No external API calls for core functionality

## Deployment Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Download ML Models

```bash
npm run download-models
```

This will download the required Transformers.js models to the `public/models/` directory.

### Step 3: Run Tests

```bash
npm run test
npm run test:e2e  # If Playwright is installed
```

### Step 4: Optimize Assets

```bash
# Minify JavaScript files
npx terser main.js -o main.min.js
npx terser js/*.js -d js/ --name-cache js/.name-cache

# Optimize CSS
npx clean-css-cli style.css -o style.min.css

# Validate JSON files
node -e "
const fs = require('fs');
const files = ['js/topics.json', 'js/emotions.json', 'js/therapeutic-content.json', 'js/thought-buffet.json'];
files.forEach(file => {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log('✓', file, 'is valid');
  } catch (e) {
    console.error('✗', file, 'is invalid:', e.message);
  }
});
"
```

### Step 5: Configure Hosting

#### For GitHub Pages:

1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Ensure `index.html` is in the root directory

#### For Netlify:

1. Connect your repository to Netlify
2. Set build command: `npm run setup`
3. Set publish directory: `/` (root)
4. Add environment variables if needed

#### For Vercel:

1. Import your repository to Vercel
2. Set framework preset to "Other"
3. Set build command: `npm run setup`
4. Set output directory: `/` (root)

### Step 6: Configure Security Headers

Add the security headers listed above to your hosting service:

#### Netlify (_headers file):
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### Vercel (vercel.json):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Post-Deployment Verification

### 1. Functionality Testing

- [ ] Landing page loads correctly
- [ ] All user flows work end-to-end
- [ ] ML models load and function properly
- [ ] Calendar generation works
- [ ] No console errors

### 2. Performance Testing

- [ ] Page load time < 3 seconds
- [ ] ML model loading time < 10 seconds
- [ ] Smooth animations and transitions
- [ ] Responsive design on all devices

### 3. Security Testing

- [ ] Security headers are properly set
- [ ] No external requests for core functionality
- [ ] No persistent data storage
- [ ] CSP violations are resolved

### 4. Accessibility Testing

- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards
- [ ] ARIA labels are properly implemented

## Monitoring and Maintenance

### Error Monitoring

Since this is a client-side application, consider implementing:

- Client-side error logging (without sending personal data)
- Performance monitoring
- User feedback collection (anonymous)

### Content Updates

To update therapeutic content:

1. Modify the JSON files in the `js/` directory
2. Validate JSON syntax
3. Test the changes locally
4. Deploy the updated files

### Model Updates

To update ML models:

1. Update the model download script
2. Test the new models locally
3. Update the model loading logic if needed
4. Deploy with the new models

## Troubleshooting

### Common Issues

1. **Models not loading**: Check that model files are in `public/models/` and accessible
2. **CSP violations**: Adjust Content-Security-Policy headers
3. **CORS errors**: Ensure all resources are served from the same origin
4. **Performance issues**: Check model file sizes and loading strategies

### Debug Mode

For debugging, you can enable verbose logging by adding to the URL:
```
?debug=true
```

This will enable additional console logging for troubleshooting.

## Privacy Compliance

This application is designed to be fully privacy-compliant:

- ✅ No external tracking
- ✅ No persistent data storage
- ✅ All processing client-side
- ✅ No external API calls for core functionality
- ✅ Self-hosted ML models
- ✅ Anonymous feedback collection only

## Support

For deployment issues or questions, refer to:

1. This deployment guide
2. The main README.md file
3. Test files for expected behavior
4. The design document for architecture details

## Backup and Recovery

Since this is a static site with no server-side data:

1. Keep your source code in version control
2. Backup your ML model files
3. Document any custom configurations
4. Test your deployment process regularly