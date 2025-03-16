import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, task }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);

    const handleSubmit = () => {
        const isAnswerCorrect = task.checkAnswer(userAnswer.trim(), task.correctCode.trim());
        setIsCorrect(isAnswerCorrect);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-content">
                    <p className="modal-question">{task.question}</p>

                    {/* Рендеринг начального кода с подсветкой */}
                    <div className="code-block">
                        <SyntaxHighlighter language="javascript" style={materialDark}>
                            {task.initialCode}
                        </SyntaxHighlighter>
                    </div>

                    {/* Редактор кода */}
                    <CodeMirror
                        value={userAnswer}
                        height="200px"
                        extensions={[javascript()]}
                        theme="dark"
                        onChange={(value) => setUserAnswer(value)}
                        placeholder="Введите ваш код здесь..."
                    />

                    {/* Кнопка проверки */}
                    <button onClick={handleSubmit} className="modal-action-btn">
                        Проверить
                    </button>

                    {/* Результат проверки */}
                    {isCorrect !== null && (
                        <p className="result-message" style={{ color: isCorrect ? 'green' : 'red' }}>
                            {isCorrect ? 'Ответ правильный!' : 'Ответ неправильный.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
