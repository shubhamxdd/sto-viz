"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useCanvasStore } from "../../stores/use-canvas-store";

export const CAMERA_DEFAULT_POSITION: [number, number, number] = [25, 20, 25];
export const CAMERA_DEFAULT_TARGET: [number, number, number] = [0, 2, 0];

export function CityCamera() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const isAutoRotating = useCanvasStore((state) => state.isAutoRotating);
  const cameraResetSignal = useCanvasStore((state) => state.cameraResetSignal);

  // Respond to camera reset requests
  useEffect(() => {
    if (cameraResetSignal === 0) return;

    if (controlsRef.current) {
      controlsRef.current.target.set(
        CAMERA_DEFAULT_TARGET[0],
        CAMERA_DEFAULT_TARGET[1],
        CAMERA_DEFAULT_TARGET[2],
      );
      camera.position.set(
        CAMERA_DEFAULT_POSITION[0],
        CAMERA_DEFAULT_POSITION[1],
        CAMERA_DEFAULT_POSITION[2],
      );
      camera.lookAt(
        CAMERA_DEFAULT_TARGET[0],
        CAMERA_DEFAULT_TARGET[1],
        CAMERA_DEFAULT_TARGET[2],
      );
      controlsRef.current.update();
    }
  }, [cameraResetSignal, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={CAMERA_DEFAULT_TARGET}
      minPolarAngle={Math.PI / 6} // 30 degrees minimum elevation
      maxPolarAngle={Math.PI / 2.5} // 72 degrees maximum elevation to prevent floor clipping
      minDistance={10}
      maxDistance={60}
      enableDamping
      dampingFactor={0.05}
      autoRotate={isAutoRotating}
      autoRotateSpeed={0.5}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      panSpeed={0.8}
    />
  );
}
