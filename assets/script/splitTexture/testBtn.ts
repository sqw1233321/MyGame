import { _decorator, Color, Component, dynamicAtlasManager, EventTouch, Node, NodeEventType, RenderTexture, Sprite, SpriteFrame, UITransform, Vec2 } from "cc";
import { TextureAnalysis } from "./TextureAnalysis";
const { ccclass, property } = _decorator;

@ccclass("testBtn")
export class testBtn extends Component {
    private _textureAnaly: TextureAnalysis;
    private _allAlphaPoint;

    protected start(): void {
        this.node.on(NodeEventType.TOUCH_END, this.onClickTest, this);
    }

    public onClickTest(param: EventTouch) {
        const loc = param.getUILocation();
        const btnNd = param.currentTarget as Node;
        const anchor = btnNd.getComponent(UITransform).anchorPoint;
        const btnPos = btnNd.getWorldPosition();
        const leftX = btnPos.x - anchor.x * btnNd.getComponent(UITransform).width;
        const upY = btnPos.y + (1 - anchor.y) * btnNd.getComponent(UITransform).height;
        //获得左上角坐标
        const leftPos = new Vec2(leftX, upY);
        const offset = new Vec2(Math.floor(loc.x - leftPos.x), Math.floor(leftPos.y - loc.y));
        console.log(offset.toString());
        if (!this._allAlphaPoint) {
            const text = this.node.addComponentSafe(Sprite).spriteFrame.original._texture;
            this._textureAnaly = new TextureAnalysis(text);
            this._allAlphaPoint = this._textureAnaly.getPiexlsByRGBA({ a: 0 }, true);
            // console.log(this._allAlphaPoint);
            // console.log(this._textureAnaly["_buffer"]);
        }
        const checkAlpha = !!this._allAlphaPoint.find((item) => {
            return item.x == offset.x && item.y == offset.y;
        });
        this.unscheduleAllCallbacks();
        this.node.getComponent(Sprite).color = new Color(255, 255, 255, 255);
        if (checkAlpha) return;
        this.unscheduleAllCallbacks();
        this.node.getComponent(Sprite).color = new Color(255, 0, 0, 255);
        this.scheduleOnce(() => {
            this.node.getComponent(Sprite).color = new Color(255, 255, 255, 255);
        }, 1);
        //console.log(this.node.name);
    }
}
