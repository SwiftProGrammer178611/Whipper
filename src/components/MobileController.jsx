import { useRef } from "react";
import * as THREE from "three";
import { myPlayer, usePlayersList } from "playroomkit";
import { Card } from "./card";
import { useGameEngine } from "../hooks/useGameEngine";
import { degToRad } from "three/src/math/MathUtils.js";
import { Center, ContactShadows, Gltf } from "@react-three/drei";
import { Character } from "./Character";
import { PlayerName } from "./PlayerName";
import { useThree, useFrame } from "@react-three/fiber";

export const MobileController = () => {
    // the benefit of adding these refs is so that data doesnt 
    // get lost on a page refresh. bascially its persistent, 
    // and even after a re-render, the data survives.
    const cardRefs = useRef([]);
    const targetRefs = useRef([]);
    //myPlayer() is quite literally what it soudns like. Its provided from playroom kit and allows for
    const me = myPlayer();
    //teh myIndex is used to determine which of the players is you to figure out which of the 4 players is you

    const { players, phase, playerTurn } = useGameEngine();
    const myIndex = players.findIndex((player) => player.id === me.id);
    const cards = me.getState("cards") || [];
    usePlayersList(true);
    let playerIdx = 0;

    //same responsive nature explained in Gameboard.jsx
    const viewport = useThree((state) => state.viewport);
    const scalingRatio = Math.min(1, viewport.width / 3);

    //runs once every rendered frame
    useFrame((_, delta) => {

        cards.forEach((_, index) => {
            const group = cardRefs.current[index];
            if (!group) return;
            const selected = index === me.getState("selectedCard");
            let target = { x: index * 0.1, y: 2 - index * 0.1, z: -index * 0.1, rotX: 0, scale: 1 };
            if (phase === "cards") {
                target = selected ? { x: 0, y: 0, z: 2, rotX: degToRad(-45), scale: 1.1 }
                    : { x: index % 2 ? 0.6 : -0.6, y: Math.floor(index / 2) * 1.6, z: -0.5, rotX: 0, scale: 1 };
            } else if (selected) {
                target = { x: -0.1, y: 2.1, z: 0.1, rotX: 0, scale: 1 };
            }
            group.rotation.x = THREE.MathUtils.damp(group.rotation.x, target.rotX, 8, delta);
            group.position.y = THREE.MathUtils.damp(group.position.y, target.y, 8, delta);
            group.position.z = THREE.MathUtils.damp(group.position.z, target.z, 8, delta);
            group.position.x = THREE.MathUtils.damp(group.position.x, target.x, 8, delta);
            const s = THREE.MathUtils.damp(group.scale.x, target.scale, 8, delta);
            group.scale.set(s, s, s);
        });

        players.forEach((player, index) => {
            if (player.id === me.id) return;
            const group = targetRefs.current[index];
            if (!group) return;
            const selected = index === me.getState("playerTarget");
            group.position.z = THREE.MathUtils.damp(group.position.z, selected ? 0 : -2, 8, delta);
            const s = THREE.MathUtils.damp(group.scale.x, selected ? 0 : 0.8, 8, delta);
            group.scale.set(s, s, s);
        });
    });

    return (
        <group position={-1}>
            {/* a shadow, slightly diff and cheats the alternative shadows method used in gameboard, but its a phone, so its fine, and looks good enoguh if we use contactshadows*/}
            <ContactShadows opacity={0.12} />
            <group scale={scalingRatio}>
                <group position={3.5} position-x={-0.6}>
                    <PlayerName
                        name={me.getProfile()?.name ?? "Player"}
                        position-y={0.8}
                        fontSize={0.1}
                    />
                    <Character
                        character={myIndex}
                        rotation-y={degToRad(45)}
                        scale={0.4}
                    />
                    {[...Array(me.getState("gems") || 0)].map((_, index) => (
                        <Gltf
                            key={index}
                            src="/models/UI_Gem_Blue.gltf"
                            position-x={0.7 + index * 0.25}
                            position-y={0.25}
                            scale={0.5}
                        />
                    ))}
                </group>
                <group position-y={1}>
                    {cards.map((card, index) => (
                        <group
                            key={index}
                            ref={(el) => (cardRefs.current[index] = el)}
                            position-x={index * 0.1}
                            position-y={2 - index * 0.1}
                            onClick={() => {
                                if (phase === "cards") {
                                    me.setState("selectedCard", index, true);
                                }
                            }}
                        >
                            <Card type={card} />
                        </group>
                    ))}
                </group>

                {/* Adding the question mark here allows for:  */}
                {phase === "playerChoice" && players[playerTurn]?.id === me.id && (
                    <Center disableY disableZ>
                        {/* //Need to fix this right now! */}
                        {players.map(
                            (player, index) =>
                                player.id !== me.id && (
                                    <group
                                        key={player.id}
                                        ref={(el) => (targetRefs.current[index] = el)}
                                        position-x={playerIdx++ * 0.8}
                                        position-z={-2}
                                        scale={0.4}
                                    >
                                        <mesh
                                            onClick={() => me.setState("playerTarget", index, true)}
                                            position-y={1}
                                            visible={false}>
                                            <boxGeometry args={[1.2, 2, 0.5]} />
                                            <meshStandardMaterial color="hotpink" />
                                        </mesh>
                                        <PlayerName
                                            name={player.getProfile()?.name ?? "Player"}
                                            fontSize={0.3}
                                            position-y={1.6} />
                                        <Character character={index} animation="Idle" />
                                    </group>
                                )
                        )}
                    </Center>
                )}
            </group>
        </group>
    );
};