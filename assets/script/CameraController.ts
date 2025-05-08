import { _decorator, Camera, Component, EPhysics2DDrawFlags, ERaycast2DType, EventMouse, EventTouch, input, Input, Node, NodeEventType, PhysicsSystem, PhysicsSystem2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    private isDragging = false;
    private lastPos = new Vec3();

    @property
    public dragSpeed: number = 1; // 控制灵敏度

    @property(Node)
    drawLayer: Node;

    start() {
        this.node.on(NodeEventType.MOUSE_DOWN, this.onTouchDown, this);
        this.node.on(NodeEventType.MOUSE_MOVE, this.onTouchMove, this);
        this.node.on(NodeEventType.MOUSE_UP, this.onTouchUp, this);
    }

    onTouchDown(event: EventMouse) {
        if (event.getButton() != 1) return;
        this.isDragging = true;
        this.lastPos.set(event.getLocationX(), event.getLocationY(), 0);
    }

    onTouchMove(event: EventMouse) {
        if (!this.isDragging) return;
        const currPos = new Vec3(event.getLocationX(), event.getLocationY(), 0);
        const delta = new Vec3(currPos.x - this.lastPos.x, currPos.y - this.lastPos.y, 0);
        this.lastPos.set(currPos);
        this.drawLayer.translate(new Vec3(delta.x * this.dragSpeed, delta.y * this.dragSpeed, 0));
    }

    onTouchUp(event: EventMouse) {
        if (event.getButton() != 1) return;
        this.isDragging = false;
    }

    // onDestroy() {
    //     input.off(Input.EventType.TOUCH_START, this.onTouchDown, this);
    //     input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    //     input.off(Input.EventType.TOUCH_CANCEL, this.onTouchUp, this);
    // }
}


