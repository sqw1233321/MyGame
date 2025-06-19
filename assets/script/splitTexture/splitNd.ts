import { _decorator, Component, EventTouch, Mat4, Node, Rect, Size, Sprite, UI, UITransform, Vec2, Vec3, Vec4 } from 'cc';
import * as SplitHelper from "./helper"
import { SplitRender } from './SplitRender';
const { ccclass, property } = _decorator;

@ccclass('splitNd')
export class splitNd extends Component {

    private _offset: Vec3;

    protected onLoad(): void {
        this.refreshOffset();
    }

    refreshOffset() {
        const renderComp = this.node.getComponent(SplitRender);
        const polygon = renderComp.polygon;;
        const anchor = this.node.getComponent(UITransform).anchorPoint;
        const point = this.getPolygonCentroid(polygon);
        this._offset = new Vec3(anchor.x - point.x, anchor.y - point.y, 0);
    }

    public getOffset() {
        return this._offset;
    }

    getPolygonCentroid(polygon: Vec2[]): Vec2 {
        let area = 0;
        let cx = 0, cy = 0;

        const len = polygon.length;
        for (let i = 0; i < len; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % len];

            const a = p1.x * p2.y - p2.x * p1.y;
            area += a;
            cx += (p1.x + p2.x) * a;
            cy += (p1.y + p2.y) * a;
        }

        area *= 0.5;
        const factor = 1 / (6 * area);
        return new Vec2(cx * factor, cy * factor);
    }

}


