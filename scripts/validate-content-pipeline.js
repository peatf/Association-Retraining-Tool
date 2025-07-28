/**
 * Content Pipeline Validation Script
 * Validates that npm run content:refresh regenerates content-index.bin without errors
 * and ensures content structure integrity after globbing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function validateContentPipeline() {
  console.log('🔍 Validating content pipeline...');
  
  try {
    // 1. Check if content:refresh script exists in package.json
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts['content:refresh']) {
      throw new Error('content:refresh script not found in package.json');
    }
    
    console.log('✅ content:refresh script found in package.json');
    
    // 2. Run content:refresh and check for errors
    console.log('🔄 Running content:refresh...');
    
    try {
      const output = execSync('npm run content:refresh', { 
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '..')
      });
      console.log('✅ content:refresh completed successfully');
    } catch (error) {
      throw new Error(`content:refresh failed: ${error.message}`);
    }
    
    // 3. Validate that content-index.bin was generated
    const contentIndexPath = path.resolve(__dirname, '../public/content/content-index.bin');
    
    if (!fs.existsSync(contentIndexPath)) {
      throw new Error('content-index.bin was not generated');
    }
    
    console.log('✅ content-index.bin generated successfully');
    
    // 4. Validate content structure integrity
    const contentIndexData = JSON.parse(fs.readFileSync(contentIndexPath, 'utf8'));
    
    // Check required structure
    const requiredFields = ['version', 'timestamp', 'metadata', 'entries'];
    for (const field of requiredFields) {
      if (!contentIndexData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check metadata structure
    if (!contentIndexData.metadata.categories || !Array.isArray(contentIndexData.metadata.categories)) {
      throw new Error('Invalid categories structure in metadata');
    }
    
    if (!contentIndexData.metadata.subcategories || typeof contentIndexData.metadata.subcategories !== 'object') {
      throw new Error('Invalid subcategories structure in metadata');
    }
    
    // Check entries structure
    if (!Array.isArray(contentIndexData.entries)) {
      throw new Error('Entries must be an array');
    }
    
    // Validate each entry
    for (const entry of contentIndexData.entries) {
      if (!entry.category || !entry.subcategories || !entry.chunks) {
        throw new Error(`Invalid entry structure: ${JSON.stringify(entry)}`);
      }
      
      if (!Array.isArray(entry.subcategories) || !Array.isArray(entry.chunks)) {
        throw new Error(`Entry arrays must be arrays: ${JSON.stringify(entry)}`);
      }
    }
    
    console.log('✅ Content structure integrity validated');
    
    // 5. Check that categories and subcategories are properly extracted
    const stats = {
      categories: contentIndexData.metadata.categories.length,
      totalEntries: contentIndexData.metadata.totalEntries,
      totalChunks: contentIndexData.metadata.totalChunks,
      subcategoriesCount: Object.keys(contentIndexData.metadata.subcategories).length
    };
    
    console.log('📊 Content statistics:', stats);
    
    // 6. Validate that both existing and new content formats work
    const hasLegacyContent = contentIndexData.entries.some(entry => 
      entry.sourceFile && (entry.sourceFile.includes('therapeutic-content') || entry.sourceFile.includes('thought-buffet'))
    );
    
    const hasNewContent = contentIndexData.entries.some(entry => 
      entry.sourceFile && (entry.sourceFile.includes('money.json') || entry.sourceFile.includes('relationships.json') || entry.sourceFile.includes('self-image.json'))
    );
    
    if (hasNewContent) {
      console.log('✅ New v1.1 content format detected and processed');
    }
    
    if (hasLegacyContent) {
      console.log('✅ Legacy content format compatibility maintained');
    }
    
    console.log('🎉 Content pipeline validation completed successfully!');
    
    return {
      success: true,
      stats,
      hasLegacyContent,
      hasNewContent
    };
    
  } catch (error) {
    console.error('❌ Content pipeline validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (process.argv[1] && process.argv[1].endsWith('validate-content-pipeline.js')) {
  validateContentPipeline();
}

export default validateContentPipeline;