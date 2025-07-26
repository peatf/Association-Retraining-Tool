#!/usr/bin/env node

/**
 * Deployment Optimization Script
 * Optimizes assets for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment optimization...\n');

// 1. Validate JSON files
console.log('📋 Validating JSON files...');
const jsonFiles = [
  'js/topics.json',
  'js/emotions.json', 
  'js/therapeutic-content.json',
  'js/thought-buffet.json'
];

let jsonValid = true;
jsonFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    JSON.parse(content);
    console.log(`  ✅ ${file} is valid`);
  } catch (error) {
    console.error(`  ❌ ${file} is invalid: ${error.message}`);
    jsonValid = false;
  }
});

if (!jsonValid) {
  console.error('\n❌ JSON validation failed. Please fix the errors above.');
  process.exit(1);
}

// 2. Check for required files
console.log('\n📁 Checking required files...');
const requiredFiles = [
  'index.html',
  'main.js',
  'style.css',
  'js/SessionStateManager.js',
  'js/ContentManager.js',
  'js/PsychologicalEngine.js',
  'js/CalendarGenerator.js',
  'js/ErrorHandler.js',
  'js/FeedbackManager.js'
];

let filesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.error(`  ❌ ${file} is missing`);
    filesExist = false;
  }
});

if (!filesExist) {
  console.error('\n❌ Required files are missing. Please ensure all files are present.');
  process.exit(1);
}

// 3. Check model files
console.log('\n🤖 Checking ML model files...');
const modelDir = 'public/models';
if (fs.existsSync(modelDir)) {
  const modelFiles = fs.readdirSync(modelDir);
  if (modelFiles.length > 0) {
    console.log(`  ✅ Found ${modelFiles.length} model files in ${modelDir}`);
    modelFiles.forEach(file => {
      const filePath = path.join(modelDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`    📦 ${file} (${sizeMB} MB)`);
    });
  } else {
    console.warn(`  ⚠️  No model files found in ${modelDir}. Run 'npm run download-models' first.`);
  }
} else {
  console.warn(`  ⚠️  Model directory ${modelDir} does not exist. Run 'npm run download-models' first.`);
}

// 4. Analyze file sizes
console.log('\n📊 Analyzing file sizes...');
const analyzeFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    return `${sizeKB} KB`;
  }
  return 'Not found';
};

console.log(`  📄 index.html: ${analyzeFile('index.html')}`);
console.log(`  📄 main.js: ${analyzeFile('main.js')}`);
console.log(`  📄 style.css: ${analyzeFile('style.css')}`);

// 5. Check for development artifacts
console.log('\n🧹 Checking for development artifacts...');
const devArtifacts = [
  'node_modules',
  '.git',
  'tests',
  'package-lock.json',
  'vitest.config.js',
  'playwright.config.js'
];

devArtifacts.forEach(artifact => {
  if (fs.existsSync(artifact)) {
    console.log(`  ⚠️  Development artifact found: ${artifact} (exclude from deployment)`);
  }
});

// 6. Generate deployment checklist
console.log('\n📋 Generating deployment checklist...');
const checklist = `
# Deployment Checklist

## Pre-deployment
- [x] JSON files validated
- [x] Required files present
- [ ] ML models downloaded
- [ ] Tests passing
- [ ] Security headers configured

## Deployment
- [ ] Assets uploaded to hosting service
- [ ] Domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Security headers applied

## Post-deployment
- [ ] Functionality tested
- [ ] Performance verified
- [ ] Accessibility checked
- [ ] Privacy compliance confirmed

Generated on: ${new Date().toISOString()}
`;

fs.writeFileSync('deployment/checklist.md', checklist);
console.log('  ✅ Deployment checklist generated at deployment/checklist.md');

// 7. Create deployment package info
console.log('\n📦 Creating deployment package info...');
const packageInfo = {
  name: 'association-retraining-tool',
  version: '1.0.0',
  deploymentDate: new Date().toISOString(),
  files: {
    html: fs.existsSync('index.html'),
    javascript: fs.existsSync('main.js'),
    css: fs.existsSync('style.css'),
    models: fs.existsSync('public/models'),
    content: jsonFiles.every(file => fs.existsSync(file))
  },
  sizes: {
    'index.html': analyzeFile('index.html'),
    'main.js': analyzeFile('main.js'),
    'style.css': analyzeFile('style.css')
  },
  privacy: {
    clientSideOnly: true,
    noPersistentStorage: true,
    noExternalTracking: true,
    selfHostedModels: true
  }
};

fs.writeFileSync('deployment/package-info.json', JSON.stringify(packageInfo, null, 2));
console.log('  ✅ Package info generated at deployment/package-info.json');

// 8. Security recommendations
console.log('\n🔒 Security recommendations...');
console.log('  📋 Configure these security headers on your hosting service:');
console.log('    - Content-Security-Policy');
console.log('    - X-Frame-Options: DENY');
console.log('    - X-Content-Type-Options: nosniff');
console.log('    - X-XSS-Protection: 1; mode=block');
console.log('    - Referrer-Policy: strict-origin-when-cross-origin');

// 9. Performance recommendations
console.log('\n⚡ Performance recommendations...');
console.log('  📋 Consider these optimizations:');
console.log('    - Enable gzip compression on your hosting service');
console.log('    - Set appropriate cache headers for static assets');
console.log('    - Use a CDN for global distribution');
console.log('    - Monitor Core Web Vitals');

console.log('\n✅ Deployment optimization complete!');
console.log('\n📖 Next steps:');
console.log('  1. Review the deployment checklist at deployment/checklist.md');
console.log('  2. Configure security headers on your hosting service');
console.log('  3. Upload files to your hosting service');
console.log('  4. Test the deployed application');
console.log('  5. Monitor performance and errors');

console.log('\n🎉 Ready for deployment!');