import { _decorator, Color, Component, director, gfx, math, Node, Size } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextureAnalysis')
export class TextureAnalysis {

    private _texture;

    private _region;

    private _buffer;

    private _textureSize: math.Size;

    constructor(Texture) {
        this._texture = Texture;
        this.init();
    }

    private init() {
        /** 准备数据 */
        //纹理
        const texture = this._texture;
        //纹理大小
        this._textureSize = new Size(texture.width, texture.height);
        //buffer
        const buffer = new Uint8Array(this._textureSize.width * this._textureSize.height * 4);
        //region
        const region = new gfx.BufferTextureCopy();
        region.texOffset.x = region.texOffset.y = 0;
        region.texExtent.width = this._textureSize.width;
        region.texExtent.height = this._textureSize.height;

        this._buffer = buffer;
        this._region = region;

        /**填充buffer */
        director.root!.device.copyTextureToBuffers(texture.getGFXTexture()!, [this._buffer], [this._region]);
    }

    public getPiexlsByRGBA(dat: { r?: number; g?: number; b?: number; a?: number }, equal = true): { x: number; y: number, color: Color }[] {
        const channelIndexMap = { r: 0, g: 1, b: 2, a: 3 } as const;
        const height = this._region.texExtent.height;
        const width = this._region.texExtent.width;
        const buffer = this._buffer;
        let res: { x: number; y: number, color: Color }[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                let isCheck = true;
                Object.keys(dat).forEach((name) => {
                    const offset = channelIndexMap[name] ?? 0;
                    const bufferValue = buffer[i + offset];
                    if (dat[name] == undefined) return;
                    switch (equal) {
                        case true:
                            if (dat[name] != bufferValue) isCheck = false;
                            break;
                        case false:
                            if (dat[name] == bufferValue) isCheck = false;
                            break;
                    }
                });
                if (isCheck) res.push({ x: x, y: y, color: new Color(buffer[i], buffer[i + 1], buffer[i + 2], buffer[i + 3]) });
            }
        }
        return res;
    }

}


