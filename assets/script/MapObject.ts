import { _decorator, Color, Component, EventMouse, Input, input, Label, Node, NodeEventType, Sprite } from 'cc';
import { MapObjectType as MapObjectType } from './GameMap';
import { Coordinate, GameObject } from './GameObject';
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
const { ccclass, property } = _decorator;

export interface MapObjectDat {
    index: number,
    coordinate: Coordinate,
    objectType: MapObjectType
}

@ccclass('MapObject')
export class MapObject extends GameObject {

    @property(Sprite)
    objectSp: Sprite;

    @property(Label)
    debugInfo: Label;

    private _index: number;
    private _objectType: MapObjectType

    protected onLoad(): void {
        this.node.on(NodeEventType.MOUSE_DOWN, this.clickMySelf, this);
    }

    public setDat(dat: MapObjectDat) {
        this._index = dat.index;
        this.setCoordinate(dat.coordinate);
        this._objectType = dat.objectType;
        this.setSp();
        this.debugInfo.string = `index:${this._index} \n x:${dat.coordinate.x} y:${dat.coordinate.y} \n worldPos:${this.node.getWorldPosition().toString()}`;
    }

    private setSp() {
        switch (this._objectType) {
            case MapObjectType.ROAD:
                this.objectSp.color = Color.GRAY;
                break;
            case MapObjectType.WALL:
                this.objectSp.color = Color.WHITE;
                break;
        }
    }

    public getType() {
        return this._objectType;
    }

    public clickMySelf(event: EventMouse) {
        if (event.getButton() != 0) return;
        if (this._objectType == MapObjectType.ROAD) {
            GlobalEventTarget.emit(GameEvent.AStarStart, this.getCoordinate());
        }
    }

}


