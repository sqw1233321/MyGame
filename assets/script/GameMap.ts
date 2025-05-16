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
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    private boxDirectionMap = [
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
        [1, -1, -1, -1, 2, -1, -1, -1, -1, 2, -1, -1, -1, -1, -1, 3],
        [1, -1, 2, -1, 2, -1, 2, 2, -1, 2, -1, 2, 2, 2, -1, 3],
        [1, -1, 2, -1, -1, -1, 4, -1, 2, 2, -1, -1, -1, 2, -1, 3],
        [1, -1, 3, 3, 3, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 3],
        [1, -1, -1, -1, 2, -1, -1, -1, 2, -1, -1, 2, -1, -1, -1, 3],
        [1, 1, 1, -1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 3],
        [1, -1, -1, -1, -1, -1, 2, -1, -1, -1, -1, -1, -1, 2, -1, 3],
        [1, -1, 1, 1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1, -1, 3],
        [1, -1, -1, -1, 2, -1, -1, -1, -1, -1, -1, 2, -1, 2, -1, 3],
        [1, 1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1, -1, 1, -1, 3],
        [1, -1, -1, -1, -1, -1, -1, -1, 2, -1, -1, -1, -1, 2, -1, 3],
        [1, -1, 2, 2, 2, 2, 2, -1, 3, 3, 3, 3, 3, 3, -1, 3],
        [1, -1, -1, -1, -1, -1, 2, -1, -1, -1, -1, -1, -1, -1, -1, 3],
        [1, 3, 3, 3, 3, -1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    ];

    private _mapDat1D = null;

    private _mapDatOri1D = null;

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

    public getMapOrientation1D() {
        if (!this._mapDatOri1D) {
            this._mapDatOri1D = [];
            const map2D = this.boxDirectionMap;
            for (let y = 0; y < map2D.length; y++) {
                for (let x = 0; x < map2D[y].length; x++) {
                    this._mapDatOri1D.push(map2D[y][x]);
                }
            }
        }
        return this._mapDatOri1D;
    }



    public getSize() {
        return this._mapDat.length;
    }

}


