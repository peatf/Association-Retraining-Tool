/**
 * Content Index Builder
 * Reads build/artifacts/raw-docs.jsonl, cleans, chunks, embeds, and emits
 * public/content/content-index.bin with category/subcategory metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildContentIndex() {
  console.log('Building content index...');
  
  try {
    // Read the processed content from ingestion
    const rawDocsPath = path.resolve(__dirname, '../build/artifacts/raw-docs.jsonl');
    
    if (!fs.existsSync(rawDocsPath)) {
      console.error('❌ raw-docs.jsonl not found. Run ingest-content.js first.');
      process.exit(1);
    }

    const rawContent = fs.readFileSync(rawDocsPath, 'utf8');
    const entries = rawContent.trim().split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    console.log(`Processing ${entries.length} content entries...`);

    // Build category and subcategory metadata
    const categories = new Set();
    const subcategoriesByCategory = {};
    const processedEntries = [];

    for (const entry of entries) {
      categories.add(entry.category);
      
      if (!subcategoriesByCategory[entry.category]) {
        subcategoriesByCategory[entry.category] = new Set();
      }
      
      // Add subcategories for this category
      entry.subcategories.forEach(sub => {
        subcategoriesByCategory[entry.category].add(sub);
      });

      // Process content for indexing
      const processedEntry = {
        id: `${entry.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: entry.category,
        subcategories: entry.subcategories,
        content: entry.summaryForVectorization,
        miningPrompts: entry.miningPrompts,
        replacementThoughts: entry.replacementThoughts,
        sourceFile: entry.sourceFile,
        // For now, we'll create simple chunks from the content
        chunks: [
          {
            text: entry.summaryForVectorization,
            metadata: {
              category: entry.category,
              subcategories: entry.subcategories,
              type: 'summary'
            }
          }
        ]
      };

      // Add chunks for mining prompts
      Object.entries(entry.miningPrompts).forEach(([type, prompts]) => {
        prompts.forEach((prompt, index) => {
          processedEntry.chunks.push({
            text: prompt,
            metadata: {
              category: entry.category,
              subcategories: entry.subcategories,
              type: `miningPrompt_${type}`,
              index
            }
          });
        });
      });

      // Add chunks for replacement thoughts
      entry.replacementThoughts.forEach((thought, index) => {
        processedEntry.chunks.push({
          text: thought,
          metadata: {
            category: entry.category,
            subcategories: entry.subcategories,
            type: 'replacementThought',
            index
          }
        });
      });

      processedEntries.push(processedEntry);
    }

    // Convert subcategories sets to arrays
    const subcategoriesMap = {};
    Object.entries(subcategoriesByCategory).forEach(([category, subSet]) => {
      subcategoriesMap[category] = Array.from(subSet);
    });

    // Build the content index structure
    const contentIndex = {
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      metadata: {
        categories: Array.from(categories),
        subcategories: subcategoriesMap,
        totalEntries: processedEntries.length,
        totalChunks: processedEntries.reduce((sum, entry) => sum + entry.chunks.length, 0)
      },
      entries: processedEntries
    };

    // Ensure output directory exists
    const outputDir = path.resolve(__dirname, '../public/content');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // For now, we'll save as JSON instead of binary for easier debugging
    // In a full implementation, this would be converted to a binary format
    const outputPath = path.resolve(outputDir, 'content-index.bin');
    fs.writeFileSync(outputPath, JSON.stringify(contentIndex, null, 2));

    console.log('✅ Content index build complete!');
    console.log(`  - Categories: ${contentIndex.metadata.categories.join(', ')}`);
    console.log(`  - Total entries: ${contentIndex.metadata.totalEntries}`);
    console.log(`  - Total chunks: ${contentIndex.metadata.totalChunks}`);
    console.log(`  - Output: ${outputPath}`);

    // Log subcategories for each category
    Object.entries(subcategoriesMap).forEach(([category, subs]) => {
      console.log(`  - ${category}: [${subs.join(', ')}]`);
    });

  } catch (error) {
    console.error('❌ Content index build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildContentIndex();