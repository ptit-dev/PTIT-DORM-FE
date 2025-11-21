// import React from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Text } from "@react-three/drei";


// type RoomProps = {
//   position: [number, number, number];
//   status: boolean;
// };

// function Room({ position, status }: RoomProps) {
//   return (
//     <mesh position={position} castShadow receiveShadow>
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={status ? "#16a34a" : "#dc2626"} />
//     </mesh>
//   );
// }


// function Building({ name, startX, startZ }: { name: string; startX: number; startZ: number }) {
//   const floors = 5;
//   const roomsPerFloor = 10;
//   const rooms = [];
//   for (let f = 0; f < floors; f++) {
//     for (let r = 0; r < roomsPerFloor; r++) {
//       const x = startX + r * 1.2;
//       const y = f * 1.2 + 1;
//       const z = startZ;
//       rooms.push(
//         <Room key={`${f}-${r}`} position={[x, y, z]} status={Math.random() > 0.5} />
//       );
//     }
//   }
//   return (
//     <>
//       {rooms}
//       {/* Mái nhà */}
//       <mesh position={[startX + 5, floors * 1.2 + 1.5, startZ]} castShadow receiveShadow>
//         <boxGeometry args={[15, 1, 4]} />
//         <meshStandardMaterial color="#5b1a1a" />
//       </mesh>
//       {/* Label */}
//       <Text
//         position={[startX + 5, floors * 1.2 + 2, startZ]}
//         fontSize={0.7}
//         color="white"
//         anchorX="center"
//         anchorY="middle"
//         outlineColor="#5b1a1a"
//         outlineWidth={0.04}
//       >
//         {name}
//       </Text>
//     </>
//   );
// }


// const Dorm3D: React.FC = () => {
//   return (
//     <Canvas camera={{ position: [0, 20, 30], fov: 45 }} style={{ height: 500, width: "100%" }} shadows>
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
//       {/* Mặt đất */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
//       <planeGeometry args={[200, 200]} />
//       <meshStandardMaterial color="#f3f3f3" />
//       </mesh>
//       {/* Các tòa nhà */}
//       <Building name="Khu B1" startX={0} startZ={0} />
//       <Building name="Khu B5" startX={20} startZ={5} />
//       <Building name="Khu B3" startX={10} startZ={-8} />
//       <OrbitControls />
//     </Canvas>
//   );
// };

// export default Dorm3D;
