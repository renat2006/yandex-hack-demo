import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import Planet from './Planet';
import Modal from './Modal';
import UserProgress from "./UserProgress.jsx";

const fitCameraToObject = (camera, object, offset = 1.25) => {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= offset;

    return { cameraZ, center };
};

const animateCamera = (camera, controlsRef, newPosition, newTarget, onComplete) => {
    const timeline = gsap.timeline({
        onComplete: onComplete,
    });

    timeline.to(camera.position, {
        duration: 2,
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current?.update(),
    });

    timeline.to(
        controlsRef.current.target,
        {
            duration: 2,
            x: newTarget.x,
            y: newTarget.y,
            z: newTarget.z,
            ease: 'power3.inOut',
            onUpdate: () => controlsRef.current?.update(),
        },
        '<'
    );

    return timeline;
};

const Scene = () => {
    const [planetModels] = useState([
        {
            modelPath: '/models/planets1.glb',
            scale: 1,
            position: [-2, 0, 0],
            rotationSpeed: 0.01,
            meshRef: React.createRef(),
            name: 'Frontend',
            dailyTask: {
                question: "Исправьте код CSS так, чтобы кнопка стала красной.",
                initialCode: `button { color: blue; }`,
                correctCode: `button { color: red; }`,
                checkAnswer: (userCode, correctCode) =>
                    userCode.trim() === correctCode.trim(),
            },
        },
        {
            modelPath: '/models/planets2.glb',
            scale: 1,
            position: [5, 2, -5],
            rotationSpeed: 0.02,
            meshRef: React.createRef(),
            name: 'Backend',
            dailyTask: {
                question:
                    "Напишите SQL-запрос для получения всех пользователей старше 18 лет.",
                initialCode:
                    `SELECT * FROM users WHERE age > ?;`,
                correctCode:
                    `SELECT * FROM users WHERE age > 18;`,
                checkAnswer: (userCode, correctCode) =>
                    userCode.trim() === correctCode.trim(),
            },
        },
        {
            modelPath: '/models/planets3.glb',
            scale: 1,
            position: [-6, -3, -4],
            rotationSpeed: 0.01,
            meshRef: React.createRef(),
            name: 'Machine Learning',
            dailyTask: {
                question:
                    "Напишите функцию Python для нормализации массива данных.",
                initialCode:
                    `def normalize(data):\n pass`,
                correctCode:
                    `def normalize(data):\n return [(x - min(data)) / (max(data) - min(data)) for x in data]`,
                checkAnswer: (userCode, correctCode) =>
                    userCode.trim() === correctCode.trim(),
            },
        },
    ]);

    const [targetPlanet, setTargetPlanet] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [controlsEnabled, setControlsEnabled] = useState(true);
    const animationTimeline = useRef(null);

// Флаг для предотвращения повторной анимации
    const isAnimating = useRef(false);

    const animateCameraToPlanet = (planet) => {
        if (isAnimating.current || isModalOpen) return; // Предотвращение повторной анимации
        isAnimating.current = true;

        if (animationTimeline.current) animationTimeline.current.kill(); // Остановить предыдущую анимацию

        setTargetPlanet(planet);
        setControlsEnabled(false);
    };

    const handleZoomComplete = () => {
        isAnimating.current = false; // Сброс флага анимации
        setIsModalOpen(true); // Открыть модальное окно
        animationTimeline.current.kill(); // Остановить анимацию после завершения
        animationTimeline.current = null; // Сбросить ссылку на анимацию
    };
    const [progress, setProgress] = useState(35); // Прогресс пользователя (в процентах)

    const levels = [
        'Junior Developer',
        'Middle Developer',
        'Senior Developer',
        'Tech Lead',
        'Architect',
        'CTO',
        'Galactic IT Master',
    ];

    const handleAddProgress = () => {
        setProgress((prev) => Math.min(prev + 10, 100)); // Увеличение прогресса
    };
    const closeModal = () => {
        setIsModalOpen(false); // Закрыть модальное окно
        setControlsEnabled(true); // Включить управление камерой
    };

    const CameraAnimator = ({ targetPlanet }) => {
        const { camera } = useThree();
        const controlsRef = useRef();

        useEffect(() => {
            if (!targetPlanet || !targetPlanet.meshRef?.current || isModalOpen) return;

            const targetPlanetMesh = targetPlanet.meshRef.current;
            const { cameraZ, center } = fitCameraToObject(camera, targetPlanetMesh);

            const aspectRatio = window.innerWidth / window.innerHeight;
            const horizontalOffset = aspectRatio * 0.5;

            const newPosition = new THREE.Vector3(
                center.x + horizontalOffset,
                center.y,
                center.z + cameraZ
            );

            animationTimeline.current = animateCamera(
                camera,
                controlsRef,
                newPosition,
                center,
                handleZoomComplete
            );
        }, [targetPlanet]);

        return <OrbitControls ref={controlsRef} enabled={controlsEnabled} />;
    };

    return (
        <>
            <Canvas camera={{position: [0, 5, 10], fov: 50}} style={{backgroundColor: 'black'}}>
                <ambientLight intensity={0.7}/>
                <directionalLight position={[10, 10, 5]} intensity={1}/>

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade/>

                {planetModels.map((planet) => (
                    <Planet
                        key={planet.name}
                        modelPath={planet.modelPath}
                        scale={planet.scale}
                        position={planet.position}
                        rotationSpeed={planet.rotationSpeed}
                        ref={planet.meshRef}
                        onClick={() => animateCameraToPlanet(planet)}
                    />
                ))}

                <CameraAnimator targetPlanet={targetPlanet}/>
            </Canvas>
            <div style={{textAlign: 'center', paddingTop: '50px'}}>
                <UserProgress progress={progress} levels={levels}/>
                <button
                    onClick={handleAddProgress}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#00ff00',
                        color: '#000',
                        cursor: 'pointer',
                    }}
                >
                    Добавить прогресс
                </button>
            </div>
            {targetPlanet && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={`Задача на планете ${targetPlanet.name}`}
                    task={targetPlanet.dailyTask}
                />
            )}
        </>
    );
};

export default Scene;