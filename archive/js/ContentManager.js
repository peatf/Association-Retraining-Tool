/**
 * ContentManager - Handles loading and managing all therapeutic content
 * Provides unified access to topics, emotions, therapeutic sequences, and thought buffet content
 * Privacy-first design with local JSON content loading
 */
class ContentManager {
    constructor() {
        this.therapeuticContent = null;
        this.thoughtBuffet = null;
        this.topicsData = null;
        this.emotionsData = null;
        this.loaded = false;
    }

    /**
     * Load all therapeutic content from JSON files
     * @returns {Promise<void>}
     */
    async loadTherapeuticContent() {
        if (this.loaded) {
            return;
        }

        try {
            const [therapeuticResponse, thoughtBuffetResponse, topicsResponse, emotionsResponse] = await Promise.all([
                fetch('./js/therapeutic-content.json'),
                fetch('./js/thought-buffet.json'),
                fetch('./js/topics.json'),
                fetch('./js/emotions.json')
            ]);

            this.therapeuticContent = await therapeuticResponse.json();
            this.thoughtBuffet = await thoughtBuffetResponse.json();
            this.topicsData = await topicsResponse.json();
            this.emotionsData = await emotionsResponse.json();

            this.loaded = true;
            console.log('Therapeutic content loaded successfully');

        } catch (error) {
            console.error('Error loading therapeutic content:', error);
            this._loadFallbackContent();
        }
    }

    /**
     * Get emotion palette for a specific topic
     * @param {string} topic - Topic name (Money, Romance, Self-Image)
     * @returns {Array} Array of emotion strings
     */
    getEmotionPalette(topic) {
        if (!this.emotionsData || !this.emotionsData[topic]) {
            return this._getFallbackEmotions(topic);
        }

        return this.emotionsData[topic].palette || [];
    }

    /**
     * Get therapeutic content for topic/emotion combination
     * @returns {Object} Complete therapeutic content structure
     */
    getTherapeuticContent() {
        if (!this.therapeuticContent) {
            return this._getFallbackTherapeuticContent();
        }

        return this.therapeuticContent;
    }

    /**
     * Get thought buffet content for NLP-driven reframes
     * @returns {Object} Thought buffet with psychological labels and reframes
     */
    getThoughtBuffet() {
        if (!this.thoughtBuffet) {
            return this._getFallbackThoughtBuffet();
        }

        return this.thoughtBuffet;
    }

    /**
     * Get ACT defusion exercise for a specific topic
     * @param {string} topic - Topic name
     * @returns {Object} ACT defusion exercise with instructions and steps
     */
    getACTDefusionExercise(topic) {
        if (!this.therapeuticContent || !this.therapeuticContent.act_defusion_exercises) {
            return this._getFallbackACTExercise();
        }

        const exercises = this.therapeuticContent.act_defusion_exercises;
        
        // Return topic-specific exercise or generic fallback
        return exercises[topic] || exercises.generic || this._getFallbackACTExercise();
    }

    /**
     * Get subtopic content based on keywords and emotion
     * @param {string} topic - Main topic
     * @param {Array} keywords - Extracted keywords from user text
     * @param {string} emotion - Selected emotion
     * @returns {Object} Subtopic content or null if not found
     */
    getSubtopicContent(topic, keywords, emotion) {
        if (!this.therapeuticContent || !this.therapeuticContent.sequences[topic]) {
            return null;
        }

        const topicContent = this.therapeuticContent.sequences[topic];
        
        // Try to find subtopic based on emotion first
        if (topicContent[emotion]) {
            return {
                subtopic: emotion,
                content: topicContent[emotion]
            };
        }

        // If no direct emotion match, return first available subtopic
        const availableSubtopics = Object.keys(topicContent);
        if (availableSubtopics.length > 0) {
            const firstSubtopic = availableSubtopics[0];
            return {
                subtopic: firstSubtopic,
                content: topicContent[firstSubtopic]
            };
        }

        return null;
    }

    /**
     * Select subtopic intelligently based on keywords and emotion
     * @param {string} topic - Main topic
     * @param {Array} keywords - Keywords from user text
     * @param {string} emotion - Selected emotion
     * @returns {string} Selected subtopic name
     */
    selectSubtopicByKeywords(topic, keywords, emotion) {
        if (!this.therapeuticContent || !this.therapeuticContent.sequences[topic]) {
            return emotion; // Fallback to emotion as subtopic
        }

        const topicContent = this.therapeuticContent.sequences[topic];
        const availableSubtopics = Object.keys(topicContent);

        // If emotion directly matches a subtopic, use it
        if (availableSubtopics.includes(emotion)) {
            return emotion;
        }

        // Try to match keywords to subtopic triggers (if implemented in content structure)
        for (const subtopic of availableSubtopics) {
            const subtopicData = topicContent[subtopic];
            
            // Check if subtopic has keyword triggers
            if (subtopicData.keywordTriggers) {
                const hasMatchingKeyword = keywords.some(keyword => 
                    subtopicData.keywordTriggers.some(trigger => 
                        keyword.toLowerCase().includes(trigger.toLowerCase()) ||
                        trigger.toLowerCase().includes(keyword.toLowerCase())
                    )
                );
                
                if (hasMatchingKeyword) {
                    return subtopic;
                }
            }

            // Check if subtopic has emotion triggers
            if (subtopicData.emotionTriggers && subtopicData.emotionTriggers.includes(emotion)) {
                return subtopic;
            }
        }

        // Fallback to first available subtopic
        return availableSubtopics[0] || emotion;
    }

