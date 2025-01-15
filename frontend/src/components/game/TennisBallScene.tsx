import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { OrbitControls, Text } from '@react-three/drei';

interface TennisBallProps {
    onStartGame: () => void;
}

const TennisBall: React.FC<TennisBallProps> = ({ onStartGame }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 2 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [dragStartTime, setDragStartTime] = useState(0);
    const { camera } = useThree();
    const defaultZoom = 5;
    const [cameraZoom, setCameraZoom] = useState(defaultZoom);

    const gltf = useLoader(GLTFLoader, '/tennis_ball.glb');

    useEffect(() => {
        const handleMouseUp = () => {
            if (isDragging) {
                const dragDuration = Date.now() - dragStartTime;
                setIsDragging(false);

                if (dragDuration > 200) {
                    const speedX = (mousePos.x - lastMousePos.x) * 0.1;
                    const speedY = (mousePos.y - lastMousePos.y) * 0.1;
                    setRotationSpeed({ x: speedX, y: speedY });

                    setTimeout(() => {
                        setRotationSpeed({ x: 0, y: 0.5 });
                    }, 1000);
                }
            }
        };

        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isDragging, mousePos, lastMousePos, dragStartTime]);

    const handlePointerMove = (event: any) => {
        if (isDragging) {
            setMousePos({
                x: event.clientX,
                y: event.clientY,
            });
        }
    };

    const handlePointerDown = (event: any) => {
        event.stopPropagation();
        setIsDragging(true);
        setDragStartTime(Date.now());
        setLastMousePos({
            x: event.clientX,
            y: event.clientY,
        });
        setMousePos({
            x: event.clientX,
            y: event.clientY,
        });
    };

    const handleClick = (event: any) => {
        const clickDuration = Date.now() - dragStartTime;
        if (clickDuration < 200) {
            // Zoom out (increase distance)
            setCameraZoom(defaultZoom * 1.4);
            setTimeout(() => {
                setCameraZoom(defaultZoom);
            }, 300);
            onStartGame();
        }
    };

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (!isDragging) {
                meshRef.current.rotation.x += rotationSpeed.x * delta;
                meshRef.current.rotation.y += rotationSpeed.y * delta;
            }
        }
        camera.position.z = THREE.MathUtils.lerp(
            camera.position.z,
            cameraZoom,
            0.1
        );
    });

    return (
        <>
            <mesh
                ref={meshRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onClick={handleClick}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
                // style={{ cursor: isHovered ? 'pointer' : 'default' }}
            >
                <primitive object={gltf.scene} scale={[72, 72, 72]} />
            </mesh>

            <Text
                position={[0, 0, 2.99]}
                fontSize={0.7}
                color="blue"
                anchorX="center"
                anchorY="middle"
                scale={isHovered ? 1.3 : 1}
                outlineWidth={0.1}
                outlineColor="silver"
                letterSpacing={0.02}
            >
                Play!
            </Text>
        </>
    );
};

// Container component with positioning options
interface TennisBallSceneProps extends TennisBallProps {
    className?: string;
    style?: React.CSSProperties;
}

const TennisBallScene: React.FC<TennisBallSceneProps> = ({
    onStartGame,
    className = '',
    style = {},
}) => {
    return (
        <div
            className={`relative w-full h-full ${className}`}
            style={{
                ...style,
                cursor: 'default',
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <ambientLight intensity={2.6} />
                <pointLight position={[1.1, 1.8, 2.1]} />
                <pointLight position={[1.3, 1.8, 2.3]} />
                <TennisBall onStartGame={onStartGame} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                />
            </Canvas>
        </div>
    );
};

export default TennisBallScene;
