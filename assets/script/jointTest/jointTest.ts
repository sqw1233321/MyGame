import { _decorator, Component, ERigidBody2DType, EventMouse, Input, math, Node, NodeEventType, RigidBody2D, Vec2, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("jointTest")
export class jointTest extends Component {
    private startVec: Vec3;
    private moveVec: Vec3;
    private currPos: Vec3;
    private curAngel: number;

    private maxAngle = 45;

    private minAngle = -45;

    @property
    public dragSpeed: number = 1; // 控制灵敏度

    @property(Node)
    leftHand: Node;

    @property(Node)
    rightHand: Node;

    @property(Node)
    arrowNd: Node;

    @property([RigidBody2D])
    rb: RigidBody2D[] = [];

    start() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchDown, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(NodeEventType.TOUCH_END, this.onTouchUp, this);
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

    // private touch(event: EventMouse) {
    //     const type: Input.EventType = event.getType() as Input.EventType;
    //     switch (type) {
    //         case Input.EventType.TOUCH_START:
    //             this.isDragging = true;
    //             this.lastPos.set(event.getLocationX(), event.getLocationY(), 0);
    //             break;
    //         case Input.EventType.TOUCH_MOVE:
    //             if (!this.isDragging) return;
    //             const currPos = new Vec3(event.getLocationX(), event.getLocationY(), 0);
    //             const delta = new Vec3(currPos.x - this.lastPos.x, currPos.y - this.lastPos.y, 0);
    //             this.lastPos.set(currPos);
    //             //this.controllerBody.translate(new Vec3(delta.x * this.dragSpeed, delta.y * this.dragSpeed, 0));
    //             this.controllerBody.getComponent(RigidBody2D).linearVelocity = new Vec2(delta.x * this.dragSpeed, delta.y * this.dragSpeed);
    //             //this.controllerBody.setPosition(currPos);
    //             break;

    //         case Input.EventType.TOUCH_END:
    //             this.isDragging = false;
    //             break;
    //     }
    // }

    private touch(event: EventMouse) {
        const type: Input.EventType = event.getType() as Input.EventType;
        const armPos = this.rightHand.getWorldPosition();
        switch (type) {
            case Input.EventType.TOUCH_START:
                this.currPos = new Vec3(event.getLocationX(), event.getLocationY(), 0);
                this.startVec = armPos.subtract(this.currPos);
                this.curAngel = this.node.angle;
                this.leftHand.getComponent(RigidBody2D).type = ERigidBody2DType.Kinematic;
                break;
            case Input.EventType.TOUCH_MOVE:
                this.currPos = new Vec3(event.getLocationX(), event.getLocationY(), 0);
                this.moveVec = armPos.subtract(this.currPos);
                const angle = this.getAngleBetweenVectors(this.startVec, this.moveVec);
                const realAngle = this.curAngel + angle;
                if (realAngle > this.maxAngle || realAngle < this.minAngle) return;
                this.rightHand.angle = realAngle;
                break;
            case Input.EventType.TOUCH_END:
                this.leftHand.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
                break;
        }
        this.leftHand.setWorldPosition(this.arrowNd.getWorldPosition());
    }

    private getAngleBetweenVectors(a: Vec3, b: Vec3): number {
        const dot = a.dot(b); // 点积
        const lenProduct = a.length() * b.length(); // 长度乘积
        if (lenProduct === 0) return 0;
        let angleRad = Math.acos(dot / lenProduct); // 弧度
        let angleDeg = math.toDegree(angleRad); // 转换为角度
        const newA = new Vec3(a);
        const newB = new Vec3(b);
        const cross = newA.cross(newB); // 2D 叉积：正 = 逆时针，负 = 顺时针
        angleDeg = cross.z >= 0 ? angleDeg : -angleDeg;
        return angleDeg;
    }

    private setGravity(gravityNum: number) {
        this.rb.forEach((rigb) => (rigb.gravityScale = gravityNum));
    }
}
