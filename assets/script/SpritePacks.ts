import { _decorator, Component, Node, Rect, Sprite, SpriteFrame, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpritePacks')
export class SpritePacks extends Component {
    //列
    @property
    col = 1;

    //行
    @property
    row = 1;

    //堆叠距离
    @property
    distance = 3;

    @property
    scale = 1;

    @property(Boolean)
    openDebug: Boolean = false;

    private _spPacks: SpriteFrame[];

    private _initCb;

    public setInitCb(cb) {
        this._initCb = cb;
    }

    protected start(): void {
        this._spPacks = this.createSubSpriteFrame();
        this.startPack();
        this._initCb?.();
    }


    private createSubSpriteFrame(): SpriteFrame[] {
        const bigSprite = this.getComponent(Sprite)?.spriteFrame;
        if (!bigSprite) return;
        const texture = bigSprite.texture;

        const width = texture.width;
        const height = texture.height;

        const tileWidth = width / this.col;
        const tileHeight = height / this.row;


        const res: SpriteFrame[] = [];

        for (let i = 0; i < this.row; i++) {
            const nowRow = i;
            for (let j = 0; j < this.col; j++) {
                const nowCol = j;
                const frame = new SpriteFrame();
                frame.texture = texture;
                // rect 从左下角开始计算
                frame.rect = new Rect(nowCol * tileWidth, texture.height - (nowRow + 1) * tileHeight, tileWidth, tileHeight);
                res.push(frame);
            }
        }
        return res;
    }

    private startPack() {
        if (!this._spPacks) return;
        // 清理旧的
        this.node.removeAllChildren();
        // 堆叠效果
        for (let i = 0; i < this._spPacks.length; ++i) {
            const sp = this._spPacks[i];
            const spriteNode = new Node();
            spriteNode.layer = this.node.layer;
            spriteNode.setPosition(new Vec3(0, this.distance * i * this.scale, 0));
            spriteNode.setScale(this.scale, this.scale, 1);
            spriteNode.setRotationFromEuler(0, 0, this.node.eulerAngles.z);  // 模拟 image_angle
            const sprite = spriteNode.addComponent(Sprite);
            sprite.spriteFrame = sp;
            this.node.addChild(spriteNode);
        }
        this.getComponent(Sprite).enabled = false;
    }

    protected update(dt: number): void {
        if (!this.openDebug) return;
        this.node.children.forEach((nd) => {
            const speed = 90; // 每秒旋转角度（度）
            const currentRotation = nd.eulerAngles.z;
            nd.setRotationFromEuler(0, 0, currentRotation + speed * dt);
        })
    }

}


