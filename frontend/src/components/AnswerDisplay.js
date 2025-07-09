import React from 'react';
import '../styles/AnswerDisplay.css';

function AnswerDisplay({ answer }) {
    if (!answer) return null;

    const renderContent = () => {
        switch (answer.type) {
            case 'quiz':
                return (
                    <div className="quiz-answers">
                        {answer.content.map((item, index) => (
                            <div key={index} className="quiz-item">
                                <div className="quiz-question">{item.question}</div>
                                <div className="quiz-answer">{item.answer}</div>
                                {index < answer.content.length - 1 && <div className="quiz-separator" />}
                            </div>
                        ))}
                    </div>
                );

            case 'table':
                return (
                    <div className="table-container">
                        <table className="answer-table">
                            <tbody>
                                {answer.content.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'list':
                return (
                    <ul className="answer-list">
                        {answer.content.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                );

            case 'paragraph':
                return (
                    <div className="answer-paragraphs">
                        {answer.content.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                );

            default:
                return <p className="answer-text">{answer}</p>;
        }
    };

    return (
        <div className="answer-display">
            {renderContent()}
        </div>
    );
}

export default AnswerDisplay; 