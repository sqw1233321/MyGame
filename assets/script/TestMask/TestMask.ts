import { _decorator, Component, director, dynamicAtlasManager, gfx, ImageAsset, Node, path, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

interface Point { x: number; y: number };

@ccclass('TestMask')
export class TestMask extends Component {

    @property(Sprite)
    sp: Sprite;

    @property
    nodeAlpha: number = 50;

    //第几段路
    @property
    pathIndex: number = 0;

    @property
    stopRadius = 2;

    /** 精灵缓存 */
    private _sprite_buffer_tab: Record<string, Uint8Array> = {};

    private _region;

    private _buffer;

    private _nodes: {
        id: number,
        x: number,
        y: number
    }[] = [];

    private _pathInfo: {
        fromId: number,
        toId: number,
        path: Point[]
    }[] = [];

    protected onLoad(): void {
        dynamicAtlasManager.enabled = false;

        const spf = this.sp.spriteFrame;
        let texture = spf.original?._texture ?? spf.texture;

        /** 纹理大小 */
        //有问题   考虑trim
        let texture_size = this.sp.trim ? spf.rect : spf.originalSize;
        texture_size = spf.originalSize;


        this._sprite_buffer_tab[texture.getHash()] = new Uint8Array(texture_size.width * texture_size.height * 4);
        const buffer = this._sprite_buffer_tab[texture.getHash()];
        const region = new gfx.BufferTextureCopy();
        this._buffer = buffer;
        this._region = region;
        region.texOffset.x = region.texOffset.y = 0;
        region.texExtent.width = texture_size.width;
        region.texExtent.height = texture_size.height;
        director.root!.device.copyTextureToBuffers(
            texture.getGFXTexture()!,
            [buffer],
            [region]
        );
        this.getNodes();
        this._nodes = [
            { id: 1, x: 5, y: 5 },
            { id: 2, x: 7, y: 24 },
            { id: 3, x: 22, y: 29 },
            { id: 4, x: 13, y: 18 },
            { id: 5, x: 19, y: 14 }
        ]
        // this.getNodeInfo(6, 5);
        // this.getNodeInfo(5, 5);
        console.log(this._nodes);
        this._nodes.forEach((node, index) => {
            let nextIndex = index + 1
            if (nextIndex == this._nodes.length) nextIndex = 0;
            const nextNode = this._nodes[nextIndex];
            const path = this.findPath(index, node, nextNode, buffer, texture_size.width, texture_size.height);
            this._pathInfo.push({ fromId: index, toId: nextIndex, path: path });
            console.log(`路径像素：${index} --> ${nextIndex} :`, path);
        })
        this.hidePath();
    }


    private getNodes() {
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._buffer;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;

                const r = buffer[i];
                const g = buffer[i + 1];
                const b = buffer[i + 2];
                const a = buffer[i + 3];

                if (r === 0 && g === 0 && b === 0 && a > this.nodeAlpha) {
                    this._nodes.push({
                        id: a, // 用 alpha 作为节点编号
                        x: x,
                        y: y
                    });
                }
            }
        }
    }


    private findPath(
        index: number,
        start: Point,
        end: Point,
        buffer: Uint8Array,
        width: number,
        height: number
    ): Point[] | null {

        const id = index;

        const visited = new Set<string>();
        const queue: { point: Point; path: Point[] }[] = [];

        const key = (x: number, y: number) => `${x},${y}`;

        queue.push({ point: start, path: [start] });
        visited.add(key(start.x, start.y));

        const dirs = [
            [0, 1], [1, 0], [0, -1], [-1, 0],
            [1, 1], [-1, 1], [1, -1], [-1, -1],
        ]; // 8方向

        while (queue.length > 0) {
            const { point, path } = queue.shift()!;
            if (Math.abs(point.x - end.x) <= 1 && Math.abs(point.y - end.y) <= 1) {
                return [...path, end]; // 到达终点
            }

            for (const [dx, dy] of dirs) {
                const nx = point.x + dx;
                const ny = point.y + dy;

                if (
                    nx >= 0 && ny >= 0 &&
                    nx < width && ny < height &&
                    this.isRed(nx, ny, buffer, width)
                ) {
                    const k = key(nx, ny);
                    if (!visited.has(k)) {
                        visited.add(k);
                        queue.push({ point: { x: nx, y: ny }, path: [...path, { x: nx, y: ny }] });
                    }
                }
            }
        }

        return null; // 找不到路径
    }

    private isRed(x: number, y: number, buffer: Uint8Array, width: number): boolean {
        const i = (y * width + x) * 4;
        const r = buffer[i];
        const g = buffer[i + 1];
        const b = buffer[i + 2];
        const a = buffer[i + 3];
        // 粗略判断为红色像素（可调整范围）
        return r >= 200 && a != 0;
    }

    private hidePath() {
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._buffer;
        const pathInfo = this._pathInfo[this.pathIndex];
        if (!pathInfo) return;
        const startP = this._nodes[pathInfo.fromId];
        const endP = this._nodes[pathInfo.toId];
        pathInfo?.path.forEach((p) => {
            const pathX = p.x;
            const pathY = p.y;
            const i = (pathY * width + pathX) * 4;
            this.checkRoundPoint({ x: pathX, y: pathY }, startP, endP)
            buffer[i + 3] = 0
        })

        const imageAsset = new ImageAsset({
            _data: buffer,
            _compressed: false,
            width: width,
            height: height,
            format: Texture2D.PixelFormat.RGBA8888,
        });

        const texture = new Texture2D();
        texture.image = imageAsset;

        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;

        // 设置给你的 Sprite 组件
        this.sp.spriteFrame = spriteFrame;

    }

    private checkRoundPoint(centerP: Point, StartP: Point, EndP: Point) {
        const width = this._region.texExtent.width;


        const isNearStart = this.getDistSqr(centerP.x, centerP.y, StartP.x, StartP.y) <= this.stopRadius * this.stopRadius;
        const isNearEnd = this.getDistSqr(centerP.x, centerP.y, EndP.x, EndP.y) <= this.stopRadius * this.stopRadius;

        if (isNearStart || isNearEnd) return;

        if (!this.isRed(centerP.x, centerP.y, this._buffer, width)) return;
        const i = (centerP.y * width + centerP.x) * 4;
        this._buffer[i + 3] = 0;
        const dirs = [
            [0, 1], [1, 0], [0, -1], [-1, 0],
            [1, 1], [-1, 1], [1, -1], [-1, -1],
        ]; // 8方向
        for (const [dx, dy] of dirs) {
            const nx = centerP.x + dx;
            const ny = centerP.y + dy;
            this.checkRoundPoint({ x: nx, y: ny }, StartP, EndP)
        }
    }

    private getDistSqr(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy;
    }

    //debug
    private getNodeInfo(x: number, y: number) {
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._buffer;
        const i = (y * width + x) * 4;
        const r = buffer[i];
        const g = buffer[i + 1];
        const b = buffer[i + 2];
        const a = buffer[i + 3];

        console.log(`r: ${r}  g: ${g}  b: ${b}  a: ${a}`);
    }



}


