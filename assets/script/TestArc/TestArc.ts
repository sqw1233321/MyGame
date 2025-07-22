import { _decorator, Component, Node, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestArc')
export class TestArc extends Component {
    @property(Sprite)
    sp: Sprite;

    @property(Sprite)
    sp2: Sprite;

    private _mat;
    private _mat2;

    private _dt = 0;

    protected start(): void {
        this._mat = this.sp.getMaterialInstance(0);
        this.sp.spriteFrame.texture.setWrapMode(Texture2D.WrapMode.REPEAT, Texture2D.WrapMode.REPEAT);
        const tex = this.sp.spriteFrame.getGFXTexture();
        this._mat2 = this.sp2.getMaterialInstance(0);
    }

    protected update(dt: number): void {
        this._dt += dt;
        this._mat.setProperty('u_speed', 0.2);
        this._mat.setProperty('u_time', this._dt);
        this._mat2.setProperty('u_speed', 0.2);
        this._mat2.setProperty('u_time', this._dt);
    }
}


