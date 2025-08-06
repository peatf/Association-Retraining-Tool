#!/usr/bin/env node

/**
 * Fix build script - Automatically updates the script tag in the built HTML file
 * to point to the correct JavaScript file with the current hash.
 */

import fs from 'fs';
import path from 'path';

const buildDir = './build';
const htmlFile = path.join(buildDir, 'index.html');
const assetsDir = path.join(buildDir, 'assets');

// Find the main JavaScript file
function findMainJsFile() {
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found');
    return null;
  }
  
  const files = fs.readdirSync(assetsDir);
  const mainJsFile = files.find(file => file.startsWith('main-') && file.endsWith('.js'));
  
  if (!mainJsFile) {
    console.error('Main JavaScript file not found');
    return null;
  }
  
  return mainJsFile;
}

// Update the HTML file
function updateHtmlFile(mainJsFile) {
  if (!fs.existsSync(htmlFile)) {
    console.error('HTML file not found');
    return false;
  }
  
  let htmlContent = fs.readFileSync(htmlFile, 'utf8');
  
  // Replace the script tag
  const oldScriptTag = /<script type="module" src="\/src\/index\.tsx"><\/script>/;
  const newScriptTag = `<script type="module" crossorigin src="/assets/${mainJsFile}"></script>`;
  
  if (oldScriptTag.test(htmlContent)) {
    htmlContent = htmlContent.replace(oldScriptTag, newScriptTag);
    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`✅ Updated script tag to point to ${mainJsFile}`);
    return true;
  } else {
    console.log('✅ Script tag already updated or not found');
    return true;
  }
}

// Main function
function main() {
  console.log('🔧 Fixing build script tag...');
  
  const mainJsFile = findMainJsFile();
  if (!mainJsFile) {
    process.exit(1);
  }
  
  const success = updateHtmlFile(mainJsFile);
  if (success) {
    console.log('✅ Build fix completed successfully');
  } else {
    console.error('❌ Failed to fix build');
    process.exit(1);
  }
}

main(); 