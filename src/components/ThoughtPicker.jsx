import React from 'react';
import styled from 'styled-components';
import { useSession } from '../context/SessionContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import BaseCard from './BaseCard.jsx';
import TopicSelector from './ThoughtPicker/TopicSelector.jsx';
import SubTopicReveal from './ThoughtPicker/SubTopicReveal.jsx';
import ReplacementThoughtList from './ThoughtPicker/ReplacementThoughtList.jsx';

const IntensitySlider = styled.input`
  width: 100%;
  margin: 1rem 0;
`;

const ThoughtPicker = () => {
  const { canvasState, updateCanvasState, addInsight } = useSession();
  const { selectedTopic, selectedSubcategory, intensity, selectedThought } = canvasState;

  const handleTopicSelect = (topic) => {
    updateCanvasState({ selectedTopic: topic, selectedSubcategory: null });
  };

  const handleSubTopicSelect = (subcategory) => {
    updateCanvasState({ selectedSubcategory: subcategory });
  };

  const handleThoughtSelect = (thought) => {
    updateCanvasState({ selectedThought: thought });
    addInsight({
      type: 'replacement_thought',
      content: thought,
      source: 'thought_picker'
    });
  };

  return (
    <BaseCard title="Better-Feeling Thoughts" showActions={false}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <TopicSelector onTopicSelect={handleTopicSelect} selectedTopic={selectedTopic} />
        <div>
          <label htmlFor="intensity-slider">Intensity</label>
          <IntensitySlider
            type="range"
            id="intensity-slider"
            min="0"
            max="10"
            value={intensity}
            onChange={(e) => updateCanvasState({ intensity: e.target.value })}
          />
        </div>
        <AnimatePresence>
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SubTopicReveal selectedCategory={selectedTopic} onSubTopicSelect={handleSubTopicSelect} selectedSubTopic={selectedSubcategory} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ReplacementThoughtList
                category={selectedTopic}
                subcategory={selectedSubcategory}
                intensity={intensity}
                onThoughtSelect={handleThoughtSelect}
                selectedThought={selectedThought}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {selectedThought && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => console.log('Thought Picker complete')}>
              Done
            </button>
          </div>
        )}
      </motion.div>
    </BaseCard>
  );
};

export default ThoughtPicker;
