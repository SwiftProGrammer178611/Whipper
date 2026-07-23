import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import {Leva} from "leva";
import {isHost} from "playroomkit";
import {UI} from "./components/UI";

const DEBUG = true;

function App() {
  return (
    <>
      <Leva hidden ={!DEBUG || !isHost()} />
    
    <Canvas shadows camera={{ position: [0, 4, 12], fov: 30 }} style={{ width: "100vw", height: "100vh" }}>
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas>
    <UI/>
    </>
  );
}

export default App;
