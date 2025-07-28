import { describe, it, expect, beforeEach, vi } from 'vitest';
import PsychologicalEngine from '../../js/PsychologicalEngine.js';

/* ---- mocks ---- */
function mockSession() {
  const state = {};
  return {
    updateState: vi.fn((k,v)=>{state[k]=v}),
    getCurrentState: vi.fn(()=>({...state})),
  };
}
function mockContent(noContent = false) {
  return {
    getTherapeuticContent: () => (noContent ? { sequences:{} } : {
      sequences:{ Money:{ anxious:[
        { content:'You began feeling anxious about money…', type:'cbt_reframe', alternative:'First alt' },
        { content:'You began feeling anxious about money, and you\'ve worked through those feelings to find a more balanced perspective.', type:'cbt_reframe' },
      ]}}
    }),
    getACTDefusionExercise: vi.fn(() => ({ instructions: 'ACT exercise instructions' })),
    getThoughtBuffet: () => ({ generic_fallback:['Fallback 1','Fallback 2','Fallback 3']}),
  };
}

/* ---- tests ---- */
describe('PsychologicalEngine – technique selection', () => {
  let engine;
  beforeEach(()=>{ engine = new PsychologicalEngine(mockSession(), mockContent()); });

  it('selects ACT for high intensity', () => {
    const tech = engine.selectTechnique({ intensity: 9 });
    expect(tech).toBe('act');
  });
  it('selects NLP‑buffet when userText & NLP engine present', () => {
    engine.setNLPEngine({ classifyText: vi.fn() });
    const tech = engine.selectTechnique({ intensity:4, userText:'I feel...', selectedTopic:'Money', selectedEmotion:'anxious' });
    expect(tech).toBe('nlp-buffet');
  });
  it('falls back to CBT for medium intensity anxious', () => {
    const tech = engine.selectTechnique({ intensity:4, selectedTopic:'Money', selectedEmotion:'anxious' });
    expect(['cbt','socratic']).toContain(tech);
  });
});

describe('PsychologicalEngine – journey & prompts', () => {
  let engine, sess, content;
  beforeEach(()=>{
    sess = mockSession();
    content = mockContent();
    engine = new PsychologicalEngine(sess, content);
  });

  it('builds CBT journey & updates session order', async () => {
    const seq = await engine.buildJourneySequence({ selectedTopic:'Money', selectedEmotion:'anxious', intensity:4 });
    expect(seq.length).toBe(2);
    expect(sess.updateState).toHaveBeenNthCalledWith(1,'currentTechnique','cbt');
    expect(sess.updateState).toHaveBeenNthCalledWith(2,'journeySequence',seq);
    expect(sess.updateState).toHaveBeenNthCalledWith(3,'currentStep',0);
    expect(sess.updateState).toHaveBeenNthCalledWith(4,'totalSteps',2);
  });

  it('continue advances and not complete until final', async () => {
    await engine.buildJourneySequence({ selectedTopic:'Money', selectedEmotion:'anxious', intensity:4 });
    const p = engine.getNextPrompt('continue');
    expect(p.content).toContain('worked through');
    expect(p.step).toBe(2);
    expect(p.isComplete).toBe(false);
  });

  it('ACT triggers after two try‑another clicks', async () => {
    await engine.buildJourneySequence({ selectedTopic:'Money', selectedEmotion:'anxious', intensity:4 });
    engine.getNextPrompt('try-another');      // alt 1
    const act = engine.getNextPrompt('try-another'); // alt 2 → ACT
    expect(act.requiresACTFlow).toBe(true);
    expect(content.getACTDefusionExercise).toHaveBeenCalled();
  });

  it('marks complete at the end', async () => {
    await engine.buildJourneySequence({ selectedTopic:'Money', selectedEmotion:'anxious', intensity:4 });
    engine.getNextPrompt('continue');         // step 2/2
    const done = engine.getNextPrompt('continue');
    expect(done.isComplete).toBe(true);
    expect(done.type).toBe('completion');
  });

  it('throws if getNextPrompt called before journey', () => {
    const fresh = new PsychologicalEngine(sess, content);
    expect(()=>fresh.getNextPrompt()).toThrow('No active journey');
  });

  it('resetJourney clears state', async () => {
    await engine.buildJourneySequence({ selectedTopic:'Money', selectedEmotion:'anxious', intensity:4 });
    engine.resetJourney();
    expect(sess.updateState).toHaveBeenCalledWith('currentTechnique', null);
    expect(engine.getCurrentJourney()).toBeNull();
  });

  it('falls back gracefully when no content for topic/emotion', async () => {
    const e2 = new PsychologicalEngine(sess, mockContent(true));
    const seq = await e2.buildJourneySequence({ selectedTopic:'Unknown', selectedEmotion:'joyful', intensity:3 });
    expect(seq[0].type).toBe('fallback');
  });
});
