import React, { Suspense, memo } from 'react';
import styled from 'styled-components';
import { useSession } from '../context/SessionContext.jsx';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import BaseCard from './BaseCard.jsx';
import { Spinner } from './common';

const TopicSelector = React.lazy(() => import('./ThoughtPicker/TopicSelector.jsx'));
const SubTopicReveal = React.lazy(() => import('./ThoughtPicker/SubTopicReveal.jsx'));
const ReplacementThoughtList = React.lazy(() => import('./ThoughtPicker/ReplacementThoughtList.jsx'));

const IntensitySlider = styled.input`
  width: 100%;
  margin: 1rem 0;
`;

const ThoughtPicker = memo(() => {
  const { canvasState, updateCanvasState, addInsight } = useSession();
  const { selectedTopic, selectedSubcategory, intensity, selectedThought } = canvasState;
  const shouldReduceMotion = useReducedMotion();

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
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
      >
        <Suspense fallback={<Spinner />}>
          <TopicSelector onTopicSelect={handleTopicSelect} selectedTopic={selectedTopic} />
        </Suspense>
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
              aria-live="polite"
            >
              <Suspense fallback={<Spinner />}>
                <SubTopicReveal selectedCategory={selectedTopic} onSubTopicSelect={handleSubTopicSelect} selectedSubTopic={selectedSubcategory} />
              </Suspense>
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
              <Suspense fallback={<Spinner />}>
                <ReplacementThoughtList
                  category={selectedTopic}
                  subcategory={selectedSubcategory}
                  intensity={intensity}
                  onThoughtSelect={handleThoughtSelect}
                  selectedThought={selectedThought}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
        {selectedThought && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => {
              console.log('Thought Picker complete');
              Sentry.captureMessage('Thought picker complete');
            }}>
              Done
            </button>
          </div>
        )}
      </motion.div>
    </BaseCard>
  );
});

export default ThoughtPicker;
