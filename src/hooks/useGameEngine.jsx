import { getState, useMultiplayerState, usePlayersList, onPlayerJoin, isHost } from 'playroomkit';
import React, { useRef, useEffect } from 'react';
import { randInt } from "three/src/math/MathUtils";
import { useControls } from 'leva';

/*
Think of this file as the Engine of the car
It's not the prettiest but necessary for the functionality and is core to the whole thing because it runs on it

*/

const GameEngineContext = React.createContext();

// some constants for initiation of the game
const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 3;
export const NB_ROUNDS = 3;
const NB_GEMS = 3;
const CARDS_PER_PLAYER = 4;


export const GameEngineProvider = ({ children }) => {
    // Similiar to useState in react, useMultiplayerState is playroom kit's version of it. and the value is synced across every client thats connected 
    const [timer, setTimer] = useMultiplayerState("timer", 0);
    const [round, setRound] = useMultiplayerState("round", 1);
    const [phase, setPhase] = useMultiplayerState("phase", "lobby");
    const [playerTurn, setPlayerTurn] = useMultiplayerState("playerTurn", 0);
    const [playerStart, setPlayerStart] = useMultiplayerState("playerStart", 0);
    const [deck, setDeck] = useMultiplayerState("deck", []);
    const [gems, setGems] = useMultiplayerState("gems", NB_GEMS);
    const [actionSuccess, setActionSuccess] = useMultiplayerState(
        "actionSuccess",
        true
    );

    // This usePlayersList gives an array of connected players. 
    // It updates itself not only when a player joins/leaves but also 
    // if anythign happens to that player like if it's state changes
    const players = usePlayersList(true);
    //this sorting amkes sure teh players array from all clients is the same
    players.sort((a, b) => a.id.localeCompare(b.id));

    const gameState = {
        timer,
        round,
        phase,
        playerTurn,
        playerStart,
        players,
        gems,
        deck,
        actionSuccess,
    };
    //dsitrbuting cards to players logic
    const distributeCards = (nbCards) => {
        const newDeck = [...getState("deck")];
        players.forEach((player) => {
            const cards = player.getState("cards") || [];
            for (let i = 0; i < nbCards; i++) {
                const randomIndex = randInt(0, newDeck.length - 1);
                cards.push(newDeck[randomIndex]);
                newDeck.splice(randomIndex, 1);
            }
            player.setState("cards", cards, true);
            player.setState("selectedCard", 0, true);
            player.setState("playerTarget", -1, true);
        });
        setDeck(newDeck, true);
    };
    // this is hte paused checkbox from leva that you see when you play the game
    
    const { paused } = useControls({
        paused: false,
    });
    const timerInterval = useRef();
    const runTimer = () => {
        timerInterval.current = setInterval(() => {
            if (!isHost()) return;
            if (paused) return;

            let newTime = getState("timer") - 1;
            console.log("Timer", newTime);

            if (newTime <= 0) {
                phaseEnd();
            } else {
                setTimer(newTime, true);
            }
        }, 1000);
    };
    const clearTimer = () => {
        clearInterval(timerInterval.current);
    }
    useEffect(() => {
        runTimer();
        return clearTimer;
    }, [phase, paused]);

    const startGame = () => {
        if (isHost()) {
            console.log("testing started?")
            setTimer(TIME_PHASE_CARDS, true);
            const randomPlayer = randInt(0, players.length - 1);
            setPlayerStart(randomPlayer, true);
            setPlayerTurn(randomPlayer, true);
            setRound(1, true);
            setDeck(
                [
                    ...new Array(16).fill(0).map(() => "punch"),
                    ...new Array(24).fill(0).map(() => "grab"),
                    ...new Array(8).fill(0).map(() => "shield"),
                ],
                true
            );
            setGems(NB_GEMS, true);
            players.forEach((player) => {
                console.log("Setting up player", player.id);
                player.setState("cards", [], true);
                player.setState("gems", 0, true);
                player.setState("shield", false, true);
                player.setState("winner", false, true);
            });

            distributeCards(CARDS_PER_PLAYER);
            setPhase("cards", true);
        }
    };

    useEffect(() => {
        startGame();
        //quite literally what it says here is what it means
        onPlayerJoin(startGame);
    }, []);
    // for defaut player action is shield unless player picks otherwise
    const performPlayerAction = () => {
        const player = players[getState("playerTurn")];
        console.log("Perform Player Action ", player.id);
        const selectedCard = player.getState("selectedCard");
        const cards = player.getState("cards");

        const card = cards[selectedCard];
        let success = true;
        if (card !== "shield") {
            player.setState("shield", false, true);
        }
        switch (card) {
            case "punch":
                let target = players[player.getState("playerTarget")];
                if (!target) {
                    let targetIndex = (getState("playerTurn") + 1) % players.length;
                    player.setState("playerTarget", targetIndex, true);
                    target = players[targetIndex];
                }

                console.log("Punch target", target.id);
                if (target.getState("shield")) {
                    console.log("Target is shelded");
                    success = false;
                    break;
                }
                if (target.getState("gems") > 0) {
                    target.setState("gems", target.getState("gems") - 1, true);
                    setGems(getState("gems") + 1, true);
                    console.log("targ has gems")
                }
                break;
            case "grab":
                if (getState("gems") > 0) {
                    player.setState("gems", player.getState("gems") + 1, true);
                    setGems(getState("gems") - 1, true);
                    console.log("Grabbed Gem");
                }
                else {
                    console.log("no gems available");
                    success = false;
                }
                break;
            case "shield":
                console.log("shield");
                player.setState("shield", true, true);
                break;
            default:
                break;

        }
        setActionSuccess(success, true);
    };
    const removePlayerCard = () => {
        const player = players[getState("playerTurn")];
        const cards = player.getState("cards");
        const selectedCard = player.getState("selectedCard");
        cards.splice(selectedCard, 1);
        player.setState("cards", cards, true);
    };

    const getCard = () => {
        const player = players[getState("playerTurn")];
        if (!player) {
            return "";
        }
        const cards = player.getState("cards");
        if (!cards) {
            return "";
        }

        const selectedCard = player.getState("selectedCard");
        return cards[selectedCard];
    };
    const phaseEnd = () => {
        let newTime = 0;
        switch (getState("phase")) {
            case "cards":
                if (getCard() === "punch") {
                    setPhase("playerChoice", true);
                    newTime = TIME_PHASE_PLAYER_CHOICE;
                } else {
                    performPlayerAction();
                    setPhase("playerAction", true)
                    newTime = TIME_PHASE_PLAYER_ACTION;
                }
                break;
            case "playerChoice":
                performPlayerAction();
                setPhase("playerAction", true);
                newTime = TIME_PHASE_PLAYER_ACTION;
                break;
            case "playerAction":
                removePlayerCard();
                const newPlayerTurn = (getState("playerTurn") + 1) % players.length;
                if (newPlayerTurn === getState("playerStart")) {
                    if (getState("round") === NB_ROUNDS) {
                        console.log("End game");
                        let maxGems = 0;
                        players.forEach((player) => {
                            if (player.getState("gems") > maxGems) {
                                maxGems = player.getState("gems")
                            }
                        });
                        players.forEach((player) => {
                            player.setState(
                                "winner",
                                player.getState("gems") === maxGems,
                                true
                            );
                            player.setState("cards", [], true);
                        });
                        setPhase("end", true);
                    } else {
                        console.log("Next Round");
                        const newPlayerStart = (getState("playerStart") + 1) % players.length;
                        setPlayerStart(newPlayerStart, true);
                        setPlayerTurn(newPlayerStart, true);
                        setRound(getState("round") + 1, true);
                        distributeCards(1);
                        setPhase("cards", true);
                        newTime = TIME_PHASE_CARDS;
                    }
                } else {
                    setPlayerTurn(newPlayerTurn, true);
                    if (getCard() === "punch") {
                        setPhase("playerChoice", true);
                        newTime = TIME_PHASE_PLAYER_CHOICE;
                    } else {
                        performPlayerAction();
                        setPhase("playerAction", true);
                        newTime = TIME_PHASE_PLAYER_ACTION;
                    }
                }
                break;
            default:
                break;
        }
        setTimer(newTime, true);
    };
    return (
        <GameEngineContext.Provider value={{
            ...gameState,
            startGame,
            getCard
        }}>
            {children}
        </GameEngineContext.Provider>
    );
};
export const useGameEngine = () => {
    const context = React.useContext(GameEngineContext);
    if (context === undefined) {
        throw new Error("UseGameEngine must be used within GmaeEngineProviders");
    }
    return context;
}