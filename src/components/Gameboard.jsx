import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AccumulativeShadows, Gltf, RandomizedLight, useGLTF } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { degToRad } from "three/src/math/MathUtils.js";
import { useGameEngine } from "../hooks/useGameEngine";
import { Card } from "./card";
import { Player } from "./Player";

export const Gameboard = () => {
    //viewport-> the visibe world in 3.js units 
    const viewport = useThree((state) => state.viewport);
    // allows for easy responsivity between screen, but the Math min 1 caps it so it doesn't grow too big past normal size on wider screen
    const scalingRatio = Math.min(1, viewport.width / 12);
    const { deck, gems, players, phase, getCard } = useGameEngine();

    const outerRefs = useRef([]);
    const innerRefs = useRef([]);

    //similiar change to what happened in MobileController.jsx
    /* the reason this usefra, useref and all thsoe changes were made is because framer-motion and framer-motion-3d are both deprecated. 
    The tutorial went with the approach using framer, but since they were edprecated, some 
    new things had to be learned. 
    
    
    */
    useFrame((_, delta) => {
        const d = (from, to) => THREE.MathUtils.damp(from, to, 8, delta);
        //cares about position in pile not name liek card 3 a pucnh card whatever
        deck.forEach((_, index) => {
            const outer = outerRefs.current[index];
            const inner = innerRefs.current[index];
            if (!outer || !inner) return;

            const selected = phase === "playerAction" && index === deck.length - 1;
            const target = selected
                ? { x: -2, y: 1.5, z: -2, rotY: degToRad(120), scale: 1.5 }
                : { x: 0, y: index * 0.015, z: 0, rotY: index % 2 ? degToRad(2) : 0, scale: 1 };

            outer.position.x = d(outer.position.x, target.x);
            outer.position.y = d(outer.position.y, target.y);
            outer.position.z = d(outer.position.z, target.z);
            outer.rotation.y = d(outer.rotation.y, target.rotY);
            const s = d(outer.scale.x, target.scale);
            outer.scale.set(s, s, s);

            inner.rotation.x = d(inner.rotation.x, selected ? degToRad(-45) : degToRad(90));
        });
    });

    const shadows = useMemo(() => (
        <AccumulativeShadows
            temporal
            frames={35}
            alphaTest={0.75}
            scale={100}
            position={[1, -6, 1]}
            color="#3bbb52"
        >
            <RandomizedLight
                amount={4}
                radius={9}
                intensity={0.55}
                ambient={0.25}
                position={[30, 5, -10]}
            />
            <RandomizedLight
                amount={4}
                radius={5}
                intensity={0.25}
                ambient={0.55}
                position={[30, 5, -9]}
            />
        </AccumulativeShadows>
    ), []);

    return <group scale={scalingRatio}>
        {/* consider switching card.jsx and Character.jsx to this gltf version to make code tighter */}
        <Gltf
            castShadow
            src="/models/Gameboard.glb"
            scale={10}
            position-x={2}
            position-z={2}
            position-y={0.3}
            rotation-y={degToRad(180)}
        />
        {shadows}
        <group position-x={4} position-z={-2}>
            {deck.map((_, index) => (
                <group
                    key={index}
                    ref={(el) => (outerRefs.current[index] = el)}
                    position-y={index * 0.015}
                    rotation-y={index % 2 ? degToRad(2) : 0}
                >
                    <group ref={(el) => (innerRefs.current[index] = el)} rotation-x={degToRad(90)}>
                        <Card type={getCard() || undefined} />
                    </group>
                </group>
            ))}
        </group>
        {[...Array(gems)].map((_, index) => (
            <Gltf
                key={index}
                src="/models/UI_Gem_Blue.gltf"
                position-x={index * 0.5}
                position-y={0.25}
                scale={0.3}
            />
        ))}
        {players.map((player, index) => (
            <group key={player.id}>
                <Player index={index} player={player} />
            </group>
        ))}
    </group>
};
useGLTF.preload("/models/Gameboard.glb");
useGLTF.preload("/models/UI_Gem_Blue.gltf");