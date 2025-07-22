import { _decorator, Component, Node, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestAdd')
export class TestAdd extends Component {
    @property(Node)
    parentNd: Node;

    @property(Node)
    childNd: Node;

    protected onLoad(): void {
        this.parentNd.on(NodeEventType.CHILD_ADDED, (child, index) => {
            console.log('HallLeft 子节点添加：', child.name);
            child.on(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, () => {
                console.log(`HallLeft ${child.name} active 状态变化: ${child.activeInHierarchy}`);
            }, this);
        }, this);

        this.scheduleOnce(() => { this.childNd.active = false; console.log("隐藏") }, 5)
        this.scheduleOnce(() => { this.childNd.active = true; console.log("显示") }, 10)
    }

}


