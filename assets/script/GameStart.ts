import { _decorator, Component, Node, js, Layout, dynamicAtlasManager, instantiate, director, game, Game, Camera } from 'cc';
import { NodeUtil } from './NodeUtil';
import { GameMap, MapObjectType } from './GameMap';
import { AStar } from './AStar';
import { Coordinate } from './GameObject';
import { MapObject, MapObjectOrientation } from './MapObject'
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
import { MapUtil } from './MapUtil';
import { Enemy } from './Enemy';
import { Player } from './Player';
import { SettingLayer } from './SettingLayer';
import { GameMgr, GameMode } from './GameMgr';
import { CameraController } from './CameraController';
import { CameraFollwer } from './CameraFollwer';
const { ccclass, property } = _decorator;

@ccclass('GameStart')
export class GameStart extends Component {
    @property(Node)
    mapSc: Node;

    @property(Enemy)
    enemy: Enemy;

    @property(Player)
    player: Player;

    @property(Node)
    drawLayer: Node;

    @property(Node)
    mapNd: Node;

    @property
    mapFrontOffset: number = 0;

    @property(SettingLayer)
    setLayer: SettingLayer;

    @property(CameraController)
    camController: CameraController;

    @property(Camera)
    camera: Camera;

    @property(CameraFollwer)
    cameraFollwer: CameraFollwer;

    private _size = 0;
    private _map: GameMap;

    private _enemyStartCord: Coordinate = { x: 1, y: 1 };
    private _playerStartCord: Coordinate = { x: 4, y: 2 };

    private reEvents() {
        GlobalEventTarget.on(GameEvent.AStarStart, this.AStarStart, this);
        GlobalEventTarget.on(GameEvent.GameModeChange, this.changeGameMode, this);
    }

    protected onLoad(): void {
        dynamicAtlasManager.enabled = false;
        this.reEvents();
        this.createMap();
        this.createFront();
        new MapUtil(this.mapSc, this._map);
        this.createCreature();
        const mode = GameMgr.Instance.getGameMode();
        this.camController.enabled = (mode == GameMode.EDITOR);
        this.cameraFollwer.enabled = (mode == GameMode.PLAY);
        this.setLayer.changeModeLb(mode);
    }

    protected start(): void {
        //在onload设置相机会被改回场景初始值
        const mode = GameMgr.Instance.getGameMode();
        const value = mode == GameMode.EDITOR ? 1000 : 320;
        this.camera.orthoHeight = value;
    }

    private changeGameMode() {
        const gameMode = GameMgr.Instance.getGameMode();
        let newMode;
        if (gameMode == GameMode.PLAY) newMode = GameMode.EDITOR;
        else if (gameMode == GameMode.EDITOR) newMode = GameMode.PLAY;
        GameMgr.Instance.setGameMode(newMode);
        this.setLayer.changeModeLb(newMode);
        director.loadScene('AStar');
    }


    private createMap() {
        this._map = new GameMap();
        const mapDats = this._map.getMapDat1D();
        const mapDirs = this._map.getMapOrientation1D();
        this._size = this._map.getSize();
        this.mapSc.getComponent(Layout).constraintNum = this._size;
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
                objectType: dat as MapObjectType,
                orientation: mapDirs[index] as MapObjectOrientation
            })
        });

    }

    private createFront() {
        const nd = instantiate(this.mapNd);
        nd.name = "MapFront";
        nd.setParent(this.drawLayer);
        const pos = nd.getPosition();
        nd.setPosition(pos.x, pos.y + this.mapFrontOffset, pos.z);
        const mapDats = this._map.getMapDat1D();
        const mapDirs = this._map.getMapOrientation1D();
        nd.children[0].children.forEach((item, index) => {
            item.getComponent(MapObject).setDat({
                index: index,
                coordinate: {
                    x: index % this._size,
                    y: Math.floor(index / this._size)
                },
                objectType: mapDats[index] as MapObjectType,
                orientation: mapDirs[index] as MapObjectOrientation
            })
            if (item.getComponent(MapObject).getType() == MapObjectType.ROAD) item.children[0].active = false;
        })
    }

    private createCreature() {
        this.enemy.setDat({ coordinate: this._enemyStartCord });
        this.player.setDat({ coordinate: this._playerStartCord });
    }

    private AStarStart(end: Coordinate) {
        if (!this.enemy) return;
        const enemyPos = this.enemy.getCoordinate();
        //console.log(`开始寻路  起点：{x:${enemyPos.x},y:${enemyPos.y}}  终点：{x:${end.x},y:${end.y}}`);
        const road: Coordinate[] = AStar.CalculateRoad(this._map.getMapDat2D(), enemyPos, end);
        if (!road || road.length == 0) {
            //console.log("没有道路!!!");
            return;
        }
        if (road[0].x === enemyPos.x && road[0].y === enemyPos.y) {
            road.shift();
        }
        if (road.length == 0) {
            //console.log("不需移动");
            return;
        }
        this.enemy.moveRoad(road);
    }

    public getGameMap() {
        return this._map;
    }


    protected onDestroy(): void {
        GlobalEventTarget.off(GameEvent.AStarStart, this.AStarStart, this);
        GlobalEventTarget.off(GameEvent.GameModeChange, this.changeGameMode, this);
    }


}


