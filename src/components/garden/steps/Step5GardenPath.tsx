// Step 5: Garden Path - Thought Selection with Sunlight Dial and Bouquet
// Placeholder implementation showing the final step with thought picker and collection

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGardenState } from '../../../context/GardenStateContext';
import type { SunlightLevel, ThoughtOption, BouquetItem } from '../../../context/GardenStateTypes';

const Step5GardenPath: React.FC = () => {
  const { 
    gardenState, 
    updateSunlightLevel, 
    loadThoughtOptions,
    selectThought,
    removeSelectedThought,
    exportSession,
    createBouquet
  } = useGardenState();
  
  const [sunlightLevel, setSunlightLevel] = useState<SunlightLevel>(gardenState.sunlightLevel);
  const [mockThoughts, setMockThoughts] = useState<ThoughtOption[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  // Mock thought data for demonstration
  const generateMockThoughts = (level: SunlightLevel) => {
    const topics = gardenState.selectedTopic || 'money';
    const baseThoughts = {
      money: {
        low: [
          "Small steps toward financial awareness are still meaningful progress",
          "I can learn to make choices that align with my values",
          "My worth isn't determined by my bank account"
        ],
        mid: [
          "I'm capable of making wise financial decisions",
          "Money is a tool that can support my goals and values",
          "I can find balance between saving and enjoying life"
        ],
        high: [
          "I attract abundance through my skills and contributions",
          "Financial freedom is within my reach through consistent action",
          "I deserve prosperity and can use it to benefit others too"
        ]
      },
      relationships: {
        low: [
          "It's okay to set gentle boundaries with people I care about",
          "I can learn to communicate my needs more clearly",
          "Healthy relationships require patience and understanding"
        ],
        mid: [
          "I attract people who appreciate and respect me",
          "I can give and receive love in balanced ways",
          "Conflict can lead to deeper understanding when handled with care"
        ],
        high: [
          "I am worthy of deep, meaningful connections",
          "I bring unique value to every relationship in my life",
          "Love multiplies when I share it freely and authentically"
        ]
      },
      selfImage: {
        low: [
          "I'm learning to be kinder to myself each day",
          "My flaws don't define my worth as a person",
          "I can acknowledge my struggles without judgment"
        ],
        mid: [
          "I have unique strengths that contribute to the world",
          "I'm growing and evolving in my own perfect timing",
          "I can celebrate small victories and progress"
        ],
        high: [
          "I am inherently valuable and deserving of love",
          "My authentic self is exactly who the world needs",
          "I embrace my full potential with confidence and grace"
        ]
      }
    };

    const thoughtsForLevel = baseThoughts[topics as keyof typeof baseThoughts]?.[level] || baseThoughts.money[level];
    
    return thoughtsForLevel.map((content, index) => ({
      id: `thought-${level}-${index}`,
      content,
      category: topics,
      subcategory: 'general',
      intensity: level,
      tags: [topics, level],
      source: 'curated' as const,
    }));
  };

  // Update thoughts when sunlight level changes
  useEffect(() => {
    const thoughts = generateMockThoughts(sunlightLevel);
    setMockThoughts(thoughts);
    updateSunlightLevel(sunlightLevel);
  }, [sunlightLevel, updateSunlightLevel, gardenState.selectedTopic]);

  // Track selected thoughts count
  useEffect(() => {
    setSelectedCount(gardenState.selectedThoughts.length);
  }, [gardenState.selectedThoughts.length]);

  const handleSunlightChange = (level: SunlightLevel) => {
    setSunlightLevel(level);
  };

  const handleThoughtSelect = (thought: ThoughtOption) => {
    selectThought(thought);
  };

  const handleRemoveThought = (thoughtId: string) => {
    removeSelectedThought(thoughtId);
  };

  const handleExportBouquet = async () => {
    try {
      await exportSession('json');
      // In a real implementation, this would trigger download or save
      alert('Bouquet created! Your insights have been preserved.');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const fieldBackground = gardenState.selectedTopic 
    ? `/assets/field_${gardenState.selectedTopic}_bg.png`
    : '/assets/field_money_bg.png';

  const sunlightOverlay = `/assets/sunlight_overlay_${sunlightLevel}.png`;

  return (
    <div 
      className="garden-step garden-step-gardenpath"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Field Background */}
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
          zIndex: 'var(--z-garden-background)',
        }}
      />

      {/* Sunlight Overlay */}
      <motion.div
        key={sunlightLevel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${sunlightOverlay})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen',
          zIndex: 'var(--z-garden-ui-base)',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 'var(--z-garden-interactive)',
          height: '100%',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <h1 style={{
            margin: 0,
            marginBottom: '12px',
            fontSize: '2rem',
            color: 'var(--garden-moonlight)',
            textShadow: '0 2px 10px rgba(0,0,0,0.7)',
            fontWeight: 300,
          }}>
            Choose Your Bouquet of New Perspectives
          </h1>
          <p style={{
            margin: 0,
            fontSize: '1.1rem',
            color: 'var(--garden-moonlight)',
            opacity: 0.9,
            textShadow: '0 1px 5px rgba(0,0,0,0.5)',
          }}>
            Adjust the sunlight and select thoughts that resonate with you
          </p>
        </motion.div>

        {/* Sunlight Dial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
          }}>
            <p style={{
              margin: 0,
              marginBottom: '16px',
              fontSize: '1rem',
              color: 'var(--garden-night-primary)',
              fontWeight: 500,
            }}>
              Sunlight Intensity
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}>
              {(['low', 'mid', 'high'] as SunlightLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => handleSunlightChange(level)}
                  style={{
                    padding: '12px 20px',
                    border: sunlightLevel === level ? '2px solid var(--garden-glow-bright)' : '2px solid transparent',
                    borderRadius: '12px',
                    background: sunlightLevel === level ? 'var(--garden-glow-bright)' : 'rgba(0,0,0,0.1)',
                    color: sunlightLevel === level ? 'white' : 'var(--garden-night-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                >
                  {level === 'low' && '🌅'} {level === 'mid' && '☀️'} {level === 'high' && '🌟'} {level}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          gap: '30px',
          alignItems: 'flex-start',
        }}>
          {/* Thought Flowers Grid */}
          <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: '20px',
              fontSize: '1.4rem',
              color: 'var(--garden-night-primary)',
              textAlign: 'center',
            }}>
              Available Thoughts
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <AnimatePresence>
                {mockThoughts.map((thought, index) => (
                  <motion.div
                    key={thought.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => handleThoughtSelect(thought)}
                    style={{
                      padding: '16px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                    }}
                    whileHover={{ scale: 1.05, borderColor: 'var(--garden-glow-bright)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      width: '30px',
                      height: '30px',
                      backgroundImage: `url(/assets/picker_flower_generic${(index % 16) + 1}.png)`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }} />
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: 'var(--garden-night-primary)',
                      lineHeight: 1.4,
                    }}>
                      {thought.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bouquet Holder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              width: '300px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '30px',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <h3 style={{
              margin: 0,
              marginBottom: '20px',
              fontSize: '1.4rem',
              color: 'var(--garden-night-primary)',
            }}>
              Your Bouquet
            </h3>

            <div style={{
              width: '120px',
              height: '120px',
              backgroundImage: 'url(/assets/bouquet_holder.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              margin: '0 auto 20px auto',
              position: 'relative',
            }}>
              {/* Selected thought count indicator */}
              {selectedCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '30px',
                  height: '30px',
                  background: 'var(--garden-glow-bright)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}>
                  {selectedCount}
                </div>
              )}
            </div>

            <p style={{
              margin: 0,
              marginBottom: '20px',
              fontSize: '0.9rem',
              color: 'var(--garden-night-secondary)',
              opacity: 0.8,
            }}>
              {selectedCount === 0 
                ? 'Select thoughts to add to your bouquet'
                : `${selectedCount} thought${selectedCount > 1 ? 's' : ''} selected`
              }
            </p>

            {/* Selected Thoughts List */}
            {gardenState.selectedThoughts.length > 0 && (
              <div style={{
                marginBottom: '20px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                {gardenState.selectedThoughts.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px',
                      margin: '8px 0',
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => handleRemoveThought(item.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(255,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                    {item.content}
                  </div>
                ))}
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExportBouquet}
              disabled={selectedCount === 0}
              className="garden-button"
              style={{
                background: selectedCount > 0 
                  ? 'var(--garden-night-primary)' 
                  : 'rgba(0,0,0,0.3)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Create Bouquet 💐
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Step5GardenPath;