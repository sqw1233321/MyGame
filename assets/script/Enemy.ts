import { _decorator, Component, Node } from 'cc';
import { CreatureObject } from './CreatureObject';
import { Coordinate } from './GameObject';
import { MapUtil } from './MapUtil';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends CreatureObject {
    public moveRoad(road: Coordinate[]) {
        const posVec = MapUtil.cordInvetLocalPosVecArr(this.node.parent, road);
        const nextStep = () => {
            if (posVec.length <= 0) return;
            const pos = posVec.shift();
            this.move(pos, nextStep);
        };
        nextStep();
    }



}


