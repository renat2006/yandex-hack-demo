import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import Planet from './Planet';
import Modal from './Modal';
import UserProgress from "./UserProgress.jsx";
import {toast, ToastContainer} from "react-toastify";

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
        setTimeout(()=>{isAnimating.current = false;}, 5000)
    };
    const [progressVisible, setProgressVisible] = useState(false); // Состояние для отображения UserProgress
    const handleZoomComplete = () => {
        isAnimating.current = false; // Сброс флага анимации
        setIsModalOpen(true); // Открыть модальное окно
        animationTimeline.current.kill(); // Остановить анимацию после завершения
        animationTimeline.current = null; // Сбросить ссылку на анимацию

    };
    const [xp, setXp] = useState(200);
    const levels = [
        { name: 'Рядовой HTML', requiredXp: 0 },
        { name: 'Сержант CSS', requiredXp: 100 },
        { name: 'Капитан JavaScript', requiredXp: 300 },
        { name: 'Майор Frontend', requiredXp: 600 },
        { name: 'Полковник Fullstack', requiredXp: 1000 },
        { name: 'Генерал Архитектуры', requiredXp: 1500 },
    ];

    const currentLevelIndex = levels.findIndex((level, index) =>
        xp >= level.requiredXp &&
        (index === levels.length - 1 || xp < levels[index + 1].requiredXp)
    );

    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1];
    const progress = nextLevel
        ? ((xp - currentLevel.requiredXp) / (nextLevel.requiredXp - currentLevel.requiredXp)) * 100
        : 100;

    const handleSuccess = () => {
        setXp(prev => prev + 150); // Начисляем 150 XP за решенную задачу
        setIsModalOpen(false);
        setControlsEnabled(true);

        // Всплывающее уведомление
        toast.success('🎉 Задача решена правильно! +150 XP', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",

        });
        setTimeout(()=> toggleProgressVisibility(), 5000);
    };
    const closeModal = () => {
        setIsModalOpen(false); // Закрыть модальное окно
        setControlsEnabled(true); // Включить управление камерой
        setTargetPlanet(null);
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

    const toggleProgressVisibility = () => {
        setProgressVisible((prev) => !prev); // Переключение состояния отображения UserProgress
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
            {progressVisible && (
            <div style={{position: "absolute", width: "100%", textAlign: 'center', top: '10px'}}>
                <UserProgress xp={xp} progress={progress} levels={levels} lockCondition="Пройдите специализацию по Backend!"/>

            </div>
                )}
            <div
                className="avatar"
                onClick={toggleProgressVisibility}
            >
                <img
                    src="https://steamuserimages-a.akamaihd.net/ugc/2490003003201333678/8F987FC4732FE047142C5A590A943CD60D187AD9/?imw=512&imh=288&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true"
                    alt="Avatar"
                />
            </div>
            {targetPlanet && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                    title={`Задача на планете ${targetPlanet.name}`}
                    task={targetPlanet.dailyTask}
                />
            )}
            <ToastContainer />
        </>
    );
};

export default Scene;