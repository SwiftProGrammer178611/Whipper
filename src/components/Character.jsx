import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";

// picks one of 4 pirates  and the naming is the same in teh file sys so that it can pick form name
const CHARACTERS = ["Anne", "Captain_Barbarossa", "Henry", "Mako"];

// start the character by DEFUALT at first char. and not doing anything(idle) and again, like in card.jsx, we use
// the ...props tactic to bundle up all the extra liek onclick pos. etc. 
export const Character = ({
    character = 0,
    animation = "Idle",
    ...props
}) => {
    // retreives  the characters, and like card.jsx the names are made in such a way 
    // that it fits this frame and we can get the players characters better
    const {scene, animations} = useGLTF(
        `/models/Characters_${CHARACTERS[character]}.gltf`
    );


    const ref = useRef();
    const {actions} = useAnimations(animations, ref);
    
    console.log(actions);

    // the MEAT: it restarts everytime the animation prop changes. This allows for the animation not be choppy when animating bc it gets the frame whatever was requirested, and rewidns to frame 0 and and 
    // fades over a half a second rather than teh snapping metnioend ealeires.
    useEffect(() => {
        actions[animation].reset().fadeIn(0.5).play();
        return () => actions[animation]?.fadeOut(0.5);
    }, [animation])
    // again, the pattern of using ...props to wrap the otehr stuff liek pos and onclick and toerh info into one object to be use d in group is used here, that tactic 
    // this group heree is what rly gets scaled and rotated, basically what the player interacts with...
    return <group {...props} ref={ref}>
        <primitive object={scene} />
    </group>
}
