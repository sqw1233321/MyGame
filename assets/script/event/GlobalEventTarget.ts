import CustomEventTarget from "./CustomEventTarget";

export enum GameEvent {
    AStarStart = "AStarStart"
}

export const GlobalEventTarget = new CustomEventTarget()
