/**
 * 描述: 请注意 该脚本只适合 单列或者单行的情况下使用 且同时身上使用了layout
 * 如果layout是横向的 那么你这里只能使用纵向的 反之亦然
 * 如果是多列或者多行也只会选择最右边或者下边的节点位置作为依据
 * 且如果是横向宽度 那个父节点的锚点x为0 纵向的话 y要为1 也就是确保x一定是正数 y一定是负数
 */

import { _decorator, Component, director, Director, Enum, Layout, NodeEventType, UITransform } from "cc";
const { ccclass, property } = _decorator;

/**
 * @en Layout type.
 *
 * @zh 布局类型。
 */
enum Type {
    /**
     *
     * @zh 水平。
     */
    HORIZONTAL = 1,

    /**
     *
     * @zh 垂直。
     */
    VERTICAL = 2,
}

@ccclass("SizeLayout")
export class SizeLayout extends Component {
    @property({ type: Enum(Type) })
    policy = Type.HORIZONTAL;

    private _layout: Layout;

    protected onLoad(): void {
        this._layout = this.getComponent(Layout);
    }

    protected onEnable(): void {
        this.node.on(NodeEventType.ANCHOR_CHANGED, this.updateLayout, this);
        director.on(Director.EVENT_AFTER_UPDATE, this.updateLayout, this);
        this.updateLayout();
    }

    public updateLayout() {
        const hasActArr = this.node.children.filter(child => child.active)
        const hasAct = hasActArr.length > 0;
        this._layout && (this._layout.enabled = hasAct);
        if (hasAct) {
            let maxWidth = 0;
            let maxHeight = 0;
            const parentNodeTrans = this.node.getComponent(UITransform);
            const parentAnchor = parentNodeTrans.anchorPoint;
            const parentPos = this.node.getWorldPosition();
            hasActArr.forEach((childNd) => {
                const childUITfm = childNd.getComponent(UITransform);
                const childPos = childNd.getWorldPosition();
                const childUpborder = childPos.y + Math.abs(childUITfm.height * (1 - childUITfm.anchorY));
                const childBottomborder = childPos.y - Math.abs(childUITfm.height * childUITfm.anchorY) + childPos.y;
                const childLeftborder = childPos.x - Math.abs(childUITfm.width * childUITfm.anchorX);
                const childRightborder = childPos.x + Math.abs(childUITfm.width * (1 - childUITfm.anchorX));
                let nowWidth = 0;
                let nowHeight = 0;
                if (parentPos.x >= childLeftborder && parentPos.x <= childRightborder) {
                    const delayLeft = parentPos.x - childLeftborder;
                    const delayRight = childRightborder - parentPos.x;
                    const left = delayLeft / parentAnchor.x;
                    const right = delayRight / parentAnchor.y;
                    nowWidth = Math.max(left, right);
                }
                else if (parentPos.x > childRightborder) {
                    const delayLeft = parentPos.x - childLeftborder;
                    const left = delayLeft / parentAnchor.x;
                    nowWidth = left;
                }
                else {
                    const delayRight = childRightborder - parentPos.x;
                    const right = delayRight / (1 - parentAnchor.x);
                    nowWidth = right;
                }

                if (parentPos.y <= childUpborder && parentPos.y >= childBottomborder) {
                    const delayBottom = parentPos.x - childBottomborder;
                    const delayUp = childUpborder - parentPos.x;
                    const bottom = delayBottom / parentAnchor.y;
                    const up = delayUp / (1 - parentAnchor.y);
                    nowHeight = Math.max(bottom, up);
                }
                else if (parentPos.y > childUpborder) {
                    const delayBottom = parentPos.y - childBottomborder;
                    const bottom = delayBottom / parentAnchor.y;
                    nowHeight = bottom;
                }
                else {
                    const delayUp = childUpborder - parentPos.y;
                    const up = delayUp / (1 - parentAnchor.y);
                    nowHeight = up;
                }

                maxWidth = Math.max(maxWidth, nowWidth);
                maxHeight = Math.max(maxHeight, nowHeight);
            });
            if (this.policy == Type.HORIZONTAL) this.node._uiProps.uiTransformComp!.width = maxWidth;
            if (this.policy == Type.VERTICAL) this.node._uiProps.uiTransformComp!.height = maxHeight;
        }
        else {
            if (this.policy == Type.HORIZONTAL) this.node._uiProps.uiTransformComp!.width = 0;
            if (this.policy == Type.VERTICAL) this.node._uiProps.uiTransformComp!.height = 0;
        }
    }

    protected onDisable() {
        this.node.off(NodeEventType.ANCHOR_CHANGED, this.updateLayout, this);
        director.off(Director.EVENT_AFTER_UPDATE, this.updateLayout, this);
    }
}
