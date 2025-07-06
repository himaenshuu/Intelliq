class ResponseHandler {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = 'Error', statusCode = 400, error = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: error ? error.message : null
        });
    }

    static formatAnswer(answer) {
        // Check if it's a quiz answer format
        if (answer.includes('*') && answer.includes('**')) {
            return this.formatQuizAnswer(answer);
        }

        // Format tables
        if (answer.includes('|')) {
            const lines = answer.split('\n');
            const tableRows = lines.filter(line => line.includes('|'));
            if (tableRows.length > 0) {
                return {
                    type: 'table',
                    content: tableRows.map(row =>
                        row.split('|')
                            .map(cell => cell.trim())
                            .filter(cell => cell)
                    )
                };
            }
        }

        // Format lists
        if (answer.includes('-') || answer.includes('*')) {
            const items = answer.split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
                .map(item => item.replace(/^[-*]\s*/, '').trim());

            if (items.length > 0) {
                return {
                    type: 'list',
                    content: items
                };
            }
        }

        // Format paragraphs
        const paragraphs = answer.split('\n\n')
            .filter(para => para.trim())
            .map(para => para.trim());

        return {
            type: 'paragraph',
            content: paragraphs
        };
    }

    static formatQuizAnswer(answer) {
        // Split the answer into individual questions
        const questions = answer.split('\n\n')
            .filter(q => q.trim())
            .map(q => {
                // Remove stars and clean up the text
                const cleanText = q
                    .replace(/\*\*/g, '') // Remove double stars
                    .replace(/\*/g, '') // Remove single stars
                    .replace(/\n\s*\n/g, '\n') // Remove extra newlines
                    .trim();

                // Split into question and answer
                const [question, ...answerParts] = cleanText.split('\n');
                return {
                    question: question.trim(),
                    answer: answerParts.join('\n').trim()
                };
            });

        return {
            type: 'quiz',
            content: questions
        };
    }

    static formatError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return {
                message: error.response.data?.error || 'Server error',
                status: error.response.status
            };
        } else if (error.request) {
            // The request was made but no response was received
            return {
                message: 'No response from server',
                status: 503
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            return {
                message: error.message || 'Unknown error',
                status: 500
            };
        }
    }
}

export default ResponseHandler; 