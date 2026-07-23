import { myPlayer, usePlayersList } from "playroomkit";
import { Card } from "./card";
import {useGameEngine} from "../hooks/useGameEngine";

export const MobileController = () => {
    const me = myPlayer();
    const{players, phase, playerTurn} = useGameEngine();
    const myIndex = players.findIndex((player) => player.id === me.id);
    const carsds = me.getState("cards") || [];
    usePlayersList(true);
    return(
        <group>
            <group position-y={1}>
                {carsds.map((card,index) => {
                    return(
                    <group
                        key={index}
                        position-x={index*0.1}
                        position-y={2-index*0.1}
                        position-z={-index*0.1}
                        onClick={() =>{
                            if(phase==="cards"){
                                me.setState("selectedCard", index, true);
                            }
                        }}
                        >
                            <Card type={card} />
                    </group>
                );
                })}
                
            </group>
        </group>
    );
};