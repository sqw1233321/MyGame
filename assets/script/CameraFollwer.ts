import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollwer')
export class CameraFollwer extends Component {
    @property(Node)
    target: Node = null!;

    @property
    smoothSpeed: number = 0.1;  // 跟随平滑程度，建议在 0.05 ~ 0.2 之间

    private _worldPos = new Vec3();
    private _targetPos = new Vec3();
    private _currentPos = new Vec3();

    update(dt: number) {
        this.target.getWorldPosition(this._worldPos);
        const cameraParent = this.node.parent!;
        cameraParent.inverseTransformPoint(this._targetPos, this._worldPos);
        this.node.getPosition(this._currentPos);
        Vec3.lerp(this._currentPos, this._currentPos, this._targetPos, this.smoothSpeed);
        this.node.setPosition(this._currentPos);
    }
}


