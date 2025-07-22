import { __private, _decorator, Component, IAssembler, Node, Renderable2D, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

export class myAssembler implements IAssembler {

    createData(renderComp: MyRenderer) {
        const renderData = renderComp.requestRenderData();
        renderData.dataLength = 2;
        renderData.resize(4, 6);
        return renderData;
    }

    updateRenderData(renderComp: MyRenderer) {
        const renderData = renderComp.renderData;
        if (renderData && renderData.vertDirty) {
            this.updateVertexData(renderComp);
            this.updateUVs(renderComp);
            this.updateColor(renderComp);
            renderData.updateRenderData(renderComp, renderComp.spriteFrame);
        }
    }

    updateWorldVerts(renderComp: MyRenderer, chunk) {
        const renderData = renderComp.renderData!;
        const vData = chunk.vb;

        const dataList = renderData.data;
        const node = renderComp.node;

        const data0 = dataList[0];
        const data3 = dataList[1];
        const matrix = node.worldMatrix;
        const a = matrix.m00; const b = matrix.m01;
        const c = matrix.m04; const d = matrix.m05;

        const justTranslate = a === 1 && b === 0 && c === 0 && d === 1;

        const tx = matrix.m12; const ty = matrix.m13;
        const vl = data0.x; const vr = data3.x;
        const vb = data0.y; const vt = data3.y;

        if (justTranslate) {
            const vltx = vl + tx;
            const vrtx = vr + tx;
            const vbty = vb + ty;
            const vtty = vt + ty;

            // left bottom
            vData[0] = vltx;
            vData[1] = vbty;
            // right bottom
            vData[9] = vrtx;
            vData[10] = vbty;
            // left top
            vData[18] = vltx;
            vData[19] = vtty;
            // right top
            vData[27] = vrtx;
            vData[28] = vtty;
        } else {
            const al = a * vl; const ar = a * vr;
            const bl = b * vl; const br = b * vr;
            const cb = c * vb; const ct = c * vt;
            const db = d * vb; const dt = d * vt;

            const cbtx = cb + tx;
            const cttx = ct + tx;
            const dbty = db + ty;
            const dtty = dt + ty;

            // left bottom
            vData[0] = al + cbtx;
            vData[1] = bl + dbty;
            // right bottom
            vData[9] = ar + cbtx;
            vData[10] = br + dbty;
            // left top
            vData[18] = al + cttx;
            vData[19] = bl + dtty;
            // right top
            vData[27] = ar + cttx;
            vData[28] = br + dtty;
        }
    }

    fillBuffers(renderComp: MyRenderer, renderer) {
        if (renderComp === null) {
            return;
        }
        const renderData = renderComp.renderData!;
        const chunk = renderData.chunk;
        if (renderComp.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(renderComp, chunk);
            renderData.vertDirty = false;
        }

        // quick version
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(bid);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);
        let indexOffset = meshBuffer.indexOffset;
        ib[indexOffset++] = vid;
        ib[indexOffset++] = vid + 1;
        ib[indexOffset++] = vid + 2;
        ib[indexOffset++] = vid + 2;
        ib[indexOffset++] = vid + 1;
        ib[indexOffset++] = vid + 3;
        meshBuffer.indexOffset += 6;

        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    }

    updateVertexData(renderComp: MyRenderer) {
        const renderData = renderComp.renderData;
        if (!renderData || !renderComp.spriteFrame?.originalSize) {
            return;
        }

        const uiTrans = renderComp.node._uiProps.uiTransformComp!;
        const dataList = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        let l = 0;
        let b = 0;
        let r = 0;
        let t = 0;

        const frame = renderComp.spriteFrame!;
        const originSize = frame.getOriginalSize();
        const rect = frame.getRect();
        const ow = originSize.width;
        const oh = originSize.height;
        const rw = rect.width;
        const rh = rect.height;
        const offset = frame.getOffset();
        const scaleX = cw / ow;
        const scaleY = ch / oh;
        const trimLeft = offset.x + (ow - rw) / 2;
        const trimRight = offset.x - (ow - rw) / 2;
        const trimBottom = offset.y + (oh - rh) / 2;
        const trimTop = offset.y - (oh - rh) / 2;
        l = trimLeft * scaleX - appX;
        b = trimBottom * scaleY - appY;
        r = cw + trimRight * scaleX - appX;
        t = ch + trimTop * scaleY - appY;

        dataList[0].x = l;
        dataList[0].y = b;

        dataList[1].x = r;
        dataList[1].y = t;

        renderData.vertDirty = true;
    }


    updateUVs(renderComp: MyRenderer) {
        if (!renderComp.spriteFrame?.uv) return;
        const renderData = renderComp.renderData!;
        const vData = renderData.chunk.vb;
        const uv = renderComp.spriteFrame.uv;
        vData[3] = uv[0];
        vData[4] = uv[1];
        vData[12] = uv[2];
        vData[13] = uv[3];
        vData[21] = uv[4];
        vData[22] = uv[5];
        vData[30] = uv[6];
        vData[31] = uv[7];
    }

    updateColor(renderComp: MyRenderer) {
        const renderData = renderComp.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = renderComp.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    }


}

