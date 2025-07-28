/**
 * PsychologicalEngine – merged, fully‑featured version
 * (CBT / Socratic / ACT / NLP “Thought Buffet”)
 */
class PsychologicalEngine {
  constructor(sessionManager, contentManager) {
    this.sessionManager = sessionManager;
    this.contentManager = contentManager;
    this.nlpEngine      = null;

    this.currentJourney = null;               // { technique, sequence, currentStep, totalSteps, alternativeAttempts }
    this.alternatives   = ['First alt', 'Second alt'];
  }

  /* -------------- public helpers -------------- */
  setNLPEngine(engine) { this.nlpEngine = engine; }

  selectTechnique({ intensity = 0, userText = '', selectedTopic, selectedEmotion }) {
    if (intensity >= 7)                    return 'act';
    if (userText.trim() && this.nlpEngine) return 'nlp-buffet';

    if (selectedTopic && selectedEmotion) {
      const tier = this._emotionTier(selectedEmotion);
      if (tier === 'high')   return 'cbt';
      if (tier === 'medium') return 'cbt'; // deterministic: CBT handles mid‑range anxiety best
      return 'socratic';
    }
    return 'cbt';
  }

  async buildJourneySequence(userState) {
    const {
      selectedTopic   = '',
      selectedEmotion = '',
      userText        = '',
      intensity       = 0,
    } = userState;

    const technique = this.selectTechnique(userState);
    let   sequence  = [];

    try {
      if (technique === 'nlp-buffet' && this.nlpEngine) {
        sequence = await this._buildNLPBuffetSequence(userText);
      } else if (technique === 'act') {
        sequence = this._buildACTSequence(selectedTopic);
      } else {
        sequence = this._buildLegacySequence(selectedTopic, selectedEmotion, technique);
      }
    } catch (err) {
      console.error('Sequence build failed, using generic fallback:', err);
      sequence = this._buildFallbackSequence();
    }

    this.currentJourney = {
      technique,
      sequence,
      currentStep: 0,
      totalSteps: sequence.length,
      alternativeAttempts: 0,
    };

    /* tests assert this exact order */
    await this.sessionManager.updateState('currentTechnique', technique);
    await this.sessionManager.updateState('journeySequence', sequence);
    await this.sessionManager.updateState('currentStep', 0);
    await this.sessionManager.updateState('totalSteps', sequence.length);

    return sequence;
  }

  getNextPrompt(action = 'continue') {
    if (!this.currentJourney)
      throw new Error('No active journey. Call buildJourneySequence first.');

    const j = this.currentJourney;

    /* ---------- try‑another ---------- */
    if (action === 'try-another') {
      j.alternativeAttempts += 1;

      // trigger ACT after **two** alternates
      if (j.alternativeAttempts >= 2) return this._triggerACTDefusion();

      const prompt = j.sequence[j.currentStep];
      return {
        content: prompt.alternative || prompt.content,
        type:    prompt.type,
        step:    j.currentStep + 1,
        totalSteps: j.totalSteps,
        isAlternative: true,
        isComplete: false,
      };
    }

    /* ------------- continue ---------- */
    if (action === 'continue') {
      j.alternativeAttempts = 0;
      j.currentStep += 1;
      this.sessionManager.updateState('currentStep', j.currentStep);

      // only show completion when we've gone past the last content index
      if (j.currentStep >= j.totalSteps) {
        return {
          content: this._completionSummary(),
          type:    'completion',
          step:    j.currentStep,
          totalSteps: j.totalSteps,
          isComplete: true,
        };
      }

      // otherwise, serve sequence[j.currentStep]
      const nextPrompt = j.sequence[j.currentStep];
      return {
        content: nextPrompt.content,
        type: nextPrompt.type,
        step: j.currentStep + 1,
        totalSteps: j.totalSteps,
        isAlternative: false,
        isComplete: false,
      };
    }

    throw new Error(`Unknown action: ${action}`);
  }

  /* ============ internal builders & helpers ============ */

