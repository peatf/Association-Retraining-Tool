/**
 * Content Index Builder
 * Reads build/artifacts/raw-docs.jsonl, cleans, chunks, embeds, and emits
 * public/content/content-index.bin with category/subcategory metadata
 * Enhanced with embedding generation for semantic search
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for embedding generation
const EMBEDDING_CONFIG = {
  modelName: 'Xenova/all-MiniLM-L6-v2',
  batchSize: 32,
  dimensions: 384
};

/**
 * Generate embeddings for text chunks using the embedding model
 */
async function generateEmbeddings(textChunks, embeddingPipeline) {
  console.log(`Generating embeddings for ${textChunks.length} text chunks...`);
  
  const embeddings = [];
  const batchSize = EMBEDDING_CONFIG.batchSize;
  
  for (let i = 0; i < textChunks.length; i += batchSize) {
    const batch = textChunks.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(textChunks.length/batchSize)}`);
    
    try {
      // Process batch
      const batchEmbeddings = [];
      for (const text of batch) {
        const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
        
        let embedding;
        if (output.data) {
          embedding = Array.from(output.data);
        } else if (Array.isArray(output)) {
          embedding = output;
        } else {
          embedding = Array.from(output.tolist ? output.tolist()[0] : output);
        }
        
        batchEmbeddings.push(embedding);
      }
      
      embeddings.push(...batchEmbeddings);
      
      // Small delay to prevent overwhelming the system
      if (i + batchSize < textChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.warn(`Error processing batch starting at index ${i}:`, error);
      // Add null embeddings for failed batch
      embeddings.push(...new Array(batch.length).fill(null));
    }
  }
  
  console.log(`Generated ${embeddings.filter(e => e !== null).length} valid embeddings`);
  return embeddings;
}

/**
 * Save embeddings to a separate index file for fast loading
 */
async function saveEmbeddingIndex(chunks, embeddings, outputDir) {
  const embeddingIndex = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    modelName: EMBEDDING_CONFIG.modelName,
    dimensions: EMBEDDING_CONFIG.dimensions,
    totalChunks: chunks.length,
    validEmbeddings: embeddings.filter(e => e !== null).length,
    chunks: chunks.map((chunk, index) => ({
      id: chunk.id || `chunk_${index}`,
      text: chunk.text,
      embedding: embeddings[index],
      metadata: chunk.metadata
    })).filter(item => item.embedding !== null)
  };
  
  const embeddingPath = path.resolve(outputDir, 'embeddings.json');
  fs.writeFileSync(embeddingPath, JSON.stringify(embeddingIndex, null, 2));
  
  console.log(`✅ Embedding index saved to ${embeddingPath}`);
  return embeddingIndex;
}

async function buildContentIndex() {
  console.log('Building content index with embeddings...');
  
  let embeddingPipeline = null;
  
  try {
    // Initialize embedding pipeline
    console.log('🤖 Loading embedding model...');
    try {
      embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_CONFIG.modelName);
      console.log('✅ Embedding model loaded successfully');
    } catch (error) {
      console.warn('⚠️  Failed to load embedding model:', error.message);
      console.log('🔄 Continuing without embeddings...');
    }

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
        summaryForVectorization: entry.summaryForVectorization,
        miningPrompts: entry.miningPrompts,
        replacementThoughts: entry.replacementThoughts,
        sourceFile: entry.sourceFile,
        chunks: []
      };

      let chunkId = 0;
      
      // Create chunks from the summary
      if (entry.summaryForVectorization) {
        processedEntry.chunks.push({
          id: `${processedEntry.id}-chunk-${chunkId++}`,
          text: entry.summaryForVectorization,
          metadata: {
            category: entry.category,
            subcategories: entry.subcategories,
            type: 'summary'
          }
        });
      }

      // Add chunks for mining prompts
      Object.entries(entry.miningPrompts || {}).forEach(([type, prompts]) => {
        if (Array.isArray(prompts)) {
          prompts.forEach((prompt, index) => {
            const promptText = typeof prompt === 'string' ? prompt : prompt.question || JSON.stringify(prompt);
            processedEntry.chunks.push({
              id: `${processedEntry.id}-chunk-${chunkId++}`,
              text: promptText,
              metadata: {
                category: entry.category,
                subcategories: entry.subcategories,
                type: `miningPrompt_${type}`,
                index
              }
            });
          });
        }
      });

      // Add chunks for replacement thoughts
      if (Array.isArray(entry.replacementThoughts)) {
        // Legacy format - flat array
        entry.replacementThoughts.forEach((thought, index) => {
          processedEntry.chunks.push({
            id: `${processedEntry.id}-chunk-${chunkId++}`,
            text: thought,
            metadata: {
              category: entry.category,
              subcategories: entry.subcategories,
              type: 'replacementThought',
              index
            }
          });
        });
      } else if (typeof entry.replacementThoughts === 'object' && entry.replacementThoughts !== null) {
        // New hierarchical format - process each level
        Object.entries(entry.replacementThoughts).forEach(([level, thoughts]) => {
          if (Array.isArray(thoughts)) {
            thoughts.forEach((thought, index) => {
              processedEntry.chunks.push({
                id: `${processedEntry.id}-chunk-${chunkId++}`,
                text: thought,
                metadata: {
                  category: entry.category,
                  subcategories: entry.subcategories,
                  type: 'replacementThought',
                  level: level,
                  index
                }
              });
            });
          }
        });
      }

      processedEntries.push(processedEntry);
    }

    // Convert subcategories sets to arrays
    const subcategoriesMap = {};
    Object.entries(subcategoriesByCategory).forEach(([category, subSet]) => {
      subcategoriesMap[category] = Array.from(subSet);
    });

    // Collect all text chunks for embedding generation
    const allChunks = [];
    processedEntries.forEach(entry => {
      allChunks.push(...entry.chunks);
    });

    console.log(`Total chunks for embedding: ${allChunks.length}`);

    // Generate embeddings if model is available
    let embeddingIndex = null;
    if (embeddingPipeline && allChunks.length > 0) {
      const textChunks = allChunks.map(chunk => chunk.text);
      const embeddings = await generateEmbeddings(textChunks, embeddingPipeline);
      
      // Ensure output directory exists
      const outputDir = path.resolve(__dirname, '../public/content');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save embedding index
      embeddingIndex = await saveEmbeddingIndex(allChunks, embeddings, outputDir);
    } else {
      console.log('⚠️  Skipping embedding generation (model not available)');
    }

    // Build the content index structure
    const contentIndex = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      metadata: {
        categories: Array.from(categories),
        subcategories: subcategoriesMap,
        totalEntries: processedEntries.length,
        totalChunks: processedEntries.reduce((sum, entry) => sum + entry.chunks.length, 0),
        hasEmbeddings: embeddingIndex !== null,
        embeddingModel: embeddingIndex ? EMBEDDING_CONFIG.modelName : null
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
    console.log(`  - Has embeddings: ${contentIndex.metadata.hasEmbeddings ? '✅' : '❌'}`);
    if (contentIndex.metadata.hasEmbeddings) {
      console.log(`  - Embedding model: ${contentIndex.metadata.embeddingModel}`);
      console.log(`  - Valid embeddings: ${embeddingIndex?.validEmbeddings || 0}`);
    }
    console.log(`  - Content index: ${outputPath}`);

    // Log subcategories for each category
    Object.entries(subcategoriesMap).forEach(([category, subs]) => {
      console.log(`  - ${category}: [${subs.join(', ')}]`);
    });

  } catch (error) {
    console.error('❌ Content index build failed:', error);
    process.exit(1);
  } finally {
    // Clean up embedding pipeline
    if (embeddingPipeline && embeddingPipeline.dispose) {
      try {
        await embeddingPipeline.dispose();
        console.log('🧹 Embedding pipeline disposed');
      } catch (cleanupError) {
        console.warn('⚠️  Error disposing embedding pipeline:', cleanupError.message);
      }
    }
  }
}

// Run the build
buildContentIndex();