import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import {Leva} from "leva";
import {isHost, isStreamScreen} from "playroomkit";
import {UI} from "./components/UI";
import { MotionConfig } from "framer-motion";

const DEBUG = true;

function App() {
  return (
    <>
      <Leva hidden ={!DEBUG || !isHost()} />
    
    <Canvas shadows camera={{ position: isStreamScreen()?[14,10,-14] : [0, 4, 12], fov: 30 }} style={{ width: "100vw", height: "100vh" }}>
      <color attach="background" args={["#ececec"]} />
      <MotionConfig
        transition={{
          type:"spring",
          mass: 5,
          stiffness:500,
          damping:100,
          restDelta:0.0001,
        }}>
      <Experience />
      </MotionConfig>
    </Canvas>
    <UI/>
    </>
  );
}

export default App;
