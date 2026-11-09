"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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
  const selectedHoldingId = useCanvasStore((state) => state.selectedHoldingId);
  const selectedPlotPosition = useCanvasStore(
    (state) => state.selectedPlotPosition,
  );

  // Smoothly damp camera orbit target and camera position toward active building or city center
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const desiredTarget =
      selectedHoldingId && selectedPlotPosition
        ? selectedPlotPosition
        : CAMERA_DEFAULT_TARGET;

    const currentTarget = controlsRef.current.target;

    const distSq =
      (currentTarget.x - desiredTarget[0]) ** 2 +
      (currentTarget.y - desiredTarget[1]) ** 2 +
      (currentTarget.z - desiredTarget[2]) ** 2;

    if (distSq > 0.0001) {
      // Exponential decay lerp factor (framerate independent)
      const lerpFactor = 1 - Math.exp(-6 * delta);

      const nextX =
        currentTarget.x + (desiredTarget[0] - currentTarget.x) * lerpFactor;
      const nextY =
        currentTarget.y + (desiredTarget[1] - currentTarget.y) * lerpFactor;
      const nextZ =
        currentTarget.z + (desiredTarget[2] - currentTarget.z) * lerpFactor;

      const deltaX = nextX - currentTarget.x;
      const deltaY = nextY - currentTarget.y;
      const deltaZ = nextZ - currentTarget.z;

      // Translate orbit pivot target
      currentTarget.set(nextX, nextY, nextZ);

      // Translate camera position identically to preserve user azimuth, elevation, and distance
      camera.position.x += deltaX;
      camera.position.y += deltaY;
      camera.position.z += deltaZ;

      controlsRef.current.update();
    }
  });

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
