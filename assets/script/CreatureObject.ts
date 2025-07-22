import { _decorator, Component, Node, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
import { Coordinate, GameObject } from './GameObject';
import { MapUtil } from './MapUtil';
const { ccclass, property } = _decorator;

export interface CreatureDat {
    coordinate: Coordinate
}

@ccclass('CreatureObject')
export class CreatureObject extends GameObject {
    @property(Node)
    sp: Node;

    @property
    moveStepDuration: number = 0.3;

    @property
    rotationSpeed: number = 0.15;

    @property
    spRotOffset = 0;

    protected _isMove: boolean;

    public setDat(dat: CreatureDat) {
        this.setCoordinate(dat.coordinate);
        const localPos = MapUtil.cordInvetWorldPosVec(dat.coordinate);
        this.node.setWorldPosition(localPos);
    }

    public getCoordinate() {
        return MapUtil.worldVecInvertCord(this.node.getWorldPosition());
    }

    public move(pos: Vec3, cb?: () => void) {
        Tween.stopAllByTarget(this.node);
        this.sp.children.forEach(item => {
            Tween.stopAllByTarget(item);
        })
        this._isMove = true;
        const dir = new Vec2(pos.x - this.node.position.x, pos.y - this.node.position.y);
        // 计算目标角度（0, 90, 180, 270）
        let targetAngle = 0;
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
            targetAngle = dir.x > 0 ? 0 : 180;
        } else {
            targetAngle = dir.y > 0 ? 90 : 270;
        }

        tween(this.node)
            .to(
                this.moveStepDuration,
                {
                    position: pos,
                },
                {
                    easing: 'quadInOut'
                })
            .call(() => {
                this._isMove = false;
                cb?.();
            }).start();

        this.sp.children.forEach(item => {
            const currentAngle = item.eulerAngles.z;
            // 计算最短路径的目标角度（避免旋转大圈）
            const shortestAngle = this.getShortestRotation(currentAngle, targetAngle) + this.spRotOffset;
            tween(item)
                .to(
                    this.rotationSpeed,
                    {
                        eulerAngles: new Vec3(0, 0, shortestAngle)
                    },
                    {
                        easing: 'cubicInOut'
                    }).start();
        })
    }

    private getShortestRotation(current: number, target: number): number {
        let delta = target - current;
        delta = ((delta + 180) % 360) - 180; // 变成 [-180, 180) 区间
        return current + delta;
    }

}


