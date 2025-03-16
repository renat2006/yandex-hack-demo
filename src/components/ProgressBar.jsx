import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ level }) => {
    return (
        <div className="progress-bar">
            <p className="progress-level">Уровень IT-мастерства:</p>
            <h2 className="progress-title">{level}</h2>
        </div>
    );
};

export default ProgressBar;
