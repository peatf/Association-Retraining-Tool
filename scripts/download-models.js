/**
 * Model Download Script
 * Downloads the Xenova/nli-deberta-v3-base model files locally for privacy-first operation
 * This ensures no external network requests are made during app usage
 */

import { pipeline, env } from "@xenova/transformers";
import { modelConfig } from "../js/nlpConfig.js";
import fs from "fs";
import path from "path";

// Configure environment for local model storage
env.allowRemoteModels = true; // Temporarily allow for initial download
env.localModelPath = "./public/models/";

async function downloadModel() {
  console.log("Starting model download for privacy-first operation...");
  console.log(`Model: ${modelConfig.modelName}`);
  console.log(`Target directory: ${env.localModelPath}`);

  try {
    // Ensure the models directory exists
    const modelsDir = path.resolve("./public/models");
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
      console.log(`Created models directory: ${modelsDir}`);
    }

    // Download the model by creating a pipeline
    console.log("Downloading model files...");
    const classifier = await pipeline(
      "zero-shot-classification",
      modelConfig.modelName,
      {
        progress_callback: (progress) => {
          if (progress && progress.progress !== undefined) {
            const percentage = Math.round(progress.progress * 100);
            const file = progress.file || "model files";
            console.log(`Downloading ${file}: ${percentage}%`);
          }
        },
        device: "cpu", // Use CPU for initial download
        quantized: modelConfig.quantized,
      }
    );

    // Test the model with a simple classification
    console.log("Testing model functionality...");
    const testResult = await classifier(
      "I feel anxious about my financial future",
      ["anxiety about the future", "financial concerns", "general worry"]
    );

    console.log("Model test successful:", testResult);
    console.log("✅ Model download and setup complete!");
    console.log(
      "The model is now available locally for privacy-first operation."
    );

    // Verify model files exist
    const modelFiles = fs.readdirSync(modelsDir, { recursive: true });
    console.log(`Model files downloaded: ${modelFiles.length} files`);
  } catch (error) {
    console.error("❌ Model download failed:", error);
    process.exit(1);
  }
}

// Run the download
downloadModel();
