import { _decorator, Component, Node, Tween, tween, UITransform, Vec3 } from 'cc';
import { Coordinate, GameObject } from './GameObject';
import { MapUtil } from './MapUtil';
const { ccclass, property } = _decorator;

export interface CreatureDat {
    coordinate: Coordinate
}

@ccclass('CreatureObject')
export class CreatureObject extends GameObject {
    public setDat(dat: CreatureDat) {
        this.setCoordinate(dat.coordinate);
        const localPos = MapUtil.cordInvetWorldPosVec(dat.coordinate);
        this.node.setWorldPosition(localPos);
    }

    public getCoordinate() {
        return MapUtil.worldVecInvertCord(this.node.getWorldPosition());
    }

    public move(pos: Vec3, cb: () => void) {
        Tween.stopAllByTarget(this.node);
        tween(this.node).to(0.3, { position: pos }, { easing: 'cubicInOut' }).call(() => { cb(); }).start();
    }

}


