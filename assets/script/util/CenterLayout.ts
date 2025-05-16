
/**
 * 描述: 居中layout
 * 创建人: hhy
 * 2024.6.27
 */
import { Enum, Layout, UITransform, Vec3, _decorator } from "cc";

const { ccclass, inspector, property, disallowMultiple, menu } = _decorator;

enum CenterHorizontalDirection {
    LEFT_TO_RIGHT = 0,
    RIGHT_TO_LEFT = 1,
    CENTER_TO_SIDE = 2,
}

@ccclass
@disallowMultiple()
@menu('自定义组件/CenterLayout')

export default class CenterLayout extends Layout {
    @property({
        type: Enum(CenterHorizontalDirection)
    })
    centerHorizontalDirection: CenterHorizontalDirection = CenterHorizontalDirection.CENTER_TO_SIDE;



    protected _doLayoutHorizontally(baseWidth: number, rowBreak: boolean, fnPositionY: (...args: any[]) => number, applyChildren: boolean): number {
        const trans = this.node._uiProps.uiTransformComp!;
        const layoutAnchor = trans.anchorPoint;
        const limit = this._getFixedBreakingNum();

        let sign = 1;
        let paddingX = this._paddingLeft;
        if (this._horizontalDirection === Layout.HorizontalDirection.RIGHT_TO_LEFT) {
            sign = -1;
            paddingX = this._paddingRight;
        }
        const startPos = (this._horizontalDirection - layoutAnchor.x) * baseWidth + sign * paddingX;
        let nextX = startPos - sign * this._spacingX;
        let totalHeight = 0; // total content height (not including spacing)
        let rowMaxHeight = 0; // maximum height of a single line
        let tempMaxHeight = 0; //
        let maxHeight = 0;
        let isBreak = false;
        const activeChildCount = this._usefulLayoutObj.length;
        let newChildWidth = this._cellSize.width;
        const paddingH = this._getPaddingH();
        if (this._layoutType !== Layout.Type.GRID && this._resizeMode === Layout.ResizeMode.CHILDREN) {
            newChildWidth = (baseWidth - paddingH - (activeChildCount - 1) * this._spacingX) / activeChildCount;
        }


        const children = this._usefulLayoutObj;
        for (let i = 0; i < children.length; ++i) {
            const childTrans = children[i];
            const child = childTrans.node;
            const scale = child.scale;
            const childScaleX = this._getUsedScaleValue(scale.x);
            const childScaleY = this._getUsedScaleValue(scale.y);
            // for resizing children
            if (this._resizeMode === Layout.ResizeMode.CHILDREN) {
                childTrans.width = newChildWidth / childScaleX;
                if (this._layoutType === Layout.Type.GRID) {
                    childTrans.height = this._cellSize.height / childScaleY;
                }
            }

            const anchorX = Math.abs(this._horizontalDirection - childTrans.anchorX);
            const childBoundingBoxWidth = childTrans.width * childScaleX;
            const childBoundingBoxHeight = childTrans.height * childScaleY;

            if (childBoundingBoxHeight > tempMaxHeight) {
                maxHeight = Math.max(tempMaxHeight, maxHeight);
                rowMaxHeight = tempMaxHeight || childBoundingBoxHeight;
                tempMaxHeight = childBoundingBoxHeight;
            }

            nextX += sign * (anchorX * childBoundingBoxWidth + this._spacingX);
            const rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;

            if (rowBreak) {
                if (limit > 0) {
                    isBreak = (i / limit) > 0 && (i % limit === 0);
                    if (isBreak) {
                        rowMaxHeight = tempMaxHeight > childBoundingBoxHeight ? tempMaxHeight : rowMaxHeight;
                    }
                } else if (childBoundingBoxWidth > baseWidth - paddingH) {
                    if (nextX > startPos + sign * (anchorX * childBoundingBoxWidth)) {
                        isBreak = true;
                    }
                } else {
                    const boundary = (1 - this._horizontalDirection - layoutAnchor.x) * baseWidth;
                    const rowBreakBoundary = nextX + rightBoundaryOfChild + sign * (sign > 0 ? this._paddingRight : this._paddingLeft);
                    isBreak = Math.abs(rowBreakBoundary) > Math.abs(boundary);
                }

                if (isBreak) {
                    nextX = startPos + sign * (anchorX * childBoundingBoxWidth);
                    if (childBoundingBoxHeight !== tempMaxHeight) {
                        rowMaxHeight = tempMaxHeight;
                    }
                    // In unconstrained mode, the second height size is always what we need when a line feed condition is required to trigger
                    totalHeight += rowMaxHeight + this._spacingY;
                    rowMaxHeight = tempMaxHeight = childBoundingBoxHeight;
                }
            }

            const finalPositionY = fnPositionY(child, childTrans, totalHeight);
            if (applyChildren) {
                child.setPosition(nextX, finalPositionY);
            }

            nextX += rightBoundaryOfChild;
        }

        rowMaxHeight = Math.max(rowMaxHeight, tempMaxHeight);
        const containerResizeBoundary = Math.max(maxHeight, totalHeight + rowMaxHeight) + this._getPaddingV();

        // --start--
        if (applyChildren && children.length > 0 && this.centerHorizontalDirection == CenterHorizontalDirection.CENTER_TO_SIDE) {
            let lastRowY = Number.MIN_SAFE_INTEGER
            let childsWidth = 0;
            let offset = 0;
            //倒序 
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                const childScaleX = this._getUsedScaleValue(child.node.scale.x);
                const childAnchorX = child.getComponent(UITransform)!.anchorX;
                const childBoundingBoxWidth = child.getComponent(UITransform)!.width * childScaleX;
                if (Math.abs(child.node.position.y - lastRowY) > 1) {
                    lastRowY = child.node.position.y;
                    if (this.horizontalDirection == Layout.HorizontalDirection.LEFT_TO_RIGHT) {
                        const childsRightX = child.node.getWorldPosition().x + (1 - childAnchorX) * childBoundingBoxWidth;
                        const childsLeftX = this.node.getWorldPosition().x - baseWidth * layoutAnchor.x;
                        childsWidth = childsRightX - childsLeftX;
                        offset = baseWidth / 2 - childsWidth / 2;
                    }
                    else if (this.horizontalDirection == Layout.HorizontalDirection.RIGHT_TO_LEFT) {
                        const childsRightX = this.node.getWorldPosition().x + baseWidth * layoutAnchor.x;
                        const childsLeftX = child.node.getWorldPosition().x - childAnchorX * childBoundingBoxWidth;
                        childsWidth = childsRightX - childsLeftX;
                        offset = -(baseWidth / 2 - childsWidth / 2);
                    }
                }
                if (!child.node.activeInHierarchy) {
                    continue;
                }
                const posX = child.node.getPosition().x;
                child.node.setPosition(new Vec3(posX + offset, child.node.position.y, 0));
            }
        }
        // --end--
        return containerResizeBoundary;
    }

    protected _doLayoutVertically(baseHeight: number, columnBreak: boolean, fnPositionX: (...args: any[]) => number, applyChildren: boolean) {
        const trans = this.node._uiProps.uiTransformComp!;
        const layoutAnchor = trans.anchorPoint;
        const limit = this._getFixedBreakingNum();

        let sign = 1;
        let paddingY = this._paddingBottom;
        if (this._verticalDirection === Layout.VerticalDirection.TOP_TO_BOTTOM) {
            sign = -1;
            paddingY = this._paddingTop;
        }

        const startPos = (this._verticalDirection - layoutAnchor.y) * baseHeight + sign * paddingY;
        let nextY = startPos - sign * this._spacingY;
        let tempMaxWidth = 0;
        let maxWidth = 0;
        let colMaxWidth = 0;
        let totalWidth = 0;
        let isBreak = false;
        const activeChildCount = this._usefulLayoutObj.length;
        let newChildHeight = this._cellSize.height;
        const paddingV = this._getPaddingV();
        if (this._layoutType !== Layout.Type.GRID && this._resizeMode === Layout.ResizeMode.CHILDREN) {
            newChildHeight = (baseHeight - paddingV - (activeChildCount - 1) * this._spacingY) / activeChildCount;
        }

        const children = this._usefulLayoutObj;
        for (let i = 0; i < children.length; ++i) {
            const childTrans = children[i];
            const child = childTrans.node;
            const scale = child.scale;
            const childScaleX = this._getUsedScaleValue(scale.x);
            const childScaleY = this._getUsedScaleValue(scale.y);

            // for resizing children
            if (this._resizeMode === Layout.ResizeMode.CHILDREN) {
                childTrans.height = newChildHeight / childScaleY;
                if (this._layoutType === Layout.Type.GRID) {
                    childTrans.width = this._cellSize.width / childScaleX;
                }
            }

            const anchorY = Math.abs(this._verticalDirection - childTrans.anchorY);
            const childBoundingBoxWidth = childTrans.width * childScaleX;
            const childBoundingBoxHeight = childTrans.height * childScaleY;

            if (childBoundingBoxWidth > tempMaxWidth) {
                maxWidth = Math.max(tempMaxWidth, maxWidth);
                colMaxWidth = tempMaxWidth || childBoundingBoxWidth;
                tempMaxWidth = childBoundingBoxWidth;
            }

            nextY += sign * (anchorY * childBoundingBoxHeight + this._spacingY);
            const topBoundaryOfChild = sign * (1 - anchorY) * childBoundingBoxHeight;

            if (columnBreak) {
                if (limit > 0) {
                    isBreak = (i / limit) > 0 && (i % limit === 0);
                    if (isBreak) {
                        colMaxWidth = tempMaxWidth > childBoundingBoxHeight ? tempMaxWidth : colMaxWidth;
                    }
                } else if (childBoundingBoxHeight > baseHeight - paddingV) {
                    if (nextY > startPos + sign * (anchorY * childBoundingBoxHeight)) {
                        isBreak = true;
                    }
                } else {
                    const boundary = (1 - this._verticalDirection - layoutAnchor.y) * baseHeight;
                    const columnBreakBoundary = nextY + topBoundaryOfChild + sign * (sign > 0 ? this._paddingTop : this._paddingBottom);
                    isBreak = Math.abs(columnBreakBoundary) > Math.abs(boundary);
                }

                if (isBreak) {
                    nextY = startPos + sign * (anchorY * childBoundingBoxHeight);
                    if (childBoundingBoxWidth !== tempMaxWidth) {
                        colMaxWidth = tempMaxWidth;
                    }
                    // In unconstrained mode, the second width size is always what we need when a line feed condition is required to trigger
                    totalWidth += colMaxWidth + this._spacingX;
                    colMaxWidth = tempMaxWidth = childBoundingBoxWidth;
                }
            }

            const finalPositionX = fnPositionX(child, childTrans, totalWidth);
            if (applyChildren) {
                child.setPosition(finalPositionX, nextY, child.getPosition().z);
            }

            nextY += topBoundaryOfChild;
        }

        colMaxWidth = Math.max(colMaxWidth, tempMaxWidth);
        const containerResizeBoundary = Math.max(maxWidth, totalWidth + colMaxWidth) + this._getPaddingH();
        // --start--
        if (applyChildren && children.length > 0 && this.centerHorizontalDirection == CenterHorizontalDirection.CENTER_TO_SIDE) {
            let lastColX = Number.MIN_SAFE_INTEGER
            let childsHeight = 0;
            let offset = 0;
            //倒序 
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                const childScaleY = this._getUsedScaleValue(child.node.scale.y);
                const childAnchorY = child.getComponent(UITransform)!.anchorY;
                const childBoundingBoxHeight = child.getComponent(UITransform)!.height * childScaleY;
                if (Math.abs(child.node.position.x - lastColX) > 1) {
                    lastColX = child.node.position.x;
                    if (this.verticalDirection == Layout.VerticalDirection.TOP_TO_BOTTOM) {
                        const childsTopY = this.node.getWorldPosition().y + (1 - layoutAnchor.y) * baseHeight;
                        const childsBottomY = child.node.getWorldPosition().y - childAnchorY * childBoundingBoxHeight;
                        childsHeight = childsTopY - childsBottomY;
                        offset = -(baseHeight / 2 - childsHeight / 2);
                    }
                    else if (this.verticalDirection == Layout.VerticalDirection.BOTTOM_TO_TOP) {
                        const childsTopY = child.node.getWorldPosition().y + (1 - childAnchorY) * childBoundingBoxHeight;
                        const childsBottomY = this.node.getWorldPosition().y - layoutAnchor.y * baseHeight;
                        childsHeight = childsTopY - childsBottomY;
                        offset = baseHeight / 2 - childsHeight / 2;
                    }
                }
                if (!child.node.activeInHierarchy) {
                    continue;
                }
                const posY = child.node.getPosition().y;
                child.node.setPosition(new Vec3(child.node.position.x, posY + offset, 0));
            }
        }
        // --end--

        return containerResizeBoundary;
    }

    _getUsedScaleValue(value: number) {
        return this.affectedByScale ? Math.abs(value) : 1;
    }
}