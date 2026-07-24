import { Environment, OrbitControls } from "@react-three/drei";
import { Card } from "./card";
import { Character } from "./Character";
import { MobileController } from "./MobileController";
import { isStreamScreen } from "playroomkit";

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      {isStreamScreen() ? <Gameboard /> : <MobileController/>}
      <MobileController/>
      <Environment preset="dawn" background blur={2}/>
    </>
  );
};