    /**
     * Check if content is loaded
     * @returns {boolean} True if all content is loaded
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Load fallback content when JSON files fail to load
     * @private
     */
    _loadFallbackContent() {
        this.topicsData = {
            topics: ['Money', 'Romance', 'Self-Image'],
            topicDescriptions: {
                'Money': 'Financial concerns, scarcity, and abundance mindset',
                'Romance': 'Relationships, dating, and emotional connections',
                'Self-Image': 'Self-worth, confidence, and personal identity'
            },
            topicIcons: {
                'Money': '💰',
                'Romance': '💕',
                'Self-Image': '🪞'
            }
        };

        this.emotionsData = {
            'Money': { palette: ['anxious', 'resentful', 'overwhelmed', 'insecure', 'ashamed', 'fearful'] },
            'Romance': { palette: ['lonely', 'rejected', 'unworthy', 'desperate', 'heartbroken', 'jealous'] },
            'Self-Image': { palette: ['inadequate', 'worthless', 'embarrassed', 'disappointed', 'self-critical', 'defeated'] }
        };

        this.thoughtBuffet = this._getFallbackThoughtBuffet();
        this.therapeuticContent = this._getFallbackTherapeuticContent();
        this.loaded = true;
    }

    /**
     * Get fallback emotions for a topic
     * @param {string} topic - Topic name
     * @returns {Array} Fallback emotion array
     * @private
     */
    _getFallbackEmotions(topic) {
        const fallbackEmotions = {
            'Money': ['anxious', 'overwhelmed', 'frustrated'],
            'Romance': ['lonely', 'rejected', 'sad'],
            'Self-Image': ['inadequate', 'worthless', 'disappointed']
        };

        return fallbackEmotions[topic] || ['anxious', 'overwhelmed', 'frustrated'];
    }

    /**
     * Get fallback thought buffet content
     * @returns {Object} Fallback thought buffet
     * @private
     */
    _getFallbackThoughtBuffet() {
        return {
            generic_fallback: [
                "It's okay if your thoughts feel tangled right now.",
                "I don't need to have it all figured out.",
                "My feelings are valid, even if they're hard to put into words.",
                "This moment of difficulty is temporary and will pass.",
                "I am worthy of compassion, especially from myself.",
                "Taking time to reflect on my thoughts shows strength and self-awareness."
            ],
            feeling_of_worthlessness: [
                "My inherent worth is not defined by my thoughts, feelings, or achievements.",
                "This is just a feeling; it is not the truth of who I am.",
                "I will treat myself with the same kindness I would offer a friend feeling this way."
            ],
            anxiety_about_the_future: [
                "I cannot control the future, but I can influence how I respond to uncertainty.",
                "My anxiety shows that I care about outcomes, which reflects my values.",
                "I will focus on what I can control in this present moment."
            ]
        };
    }

    /**
     * Get fallback therapeutic content
     * @returns {Object} Fallback therapeutic content structure
     * @private
     */
    _getFallbackTherapeuticContent() {
        return {
            sequences: {
                Money: {
                    anxious: [
                        {
                            type: 'cbt_reframe',
                            content: 'Notice that your financial anxiety often focuses on worst-case scenarios. Consider the evidence that contradicts these fears.',
                            alternative: 'Your anxiety about money shows you care about security. You can take one small step today to feel more financially grounded.'
                        }
                    ]
                },
                Romance: {
                    lonely: [
                        {
                            type: 'cbt_reframe',
                            content: 'Loneliness is a signal that you value connection, not evidence that you\'re unlovable.',
                            alternative: 'The capacity to feel lonely shows your heart is open to love, which is a beautiful quality.'
                        }
                    ]
                },
                'Self-Image': {
                    inadequate: [
                        {
                            type: 'cbt_reframe',
                            content: 'Feeling inadequate often means you\'re comparing your inside experience to others\' outside appearance.',
                            alternative: 'Inadequacy is a feeling, not a fact. Your worth doesn\'t depend on measuring up to impossible standards.'
                        }
                    ]
                }
            },
            act_defusion_exercises: {
                generic: this._getFallbackACTExercise()
            }
        };
    }

    /**
     * Get fallback ACT defusion exercise
     * @returns {Object} Fallback ACT exercise
     * @private
     */
    _getFallbackACTExercise() {
        return {
            title: "Thoughts as Leaves on a Stream",
            instructions: "A gentle exercise for creating space between you and any difficult thoughts.",
            steps: [
                "Imagine yourself sitting beside a gently flowing stream on a peaceful day.",
                "Notice leaves floating down the stream—some moving quickly, others slowly, each unique.",
                "As thoughts arise in your mind, place each one on a leaf and watch it float downstream.",
                "You might see leaves labeled with worries, judgments, fears, or painful memories.",
                "Don't try to stop the leaves or push them away. Simply observe them floating by.",
                "If you find yourself getting caught up in a thought, gently return to your position by the stream.",
                "Remember: you are not the leaves or the thoughts they carry. You are the peaceful observer by the water."
            ],
            closing: "Thoughts come and go like leaves on a stream. You are the constant, aware presence watching from the shore."
        };
    }
}

export default ContentManager;