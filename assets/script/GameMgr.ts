import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum GameMode {
    PLAY = "PLAY",      //游玩模式
    EDITOR = "EDITOR"   //地图编辑模式
}

@ccclass('GameMgr')
export class GameMgr {
    private _gameMode: GameMode = GameMode.PLAY;

    private static _instance:GameMgr = null;

    public static get Instance():GameMgr {
        if (!this._instance) {
            this._instance = new GameMgr();
        }
        return this._instance;
    }

    public setGameMode(mode: GameMode) {
        this._gameMode = mode;
    }

    public getGameMode() {
        return this._gameMode;
    }


}


