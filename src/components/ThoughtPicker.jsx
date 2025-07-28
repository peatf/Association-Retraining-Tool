import React from 'react';
import styled from 'styled-components';
import { useSession } from '../context/SessionContext.jsx';
import { motion } from 'framer-motion';
import BaseCard from './BaseCard.jsx';
import TopicSelector from './ThoughtPicker/TopicSelector.jsx';
import SubTopicReveal from './ThoughtPicker/SubTopicReveal.jsx';
import ReplacementThoughtList from './ThoughtPicker/ReplacementThoughtList.jsx';

const ThoughtPicker = () => {
  const { canvasState, updateCanvasState } = useSession();
  const { selectedTopic, selectedSubcategory } = canvasState;

  const handleTopicSelect = (topic) => {
    updateCanvasState({ selectedTopic: topic, selectedSubcategory: null });
  };

  const handleSubTopicSelect = (subcategory) => {
    updateCanvasState({ selectedSubcategory: subcategory });
  };

  return (
    <BaseCard title="Better-Feeling Thoughts" showActions={false}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <TopicSelector onTopicSelect={handleTopicSelect} selectedTopic={selectedTopic} />
        <SubTopicReveal selectedCategory={selectedTopic} onSubTopicSelect={handleSubTopicSelect} selectedSubTopic={selectedSubcategory} />
        <ReplacementThoughtList category={selectedTopic} subcategory={selectedSubcategory} />
      </motion.div>
    </BaseCard>
  );
};

export default ThoughtPicker;
