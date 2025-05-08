import { _decorator, Component, EventKeyboard, input, Input, KeyCode, Node, Vec3 } from 'cc';
import { CreatureObject } from './CreatureObject';
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
import { MapUtil } from './MapUtil';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends CreatureObject {
    @property
    public moveSpeed: number = 200; // 每秒移动多少像素

    private direction = new Vec3(0, 0, 0);
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
        this.direction.set(0, 0, 0);
        if (this.keyMap[KeyCode.KEY_W]) this.direction.y += 1;
        if (this.keyMap[KeyCode.KEY_S]) this.direction.y -= 1;
        if (this.keyMap[KeyCode.KEY_A]) this.direction.x -= 1;
        if (this.keyMap[KeyCode.KEY_D]) this.direction.x += 1;

        if (this.direction.lengthSqr() > 0) {
            this.direction.normalize();
            this.node.setPosition(this.node.position.clone().add(this.direction.multiplyScalar(this.moveSpeed * dt)));
            GlobalEventTarget.emit(GameEvent.AStarStart, MapUtil.worldVecInvertCord(this.node.getWorldPosition()));
        }
    }
}


