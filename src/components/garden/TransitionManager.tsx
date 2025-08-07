// Transition Manager - GSAP-based animation coordinator for garden transitions
// Handles complex cinematic transitions between garden steps

import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGardenState, useGardenAnimations } from '../../context/GardenStateContext';
import type { AnimationQueueItem, StepType } from '../../context/GardenStateTypes';

interface TransitionManagerProps {
  children: React.ReactNode;
}

const TransitionManager: React.FC<TransitionManagerProps> = ({ children }) => {
  const { gardenState } = useGardenState();
  const { animationState, queueAnimation, clearAnimationQueue, setAnimating } = useGardenAnimations();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const processingRef = useRef(false);

  // Process animation queue
  const processAnimationQueue = useCallback(async () => {
    if (processingRef.current || animationState.animationQueue.length === 0) {
      return;
    }

    processingRef.current = true;
    setAnimating(true);

    // Create GSAP timeline for coordinated animations
    const timeline = gsap.timeline({
      onComplete: () => {
        setAnimating(false);
        processingRef.current = false;
        clearAnimationQueue();
      },
    });

    timelineRef.current = timeline;

    // Process each animation in the queue
    for (const animation of animationState.animationQueue) {
      await executeAnimation(animation, timeline);
    }

    // Start the timeline
    timeline.play();
  }, [animationState.animationQueue, setAnimating, clearAnimationQueue]);

  // Execute individual animation
  const executeAnimation = useCallback(async (
    animation: AnimationQueueItem, 
    timeline: gsap.core.Timeline
  ): Promise<void> => {
    const { target, properties, duration, delay = 0, ease = 'power2.out', onStart, onComplete } = animation;

    try {
      // Find target elements
      const elements = typeof target === 'string' 
        ? document.querySelectorAll(target)
        : [target];

      if (elements.length === 0) {
        console.warn(`Animation target not found: ${target}`);
        return;
      }

      // Add animation to timeline
      timeline.to(elements, {
        ...properties,
        duration,
        ease,
        onStart,
        onComplete,
      }, delay > 0 ? `+=${delay}` : undefined);

    } catch (error) {
      console.error('Animation execution failed:', error);
    }
  }, []);

  // Predefined transition animations for common step changes
  const executeStepTransition = useCallback((fromStep: StepType, toStep: StepType) => {
    // Clear any existing animations
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Define step-specific transitions
    switch (`${fromStep}->${toStep}`) {
      case 'nightSky->mapTransition':
        queueAnimation({
          id: 'sky-to-map-transition',
          type: 'gsap',
          target: '.night-sky-container',
          properties: { opacity: 0, scale: 1.1 },
          duration: 1,
          ease: 'power2.inOut',
        });
        
        queueAnimation({
          id: 'map-reveal',
          type: 'gsap',
          target: '.map-container',
          properties: { opacity: 1, scale: 1 },
          duration: 1,
          delay: 0.5,
          ease: 'power2.inOut',
        });
        break;

      case 'mapTransition->fieldEntry':
        queueAnimation({
          id: 'dive-into-field',
          type: 'gsap',
          target: '.map-container',
          properties: { 
            scale: 4, 
            opacity: 0,
            filter: 'blur(10px)'
          },
          duration: 1.5,
          ease: 'power2.in',
        });
        
        queueAnimation({
          id: 'field-emerge',
          type: 'gsap',
          target: '.field-container',
          properties: { 
            scale: 1, 
            opacity: 1,
            filter: 'blur(0px)'
          },
          duration: 1.5,
          delay: 0.5,
          ease: 'power2.out',
        });
        break;

      case 'fieldEntry->botanicalReflection':
        queueAnimation({
          id: 'zoom-to-flower',
          type: 'gsap',
          target: '.field-background',
          properties: { 
            scale: 2, 
            filter: 'blur(5px) brightness(0.85)'
          },
          duration: 1,
          ease: 'power2.inOut',
        });
        
        queueAnimation({
          id: 'flower-appear',
          type: 'gsap',
          target: '.flower-focus-area',
          properties: { 
            opacity: 1, 
            scale: 1,
            y: 0
          },
          duration: 1,
          delay: 0.5,
          ease: 'back.out(1.7)',
        });
        break;

      case 'botanicalReflection->gardenPath':
      case 'fieldEntry->gardenPath':
        queueAnimation({
          id: 'pull-back-to-path',
          type: 'gsap',
          target: '.field-background',
          properties: { 
            scale: 1, 
            filter: 'blur(0px) brightness(1)'
          },
          duration: 1.5,
          ease: 'power2.inOut',
        });
        
        queueAnimation({
          id: 'path-elements-appear',
          type: 'gsap',
          target: '.garden-path-elements',
          properties: { 
            opacity: 1, 
            y: 0,
            stagger: 0.1
          },
          duration: 1,
          delay: 1,
          ease: 'power2.out',
        });
        break;

      default:
        // Generic fade transition
        queueAnimation({
          id: 'generic-fade-out',
          type: 'gsap',
          target: '.garden-step',
          properties: { opacity: 0 },
          duration: 0.5,
          ease: 'power2.out',
        });
        
        queueAnimation({
          id: 'generic-fade-in',
          type: 'gsap',
          target: '.garden-step',
          properties: { opacity: 1 },
          duration: 0.5,
          delay: 0.5,
          ease: 'power2.out',
        });
        break;
    }
  }, [queueAnimation]);

  // Watch for step changes and trigger transitions
  const previousStepRef = useRef<StepType>(gardenState.currentStep);
  
  useEffect(() => {
    const currentStep = gardenState.currentStep;
    const previousStep = previousStepRef.current;
    
    if (currentStep !== previousStep) {
      executeStepTransition(previousStep, currentStep);
      previousStepRef.current = currentStep;
    }
  }, [gardenState.currentStep, executeStepTransition]);

  // Process animation queue when new animations are added
  useEffect(() => {
    if (animationState.animationQueue.length > 0) {
      processAnimationQueue();
    }
  }, [animationState.animationQueue.length, processAnimationQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  // Enhanced GSAP utilities for garden-specific animations
  const gardenAnimations = {
    // Gentle floating animation for flowers
    floatGently: (target: string, duration = 3) => {
      gsap.to(target, {
        y: '+=10',
        rotation: '+=2',
        duration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    },

    // Breathing glow effect
    breathingGlow: (target: string, intensity = 0.5) => {
      gsap.to(target, {
        opacity: intensity,
        scale: 1.05,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    },

    // Petal drift effect
    petalDrift: (target: string) => {
      gsap.set(target, { opacity: 0.7, y: -10 });
      gsap.to(target, {
        y: '+=50',
        x: '+=20',
        rotation: 360,
        opacity: 0.3,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        stagger: {
          amount: 2,
          from: 'random',
        },
      });
    },

    // Sunlight sweep
    sunlightSweep: (target: string, direction = 'left') => {
      const startX = direction === 'left' ? '-100%' : '100%';
      const endX = direction === 'left' ? '100%' : '-100%';
      
      gsap.fromTo(target, 
        { x: startX, opacity: 0 },
        { 
          x: endX, 
          opacity: 1,
          duration: 3,
          ease: 'sine.inOut',
        }
      );
    },
  };

  // Make utilities available globally for components
  React.useEffect(() => {
    (window as any).gardenAnimations = gardenAnimations;
  }, []);

  return (
    <div 
      className="garden-transition-manager"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
      
      {/* Development animation debugger */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            zIndex: 1000,
            fontFamily: 'monospace',
            maxWidth: '200px',
          }}
        >
          <div>Animations: {animationState.isAnimating ? 'Active' : 'Idle'}</div>
          <div>Queue: {animationState.animationQueue.length}</div>
          {animationState.currentAnimation && (
            <div>Current: {animationState.currentAnimation}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitionManager;