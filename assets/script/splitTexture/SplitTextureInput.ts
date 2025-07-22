import { _decorator, Component, EventTouch, Graphics, Mat4, Node, Vec2, Vec3 } from 'cc';
import ToolsSplit from './ToolsSplit';
import { SplitRender } from './SplitRender';
import * as SplitHelper from "./helper"
import { splitNd } from './splitNd';
const { ccclass, property } = _decorator;

@ccclass('SplitTextureInput')
export class SplitTextureInput extends Component {

    @property(Node)
    lineTool: Node = null;

    @property(Node)
    sliceParent: Node;

    //是否点击碎片
    private _isSelectSlice: boolean = false;
    private _selectNd: Node = null;

    private _graphics: Graphics;
    private _splitTool: ToolsSplit;

    private startPoint: Vec2 = null;
    private endPoint: Vec2 = null;


    protected onLoad(): void {
        this._graphics = this.lineTool.getComponent(Graphics);
        this._splitTool = this.lineTool.getComponent(ToolsSplit);
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(e: EventTouch) {
        const [isSelectSlice, selectNd] = this.checkIsSelectSlice(e.getTouches()[0].getLocation(), true);
        this._isSelectSlice = isSelectSlice;
        this._selectNd = selectNd;
        console.log("   selectSlice  is ", isSelectSlice);
        this._graphics.enabled = !isSelectSlice;
        if (this._isSelectSlice) {
        }
        else {
            this.startPoint = e.getUILocation();
        }
    }

    onTouchMove(e: EventTouch) {
        if (this._isSelectSlice) {
            const sliceNd = this._selectNd;
            const worldPos = e.getTouches()[0].getLocation();
            const offset = sliceNd.getComponent(splitNd).getOffset();
            worldPos.x += offset.x;
            worldPos.y += offset.y;
            sliceNd.setWorldPosition(new Vec3(worldPos.x, worldPos.y, 0));
        }
        else {
            this._graphics.clear();
            this._graphics.moveTo(this.startPoint.x, this.startPoint.y);
            let p = e.getUILocation();
            this._graphics.lineTo(p.x, p.y);
            this._graphics.stroke();
        }
    }

    onTouchEnd(e: EventTouch) {
        if (this._isSelectSlice) {

        }
        else {
            this._graphics.clear();
            this.endPoint = e.getUILocation();
            this._splitTool.useLineCutPolygon(this.startPoint, this.endPoint);
        }
    }

    //是否点击到了碎片上
    checkIsSelectSlice(pos: Vec2, isWorld): [boolean, Node] {
        let res = false;
        let nd: Node;
        //让上面（后面的子节点）的被点到 不影响原数组
        const reversed = [...this.sliceParent.children].reverse();
        for (const item of reversed) {
            const renderComp = item.getComponent(SplitRender);
            const polygon = renderComp.polygon;
            let point = new Vec3();
            if (isWorld) {
                const worldMat = item.worldMatrix;
                let localMat = new Mat4();
                Mat4.invert(localMat, worldMat);
                Vec3.transformMat4(point, new Vec3(pos.x, pos.y, 0), localMat);
            }
            else {
                point.x = pos.x;
                point.y = pos.y;
                point.z = 0;
            }
            const isIn = SplitHelper.isInPolygon(new Vec2(point.x, point.y), polygon);
            res = isIn;
            if (isIn) {
                nd = item;
                break;
            }
        }
        return [res, nd];
    }

}


