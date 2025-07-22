import { _decorator, Component, Label, LabelOutline, Node, sp } from "cc";
const { ccclass, property } = _decorator;

@ccclass("test")
export class test extends Component {
    @property(sp.SkeletonData)
    datSm: sp.SkeletonData;

    @property(sp.SkeletonData)
    datBig: sp.SkeletonData;

    @property(Label)
    testLb: Label;

    start() {
        console.log(this.testLb.materials);
        console.log(this.testLb.getComponent(LabelOutline).materials);
    }
}
