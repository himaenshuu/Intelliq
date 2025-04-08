function handleError(res, error, context) {
    console.error(`Error in ${context}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
    });

    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        error: `Error in ${context}. Please try again.`,
        details: errorMessage
    });
}

module.exports = {
    handleError
}; 