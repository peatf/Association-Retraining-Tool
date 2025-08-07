// Step 2: Map Transition - Topic Selection with Cinematic Zoom
// Placeholder implementation showing the map transition interface

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGardenState } from '../../../context/GardenStateContext';
import type { TopicType } from '../../../context/GardenStateTypes';

const Step2MapTransition: React.FC = () => {
  const { gardenState, selectTopic, updateTransitionPhase } = useGardenState();
  const [hoveredTopic, setHoveredTopic] = useState<TopicType | null>(null);
  const [zoomComplete, setZoomComplete] = useState(false);

  // Simulate transition phases
  useEffect(() => {
    const timer1 = setTimeout(() => {
      updateTransitionPhase('reveal');
    }, 1000);

    const timer2 = setTimeout(() => {
      updateTransitionPhase('zoom');
    }, 2000);

    const timer3 = setTimeout(() => {
      updateTransitionPhase('complete');
      setZoomComplete(true);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [updateTransitionPhase]);

  const handleTopicSelect = (topic: TopicType) => {
    selectTopic(topic);
  };

  return (
    <div 
      className="garden-step garden-step-maptransition"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #1a1d3a 0%, #2a3b5a 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Sky to Map Overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: gardenState.transitionPhase === 'fade' ? 0 : 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/sky_to_map_overlay.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 'var(--z-garden-background)',
        }}
      />

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: gardenState.transitionPhase !== 'fade' ? 1 : 0,
          scale: gardenState.transitionPhase === 'zoom' ? 2 : 1,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/map_world_overview.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 'var(--z-garden-ui-base)',
        }}
      />

      {/* Topic Selection Interface */}
      {zoomComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-garden-interactive)',
            color: 'var(--garden-moonlight)',
          }}
        >
          {/* Selection Prompt */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{
              textAlign: 'center',
              marginBottom: '60px',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '30px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h2 style={{ 
              fontSize: '2rem', 
              margin: 0, 
              marginBottom: '16px',
              fontWeight: 300,
            }}>
              Which part of your garden calls for attention?
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              margin: 0, 
              opacity: 0.9,
              maxWidth: '500px',
            }}>
              Choose the area where you'd like to plant new perspectives.
            </p>
          </motion.div>

          {/* Topic Beds */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '80px',
            flexWrap: 'wrap',
          }}>
            {/* Money Topic */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              onHoverStart={() => setHoveredTopic('money')}
              onHoverEnd={() => setHoveredTopic(null)}
              onClick={() => handleTopicSelect('money')}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                transform: hoveredTopic === 'money' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div style={{
                width: '200px',
                height: '200px',
                backgroundImage: `url(/assets/path_picker_money.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '20px',
                marginBottom: '20px',
                border: gardenState.selectedTopic === 'money' ? '3px solid var(--garden-glow-bright)' : '3px solid transparent',
                boxShadow: hoveredTopic === 'money' ? 'var(--garden-shadow-glow)' : 'var(--garden-shadow-soft)',
              }} />
              <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--garden-money-primary)' }}>
                Money & Abundance
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, maxWidth: '180px' }}>
                Thoughts about wealth, security, and financial wellbeing
              </p>
            </motion.div>

            {/* Relationships Topic */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              onHoverStart={() => setHoveredTopic('relationships')}
              onHoverEnd={() => setHoveredTopic(null)}
              onClick={() => handleTopicSelect('relationships')}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                transform: hoveredTopic === 'relationships' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div style={{
                width: '200px',
                height: '200px',
                backgroundImage: `url(/assets/path_picker_relationships.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '20px',
                marginBottom: '20px',
                border: gardenState.selectedTopic === 'relationships' ? '3px solid var(--garden-glow-bright)' : '3px solid transparent',
                boxShadow: hoveredTopic === 'relationships' ? 'var(--garden-shadow-glow)' : 'var(--garden-shadow-soft)',
              }} />
              <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--garden-relationships-primary)' }}>
                Relationships
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, maxWidth: '180px' }}>
                Connections with family, friends, and loved ones
              </p>
            </motion.div>

            {/* Self-Image Topic */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              onHoverStart={() => setHoveredTopic('selfImage')}
              onHoverEnd={() => setHoveredTopic(null)}
              onClick={() => handleTopicSelect('selfImage')}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                transform: hoveredTopic === 'selfImage' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div style={{
                width: '200px',
                height: '200px',
                backgroundImage: `url(/assets/path_picker_selfimage.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '20px',
                marginBottom: '20px',
                border: gardenState.selectedTopic === 'selfImage' ? '3px solid var(--garden-glow-bright)' : '3px solid transparent',
                boxShadow: hoveredTopic === 'selfImage' ? 'var(--garden-shadow-glow)' : 'var(--garden-shadow-soft)',
              }} />
              <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--garden-selfimage-primary)' }}>
                Self-Image
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, maxWidth: '180px' }}>
                How you see yourself and your worth
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Transition Status */}
      {!zoomComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            color: 'var(--garden-moonlight)',
            zIndex: 'var(--z-garden-ui-base)',
          }}
        >
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
            {gardenState.transitionPhase === 'fade' && 'Transitioning from night sky...'}
            {gardenState.transitionPhase === 'reveal' && 'Revealing your inner garden map...'}
            {gardenState.transitionPhase === 'zoom' && 'Focusing on the flower beds...'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Step2MapTransition;