  _triggerACTDefusion() {
    const { selectedTopic } = this.sessionManager.getCurrentState();
    const act = this.contentManager.getACTDefusionExercise(selectedTopic);

    this.sessionManager.updateState('currentScreen', 'act-defusion');

    return {
      content: act.instructions,
      type:    'act-defusion',
      actExercise: act,
      requiresACTFlow: true,
      isComplete: false,
    };
  }

  async _buildNLPBuffetSequence(userText) {
    try {
      const cls    = await this.nlpEngine.classifyText(userText);
      const buffet = this.contentManager.getThoughtBuffet();
      const label  = cls.confidence >= 0.45 && buffet[cls.label] ? cls.label : 'generic_fallback';

      return buffet[label].map((str, idx) => ({
        content: str,
        alternative: `Let's reframe that: ${str}`,
        type: 'nlp-reframe',
        step: idx,
      }));
    } catch (err) {
      console.error('NLP classification failed → fallback', err);
      const bf = this.contentManager.getThoughtBuffet().generic_fallback;
      return bf.map((s, i) => ({
        content: s,
        alternative: `Here's another perspective: ${s}`,
        type: 'nlp-reframe-fallback',
        step: i,
      }));
    }
  }

  _buildACTSequence(topic) {
    const act = this.contentManager.getACTDefusionExercise(topic);
    return [{
      content: act.instructions,
      alternative: "Let's approach those thoughts mindfully.",
      type: 'act-defusion',
      step: 0,
      actExercise: act,
    }];
  }

  _buildLegacySequence(topic, emotion, technique) {
    const bank = this.contentManager.getTherapeuticContent();
    const seq  = bank.sequences?.[topic]?.[emotion] || [];
    if (!seq.length) return this._buildFallbackSequence();

    if (technique === 'cbt') {
      const cbtSteps = seq.filter(s => s.type === 'cbt_reframe');
      return cbtSteps.length ? cbtSteps : seq; // fallback to mixed
    }
    if (technique === 'socratic') {
      const socSteps = seq.filter(s => s.type === 'socratic');
      return socSteps.length ? socSteps : seq; // fallback to mixed
    }
    return seq; // mixed
  }

  _buildFallbackSequence() {
    return [
      { content:"It's okay if your thoughts feel tangled.", alternative:"Your feelings are valid.", type:'fallback', step:0 },
      { content:"This moment is temporary and will pass.",  alternative:"Be gentle with yourself.", type:'fallback', step:1 },
      { content:"Reflecting shows self‑awareness.",         alternative:"You deserve compassion.", type:'fallback', step:2 },
    ];
  }

  _completionSummary() {
    const { selectedTopic='', selectedEmotion='', intensity=0, currentTechnique } =
      this.sessionManager.getCurrentState();

    const topic = selectedTopic ? selectedTopic.toLowerCase() : 'this area of your life';
    const emo   = selectedEmotion ? `feeling ${selectedEmotion}` : 'your feelings';

    if (currentTechnique === 'act')
      return `You felt overwhelmed about ${topic}, and you've worked through those thoughts using mindful defusion.`;
    if (currentTechnique === 'nlp-buffet')
      return `You worked through your thoughts with personalised insights and shifted your view of ${topic}.`;

    if (intensity >= 7)
      return `You faced intense emotions about ${topic} and worked through them to regain balance.`;
    if (intensity >= 4)
      return `You began ${emo} about ${topic} and worked through those feelings to find a clearer perspective.`;

    return `You’ve worked through your reflections on ${topic} and strengthened resilience.`;
  }

  _emotionTier(emotion) {
    const high   = ['overwhelmed','ashamed','desperate','heartbroken','worthless','defeated'];
    const medium = ['anxious','resentful','lonely','rejected','inadequate','embarrassed'];
    if (high.includes(emotion))   return 'high';
    if (medium.includes(emotion)) return 'medium';
    return 'low';
  }

  /* utilities */
  resetJourney() {
    this.currentJourney = null;
    this.sessionManager.updateState('currentTechnique', null);
    this.sessionManager.updateState('journeySequence', []);
    this.sessionManager.updateState('currentStep', 0);
    this.sessionManager.updateState('totalSteps', 0);
  }
  getCurrentJourney() { return this.currentJourney ? { ...this.currentJourney } : null; }
}

export default PsychologicalEngine;
