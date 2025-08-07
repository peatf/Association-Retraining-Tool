// Step 1: Night Sky - Readiness Assessment with Animated Gates
// Placeholder implementation showing the night sky interface structure

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGardenState } from '../../../context/GardenStateContext';

const Step1NightSky: React.FC = () => {
  const { 
    gardenState, 
    updateReadiness, 
    selectGate, 
    proceedFromGate,
    showRestMessage 
  } = useGardenState();
  
  const [readinessLevel, setReadinessLevel] = useState(gardenState.readinessLevel);

  // Handle readiness slider change
  const handleReadinessChange = (level: number) => {
    setReadinessLevel(level);
    updateReadiness(level);
  };

  // Auto-proceed after gate selection
  useEffect(() => {
    if (gardenState.selectedGate && gardenState.selectedGate !== 'closed') {
      const timer = setTimeout(() => {
        proceedFromGate();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gardenState.selectedGate, proceedFromGate]);

  return (
    <div 
      className="garden-step garden-step-nightsky"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #0a0b1e 0%, #1a1d3a 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background Layers */}
      <div 
        className="night-sky-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/night_sky_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 'var(--z-garden-background)',
        }}
      />

      {/* Cloud Layers */}
      <div
        className="clouds-back garden-drift-slow"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/clouds_layer_back.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          zIndex: 'var(--z-garden-clouds-back)',
        }}
      />

      <div
        className="clouds-front garden-drift-fast"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/clouds_layer_front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: 'var(--z-garden-clouds-front)',
        }}
      />

      {/* Stars */}
      <div
        className="stars garden-twinkle"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/star_twinkle_static.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen',
          zIndex: 'var(--z-garden-stars)',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 'var(--z-garden-ui-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
          color: 'var(--garden-moonlight)',
        }}
      >
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: 0, 
            marginBottom: '16px',
            fontWeight: 300,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}>
            Welcome to Your Inner Garden
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            margin: 0, 
            opacity: 0.9,
            maxWidth: '600px',
          }}>
            Before we begin this journey, let's assess your readiness to tend to your thoughts.
          </p>
        </motion.div>

        {/* Gates Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            marginBottom: '60px',
            flexWrap: 'wrap',
          }}
        >
          {/* Open Gate */}
          <div 
            className={`gate-option ${gardenState.selectedGate === 'open' ? 'selected' : ''}`}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: gardenState.selectedGate && gardenState.selectedGate !== 'open' ? 0.5 : 1,
            }}
            onClick={() => selectGate('open')}
          >
            <div 
              style={{
                width: '120px',
                height: '160px',
                backgroundImage: 'url(/assets/gate_open_base.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                marginBottom: '16px',
                position: 'relative',
              }}
            >
              {gardenState.selectedGate === 'open' && (
                <div 
                  className="garden-breathing"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/assets/gate_open_glow.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />
              )}
            </div>
            <h3 style={{ margin: 0, marginBottom: '8px' }}>Ready for Momentum</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              I'm feeling clear and ready to dive deep
            </p>
          </div>

          {/* Partial Gate */}
          <div 
            className={`gate-option ${gardenState.selectedGate === 'partial' ? 'selected' : ''}`}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: gardenState.selectedGate && gardenState.selectedGate !== 'partial' ? 0.5 : 1,
            }}
            onClick={() => selectGate('partial')}
          >
            <div 
              style={{
                width: '120px',
                height: '160px',
                backgroundImage: 'url(/assets/gate_partial_base.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                marginBottom: '16px',
                position: 'relative',
              }}
            >
              {gardenState.selectedGate === 'partial' && (
                <div 
                  className="garden-breathing"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/assets/gate_partial_glow.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />
              )}
            </div>
            <h3 style={{ margin: 0, marginBottom: '8px' }}>Willing & Curious</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              I'm open to gentle exploration
            </p>
          </div>

          {/* Closed Gate */}
          <div 
            className={`gate-option ${gardenState.selectedGate === 'closed' ? 'selected' : ''}`}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: gardenState.selectedGate && gardenState.selectedGate !== 'closed' ? 0.5 : 1,
            }}
            onClick={() => selectGate('closed')}
          >
            <div 
              style={{
                width: '120px',
                height: '160px',
                backgroundImage: 'url(/assets/gate_closed_base.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                marginBottom: '16px',
                position: 'relative',
              }}
            >
              {gardenState.selectedGate === 'closed' && (
                <div 
                  className="garden-breathing"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/assets/gate_closed_glow.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />
              )}
            </div>
            <h3 style={{ margin: 0, marginBottom: '8px' }}>Emotionally Overwhelmed</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              I need gentle support first
            </p>
          </div>
        </motion.div>

        {/* Readiness Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          style={{
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <label 
            htmlFor="readiness-slider"
            style={{
              display: 'block',
              marginBottom: '16px',
              fontSize: '1.1rem',
              opacity: 0.9,
            }}
          >
            How ready do you feel? (Current: {readinessLevel}%)
          </label>
          <input
            id="readiness-slider"
            type="range"
            min="0"
            max="100"
            value={readinessLevel}
            onChange={(e) => handleReadinessChange(parseInt(e.target.value))}
            style={{
              width: '300px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </motion.div>

        {/* Selected Gate Message */}
        {gardenState.selectedGate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              maxWidth: '400px',
            }}
          >
            {gardenState.selectedGate === 'closed' ? (
              <div>
                <p style={{ margin: 0, marginBottom: '16px' }}>
                  It's wise to recognize when we need extra care. 
                  Your garden will always be here when you're ready.
                </p>
                <button
                  onClick={() => showRestMessage(false)}
                  className="garden-button"
                  style={{
                    background: 'var(--garden-moonlight)',
                    color: 'var(--garden-night-primary)',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Take Time to Rest
                </button>
              </div>
            ) : (
              <p style={{ margin: 0 }}>
                Wonderful! Preparing your garden journey...
                <br />
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  You'll be taken to the next step shortly.
                </span>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Step1NightSky;