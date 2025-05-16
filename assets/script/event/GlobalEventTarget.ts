import CustomEventTarget from "./CustomEventTarget";

export enum GameEvent {
    AStarStart = "AStarStart",
    GameModeChange = "GameModeChange",
}

export const GlobalEventTarget = new CustomEventTarget()
