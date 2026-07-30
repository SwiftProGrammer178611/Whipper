import {Billboard,Text} from "@react-three/drei";
// Billboard (drei) automatically rotates its children to always face the camera, regardless of the camera's own
// oritentation -- essential for floating name-tag text that should be readable from any angle.
// 
//as a safety check name="" guards against if a player doesnt eneter a nme instead of crashing
//and yet AGAIN the ...props trick is used to wrpa up all extra sutff liek pos and all other infromation rolled ip into one obejct
export const PlayerName = ({name="", fontSize=0.2, ...props}) => (
    //
    <Billboard {...props}>

        {/* the anchor Y on the bottom basically means anchor to the bototm of the billboard. This allows the text to grow UPWARDS  */}
        
        <Text
            anchorY={"bottom"}
            fontSize={fontSize}
            font="/fonts/Roboto_Condensed-Black.ttf"
            >
                {name}
            </Text>
    </Billboard>
);