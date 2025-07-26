// Unit tests for SessionStateManager
import { describe, it, expect, beforeEach } from 'vitest';
import SessionStateManager from '../../js/SessionStateManager.js';

describe('SessionStateManager', () => {
  let sessionManager;

  beforeEach(() => {
    sessionManager = new SessionStateManager();
  });

  describe('Session Initialization', () => {
    it('should initialize with default state', () => {
      sessionManager.initializeSession();
      
      const state = sessionManager.getCurrentState();
      expect(state.currentScreen).toBe('landing');
      expect(state.intensity).toBeNull();
      expect(state.selectedTopic).toBeNull();
      expect(state.selectedEmotion).toBeNull();
      expect(state.userText).toBeNull();
    });

    it('should reinitialize if session state is corrupted', () => {
      sessionManager.initializeSession();
      sessionManager.sessionData = null;
      
      sessionManager.initializeSession();
      expect(sessionManager.getCurrentState()).toBeDefined();
      expect(sessionManager.getState('currentScreen')).toBe('landing');
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      sessionManager.initializeSession();
    });

    it('should update state values correctly', () => {
      sessionManager.updateState('intensity', 7);
      sessionManager.updateState('selectedTopic', 'Money');
      
      expect(sessionManager.getState('intensity')).toBe(7);
      expect(sessionManager.getState('selectedTopic')).toBe('Money');
    });

    it('should return undefined for non-existent keys', () => {
      expect(sessionManager.getState('nonExistentKey')).toBeUndefined();
    });

    it('should return complete current state', () => {
      sessionManager.updateState('intensity', 5);
      sessionManager.updateState('selectedTopic', 'Romance');
      
      const state = sessionManager.getCurrentState();
      expect(state.intensity).toBe(5);
      expect(state.selectedTopic).toBe('Romance');
      expect(state.currentScreen).toBe('landing');
    });
  });

  describe('Session Clearing', () => {
    it('should clear all session data', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('userText', 'Sensitive data');
      sessionManager.updateState('selectedTopic', 'Money');
      
      sessionManager.clearSession();
      
      // After clearing, session is not initialized
      expect(sessionManager.initialized).toBe(false);
      expect(sessionManager.sessionData).toEqual({});
      
      // getState will reinitialize, so check the reinitialized values
      expect(sessionManager.getState('userText')).toBeNull(); // Reinitialized value
      expect(sessionManager.getState('selectedTopic')).toBeNull(); // Reinitialized value
    });

    it('should handle clearing already cleared session', () => {
      sessionManager.clearSession();
      expect(() => sessionManager.clearSession()).not.toThrow();
    });
  });

  describe('Privacy Protection', () => {
    it('should not use persistent storage', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('userText', 'Private information');
      
      // Verify no localStorage or sessionStorage calls
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should store data only in memory', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('testData', 'memory-only');
      
      expect(sessionManager.sessionData.testData).toBe('memory-only');
    });
  });
});