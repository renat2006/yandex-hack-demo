import React, { useEffect, useRef } from 'react';
import './UserProgress.css';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid'; // Импорт иконок из Heroicons v2
import gsap from 'gsap';
import { Tooltip } from 'react-tippy'; // Импорт Tooltip из React Tippy
import 'react-tippy/dist/tippy.css'; // Стили для Tippy

const UserProgress = ({ xp, levels, lockCondition }) => {
    console.log(levels)
    const progressBarRef = useRef(null);
    const levelRefs = useRef([]);

    // Находим текущий уровень
    const currentLevelIndex = levels.findIndex((level, index) =>
        xp >= level.requiredXp &&
        (index === levels.length - 1 || xp < levels[index + 1].requiredXp)
    );

    const currentLevel = levels[currentLevelIndex];
    console.log(currentLevel)
    const nextLevel = levels[currentLevelIndex + 1];

    // Рассчитываем прогресс до следующего уровня
    const progress = nextLevel
        ? ((xp - currentLevel.requiredXp) / (nextLevel.requiredXp - currentLevel.requiredXp)) * 100
        : 100;

    useEffect(() => {
        // Анимация заполнения прогресс-бара
        gsap.to(progressBarRef.current, {
            width: `${progress}%`,
            duration: 1,
            ease: 'power3.out',
        });

        // Анимация появления уровней
        levelRefs.current.forEach((ref, index) => {
            if (ref) {
                gsap.fromTo(
                    ref,
                    { autoAlpha: 0, y: 20 },
                    { autoAlpha: 1, y: 0, delay: index * 0.2, duration: 0.5, ease: 'power3.out' }
                );
            }
        });
    }, [xp, progress]);

    return (
        <div className="user-progress">
            <div className="progress-header">
                <h3>Ваш прогресс на треке Backend</h3>
                <p>
                    Уровень: <span className="current-level">{currentLevel.name}</span>
                </p>
                <p>
                    XP: <span className="current-xp">{xp}</span>
                </p>
            </div>

            {/* Линия прогресса */}
            <div className="progress-bar-container">
                <div className="progress-bar">
                    <div ref={progressBarRef} className="progress-bar-fill"></div>
                </div>

                {/* Уровни */}
                <div className="marker-container">
                    {levels.map((level, index) => (
                        <div
                            key={level.name}
                            ref={(el) => (levelRefs.current[index] = el)}
                            className={`progress-marker ${
                                index <= currentLevelIndex ? 'achieved' : ''
                            }`}
                            style={{ left: `${(level.requiredXp / levels[levels.length - 1].requiredXp) * 100}%` }}
                        >
                            {/* Иконки вместо галочек */}
                            <Tooltip
                                title={index === 4 ? lockCondition : ''}
                                position="bottom"
                                trigger="mouseenter"
                                arrow={true}
                                disabled={index !== 4} // Поповер только для замка
                                interactive={true}
                            >
                                <div className="marker-circle">
                                    {index === 4 ? (
                                        <LockClosedIcon className="icon lock-icon" />
                                    ) : index <= currentLevelIndex ? (
                                        <CheckCircleIcon className="icon achieved-icon" />
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </Tooltip>
                            <span className="marker-label">{level.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Информация о следующем уровне */}
            {nextLevel && (
                <p className="next-level-info">
                    До следующего уровня (<span>{nextLevel.name}</span>) осталось{' '}
                    {nextLevel.requiredXp - xp} XP!
                </p>
            )}
        </div>
    );
};

export default UserProgress;