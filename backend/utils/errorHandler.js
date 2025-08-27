function handleError(res, error, context) {
    console.error(`Error in ${context}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
    });

    // Determine appropriate status code
    let statusCode = 500;
    let userMessage = 'An unexpected error occurred. Please try again.';

    if (error.statusCode) {
        statusCode = error.statusCode;
    } else if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        userMessage = 'File size exceeds the maximum limit of 5MB.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        userMessage = 'Invalid file format. Please upload a PDF or image file.';
    } else if (error.message.includes('Invalid file type')) {
        statusCode = 400;
        userMessage = 'Invalid file type. Only PDF and image files are allowed.';
    } else if (error.message.includes('No file uploaded')) {
        statusCode = 400;
        userMessage = 'No file was uploaded. Please select a file to process.';
    }

    res.status(statusCode).json({
        error: userMessage,
        context: context
    });
}

export {
    handleError
}; 