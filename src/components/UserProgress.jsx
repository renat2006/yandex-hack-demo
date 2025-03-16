import React from 'react';
import './UserProgress.css';

const UserProgress = ({ progress, levels }) => {
    const currentLevelIndex = Math.min(
        Math.floor(progress / (100 / levels.length)),
        levels.length - 1
    );

    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1] || 'Max Level';

    return (
        <div className="user-progress">
            <div className="progress-header">
                <h2>Прогресс пользователя</h2>
                <p>
                    Уровень: <span className="current-level">{currentLevel}</span>
                </p>
            </div>

            {/* Вертикальный индикатор прогресса */}
            <div className="progress-bar-container">
                {levels.map((level, index) => (
                    <div
                        key={index}
                        className={`progress-step ${
                            index <= currentLevelIndex ? 'step-achieved' : ''
                        }`}
                    >
                        <div className="step-circle">
                            {index <= currentLevelIndex ? '✔' : ''}
                        </div>
                        <p className="step-label">{level}</p>
                    </div>
                ))}
                <div
                    className="progress-line"
                    style={{
                        height: `${(progress / 100) * 100}%`,
                    }}
                ></div>
            </div>

            {/* Информация о следующем уровне */}
            {nextLevel !== 'Max Level' && (
                <p className="next-level-info">
                    До следующего уровня (<span>{nextLevel}</span>) осталось{' '}
                    {Math.max(
                        0,
                        Math.ceil((currentLevelIndex + 1) * (100 / levels.length) - progress)
                    )}
                    %!
                </p>
            )}
        </div>
    );
};

export default UserProgress;
