/**
 * Content Ingestion Script
 * Globs all content files from /content/raw/*.{json,txt} and processes them
 * for the content pipeline. Extracts categories, subcategories, miningPrompts,
 * and replacementThoughts from multiple files.
 */

import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ingestContent() {
  console.log('Starting content ingestion...');
  
  try {
    // Ensure build directory exists
    const buildDir = path.resolve(__dirname, '../build');
    const artifactsDir = path.resolve(buildDir, 'artifacts');
    
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    // Glob all content files from /content/raw/
    const contentPattern = path.resolve(__dirname, '../content/raw/*.{json,txt}');
    console.log(`Searching for content files: ${contentPattern}`);
    
    const paths = await glob(contentPattern);
    console.log(`Found ${paths.length} content files:`, paths.map(p => path.basename(p)));

    if (paths.length === 0) {
      console.log('No content files found. Creating empty raw-docs.jsonl');
      fs.writeFileSync(path.resolve(artifactsDir, 'raw-docs.jsonl'), '');
      return;
    }

    const allEntries = [];

    // Process each content file
    for (const filePath of paths) {
      console.log(`Processing: ${path.basename(filePath)}`);
      
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        
        // Handle different file types
        let entries;
        if (filePath.endsWith('.json')) {
          entries = JSON.parse(raw);
        } else if (filePath.endsWith('.txt')) {
          // For .txt files, create a simple entry
          entries = [{
            category: path.basename(filePath, '.txt'),
            subcategories: [],
            summaryForVectorization: raw.substring(0, 200),
            miningPrompts: {
              neutralize: [],
              commonGround: [],
              dataExtraction: []
            },
            replacementThoughts: []
          }];
        }

        // Ensure entries is an array
        if (!Array.isArray(entries)) {
          entries = [entries];
        }

        // Validate and process each entry
        for (const entry of entries) {
          // Validate required fields
          if (!entry.category) {
            console.warn(`Entry missing category in ${filePath}, skipping`);
            continue;
          }

          // Ensure required structure exists
          const processedEntry = {
            category: entry.category,
            subcategories: entry.subcategories || [],
            summaryForVectorization: entry.summaryForVectorization || `Content for ${entry.category}`,
            miningPrompts: {
              neutralize: entry.miningPrompts?.neutralize || [],
              commonGround: entry.miningPrompts?.commonGround || [],
              dataExtraction: entry.miningPrompts?.dataExtraction || []
            },
            replacementThoughts: entry.replacementThoughts || [],
            sourceFile: path.basename(filePath)
          };

          allEntries.push(processedEntry);
          console.log(`  - Processed category: ${processedEntry.category} with ${processedEntry.subcategories.length} subcategories`);
        }

      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        continue;
      }
    }

    // Write processed entries to JSONL format
    const outputPath = path.resolve(artifactsDir, 'raw-docs.jsonl');
    const jsonlContent = allEntries.map(entry => JSON.stringify(entry)).join('\n');
    
    fs.writeFileSync(outputPath, jsonlContent);
    
    console.log(`✅ Content ingestion complete!`);
    console.log(`  - Processed ${allEntries.length} entries`);
    console.log(`  - Categories found: ${[...new Set(allEntries.map(e => e.category))].join(', ')}`);
    console.log(`  - Output: ${outputPath}`);

  } catch (error) {
    console.error('❌ Content ingestion failed:', error);
    process.exit(1);
  }
}

// Run the ingestion
ingestContent();