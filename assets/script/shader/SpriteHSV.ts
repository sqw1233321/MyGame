import { _decorator, Component, resources, Material, v4, RenderComponent, Sprite, CCFloat } from "cc";
import { EDITOR } from "cc/env";
const { ccclass, property, requireComponent, executionOrder } = _decorator;

@ccclass("SpriteHSV")
@requireComponent(RenderComponent)
@executionOrder(999)
export class SpriteHSV extends Component {
    _ColorH: number = 0; //(-180,180)
    _ColorS: number = 0; //(-100,100)
    _ColorV: number = 0; //(-100,100)
    _ColorTYPE: number = 0;

    @property({ slide: true, step: 1, min: 0, max: 3 })
    get ColorTYPE() {
        return this._ColorTYPE;
    }
    set ColorTYPE(value: number) {
        this._ColorTYPE = value;
        this.SetColorHSV();
    }

    @property({ slide: true, step: 1, min: -180, max: 180 })
    get ColorH() {
        return this._ColorH;
    }
    set ColorH(value: number) {
        this._ColorH = value;
        this.SetColorHSV();
    }
    @property({ slide: true, step: 0.5, min: -100, max: 100 })
    get ColorS() {
        return this._ColorS;
    }
    set ColorS(value: number) {
        this._ColorS = value;
        this.SetColorHSV();
    }
    @property({ slide: true, step: 0.5, min: -100, max: 100 })
    get ColorV() {
        return this._ColorV;
    }
    set ColorV(value: number) {
        this._ColorV = value;
        this.SetColorHSV();
    }
    public SetColorHSV() {
        const render = this.getComponent(RenderComponent);
        const customMat = render?.customMaterial;
        if (!customMat) {
            console.log("请先添加自定义材质<< SpriteHSV >>再调试");
            return;
        }
        this.setMaterialProperty();
    }

    // public get noPackable() {
    //     return true;
    // }

    public start() {
        this.loadEffectMaterial();
    }

    public loadEffectMaterial() {
        resources.load("materials/sprite-hsv", Material, (err, mat: Material) => {
            const render = this.getComponent(RenderComponent);
            if (!render) return;
            render.customMaterial = mat;
            this.setMaterialProperty();
        });
    }

    private setMaterialProperty() {
        const material = this.getComponent(RenderComponent)?.material;
        if (!material) return;
        material.setProperty("ColorH", this._ColorH);
        material.setProperty("ColorS", this._ColorS / 100.0);
        material.setProperty("ColorV", this._ColorV / 100.0);
        material.setProperty("ColorTYPE", this._ColorTYPE);
    }
}
