/**
 * 描述: 根据信息图切断显示图的某些像素
 * 创建人: hhy
 * 2025.5.16
 */

import { _decorator, Color, Component, director, dynamicAtlasManager, gfx, ImageAsset, math, Node, path, profiler, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

interface Point { x: number; y: number };
//formId从0开始
interface PathInfo { fromId: number, toId: number };

@ccclass('TextureClip')
export class TextureClip extends Component {

    @property(Sprite)
    showSp: Sprite;

    @property(Sprite)
    infoSp: Sprite;

    private _region;

    private _showBuffer;

    private _infoBuffer;

    private _textureSize: math.Size;

    private _pathSpfsInfo: { pathInfo: PathInfo, spFrame: SpriteFrame }[] = [];

    private _hideP: Point[] = [];

    protected onLoad(): void {
        this.init();
        //debug:
        //this.getNodeInfo(67, 131);
    }

    private init() {
        /** 准备数据 */
        //纹理
        const texture = this.showSp.spriteFrame.texture;
        const infoTex = this.infoSp.spriteFrame.texture;
        //纹理大小
        this._textureSize = this.showSp.spriteFrame.originalSize;
        //buffer
        const showBuffer = new Uint8Array(this._textureSize.width * this._textureSize.height * 4);
        const infoBuffer = new Uint8Array(this._textureSize.width * this._textureSize.height * 4);
        //region
        const region = new gfx.BufferTextureCopy();
        region.texOffset.x = region.texOffset.y = 0;
        region.texExtent.width = this._textureSize.width;
        region.texExtent.height = this._textureSize.height;

        this._showBuffer = showBuffer;
        this._infoBuffer = infoBuffer;
        this._region = region;

        /**填充buffer */
        director.root!.device.copyTextureToBuffers(
            infoTex.getGFXTexture()!,
            [infoBuffer],
            [region]
        );

        director.root!.device.copyTextureToBuffers(
            texture.getGFXTexture()!,
            [showBuffer],
            [region]
        );

    }


    private getHidePixels(segmentIndexs: number[]) {
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._infoBuffer;
        this._hideP = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = buffer[i];
                const g = buffer[i + 1];
                if (r == 207) this._hideP.push({ x: x, y: y });
                //debug:
                if (g == 15) console.log(`g = 15  x:${x}  y:${y}`);
            }
        }
    }

    private setSpInfo(pathInfo: PathInfo) {
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._showBuffer;
        this._hideP.forEach(p => {
            const x = p.x;
            const y = p.y;
            const i = (y * width + x) * 4;
            buffer[i + 3] = 0;
        })

        const imageAsset = new ImageAsset();
        imageAsset.reset({
            _data: buffer,
            _compressed: false,
            width: width,
            height: height,
            format: Texture2D.PixelFormat.RGBA8888,
        });

        const texture = new Texture2D();
        texture.image = imageAsset;

        const newSpf = new SpriteFrame();
        newSpf.texture = texture;
        newSpf["packable"] = false;

        const alreadyIndex = this._pathSpfsInfo.findIndex(spInfo => spInfo.pathInfo.fromId == pathInfo.fromId && spInfo.pathInfo.toId == pathInfo.toId);
        if (alreadyIndex != -1) {
            this._pathSpfsInfo.splice(alreadyIndex, 1);
        }
        const newSpInfo = { pathInfo: pathInfo, spFrame: newSpf };
        this._pathSpfsInfo.push({ pathInfo: pathInfo, spFrame: newSpf })
        return newSpInfo;
    }

    public getPiexlsByRGBA(dat: { r?: number, g?: number, b?: number, a?: number }): { x: number, y: number }[] {
        const channelIndexMap = { r: 0, g: 1, b: 2, a: 3 } as const;
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._infoBuffer;
        let res: { x: number, y: number }[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                let isCheck = true;
                Object.keys(dat).forEach((name) => {
                    const offset = channelIndexMap[name] ?? 0;
                    const bufferValue = buffer[i + offset];
                    if (dat[name] != undefined && dat[name] != bufferValue) isCheck = false;
                })
                if (isCheck) res.push({ x: x, y: y })
            }
        }
        return res;
    }


    /**
     * 隐藏路径
     * @param formIndex 起始index
     * @param toIndex 终止index
     * index从0开始
     */
    public hidePath(formIndex: number, toIndex: number) {
        let spInfo = this._pathSpfsInfo.find(spInfo => spInfo.pathInfo.fromId == formIndex && spInfo.pathInfo.toId == toIndex);
        let segmentIndexs: number[] = []
        //通过起点终点index获得段落index
        // segmentIndexs = formIndex  toIndex;
        if (!spInfo) {
            this.getHidePixels(segmentIndexs);
            spInfo = this.setSpInfo({ fromId: formIndex, toId: toIndex });
        }
        this.showSp.spriteFrame = spInfo.spFrame;
    }

    protected onDestroy(): void {
        this._pathSpfsInfo?.forEach(info => {
            info.spFrame.decRef();
            info.spFrame?.texture.decRef();
        })
    }


    public getSize() {
        return this._textureSize;
    }

    public getShowSp() {
        return this.showSp;
    }

    //debug
    private getNodeInfo(x: number, y: number) {
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._infoBuffer;
        const i = (y * width + x) * 4;
        const r = buffer[i];
        const g = buffer[i + 1];
        const b = buffer[i + 2];
        const a = buffer[i + 3];

        console.log(`r: ${r}  g: ${g}  b: ${b}  a: ${a}`);
    }

}


