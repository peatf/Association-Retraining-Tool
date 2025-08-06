// CalendarGenerator.js
// Privacy-first calendar integration that creates .ics files entirely client-side
// No server interaction - all calendar generation happens in the browser

class CalendarGenerator {
    constructor() {
        this.reminderMessages = {
            daily: "Take 3 minutes for emotional wellness",
            weekly: "Weekly check-in: How are you feeling?",
            default: "Mindful moment: Notice your thoughts and feelings"
        };
    }

    /**
     * Generates a downloadable .ICS calendar file with reminders
     * @param {string} frequency - 'daily' or 'weekly'
     * @returns {void} - Triggers file download
     */
    generateICSFile(frequency) {
        try {
            const icsContent = this.createICSContent(frequency);
            this.triggerDownload(icsContent, frequency);
        } catch (error) {
            console.error('Error generating calendar file:', error);
            throw new Error('Failed to generate calendar reminder');
        }
    }

    /**
     * Creates the ICS file content with appropriate recurrence rules
     * @param {string} frequency - 'daily' or 'weekly'
     * @returns {string} - ICS file content
     */
    createICSContent(frequency) {
        const now = new Date();
        const startDate = new Date(now);
        
        // Set reminder for tomorrow at 9 AM to give user time to prepare
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(9, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 15); // 15-minute reminder
        
        // Format dates for ICS (YYYYMMDDTHHMMSSZ)
        const formatICSDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };
        
        const dtStart = formatICSDate(startDate);
        const dtEnd = formatICSDate(endDate);
        const dtStamp = formatICSDate(now);
        
        // Generate unique UID for the event
        const uid = `therapeutic-reminder-${Date.now()}@association-retraining-tool`;
        
        // Set recurrence rule based on frequency
        const recurrenceRule = frequency === 'daily' ? 'RRULE:FREQ=DAILY' : 'RRULE:FREQ=WEEKLY';
        
        // Get appropriate reminder message
        const summary = this.formatReminderContent(frequency);
        const description = this.generateReminderDescription(frequency);
        
        // Build ICS content following RFC 5545 standard
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Association Retraining Tool//Therapeutic Reminders//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `DTSTAMP:${dtStamp}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            recurrenceRule,
            'CATEGORIES:Personal,Wellness,Mental Health',
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'BEGIN:VALARM',
            'TRIGGER:-PT5M', // 5 minutes before
            'ACTION:DISPLAY',
            `DESCRIPTION:${summary}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
        
        return icsContent;
    }

    /**
     * Formats the reminder content based on frequency
     * @param {string} frequency - 'daily' or 'weekly'
     * @returns {string} - Formatted reminder text
     */
    formatReminderContent(frequency) {
        return this.reminderMessages[frequency] || this.reminderMessages.default;
    }

    /**
     * Generates a detailed description for the calendar event
     * @param {string} frequency - 'daily' or 'weekly'
     * @returns {string} - Event description
     */
    generateReminderDescription(frequency) {
        const baseDescription = "A gentle reminder to check in with your emotional wellness. Take a few minutes to notice your thoughts and feelings without judgment.";
        
        if (frequency === 'daily') {
            return `${baseDescription}\\n\\nDaily practice suggestions:\\n• Notice one thought without judging it\\n• Take three mindful breaths\\n• Ask yourself: "How am I feeling right now?"`;
        } else {
            return `${baseDescription}\\n\\nWeekly reflection suggestions:\\n• Review your emotional patterns from the week\\n• Identify one area of growth or insight\\n• Set an intention for emotional wellness`;
        }
    }

    /**
     * Triggers the download of the ICS file
     * @param {string} icsContent - The ICS file content
     * @param {string} frequency - 'daily' or 'weekly' for filename
     */
    triggerDownload(icsContent, frequency) {
        try {
            // Create blob with proper MIME type for calendar files
            const blob = new Blob([icsContent], { 
                type: 'text/calendar;charset=utf-8' 
            });
            
            // Create download URL
            const url = window.URL.createObjectURL(blob);
            
            // Create temporary download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `therapeutic-reminders-${frequency}.ics`;
            downloadLink.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Cleanup
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(url);
            
            console.log(`Calendar file generated successfully: ${frequency} reminders`);
        } catch (error) {
            console.error('Error triggering calendar download:', error);
            throw new Error('Failed to download calendar file');
        }
    }

    /**
     * Validates the frequency parameter
     * @param {string} frequency - The frequency to validate
     * @returns {boolean} - Whether the frequency is valid
     */
    isValidFrequency(frequency) {
        return ['daily', 'weekly'].includes(frequency);
    }

    /**
     * Gets available reminder frequencies
     * @returns {Array<string>} - Array of valid frequencies
     */
    getAvailableFrequencies() {
        return ['daily', 'weekly'];
    }
}

export default CalendarGenerator;