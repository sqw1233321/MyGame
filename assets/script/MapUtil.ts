import { _decorator, Component, Node, UITransform, Vec2, Vec3 } from 'cc';
import { Coordinate } from './GameObject';
import { MapObject } from './MapObject';
import { GameMap, MapObjectType } from './GameMap';
const { ccclass, property } = _decorator;

@ccclass('MapUtil')
export class MapUtil {
    private _mapSc: Node;
    private _gameMap: GameMap;
    static _ins: MapUtil;

    constructor(MapSc: Node, GameMap: GameMap) {
        this._mapSc = MapSc;
        this._gameMap = GameMap;
        MapUtil._ins = this;
    }

    public static cordInvetWorldPosVecArr(cords: Coordinate[]): Vec3[] {
        const res = [];
        cords.forEach(cord => {
            res.push(this.cordInvetWorldPosVec(cord));
        })
        return res;
    }

    public static cordInvetWorldPosVec(cord: Coordinate): Vec3 {
        const mapObejct = MapUtil._ins._mapSc.children.find((item) => {
            const c = item.getComponent(MapObject).getCoordinate();
            if (c.x == cord.x && c.y == cord.y) return true;
        })
        return mapObejct.getWorldPosition();
    }

    public static cordInvetLocalPosVecArr(targetNode: Node, cords: Coordinate[]): Vec3[] {
        const res = [];
        cords.forEach(cord => {
            res.push(this.cordInvetLocalPosVec(targetNode, cord));
        })
        return res;
    }

    public static cordInvetLocalPosVec(targetNode: Node, cord: Coordinate): Vec3 {
        const mapObejct = MapUtil._ins._mapSc.children.find((item) => {
            const c = item.getComponent(MapObject).getCoordinate();
            if (c.x == cord.x && c.y == cord.y) return true;
        })
        return targetNode.getComponent(UITransform)?.convertToNodeSpaceAR(mapObejct.getWorldPosition());
    }

    public static worldVecInvertCord(worldPos: Vec3) {
        const mapObejct = MapUtil._ins._mapSc.children.find((item) => {
            const c = item.getComponent(MapObject).node.getWorldPosition();
            const size = item.getComponent(MapObject).getSquareSize() * 0.9;
            if (worldPos.x < c.x + size && worldPos.x > c.x - size
                && worldPos.y < c.y + size && worldPos.y > c.y - size)
                return true;
        })
        return mapObejct?.getComponent(MapObject).getCoordinate();
    }

    public static getMapDatByCoordinate(cord: Coordinate): MapObjectType {
        const mapDat = MapUtil._ins._gameMap.getMapDat2D();
        return mapDat?.[cord.y]?.[cord.x] ?? null;
    }

    public static getCanGoByCoordinate(cord: Coordinate) {
        const type = this.getMapDatByCoordinate(cord);
        return [MapObjectType.ROAD].findIndex(t => t == type) != -1;
    }

}


