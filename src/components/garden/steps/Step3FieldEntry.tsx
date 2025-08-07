// Step 3: Field Entry - Thought Capture with Field Immersion
// Placeholder implementation showing the field dive and thought input interface

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGardenState } from '../../../context/GardenStateContext';

const Step3FieldEntry: React.FC = () => {
  const { gardenState, updateThought, submitThought } = useGardenState();
  const [thoughtText, setThoughtText] = useState(gardenState.userThought);
  const [showPersistenceQuestion, setShowPersistenceQuestion] = useState(false);
  const [diveComplete, setDiveComplete] = useState(false);

  // Simulate dive animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDiveComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleThoughtSubmit = () => {
    if (thoughtText.trim()) {
      updateThought(thoughtText);
      setShowPersistenceQuestion(true);
    }
  };

  const handlePersistenceResponse = (isPersistent: boolean) => {
    submitThought(thoughtText, isPersistent);
  };

  const fieldBackground = gardenState.selectedTopic 
    ? `/assets/field_${gardenState.selectedTopic}_bg.png`
    : '/assets/field_money_bg.png';

  return (
    <div 
      className="garden-step garden-step-fieldentry"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Field Background */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
        animate={{ 
          scale: diveComplete ? 1 : 1.2, 
          opacity: 1, 
          filter: diveComplete ? 'blur(3px) brightness(0.85)' : 'blur(0px) brightness(1)'
        }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${fieldBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 'var(--z-garden-background)',
        }}
      />

      {/* Petal Drift Overlay */}
      {diveComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 'var(--z-garden-ui-base)',
            pointerEvents: 'none',
          }}
        >
          {/* Simulate petal drift with CSS animation */}
          <div 
            className="petal-drift"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
                radial-gradient(circle at 60% 60%, rgba(255,255,255,0.1) 2px, transparent 2px),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 2px, transparent 2px)
              `,
              backgroundSize: '100px 100px, 150px 150px, 200px 200px',
              animation: 'petalDrift 15s linear infinite',
              mixBlendMode: 'soft-light',
            }}
          />
        </motion.div>
      )}

      {/* Journal Interface */}
      <AnimatePresence>
        {diveComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              zIndex: 'var(--z-garden-interactive)',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              {!showPersistenceQuestion ? (
                <div>
                  <h2 style={{
                    margin: 0,
                    marginBottom: '24px',
                    fontSize: '1.8rem',
                    color: 'var(--garden-night-primary)',
                    textAlign: 'center',
                    fontWeight: 300,
                  }}>
                    What thought has been growing in this field?
                  </h2>

                  <p style={{
                    margin: 0,
                    marginBottom: '24px',
                    fontSize: '1rem',
                    color: 'var(--garden-night-secondary)',
                    textAlign: 'center',
                    opacity: 0.8,
                  }}>
                    Share the thought that's been on your mind. There's no judgment here—
                    just space for what you're experiencing.
                  </p>

                  <textarea
                    value={thoughtText}
                    onChange={(e) => setThoughtText(e.target.value)}
                    placeholder="I've been thinking about..."
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

                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={handleThoughtSubmit}
                      disabled={!thoughtText.trim()}
                      className="garden-button"
                      style={{
                        background: thoughtText.trim() 
                          ? 'var(--garden-night-primary)' 
                          : 'rgba(0,0,0,0.3)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: thoughtText.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 style={{
                    margin: 0,
                    marginBottom: '20px',
                    fontSize: '1.5rem',
                    color: 'var(--garden-night-primary)',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}>
                    Is this a persistent sprout—one that keeps pushing through?
                  </h3>

                  <p style={{
                    margin: 0,
                    marginBottom: '32px',
                    fontSize: '1rem',
                    color: 'var(--garden-night-secondary)',
                    textAlign: 'center',
                    opacity: 0.8,
                  }}>
                    Some thoughts return again and again, asking for deeper attention.
                    Others are more fleeting, passing through like gentle breezes.
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}>
                    <button
                      onClick={() => handlePersistenceResponse(true)}
                      className="garden-button"
                      style={{
                        background: 'var(--garden-relationships-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        minWidth: '200px',
                      }}
                    >
                      Yes, it keeps returning
                    </button>

                    <button
                      onClick={() => handlePersistenceResponse(false)}
                      className="garden-button"
                      style={{
                        background: 'transparent',
                        color: 'var(--garden-night-primary)',
                        border: '2px solid var(--garden-night-primary)',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        minWidth: '200px',
                      }}
                    >
                      No, it's more fleeting
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diving Status */}
      {!diveComplete && (
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
          <p style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>
            Diving into your chosen field...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Step3FieldEntry;