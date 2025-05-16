import { _decorator, Component, Node, UITransform, Vec2, Vec3 } from 'cc';
import { TextureClip } from './TextureClip';
import { NodeUtil } from '../NodeUtil';
const { ccclass, property } = _decorator;

@ccclass('TestNode')
export class TestNode extends Component {
    @property(TextureClip)
    textureClip: TextureClip;

    @property(Node)
    parentNd: Node;

    protected start(): void {
        const pixels = this.textureClip.getPiexlsByRGBA({ g: 15 });
        const nodeSize = this.textureClip.getSize();
        const showSp = this.textureClip.getShowSp();
        console.log("pixels  is  ", pixels);
        const posArr: Vec3[] = [];
        const showSpUI = showSp.node.getComponent(UITransform);
        pixels.forEach(pixelPos => {
            const rateX = pixelPos.x / nodeSize.width;
            const rateY = pixelPos.y / nodeSize.height;
            //距离spriteFrame左上角的位置
            const offsetX = showSpUI.width * rateX;
            const offsetY = showSpUI.height * rateY;
            //左上角移动到spriteframe的锚点
            const realSpOffsetX = -showSpUI.anchorX * nodeSize.width;
            const realSpOffsetY = (1 - showSpUI.anchorY) * nodeSize.height;
            //相对于spriteFrame的位置
            const realOffsetX = (offsetX + realSpOffsetX) * showSp.node.getScale().x;
            const realOffsetY = (realSpOffsetY - offsetY) * showSp.node.getScale().y;
            //世界坐标
            const showSpPos = showSp.node.getWorldPosition();
            const worldPos = new Vec3(showSpPos.x + realOffsetX, showSpPos.y + realOffsetY);
            //相对于父节点的位置
            const realPos = this.parentNd.getComponent(UITransform)?.convertToNodeSpaceAR(worldPos);
            posArr.push(realPos);
        })

        NodeUtil.autoRefreshChildren(this.parentNd, posArr, (item, index, pos) => {
            item.setPosition(pos);
        })

    }

}


