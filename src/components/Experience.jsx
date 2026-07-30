import { Environment, OrbitControls } from "@react-three/drei";
import { Card } from "./card";
import { MobileController } from "./MobileController";
import { isStreamScreen } from "playroomkit";
import { Gameboard } from "./Gameboard";

// This experience component routes between TV and the controller
export const Experience = () => {
  return (
    <>
      {/* the orbiting feature where you can drag adn scroll and orbit the camera */}
      <OrbitControls />
      {/* is steram screen ternary here is essetnial. it checks teh state the 
      player is in, which is why while testing, I had to use a phoen view for 
      one, bc on phone view its different compared to the tv or big screen view */}
      {isStreamScreen() ? <Gameboard /> : <MobileController/>}
      {/* Kinda sets the stage and scene colors and presets */}
      <Environment preset="dawn" background blur={2}/>
    </>
  );
};
