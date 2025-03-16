import React, { forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const Planet = forwardRef(({ modelPath, scale, position, rotationSpeed, onClick }, ref) => {
    const { scene } = useGLTF(modelPath);

    useFrame(() => {
        if (ref.current) {
            // ref.current.rotation.y += rotationSpeed;
        }
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={scale}
            position={position}
            onClick={onClick}
        />
    );
});

export default Planet;
