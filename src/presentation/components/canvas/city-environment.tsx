"use client";

interface CityEnvironmentProps {
  enableShadows?: boolean;
}

export function CityEnvironment({
  enableShadows = false,
}: CityEnvironmentProps) {
  return (
    <>
      {/* Background color and depth fog */}
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 25, 80]} />

      {/* Cool ambient light for deep shadow definition */}
      <ambientLight color="#1e293b" intensity={0.5} />

      {/* Cyberpunk moonlight key light */}
      <directionalLight
        position={[25, 40, 20]}
        color="#38bdf8"
        intensity={1.2}
        castShadow={enableShadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0001}
      />

      {/* Subtle magenta city glow rim light */}
      <directionalLight
        position={[-20, 15, -20]}
        color="#f43f5e"
        intensity={0.4}
      />
    </>
  );
}
