import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')

export class test extends Component {

    @property(sp.Skeleton)
    skeleton: sp.Skeleton;

    @property(sp.SkeletonData)
    datSm: sp.SkeletonData;

    @property(sp.SkeletonData)
    datBig: sp.SkeletonData;

    start() {
        this.scheduleOnce(() => {
            this.skeleton.clearTracks()
        }, 1.5)
        // this.skeleton.setSkeletonData(this.datSm);
        this.skeleton.addAnimation(0, "skill1", false);
        this.skeleton.addAnimation(0, "dead", false);
        this.skeleton.addAnimation(0, "skill1", false);
        this.skeleton.addAnimation(0, "stand", false);
        this.skeleton.setCompleteListener(()=>{
            this.skeleton.node.setScale(0, 0, 0);
        })
    }
}


