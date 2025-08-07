// Step 4: Botanical Reflection - Three-Phase Mining Process
// Placeholder implementation showing the flower transformation and mining interface

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGardenState } from '../../../context/GardenStateContext';
import type { MiningPhase, MiningResult } from '../../../context/GardenStateTypes';

const Step4BotanicalReflection: React.FC = () => {
  const { 
    gardenState, 
    startMiningPhase, 
    completeMiningPhase, 
    updateFlowerState 
  } = useGardenState();
  
  const [userInput, setUserInput] = useState('');
  const [currentPhase, setCurrentPhase] = useState<MiningPhase>(gardenState.currentMiningPhase);

  const phases = [
    {
      id: 1 as MiningPhase,
      title: "Neutral Observation",
      icon: "/assets/icon_magnifying_glass.png",
      description: "Let's examine this thought with curiosity, not judgment",
      prompt: "What do you notice about this thought when you observe it without trying to change it?",
      type: 'neutralize' as const,
    },
    {
      id: 2 as MiningPhase,
      title: "Root Purpose",
      icon: "/assets/icon_watering_can.png",
      description: "What protective purpose might this thought serve?",
      prompt: "Even difficult thoughts often try to protect us in some way. What might this thought be trying to protect you from?",
      type: 'commonGround' as const,
    },
    {
      id: 3 as MiningPhase,
      title: "New Growth Perspective",
      icon: "/assets/icon_pruning_shears.png", 
      description: "How might we nurture a more compassionate view?",
      prompt: "If you could speak to yourself with the same kindness you'd show a good friend, what would you say about this situation?",
      type: 'dataExtraction' as const,
    }
  ];

  const currentPhaseData = phases[currentPhase - 1];

  const handlePhaseComplete = () => {
    const result: MiningResult = {
      phase: currentPhase,
      type: currentPhaseData.type,
      userInput,
      selectedPrompts: [currentPhaseData.prompt],
      timestamp: new Date().toISOString(),
      completed: true,
    };

    completeMiningPhase(result);
    
    // Update flower state based on phase
    if (currentPhase === 1) {
      updateFlowerState('neutral');
      setCurrentPhase(2);
      startMiningPhase(2);
    } else if (currentPhase === 2) {
      updateFlowerState('fullbloom');
      setCurrentPhase(3);
      startMiningPhase(3);
    } else {
      // All phases complete - will navigate to garden path
    }
    
    setUserInput('');
  };

  const getFlowerImage = () => {
    const topic = gardenState.selectedTopic || 'money';
    const state = gardenState.flowerState;
    return `/assets/flower_${topic}_${state}.png`;
  };

  const fieldBackground = gardenState.selectedTopic 
    ? `/assets/field_${gardenState.selectedTopic}_bg.png`
    : '/assets/field_money_bg.png';

  return (
    <div 
      className="garden-step garden-step-botanical"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Blurred Field Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${fieldBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px) brightness(0.85)',
          zIndex: 'var(--z-garden-background)',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 'var(--z-garden-interactive)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '60px',
            alignItems: 'center',
            maxWidth: '1200px',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Flower Focus Area */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Flower Image */}
            <motion.img
              key={gardenState.flowerState}
              src={getFlowerImage()}
              alt={`${gardenState.selectedTopic} flower in ${gardenState.flowerState} state`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
              }}
            />

            {/* Root Animation for Phase 2 */}
            {currentPhase === 2 && (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '60px',
                  backgroundImage: 'url(/assets/flower_roots_static.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center top',
                  transformOrigin: 'top center',
                }}
              />
            )}
          </motion.div>

          {/* Mining Interface */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxWidth: '500px',
              width: '100%',
            }}
          >
            {/* Phase Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img
                src={currentPhaseData.icon}
                alt={currentPhaseData.title}
                style={{
                  width: '60px',
                  height: '60px',
                  marginBottom: '16px',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                }}
              />
              <h2 style={{
                margin: 0,
                marginBottom: '8px',
                fontSize: '1.8rem',
                color: 'var(--garden-night-primary)',
                fontWeight: 400,
              }}>
                {currentPhaseData.title}
              </h2>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                color: 'var(--garden-night-secondary)',
                opacity: 0.8,
              }}>
                {currentPhaseData.description}
              </p>
            </div>

            {/* Progress Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '30px',
            }}>
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: index + 1 <= currentPhase 
                      ? 'var(--garden-glow-bright)' 
                      : 'rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Mining Prompt */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                margin: 0,
                marginBottom: '16px',
                fontSize: '1.1rem',
                color: 'var(--garden-night-primary)',
                fontWeight: 500,
                lineHeight: 1.4,
              }}>
                {currentPhaseData.prompt}
              </p>
            </div>

            {/* User Input */}
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Share your thoughts here..."
              style={{
                width: '100%',
                height: '120px',
                padding: '16px',
                border: '2px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '24px',
                background: 'rgba(255,255,255,0.9)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--garden-glow-bright)';
                e.target.style.boxShadow = '0 0 0 3px rgba(180,200,255,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Action Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handlePhaseComplete}
                disabled={!userInput.trim()}
                className="garden-button"
                style={{
                  background: userInput.trim() 
                    ? 'var(--garden-night-primary)' 
                    : 'rgba(0,0,0,0.3)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                }}
              >
                {currentPhase === 3 ? 'Complete Reflection' : 'Continue to Next Phase'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Original Thought Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'var(--garden-moonlight)',
          padding: '16px 24px',
          borderRadius: '12px',
          maxWidth: '80%',
          textAlign: 'center',
          zIndex: 'var(--z-garden-ui-base)',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
          Reflecting on:
        </p>
        <p style={{ margin: 0, marginTop: '4px', fontSize: '1rem', fontStyle: 'italic' }}>
          "{gardenState.userThought}"
        </p>
      </motion.div>
    </div>
  );
};

export default Step4BotanicalReflection;