import React, { useRef } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { Text } from '@react-three/drei';
import { numWorkgroups } from 'three/src/nodes/gpgpu/ComputeBuiltinNode.js';

//the descriptions for each of the 3 cards
const CARD_DESCRIPTIONS = {
  punch: "Punch another pirate and make it drop a gem",
  shield: "Protect yourself from an attack",
  grab: "Grab a gem from from the loot but if nothing is there YOU won't get anything",
};

//default value of the card is shield
//the ...props tactic groups any other thigns like onclick or scale positon, 
// any other 
// things get wrapped up into one obj. to be used below in teh group
export function Card({ type = "shield", ...props }) {
  //loads card model
  const { nodes, materials } = useGLTF('/models/card.glb')

  //since the name for the cards made were concise, the card can be displayed by type just by typing the type of card, liek shield, grab or punch
  const texture = useTexture(`cards/${type}.jpg`);

  return (
    // the dispose=null really means that the program is relling r3f not to dispose of the geometries we had like the player and whatnot and other 
    // materials when the compoennt unmounts(react idea).
    //The thing is, since the materiald and textures and stuff are SHARED across 
    // cards and stuff, disposing would free up gpu resources, but its not efficient for the game. unmounting of one card could destroy the geoemtry and stuff and looks for evyer other card if we DO dispose
    <group {...props} dispose={null}>
      {/* basic material/texturing for the card */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane.geometry}
        material={materials.Front}
      >
        <meshStandardMaterial {...materials.Front} map={texture} color="white" />
      </mesh>
      {/* what border and backface look like */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane_1.geometry}
        material={materials.Borders}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane_2.geometry}
        material={materials.Back} />

      {/* text that goes on top of the cards, like card Descriptions and stuff */}
      <Text
        font="/fonts/Roboto_Condensed-Bold.ttf"
        fontSize={0.1}
        anchorY={"top"}
        anchorX={"left"}
        position-x={-0.46}
        position-y={"-0.3"}
        position-z={0.01}>
        {type.toUpperCase()}
        <meshStandardMaterial
          color="white"
          roughness={materials.Front.roughness} />
      </Text>
      <Text
        font="/fonts/Roboto_Condensed-Bold.ttf"
        fontSize={0.06}
        maxWidth={0.9}
        anchorY={"top"}
        anchorX={"left"}
        position-x={-0.46}
        position-y={-0.44}
        position-z={0.01}
        lineHeight={1}>
        {CARD_DESCRIPTIONS[type] || ""}
        <meshStandardMaterial
          color="white"
          roughness={materials.Front.roughness} />
      </Text>
    </group>
  )
}

// effieciency and laod form starts. rather than wait for each thing to load, when card is caleld, 
// whereever its imported, just load it from the get go itself
useGLTF.preload('/models/card.glb')
useTexture.preload("cards/punch.jpg");
useTexture.preload("cards/shield.jpg");
useTexture.preload("cards/grab.jpg");
