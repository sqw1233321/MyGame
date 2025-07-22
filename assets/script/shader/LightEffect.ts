import { _decorator, Component, resources, Material, v4, RenderComponent, Sprite } from "cc";
import { EDITOR } from "cc/env";
const { ccclass, property, requireComponent, executionOrder } = _decorator;

@ccclass("lightEffect")
@requireComponent(RenderComponent)
@executionOrder(999)
export class LightEffect extends Component {
    @property
    lightTime: number = 2;

    @property
    lightInterval: number = 1;

    @property
    lightAngle: number = 70;

    @property({ tooltip: "节点宽度百分比" })
    lightWidth: number = 0.3;

    @property
    _testTime = 0;
    @property({ slide: true, step: 0.01, min: 0, max: 1 })
    get testTime() {
        return this._testTime;
    }

    set testTime(value) {
        this._testTime = value;
        if (!EDITOR) return;
        const render = this.getComponent(RenderComponent);
        const customMat = render?.customMaterial;
        if (!customMat) {
            console.log("请先添加自定义材质<< lightMaterial >>再调试");
            return;
        }
        const material = render?.material;
        material.setProperty("testTime", value);
        this.setMaterialProperty();
    }

    public get noPackable() {
        return true;
    }

    public start() {
        this.loadEffectMaterial();
    }

    public loadEffectMaterial() {
        // lightTimeV: { value: 30 }
        // lightAngle: { value: 70} #0~180
        // lightWidth: { value: 0.3} #0~180
        resources.load("materials/lightMaterial", Material, (err, mat: Material) => {
            const render = this.getComponent(RenderComponent);
            if (!render) return;
            render.customMaterial = mat;
            this.setMaterialProperty();
        });
    }

    private setMaterialProperty() {
        const material = this.getComponent(RenderComponent)?.material;
        if (!material) return;
        material.setProperty("lightTime", this.lightTime);
        material.setProperty("lightInterval", this.lightInterval);
        material.setProperty("lightAngle", this.lightAngle);
        material.setProperty("lightWidth", this.lightWidth);
        if (this.getComponent(Sprite)) {
            this.setSpriteProperty();
        }
    }

    private setSpriteProperty() {
        const sprite = this.getComponent(Sprite);
        const uv: number[] = sprite?.spriteFrame?.uv;
        if (!uv) return;
        let rotated = sprite.spriteFrame.rotated;
        //旋转之后uv所代表的值会有所改变
        let [uv0, uv1, uv2, uv3, uv4, uv5, uv6, uv7] = [...uv];
        let uvRoEnd = !rotated ? v4(uv0, uv6, uv7, uv1) : v4(uv0, uv3 - uv1 + uv0, uv1, uv4 - uv0 + uv1);
        let rotatedNum = rotated ? 1.0 : -1.0;
        const material = this.getComponent(RenderComponent)?.material;
        material.setProperty("spriteFrameUv", uvRoEnd);
        material.setProperty("spriteRotated", rotatedNum);
    }
}
