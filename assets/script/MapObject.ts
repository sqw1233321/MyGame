import { _decorator, Color, Component, EventMouse, Input, input, Label, Node, NodeEventType, resources, Sprite, SpriteFrame, Texture2D } from 'cc';
import { MapObjectType as MapObjectType } from './GameMap';
import { Coordinate, GameObject } from './GameObject';
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
import { SpritePacks } from './SpritePacks';
const { ccclass, property } = _decorator;

export interface MapObjectDat {
    index: number,
    coordinate: Coordinate,
    objectType: MapObjectType,
    orientation: MapObjectOrientation
}

export enum MapObjectOrientation {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

@ccclass('MapObject')
export class MapObject extends GameObject {

    @property(Sprite)
    objectSp: Sprite;

    @property(Label)
    debugInfo: Label;

    @property
    spRotOffset = 0;

    @property(Texture2D)
    wallTexture: Texture2D;

    private _index: number;
    private _objectType: MapObjectType
    private _dir: MapObjectOrientation;

    protected onLoad(): void {
        this.node.on(NodeEventType.MOUSE_DOWN, this.clickMySelf, this);
    }

    public setDat(dat: MapObjectDat) {
        this._index = dat.index;
        this._dir = dat.orientation;
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
                const frame = new SpriteFrame();
                frame.texture = this.wallTexture;
                this.objectSp.getComponent(Sprite).spriteFrame = frame;
                this.objectSp.getComponent(SpritePacks).setInitCb(() => {
                    this.setRot();
                });
                this.objectSp.getComponent(SpritePacks).enabled = true;
                break;
        }
    }

    private setRot() {
        if (!this._dir) return;
        let z = 0;
        switch (this._dir) {
            case MapObjectOrientation.UP:
                z = 0;
                break;
            case MapObjectOrientation.DOWN:
                z = 180
                break;
            case MapObjectOrientation.LEFT:
                z = 90
                break;
            case MapObjectOrientation.RIGHT:
                z = -90
                break;
        }
        this.objectSp.node.children.forEach(item => {
            item.setRotationFromEuler(0, 0, z);
        })
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


