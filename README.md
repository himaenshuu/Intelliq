# AI Quiz Solver

A web application that uses AI to solve quiz questions from various input sources including text, PDF files, and images.

## Features

- Process text questions directly
- Upload and process PDF files
- Upload and process images
- Modern, responsive UI
- Real-time processing with loading indicators
- Error handling and user feedback

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google API key for Gemini AI

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-quiz-solver
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with your Google API key:
```
GOOGLE_API_KEY=your_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
npm run client
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Text Input**:
   - Select the "Text" tab
   - Enter your question in the text area
   - Click "Get Answer"

2. **PDF Input**:
   - Select the "PDF" tab
   - Drag and drop a PDF file or click to select
   - The AI will process the PDF and provide an answer

3. **Image Input**:
   - Select the "Image" tab
   - Drag and drop an image file or click to select
   - The AI will analyze the image and provide an answer

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - React Dropzone
  - Axios

- Backend:
  - Node.js
  - Express
  - Multer
  - PDF-parse
  - Google Generative AI

## License

MIT 

## Flowchart

quizcrack/
├── client/                      # React Frontend
│   ├── public/                  # Static files
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/                     # Source files
│   │   ├── App.js               # Main application component
│   │   ├── App.css              # Main styles
│   │   ├── index.js             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json             # Frontend dependencies
│   └── README.md                # Frontend documentation
│
├── server/                      # Node.js Backend
│   ├── server.js                # Main server file
│   ├── start.js                 # Application starter
│   ├── package.json             # Backend dependencies
│   ├── .env                     # Development environment variables
│   ├── .env.production          # Production environment variables
│   └── README.md                # Backend documentation
│
├── .gitignore                   # Git ignore file
├── package.json                 # Root package.json
└── README.md                    # Project documentation