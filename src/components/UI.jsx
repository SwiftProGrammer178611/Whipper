import { NB_ROUNDS, useGameEngine } from "../hooks/useGameEngine";
import { myPlayer, isHost } from "playroomkit";
export const UI = () => {


    const  {
        phase,
        startGame,
        timer,
        playerTurn,
        players,
        round,
        getCard,
        actionSuccess,
    } = useGameEngine();

    const currentPlayer = players[playerTurn];
    const me = myPlayer();
    const currentCard = getCard();
    const target = 
        phase === "playerAction" &&
        currentCard === "punch" &&
        players[currentPlayer.getState("playerTarget")];

    let label = "";
    switch(phase) {
        case "cards":
            label = "Select card U wanna play";
            break;
        case "playerChoice":
            label = currentPlayer.id === me.id ? "Select Player U wanna punch" : `${currentPlayer?.state.porfile?.name} is going to punch someone`;
            break;
        case "playerAction":
            switch (currentCard) {
                case "punch":
                    label = actionSuccess ? `${currentPlayer?.state.profile?.name} is punching ${target?.state.profile?.name}` : `${currentPLayer?.state.profile?.name} failed punching $target?.state.profile.name`
                case "grab":
                    label = actionSuccess ? `${currentPlayer?.state.profile?.name} is grabbing a gem` : `no more gems for ${currentPlayer?.state.profile?.name}`;
                    break;
                case "shield":
                    label = `${currentPlayer?.state.profile?.name} cant be punched bc of the shield. WAIT till next turn`;
                    break;
                default: 
                    break;
            }
        case "end":
            label = "Game Over";
            break;

    }

    return(
        <div  className = "text-white drop-shadow-xl fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col pointer-events-none">
            <div className="p-4 w-full flex items-center justify-between">
                <h2 className="text-2xl font-bold text-center uppercase">
                    Round {round}/{NB_ROUNDS}
                </h2>
                <div className ="flex items-center gap-1 w-14 ">
                    <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-6 h-6"
>
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
</svg>
                    <h2 className="text-2xl font-bold text-center uppercase">{timer}</h2>
                </div>
            </div>
            <div className="flex-1" />
            <div className="p-4 w-full">
                <h1 className="text-2xl font-bold text-center">{label}</h1>
                {phase === "end" && (
                    <p className ="text-center">
                        Winner:{" "}
                        {players
                            .filter((player) => player.getState("winner"))
                            .map((player) => player.state.profile.name)
                            .join(", ")}
                        !
                    </p>
                )}
                {isHost() && phase === "end" && (
                    <button
                        onClick={startGame}
                        className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">PLay again</button>
                )}
            </div>
        </div>
    );
}