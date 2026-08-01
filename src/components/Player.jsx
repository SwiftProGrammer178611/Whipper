import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameEngine } from "../hooks/useGameEngine";
import { degToRad } from "three/src/math/MathUtils.js";
import { Character } from "./Character";
import { PlayerName } from "./PlayerName";
import { Center, Gltf } from "@react-three/drei";

// This is the 3d rendering of the player itself. for ONE player tho

export const Player = ({ player, index }) => {

    // basically a bunch of different player states checking which state the player is in
    const { phase, playerTurn, players, getCard } = useGameEngine();
    const isPlayerTurn = phase === "playerAction" && index === playerTurn;
    const currentPlayer = players[playerTurn];
    const currentCard = getCard();
    const hasShield = player.getState("shield");
    const isPlayerPunched =
        phase === "playerAction" &&
        currentCard === "punch" &&
        index === currentPlayer.getState("playerTarget");
    const isWinner = player.getState("winner");

    const [animation, setAnimation] = useState("Idle");
    // on page load(the useffect) the state the player is in is checked, 
    useEffect(() => {
        let cardAnim = "Idle";
        if (isPlayerTurn) {
            switch (currentCard) {
                case "punch":
                    cardAnim = "Sword";
                    break;
                case "shield":
                    cardAnim = "Wave";
                    break;
                case "grab":
                    cardAnim = "Punch";
                    break;
                default:
                    break;
            }
        } else {
            if (isPlayerPunched) {
                cardAnim = "Duck";
            }
        }
        if (isWinner) {
            cardAnim = "Wave";
        }
        setAnimation(cardAnim);
    }, [currentCard, playerTurn, phase, isPlayerPunched, isWinner]);

    const groupRef = useRef();
    const baseX = 1 + index;
    const baseZ = 2;

    useFrame((_, delta) => {
        const group = groupRef.current;
        if (!group) return;

        const targets = {
            Idle: { x: baseX, z: baseZ, rotateY: 0, scale: 1 },
            Sword: { x: -1, z: 0.2, rotateY: 0, scale: 1 },
            Wave: { x: baseX, z: baseZ, rotateY: 0, scale: 1.5 },
            Punch: { x: 0, z: 0.4, rotateY: 0, scale: 1 },
            Duck: { x: -1, z: -0.4, rotateY: degToRad(180), scale: 1 },
        };
        const target = targets[animation] || targets.Idle;
        const d = (from, to) => THREE.MathUtils.damp(from, to, 8, delta);

        group.position.x = d(group.position.x, target.x);
        group.position.z = d(group.position.z, target.z);
        group.rotation.y = d(group.rotation.y, target.rotateY);
        const s = d(group.scale.x, target.scale);
        group.scale.set(s, s, s);
    });

    return (
        <group ref={groupRef} position-x={baseX} position-z={baseZ}>
            <PlayerName name={player.getProfile()?.name || "Player"} position-y={0.8} />
            <Character
                scale={0.5}
                character={index}
                rotation-y={degToRad(180)}
                animation={animation}
            />
            {hasShield && <Gltf scale={0.5} src="/models/Prop_Barrel.gltf" />}
            <Center disableY disableZ>
                {[...Array(player.getState("gems") || 0)].map((_, gemIndex) => (
                    <Gltf
                        key={gemIndex}
                        src="/models/UI_Gem_Blue.gltf"
                        position-x={gemIndex * 0.5}
                        position-y={0.25}
                        position-z={0.5}
                        scale={0.3}
                    />
                ))}
            </Center>
        </group>
    );
};

/*



*/