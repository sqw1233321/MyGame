import { _decorator, Component, IAssembler, Node, Renderable2D, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

//精灵堆叠

class AssemblerSplit implements IAssembler {
    createData(com: TestSpriteStack) {
        let vertexCount = 4;
        let indexCount = 6;

        const renderData = com.requestRenderData();
        renderData.dataLength = vertexCount;
        renderData.resize(vertexCount, indexCount);
        return renderData;
    }

    //render2D的renderDataFlag为true
    updateRenderData(com: TestSpriteStack) {
        // dynamicAtlasManager.packToDynamicAtlas(com, frame);
        const renderData = com.renderData;
        if (renderData.vertDirty) {
            this.resetData(com);
            this.updateVertexData(com);
            this.updateUvs(com);
            this.updateColor(com);
            renderData.updateRenderData(com, com.spriteFrame);
        }
    }

    resetData(com: TestSpriteStack) {
        let points = com.polygon;
        if (!points || points.length < 3) return;

        let vertexCount = points.length;
        let indexCount = vertexCount + (vertexCount - 3) * 2;

        com.renderData.clear();
        com.renderData.dataLength = vertexCount;
        com.renderData.resize(vertexCount, indexCount);

        let material = com.renderData.material;
        com.renderData.material = material;
    }

    updateVertexData(com: TestSpriteStack) {
        const renderData = com.renderData;
        if (!renderData) {
            return;
        }
        const dataList = renderData.data;

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            dataList[i].x = polygon[i].x;
            dataList[i].y = polygon[i].y;
        }

        ///修改。。。。。。。。。。。。。。。。。。。。。。。
        const chunk = com.renderData.chunk;
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const ib = chunk.vertexAccessor.getIndexBuffer(bid) as any;
        const indexOffset = chunk.vertexAccessor.getMeshBuffer(bid).indexOffset;

        let indicesArr = SplitHelper.splitPolygon(com.polygon);
        for (let i = 0, l = indicesArr.length; i < l; i++) {
            ib[indexOffset + i] = vid + indicesArr[i];
        }
    }

    updateUvs(com: TestSpriteStack) {
        let uvOffset = 3,
            floatsPerVert = 9;
        const vData = com.renderData.chunk.vb;

        let uvs = [];
        if (com.spriteFrame.texture) {
            uvs = SplitHelper.computeUv(com.polygon, com.spriteFrame.texture.width, com.spriteFrame.texture.height);
        }

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            vData[uvOffset] = uvs[i].x;
            vData[uvOffset + 1] = uvs[i].y;
            uvOffset += floatsPerVert;
        }
    }

    updateColor(com: TestSpriteStack) {
        const renderData = com.renderData!;

        let colorOffset = 5,
            floatsPerVert = renderData.floatStride;
        let vData = renderData.chunk.vb;

        const color = com.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            vData![colorOffset] = colorR;
            vData![colorOffset + 1] = colorG;
            vData![colorOffset + 2] = colorB;
            vData![colorOffset + 3] = colorA;
            colorOffset += floatsPerVert;
        }
    }

    //render2D的renderFlag为true
    fillBuffers(com: TestSpriteStack, renderer: any) {
        const chunk = com.renderData.chunk;
        // indices generated
        let indicesArr = SplitHelper.splitPolygon(com.polygon);
        //console.log("indicesArr is ", indicesArr);
        this.updateWorldVerts(com, chunk.vb);

        // quick version
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(bid);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);
        let indexOffset = meshBuffer.indexOffset;

        // fill indices
        for (let i = 0, l = indicesArr.length; i < l; i++) {
            ib[indexOffset++] = indicesArr[i] + vid;
        }
        meshBuffer.indexOffset += indicesArr.length;
        //console.log(" indicesArr is ", indicesArr, " vid is ", vid, "  indexoffset is ", indexOffset, "  total ib is  ", chunk.vertexAccessor.getIndexBuffer(bid));
    }

    updateWorldVerts(com: TestSpriteStack, verts: Float32Array) {
        let floatsPerVert = 9;

        let matrix: Mat4 = com.node.worldMatrix;
        let a = matrix.m00,
            b = matrix.m01,
            c = matrix.m04,
            d = matrix.m05,
            tx = matrix.m12,
            ty = matrix.m13;

        let justTranslate = a === 1 && b === 0 && c === 0 && d === 1;
        if (justTranslate) {
            let polygon = com.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = polygon[i].x + tx;
                verts[i * floatsPerVert + 1] = polygon[i].y + ty;
            }
        } else {
            let polygon = com.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = a * polygon[i].x + c * polygon[i].y + tx;
                verts[i * floatsPerVert + 1] = b * polygon[i].x + d * polygon[i].y + ty;
            }
        }

        // @ts-ignore
        com.node._uiProps.uiTransformDirty = false;
    }
}

@ccclass("TestSpriteStack")
export class TestSpriteStack extends Renderable2D {
    @property({ type: SpriteFrame, serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;
    @property({ type: SpriteFrame, serializable: true })
    get spriteFrame() {
        return this._spriteFrame;
    }
}
