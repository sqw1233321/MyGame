import { _decorator, Component, Node, js, Layout } from 'cc';
import { NodeUtil } from './NodeUtil';
import { GameMap, MapObjectType } from './GameMap';
import { AStar } from './AStar';
import { CreatureObject } from './CreatureObject';
import { Coordinate } from './GameObject';
import { MapObject } from './MapObject'
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
import { MapUtil } from './MapUtil';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;



@ccclass('GameMgr')
export class GameMgr extends Component {
    @property(Node)
    mapSc: Node;

    @property(Enemy)
    enemy: Enemy;

    private _size = 9;
    private _map: GameMap;
    private static _ins: GameMgr;

    private _startPos: Coordinate = { x: 1, y: 1 };

    static get Instance() {
        return GameMgr._ins;
    }

    protected onLoad(): void {
        GameMgr._ins = this;
        GlobalEventTarget.on(GameEvent.AStarStart, this.AStarStart, this);
        new MapUtil(this.mapSc);
        this.createMap();
        this.createCreature();
    }

    public emitEvent(key: string, ...dat) {
        this.node.emit(key, ...dat);
    }

    private createMap() {
        this._map = new GameMap();
        const mapDats = this._map.getMapDat1D();
        NodeUtil.autoRefreshChildren(this.mapSc, mapDats, (item, index, dat) => {
            //不然每个节点的位置都不会刷新
            this.mapSc.getComponent(Layout).updateLayout();
            //
            item.getComponent(MapObject).setDat({
                index: index,
                coordinate: {
                    x: index % this._size,
                    y: Math.floor(index / this._size)
                },
                objectType: dat as MapObjectType
            })
        });
    }

    private createCreature() {
        this.enemy.setDat({ coordinate: this._startPos });
    }

    private AStarStart(end: Coordinate) {
        const enemyPos = this.enemy.getCoordinate();
        console.log(`开始寻路  起点：{x:${enemyPos.x},y:${enemyPos.y}}  终点：{x:${end.x},y:${end.y}}`);
        const road: Coordinate[] = AStar.CalculateRoad(this._map.getMapDat2D(), enemyPos, end);
        if (!road || road.length == 0) {
            console.log("没有道路!!!");
            return;
        }
        if (road[0].x === enemyPos.x && road[0].y === enemyPos.y) {
            road.shift();
        }
        if (road.length == 0) {
            console.log("不需移动");
            return;
        }
        this.enemy.moveRoad(road);
    }


}