@ccclass('MyRenderer')
export class MyRenderer extends Renderable2D {
    @property({ type: SpriteFrame, serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;

    @property({ type: SpriteFrame, serializable: true })
    get spriteFrame() {
        return this._spriteFrame;
    }

    set spriteFrame(value) {
        if (!value || this._spriteFrame === value) {
            this._spriteFrame = value;
            return;
        }
        const lastSprite = this._spriteFrame;
        this._spriteFrame = value;

        let l = -value.width / 2, b = -value.height / 2, t = value.height / 2, r = value.width / 2;
        //this.polygon = [v2(l, b), v2(r, b), v2(r, t), v2(l, t)];

        this.markForUpdateRenderData(false);
        this._applySpriteSize();
        // this._applySpriteFrame(lastSprite);
        // if (EDITOR) {
        //     this.node.emit(EventType.SPRITE_FRAME_CHANGED, this);
        // }
    }

    private _applySpriteSize() {
        if (this._spriteFrame) {
            const size = this._spriteFrame.originalSize;
            this.node._uiProps.uiTransformComp!.setContentSize(size);
        }

        this._activateMaterial();
    }

    private _activateMaterial() {
        const spriteFrame = this._spriteFrame;
        const material = this.getRenderMaterial(0);
        if (spriteFrame) {
            if (material) {
                this.markForUpdateRenderData();
            }
        }

        if (this.renderData) {
            this.renderData.material = material;
        }
    }

    // private _applySpriteFrame(oldFrame: SpriteFrame | null) {
    //     const spriteFrame = this._spriteFrame;

    //     // if (oldFrame && this._type === SpriteType.SLICED) {
    //     //     oldFrame.off(SpriteFrame.EVENT_UV_UPDATED, this._updateUVs, this);
    //     // }
    //     this._updateUVs();

    //     let textureChanged = false;
    //     if (spriteFrame) {
    //         if (!oldFrame || oldFrame.texture !== spriteFrame.texture) {
    //             textureChanged = true;
    //         }
    //         if (textureChanged) {
    //             if (this._renderData) this._renderData.textureDirty = true;
    //             // this.changeMaterialForDefine();
    //         }
    //         this._applySpriteSize();
    //         spriteFrame.on(SpriteFrame.EVENT_UV_UPDATED, this._updateUVs, this);
    //     }
    // }

    private _updateUVs(){
        this._assembler.updateUvs();
    }


    protected _flushAssembler(): void {
        if (this._assembler == null) {
            this.destroyRenderData();
            this._assembler = new myAssembler();
        }

        if (!this.renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this.renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                this._updateColor();
            }
        }
    }

    protected _render(render: __private._cocos_2d_renderer_i_batcher__IBatcher): void {
        this._assembler.fillBuffers(this, render);
    }

}


