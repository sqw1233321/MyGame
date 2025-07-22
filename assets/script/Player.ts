import { _decorator, Component, EventKeyboard, input, Input, KeyCode, Node, Vec3 } from 'cc';
import { CreatureObject } from './CreatureObject';
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
import { MapUtil } from './MapUtil';
import { Coordinate } from './GameObject';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends CreatureObject {
    private keyMap: { [key: number]: boolean } = {};

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        this.keyMap[event.keyCode] = true;
    }

    onKeyUp(event: EventKeyboard) {
        this.keyMap[event.keyCode] = false;
    }

    update(dt: number) {
        if (this._isMove) return;
        const nowCord = this.getCoordinate();
        const noxX = nowCord.x;
        const noxY = nowCord.y;
        const newCord: Coordinate = { x: noxX, y: noxY };
        if (this.keyMap[KeyCode.KEY_W]) newCord.y -= 1;
        else if (this.keyMap[KeyCode.KEY_S]) newCord.y += 1;
        else if (this.keyMap[KeyCode.KEY_A]) newCord.x -= 1;
        else if (this.keyMap[KeyCode.KEY_D]) newCord.x += 1;
        if (nowCord.x == newCord.x && nowCord.y == newCord.y) return;
        const canGo = MapUtil.getCanGoByCoordinate(newCord);
        console.log(`nowCord: {x:${nowCord.x} y:${nowCord.y}}  newCord: {x:${newCord.x} y:${newCord.y}}`);
        if (!canGo) {
            console.log("不能走")
            return;
        }
        const localPos = MapUtil.cordInvetLocalPosVec(this.node.parent, newCord);
        this.move(localPos);
        GlobalEventTarget.emit(GameEvent.AStarStart, newCord);
    }
}


