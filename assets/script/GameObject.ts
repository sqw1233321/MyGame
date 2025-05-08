import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface Coordinate {
    x: number,
    y: number
}


@ccclass('GameObject')
export class GameObject extends Component {
    private _coordinate: Coordinate;

    protected setCoordinate(dat: Coordinate) {
        this._coordinate = { x: dat.x, y: dat.y };
    }

    public getCoordinate() {
        return this._coordinate;
    }

    public getSquareSize() {
        return 100;
    }
}


