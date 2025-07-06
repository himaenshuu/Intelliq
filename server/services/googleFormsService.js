import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleFormsService {
    constructor() {
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    async verifyEmailAccess(formUrl, userEmail) {
        try {
            // Extract form ID from URL
            const formId = this.extractFormId(formUrl);
            if (!formId) {
                throw new Error('Invalid Google Form URL');
            }

            // Get form details
            const forms = google.forms({ version: 'v1', auth: this.oauth2Client });
            const form = await forms.forms.get({ formId });

            // Check if form is restricted
            if (form.data.settings && form.data.settings.access) {
                const allowedEmails = form.data.settings.access.allowedEmails || [];
                if (!allowedEmails.includes(userEmail)) {
                    throw new Error('You do not have access to this form');
                }
            }

            return {
                hasAccess: true,
                formId,
                formTitle: form.data.info.title
            };
        } catch (error) {
            console.error('Error verifying form access:', error);
            throw error;
        }
    }

    async getFormResponses(formId, userEmail) {
        try {
            const forms = google.forms({ version: 'v1', auth: this.oauth2Client });
            const responses = await forms.forms.responses.list({
                formId,
                filter: `respondentEmail = "${userEmail}"`
            });

            return responses.data.responses || [];
        } catch (error) {
            console.error('Error getting form responses:', error);
            throw error;
        }
    }

    extractFormId(url) {
        try {
            const urlObj = new URL(url);
            // Handle different Google Forms URL formats
            if (urlObj.hostname.includes('google.com')) {
                if (urlObj.pathname.includes('/forms/d/')) {
                    return urlObj.pathname.split('/forms/d/')[1].split('/')[0];
                } else if (urlObj.pathname.includes('/forms/')) {
                    return urlObj.pathname.split('/forms/')[1].split('/')[0];
                }
            }
            return null;
        } catch (error) {
            console.error('Error extracting form ID:', error);
            return null;
        }
    }
}

export default new GoogleFormsService(); 