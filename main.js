// main.js
// Clean, static front-end application with privacy-first design
// No backend dependencies - all processing happens client-side

// Check if React Canvas is active before importing anything
if (window.REACT_CANVAS_ACTIVE) {
    console.log('React Canvas is active. Skipping legacy initialization.');
    // Exit early to prevent any imports or initialization
} else {
    // Only import and initialize if React is not active
    import('./js/SessionStateManager.js').then(({ default: SessionStateManager }) => {
        // Dynamic imports to prevent loading when React is active
        Promise.all([
            import('./js/PsychologicalEngine.js'),
            import('./js/ContentManager.js'),
            import('./js/CalendarGenerator.js'),
            import('./js/ErrorHandler.js'),
            import('./js/FeedbackManager.js'),
            import('./src/services/ContentSearchService.js')
        ]).then(([
            { default: PsychologicalEngine },
            { default: ContentManager },
            { default: CalendarGenerator },
            { default: ErrorHandler },
            { default: FeedbackManager },
            { default: contentSearchService }
        ]) => {
            initializeLegacyApp(SessionStateManager, PsychologicalEngine, ContentManager, CalendarGenerator, ErrorHandler, FeedbackManager, contentSearchService);
        });
    });
}

function initializeLegacyApp(SessionStateManager, PsychologicalEngine, ContentManager, CalendarGenerator, ErrorHandler, FeedbackManager, contentSearchService) {

// Initialize session manager for transient, memory-only storage
const sessionManager = new SessionStateManager();

// Initialize error handler first
const errorHandler = new ErrorHandler(sessionManager);

// Initialize content manager, psychological engine, calendar generator, and feedback manager
const contentManager = new ContentManager();
const psychologicalEngine = new PsychologicalEngine(sessionManager, contentManager);
const calendarGenerator = new CalendarGenerator();
const feedbackManager = new FeedbackManager(sessionManager);

// Initialize session on app start
sessionManager.initializeSession();

// Load topics and emotions data
let topicsData = null;
let emotionsData = null;

// Load JSON data on initialization with error handling
async function loadContentData() {
    try {
        const [topicsResponse, emotionsResponse] = await Promise.all([
            fetch('./js/topics.json'),
            fetch('./js/emotions.json')
        ]);
        
        topicsData = await topicsResponse.json();
        emotionsData = await emotionsResponse.json();
    } catch (error) {
        // Use ErrorHandler for content loading failures
        topicsData = errorHandler.handleContentLoadingError('topics', error);
        emotionsData = errorHandler.handleContentLoadingError('emotions', error);
        
        errorHandler.showUserError(
            'Some content failed to load, but we\'ve provided fallback content to ensure your experience continues smoothly.',
            'general'
        );
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check if React Canvas is active to avoid conflicts
    if (window.REACT_CANVAS_ACTIVE) {
        console.log('React Canvas is active. Skipping legacy initialization.');
        return;
    }
    
    // Load content data on initialization
    await loadContentData();
    
    // Load therapeutic content for the psychological engine
    await contentManager.loadTherapeuticContent();
    
    // Navigation helper
    function goTo(id) {
        document.querySelectorAll('#app-container > div').forEach(div => 
            div.classList.toggle('active', div.id === id)
        );
        sessionManager.updateState('currentScreen', id);
    }

    // Screen 1: Landing → Readiness
    document.getElementById('btn-start').addEventListener('click', () => {
        goTo('screen-readiness');
    });

    // Screen 2: Readiness check with intensity slider
    const intensitySlider = document.getElementById('intensity-slider');
    const intensityValue = document.getElementById('intensity-value');
    const intensityFeedback = document.getElementById('intensity-feedback');

    // Update intensity display and feedback in real-time
    intensitySlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        intensityValue.textContent = value;
        intensityValue.classList.add('intensity-pulse');
        
        // Remove pulse animation after it completes
        setTimeout(() => {
            intensityValue.classList.remove('intensity-pulse');
        }, 200);
        
        // Update contextual messaging based on slider value
        updateIntensityFeedback(value);
        
        // Store intensity in session
        sessionManager.updateState('intensity', value);
    });

    function updateIntensityFeedback(intensity) {
        let message = '';
        let className = '';
        
        if (intensity <= 3) {
            message = "You're feeling relatively calm - this is a great mindset for reflection and growth.";
            className = 'feedback-low';
        } else if (intensity <= 6) {
            message = "You're feeling moderately intense emotions - this is a good place to start working through them.";
            className = 'feedback-medium';
        } else if (intensity <= 8) {
            message = "You're experiencing strong emotions - let's work together to find some relief and perspective.";
            className = 'feedback-high';
        } else {
            message = "You're feeling overwhelmed right now - we'll start with some calming techniques to help you feel more grounded.";
            className = 'feedback-high';
        }
        
        intensityFeedback.textContent = message;
        intensityFeedback.className = `feedback-text ${className}`;
    }

    // Continue from readiness to topic selection
    document.getElementById('btn-continue-readiness').addEventListener('click', () => {
        const intensity = parseInt(intensitySlider.value);
        sessionManager.updateState('intensity', intensity);
        
        // If intensity is 7+ (high), we'll route to ACT defusion later in the flow
        // For now, continue to topic selection
        loadTopics();
        goTo('screen-topic');
    });

    // Screen 3: Topic buttons - load from ContentSearchService
    async function loadTopics() {
        try {
            const categories = await contentSearchService.getCategories();
            
            let finalCategories = categories;
            if (categories.length === 0) {
                console.warn('No categories found, falling back to static data');
                // Fallback to static data if no categories found
                if (!topicsData) {
                    console.error('Topics data not loaded');
                    return;
                }
                finalCategories = topicsData.topics;
            }
            
            const topicButtons = document.getElementById('topic-buttons');
            topicButtons.innerHTML = '';
            
            finalCategories.forEach((topicName, index) => {
                const button = document.createElement('button');
                button.className = `btn-primary topic-button topic-${topicName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                
                // Use static data for icons and descriptions if available, otherwise use defaults
                const icon = topicsData?.topicIcons?.[topicName] || getDefaultIcon(topicName);
                const description = topicsData?.topicDescriptions?.[topicName] || `Work on ${topicName.toLowerCase()} related concerns`;
                
                button.innerHTML = `
                    <span class="topic-icon">${icon}</span>
                    <span class="topic-name">${topicName}</span>
                    <span class="topic-description">${description}</span>
                `;
                button.addEventListener('click', () => selectTopic(topicName));
                
                // Add staggered animation delay
                button.style.animationDelay = `${index * 0.1}s`;
                
                topicButtons.appendChild(button);
            });
        } catch (error) {
            console.error('Error loading topics from ContentSearchService:', error);
            // Fallback to static data
            if (topicsData) {
                topicsData.topics.forEach((topicName, index) => {
                    const button = document.createElement('button');
                    button.className = `btn-primary topic-button topic-${topicName.toLowerCase().replace('-', '')}`;
                    button.innerHTML = `
                        <span class="topic-icon">${topicsData.topicIcons[topicName]}</span>
                        <span class="topic-name">${topicName}</span>
                        <span class="topic-description">${topicsData.topicDescriptions[topicName]}</span>
                    `;
                    button.addEventListener('click', () => selectTopic(topicName));
                    button.style.animationDelay = `${index * 0.1}s`;
                    document.getElementById('topic-buttons').appendChild(button);
                });
            }
        }
    }

    // Helper function to get default icons for categories
    function getDefaultIcon(category) {
        const iconMap = {
            'Money': '💰',
            'Relationships': '💕',
            'Self-Image': '🪞',
            'Romance': '💕'
        };
        return iconMap[category] || '🔹';
    }

    async function selectTopic(topic) {
        sessionManager.updateState('selectedTopic', topic);
        
        try {
            // Load subcategories from ContentSearchService
            const subcategories = await contentSearchService.getSubcategories(topic);
            
            // If subcategories exist, we could show them as an intermediate step
            // For now, we'll store them in session state for potential future use
            if (subcategories.length > 0) {
                sessionManager.updateState('availableSubcategories', subcategories);
            }
        } catch (error) {
            console.error('Error loading subcategories:', error);
        }
        
        // Continue with existing emotion selection logic
        if (!emotionsData) {
            console.error('Emotions data not loaded');
            return;
        }
        
        const emotionButtons = document.getElementById('emotion-buttons');
        emotionButtons.innerHTML = '';
        
        const emotions = emotionsData[topic]?.palette || ['anxious', 'overwhelmed', 'frustrated', 'sad', 'angry'];
        emotions.forEach((emotion, index) => {
            const button = document.createElement('button');
            button.className = `btn-primary emotion-button emotion-${emotion}`;
            button.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            
            // Add tooltip with emotion description if available
            const description = emotionsData[topic]?.descriptions?.[emotion];
            if (description) {
                button.title = description;
            }
            
            button.addEventListener('click', () => selectEmotion(emotion));
            
            // Add staggered animation delay
            button.style.animationDelay = `${index * 0.1}s`;
            
            emotionButtons.appendChild(button);
        });
        
        goTo('screen-emotion');
    }

    // New function to reveal subcategories (for future use)
    async function revealSubTopics(category) {
        try {
            const subcategories = await contentSearchService.getSubcategories(category);
            
            // This could be used to create a SubTopicReveal component
            // For now, we'll just log the subcategories
            console.log(`Subcategories for ${category}:`, subcategories);
            
            return subcategories;
        } catch (error) {
            console.error('Error revealing subtopics:', error);
            return [];
        }
    }

    // New function to get replacement thoughts list (ReplacementThoughtList functionality)
    async function getReplacementThoughtsList(category, subcategory = null, intensity = 10) {
        try {
            const replacementThoughts = await contentSearchService.getReplacementThoughts(
                category, 
                subcategory, 
                intensity
            );
            
            console.log(`Replacement thoughts for ${category}${subcategory ? ` > ${subcategory}` : ''}:`, replacementThoughts);
            
            return replacementThoughts;
        } catch (error) {
            console.error('Error getting replacement thoughts:', error);
            return [];
        }
    }

    // Screen 4: Emotion selection
    function selectEmotion(emotion) {
        sessionManager.updateState('selectedEmotion', emotion);
        goTo('screen-starting-text');
    }

    // Screen 5: Start Journey - Text input is now mandatory
    document.getElementById('btn-begin-journey').addEventListener('click', async () => {
        const textInput = document.getElementById('starting-textarea').value.trim();
        
        // Validate that text input is provided
        if (!textInput) {
            // Show validation message
            const textarea = document.getElementById('starting-textarea');
            textarea.style.borderColor = '#e74c3c';
            textarea.placeholder = 'Please share what\'s on your mind to continue...';
            textarea.focus();
            return;
        }
        
        // Reset any validation styling
        document.getElementById('starting-textarea').style.borderColor = '';
        
        // Store user input in session manager
        sessionManager.updateState('userText', textInput);
        sessionManager.updateState('alternativeAngleClicks', 0);
        
        try {
            // Build therapeutic journey using PsychologicalEngine
            const userState = sessionManager.getCurrentState();
            const journeySequence = await psychologicalEngine.buildJourneySequence(userState);
            
            // Check if this should route to ACT defusion
            const technique = sessionManager.getState('currentTechnique');
            if (technique === 'act') {
                const actExercise = contentManager.getACTDefusionExercise(userState.selectedTopic);
                document.getElementById('act-prompt').textContent = actExercise.instructions;
                goTo('screen-act-defusion');
                return;
            }
            
            // Start the therapeutic journey
            const firstPrompt = psychologicalEngine.getNextPrompt('continue');
            document.getElementById('journey-prompt').textContent = firstPrompt.content;
            
            // Initialize progress dots for journey
            updateProgressDots(firstPrompt.step, firstPrompt.totalSteps);
            goTo('screen-journey');
            
        } catch (error) {
            console.error('Error starting therapeutic journey:', error);
            // Fallback to simple prompt
            document.getElementById('journey-prompt').textContent = "Let's work through this together. Take a moment to notice that having difficult thoughts shows you care deeply about this area of your life.";
            updateProgressDots(1, 5);
            goTo('screen-journey');
        }
    });

    // Screen 6: Journey buttons with PsychologicalEngine integration
    document.getElementById('btn-feels-better').addEventListener('click', () => {
        try {
            // Use PsychologicalEngine to get next prompt
            const nextPrompt = psychologicalEngine.getNextPrompt('continue');
            
            if (nextPrompt.isComplete) {
                // Journey complete
                animateProgressCompletion();
                setTimeout(() => {
                    showCompletion(nextPrompt.content);
                }, 800);
            } else if (nextPrompt.requiresACTFlow) {
                // Route to ACT defusion
                document.getElementById('act-prompt').textContent = nextPrompt.content;
                goTo('screen-act-defusion');
            } else {
                // Continue journey with next therapeutic prompt
                document.getElementById('journey-prompt').textContent = nextPrompt.content;
                updateProgressDots(nextPrompt.step, nextPrompt.totalSteps);
            }
        } catch (error) {
            console.error('Error getting next prompt:', error);
            // Fallback behavior
            showCompletion("You've successfully worked through your thoughts and found a new perspective.");
        }
    });

    document.getElementById('btn-try-another').addEventListener('click', () => {
        try {
            // Use PsychologicalEngine to get alternative prompt
            const alternativePrompt = psychologicalEngine.getNextPrompt('try-another');
            
            if (alternativePrompt.requiresACTFlow) {
                // Route to ACT defusion after multiple attempts
                document.getElementById('act-prompt').textContent = alternativePrompt.content;
                goTo('screen-act-defusion');
            } else {
                // Show alternative prompt for current step
                document.getElementById('journey-prompt').textContent = alternativePrompt.content;
                // Don't update progress dots for alternative prompts
            }
        } catch (error) {
            console.error('Error getting alternative prompt:', error);
            // Fallback behavior
            document.getElementById('journey-prompt').textContent = "Let's try a different perspective. Your willingness to explore new ways of thinking shows real strength and openness to growth.";
        }
    });

    // Screen 7: ACT defusion continue
    document.getElementById('btn-act-continue').addEventListener('click', () => {
        showCompletion("You've taken a mindful approach to your thoughts and created space for new perspectives.");
    });

    // Screen 8: Completion
    function showCompletion(reliefSummary) {
        document.getElementById('completion-summary').textContent = reliefSummary;
        document.getElementById('completion-animation').classList.add('pulse');
        
        // Generate emotional shift summary based on session data
        const topic = sessionManager.getState('selectedTopic');
        const emotion = sessionManager.getState('selectedEmotion');
        const intensity = sessionManager.getState('intensity');
        
        const emotionalShiftText = generateEmotionalShiftSummary(topic, emotion, intensity);
        document.getElementById('emotional-shift-summary').textContent = emotionalShiftText;
        
        goTo('screen-completion');
        
        // Show anonymous feedback survey if appropriate
        setTimeout(() => {
            if (feedbackManager.shouldShowFeedback()) {
                const completionContainer = document.querySelector('#screen-completion .container');
                feedbackManager.showFeedbackSurvey(completionContainer);
            }
        }, 1500); // Show feedback after user has time to read completion message
    }

    function generateEmotionalShiftSummary(topic, emotion, intensity) {
        const topicLower = topic?.toLowerCase() || 'this area';
        const emotionText = emotion ? `feeling ${emotion}` : 'these difficult emotions';
        
        if (intensity >= 7) {
            return `You started feeling overwhelmed about ${topicLower}, and through mindful awareness, you've created space between yourself and those intense thoughts.`;
        } else if (intensity >= 4) {
            return `You began ${emotionText} about ${topicLower}, and you've worked through those feelings to find a more balanced perspective.`;
        } else {
            return `Even though you started in a relatively calm state, you've deepened your understanding of ${topicLower} and strengthened your emotional resilience.`;
        }
    }

    document.getElementById('set-reminder-link').addEventListener('click', (e) => {
        e.preventDefault();
        goTo('screen-calendar');
    });

    document.getElementById('btn-start-over').addEventListener('click', () => {
        // Clear session data and start fresh
        sessionManager.clearSession();
        sessionManager.initializeSession();
        
        // Reset UI elements
        document.getElementById('starting-textarea').value = '';
        document.getElementById('starting-textarea').style.borderColor = '';
        document.getElementById('intensity-slider').value = 5;
        document.getElementById('intensity-value').textContent = '5';
        updateIntensityFeedback(5);
        
        // Reset progress dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.classList.remove('filled', 'completed', 'dot-animate', 'completion-pulse');
        });
        
        // Reset current step
        currentStep = 1;
        
        goTo('screen-landing');
    });

    // Screen 9: Calendar - Privacy-first calendar integration
    document.getElementById('btn-daily').addEventListener('click', async () => {
        try {
            await calendarGenerator.generateICSFile('daily');
            showCalendarSuccess('Daily reminders have been added to your calendar!');
        } catch (error) {
            const errorResponse = errorHandler.handleCalendarError(error, 'daily');
            showCalendarError(errorResponse.userMessage);
        }
    });

    document.getElementById('btn-weekly').addEventListener('click', async () => {
        try {
            await calendarGenerator.generateICSFile('weekly');
            showCalendarSuccess('Weekly reminders have been added to your calendar!');
        } catch (error) {
            const errorResponse = errorHandler.handleCalendarError(error, 'weekly');
            showCalendarError(errorResponse.userMessage);
        }
    });

    document.getElementById('btn-no-thanks').addEventListener('click', () => {
        goTo('screen-landing');
    });

    // Calendar feedback functions
    function showCalendarSuccess(message) {
        const calendarContainer = document.querySelector('#screen-calendar .container');
        const successMessage = document.createElement('div');
        successMessage.className = 'calendar-success';
        successMessage.innerHTML = `
            <div class="success-icon">✅</div>
            <p>${message}</p>
            <small>The calendar file has been downloaded. Import it into your preferred calendar app.</small>
        `;
        
        // Insert success message before buttons
        const buttonGroup = calendarContainer.querySelector('.button-group');
        calendarContainer.insertBefore(successMessage, buttonGroup);
        
        // Auto-redirect after showing success
        setTimeout(() => {
            goTo('screen-landing');
        }, 3000);
    }

    function showCalendarError(message) {
        const calendarContainer = document.querySelector('#screen-calendar .container');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'calendar-error';
        errorMessage.innerHTML = `
            <div class="error-icon">⚠️</div>
            <p>${message}</p>
        `;
        
        // Insert error message before buttons
        const buttonGroup = calendarContainer.querySelector('.button-group');
        calendarContainer.insertBefore(errorMessage, buttonGroup);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 5000);
    }

    // Enhanced Progress indicator system (from existing script.js)
    function updateProgressDots(currentStep, totalSteps = 6) {
        const dots = document.querySelectorAll('.dot');
        
        // Ensure we have the right number of dots for the journey
        const progressContainer = document.querySelector('.progress-dots');
        if (progressContainer && dots.length !== totalSteps) {
            progressContainer.innerHTML = '';
            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Step ${i + 1} of ${totalSteps}`);
                progressContainer.appendChild(dot);
            }
        }
        
        // Update dots with smooth animations
        const updatedDots = document.querySelectorAll('.dot');
        updatedDots.forEach((dot, index) => {
            const shouldBeFilled = index < currentStep;
            const isCurrentlyFilled = dot.classList.contains('filled');
            
            if (shouldBeFilled && !isCurrentlyFilled) {
                // Add filled class with animation delay
                setTimeout(() => {
                    dot.classList.add('filled');
                    dot.classList.add('dot-animate');
                    
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        dot.classList.remove('dot-animate');
                    }, 300);
                }, index * 100); // Stagger the animation
            } else if (!shouldBeFilled && isCurrentlyFilled) {
                dot.classList.remove('filled');
            }
            
            // Update accessibility
            if (shouldBeFilled) {
                dot.setAttribute('aria-label', `Step ${index + 1} completed`);
            } else if (index === currentStep - 1) {
                dot.setAttribute('aria-label', `Current step ${index + 1} of ${totalSteps}`);
            } else {
                dot.setAttribute('aria-label', `Step ${index + 1} of ${totalSteps}`);
            }
        });
        
        // Update progress percentage for screen readers
        const progressPercentage = Math.round((currentStep / totalSteps) * 100);
        const journeyHeader = document.querySelector('.journey-header h2');
        if (journeyHeader) {
            journeyHeader.setAttribute('aria-label', `Your Journey - ${progressPercentage}% complete, step ${currentStep} of ${totalSteps}`);
        }
    }

    // Progress completion animation
    function animateProgressCompletion() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            setTimeout(() => {
                dot.classList.add('completed');
                dot.classList.add('completion-pulse');
                
                setTimeout(() => {
                    dot.classList.remove('completion-pulse');
                }, 600);
            }, index * 150);
        });
        
        // Add completion glow effect
        const progressContainer = document.querySelector('.progress-dots');
        if (progressContainer) {
            progressContainer.classList.add('journey-complete');
            
            setTimeout(() => {
                progressContainer.classList.remove('journey-complete');
            }, 2000);
        }
    }

    // Allow submitting with Enter key in textarea (but not Shift+Enter for new lines)
    const userInput = document.getElementById('starting-textarea');
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents adding a new line
            document.getElementById('btn-begin-journey').click();
        }
    });
});

} // End of initializeLegacyApp function