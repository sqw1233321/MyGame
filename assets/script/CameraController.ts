import { __private, _decorator, Camera, Component, EPhysics2DDrawFlags, ERaycast2DType, EventMouse, EventTouch, input, Input, Node, NodeEventType, PhysicsSystem, PhysicsSystem2D, Vec2, Vec3 } from 'cc';
import { GameMgr, GameMode } from './GameMgr';
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
        this.touch(event);
    }

    onTouchMove(event: EventMouse) {
        this.touch(event);
    }

    onTouchUp(event: EventMouse) {
        this.touch(event);
    }

    private touch(event: EventMouse) {
        const mode = GameMgr.Instance.getGameMode();
        if (mode == GameMode.PLAY) return;
        const type: Input.EventType = event.getType() as Input.EventType;
        switch (type) {
            case Input.EventType.MOUSE_DOWN:
                if (event.getButton() != 2) return;
                this.isDragging = true;
                this.lastPos.set(event.getLocationX(), event.getLocationY(), 0);
                break;
            case Input.EventType.MOUSE_MOVE:
                if (!this.isDragging) return;
                const currPos = new Vec3(event.getLocationX(), event.getLocationY(), 0);
                const delta = new Vec3(currPos.x - this.lastPos.x, currPos.y - this.lastPos.y, 0);
                this.lastPos.set(currPos);
                this.drawLayer.translate(new Vec3(delta.x * this.dragSpeed, delta.y * this.dragSpeed, 0));
                break;

            case Input.EventType.MOUSE_UP:
                if (event.getButton() != 2) return;
                this.isDragging = false;
                break;
            case Input.EventType.MOUSE_WHEEL:


                break;
        }
    }

    // onDestroy() {
    //     input.off(Input.EventType.TOUCH_START, this.onTouchDown, this);
    //     input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    //     input.off(Input.EventType.TOUCH_CANCEL, this.onTouchUp, this);
    // }
}


