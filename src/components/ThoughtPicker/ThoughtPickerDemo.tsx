/**
 * ThoughtPickerDemo.jsx
 * Demo component showing how the ThoughtPicker components work together
 * This demonstrates the complete flow: Category → Subcategory → Replacement Thoughts
 */

import React, { useState } from "react";
import {
  TopicSelector,
  SubTopicReveal,
  ReplacementThoughtList,
} from "./index";

const ThoughtPickerDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedThought, setSelectedThought] = useState(null);
  const [intensity, setIntensity] = useState(7);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    setSelectedThought(null); // Reset thought when category changes
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedThought(null); // Reset thought when subcategory changes
  };

  const handleThoughtSelect = (thought) => {
    setSelectedThought(thought);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedThought(null);
  };

  return (
    <div className="thought-picker-demo">
      <div className="demo-header">
        <h1>ThoughtPicker Components Demo</h1>
        <p>This demonstrates the v1.1 dynamic content pipeline in action.</p>

        <div className="intensity-control">
          <label htmlFor="intensity-slider">Intensity Level: {intensity}</label>
          <input
            id="intensity-slider"
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
          />
        </div>

        <button className="btn-secondary" onClick={handleReset}>
          Reset Selection
        </button>
      </div>

      <div className="demo-steps">
        {/* Step 1: Category Selection */}
        <div className="demo-step">
          <h2>Step 1: Select Category</h2>
          <TopicSelector
            onTopicSelect={handleCategorySelect}
            selectedTopic={selectedCategory}
          />
          {selectedCategory && (
            <div className="selection-display">
              ✅ Selected: <strong>{selectedCategory}</strong>
            </div>
          )}
        </div>

        {/* Step 2: Subcategory Selection (only if category is selected) */}
        {selectedCategory && (
          <div className="demo-step">
            <h2>Step 2: Select Subcategory (Optional)</h2>
            <SubTopicReveal
              selectedCategory={selectedCategory}
              onSubTopicSelect={handleSubcategorySelect}
              selectedSubTopic={selectedSubcategory}
            />
            {selectedSubcategory && (
              <div className="selection-display">
                ✅ Selected: <strong>{selectedSubcategory}</strong>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Replacement Thoughts (only if category is selected) */}
        {selectedCategory && (
          <div className="demo-step">
            <h2>Step 3: Choose Replacement Thought</h2>
            <ReplacementThoughtList
              category={selectedCategory}
              subcategory={selectedSubcategory}
              intensity={intensity}
              onThoughtSelect={handleThoughtSelect}
              selectedThought={selectedThought}
            />
            {selectedThought && (
              <div className="selection-display">
                ✅ Selected thought: <em>"{selectedThought}"</em>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Final Selection Summary */}
      {selectedCategory && (
        <div className="demo-summary">
          <h3>Current Selection Summary</h3>
          <ul>
            <li>
              <strong>Category:</strong> {selectedCategory}
            </li>
            <li>
              <strong>Subcategory:</strong>{" "}
              {selectedSubcategory || "None (General)"}
            </li>
            <li>
              <strong>Intensity Level:</strong> {intensity}
            </li>
            <li>
              <strong>Selected Thought:</strong>{" "}
              {selectedThought ? `"${selectedThought}"` : "None"}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Only export in development mode
export default process.env.NODE_ENV === "development"
  ? ThoughtPickerDemo
  : null;
