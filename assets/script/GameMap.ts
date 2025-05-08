import { _decorator, Component, Node } from 'cc';
import { Coordinate } from './GameObject';
const { ccclass, property } = _decorator;

export enum MapObjectType {
    ROAD = 0,
    WALL,
}

@ccclass('GameMap')
export class GameMap {
    private _mapDat = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    private _mapDat1D = null;

    constructor() {

    }

    public getMapDat2D() {
        return this._mapDat;
    }

    public getMapDat1D() {
        if (!this._mapDat1D) {
            this._mapDat1D = [];
            const map2D = this._mapDat;
            for (let y = 0; y < map2D.length; y++) {
                for (let x = 0; x < map2D[y].length; x++) {
                    this._mapDat1D.push(map2D[y][x]);
                }
            }
        }
        return this._mapDat1D;
    }

    public getSize() {
        return this._mapDat.length;
    }

}


