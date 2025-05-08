import { _decorator, Component, instantiate, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NodeUtil')
export class NodeUtil {
    public static autoRefreshChildren<T>(parent: Node, data: T[], callback: (item: Node, index: number, element?: T) => void) {
        if (!parent || !data) {
            console.error("parent或者data没有数据 parent.name: " + parent?.name + "data:" + data?.length);
            return;
        }
        const children = parent.children;
        const defaultItem = children[0];
        if (!defaultItem) return;

        for (let i = 0; i < data.length; ++i) {
            let item = children[i];
            if (!item) {
                item = instantiate(defaultItem);
                parent.addChild(item);
            }
            item.active = true;
        }

        for (let i = 0; i < data.length || i < children.length; ++i) {
            let item = children[i];
            if (i >= data.length && i < children.length) {
                item.active = false
                continue;
            }
            callback?.(item, i, data[i]);
        }
    }

    
}


