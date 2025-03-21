import React, {useEffect, useState} from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import './Modal.css';

const Modal = ({ isOpen, onClose, onSuccess, title, task }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);

    const handleSubmit = () => {
        const isAnswerCorrect = task.checkAnswer(userAnswer.trim(), task.correctCode.trim());
        setIsCorrect(isAnswerCorrect);

        if (isAnswerCorrect) {
            onSuccess();
        }
    };
    useEffect(() => {
        if (isCorrect) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isCorrect]);


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


                    <div className="code-block">
                        <SyntaxHighlighter language="javascript" style={materialDark}>
                            {task.initialCode}
                        </SyntaxHighlighter>
                    </div>


                    <CodeMirror
                        value={userAnswer}
                        height="200px"
                        extensions={[javascript()]}
                        theme="dark"
                        onChange={(value) => setUserAnswer(value)}
                        placeholder="Введите ваш код здесь..."
                    />


                    <button onClick={handleSubmit} className="modal-action-btn">
                        Проверить
                    </button>


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
