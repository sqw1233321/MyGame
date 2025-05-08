/*
    描述: 自定义事件目标
    创建人: yjy
    创建时间: 2021.9.23
*/

import { AllEvent } from "../common/Event";

export default class CustomEventTarget {
    private static s_targetInfos: { target: Object, eventTargets: CustomEventTarget[] }[] = [];
    private _events: { [index: string]: { callback: Function, target: Object, priority: number, isOnce: boolean }[] };

    /**
     * 查找目标信息
     * @param target - 目标
     */
    private static findTargetInfo(target: Object) {
        for (let i = 0; i < this.s_targetInfos.length; i++) {
            if (this.s_targetInfos[i].target === target) {
                return this.s_targetInfos[i];
            }
        }
    }

    private static removeTargetInfo(target: Object) {
        for (let i = 0; i < this.s_targetInfos.length; i++) {
            if (this.s_targetInfos[i].target === target) {
                this.s_targetInfos.splice(i, 1);
                return;
            }
        }
    }

    /**
     * 添加目标事件目标
     * @param target - 目标
     * @param eventTarget - 事件目标
     */
    private static addTargetEventTarget(target: Object, eventTarget: CustomEventTarget) {
        let targetInfo = CustomEventTarget.findTargetInfo(target);
        if (!targetInfo) {
            CustomEventTarget.s_targetInfos.push({ target: target, eventTargets: [eventTarget] });
            return;
        }
        if (targetInfo.eventTargets.indexOf(eventTarget) == -1) {
            targetInfo.eventTargets.push(eventTarget);
        }
    }

    /**
     * 移除目标事件目标
     * @param target - 目标
     * @param eventTarget - 事件目标
     */
    private static removeTargetEventTarget(target: Object, eventTarget: CustomEventTarget) {
        let targetInfo = this.findTargetInfo(target);
        if (!targetInfo) {
            return;
        }
        let index = targetInfo.eventTargets.indexOf(eventTarget);
        if (index > - 1) {
            targetInfo.eventTargets.splice(index, 1);
            if (targetInfo.eventTargets.length < 1) {
                CustomEventTarget.removeTargetInfo(target);
            }
        }
    }

    /**
     * 移除目标所有事件目标
     * @param target - 目标
     */
    public static removeTargetAllEventTargets(target: Object) {
        let targetInfo = CustomEventTarget.findTargetInfo(target);
        if (!targetInfo) {
            return;
        }
        for (let i = 0; i < targetInfo.eventTargets.length; i++) {
            targetInfo.eventTargets[i].removeTargetAllEvent(targetInfo.target);
        }
        targetInfo.eventTargets = [];
        CustomEventTarget.removeTargetInfo(target);
    }

    /**
     * 清理
     */
    public static clear() {
        for (let i = 0; i < this.s_targetInfos.length; i++) {
            let targetInfo = this.s_targetInfos[i];
            for (let i = 0; i < targetInfo.eventTargets.length; i++) {
                targetInfo.eventTargets[i].removeTargetAllEvent(targetInfo.target);
            }
            this.s_targetInfos.splice(i, 1);
            i--;
        }
        this.s_targetInfos = [];
    }

    public constructor() {
        this._events = {};
    }

    /**
     * 监听事件一次
     * @param eventName - 事件名称
     * @param callback - 回调
     * @param target - 目标
     * @param priority - 优先级
     */
    public once(eventName: string | number, callback: Function, target: Object, priority: number = 0) {
        this.on(eventName, callback, target, priority, true);
    }

    /**
     * 监听事件
     * @param eventName - 事件名称
     * @param callback - 回调
     * @param target - 目标
     * @param priority - 优先级
     * @param isOnce - 是否一次
     */
    public on(eventName: string | number, callback: Function, target: Object, priority: number = 0, isOnce: boolean = false) {
        this._events[eventName] = this._events[eventName] || [];
        let events = this._events[eventName];
        for (let event of events) {
            if (event.target === target && callback === event.callback) {
                return;
            }
        }
        events.push({
            callback: callback,
            target: target,
            priority: priority,
            isOnce: isOnce,
        });
        events.sort((a, b) => {
            return a.priority - b.priority;
        });
        CustomEventTarget.addTargetEventTarget(target, this);
    }

    //不做判断，直接添加
    public forceOn(eventName: string | number, callback: Function, target: Object) {
        this._events[eventName] = this._events[eventName] || [];
        let events = this._events[eventName];
        events.push({
            callback: callback,
            target: target,
            priority: 0,
            isOnce: false,
        });
        events.sort((a, b) => {
            return a.priority - b.priority;
        });
        CustomEventTarget.addTargetEventTarget(target, this);
    }

    /**
     * 监听多个事件
     * @param eventNames - 事件名称
     * @param callback - 回调
     * @param target - 目标
     * @param priority - 优先级
     */
    public onMutil(eventNames: string[] | number[], callback: Function, target: Object, priority: number = 0) {
        for (let i = 0; i < eventNames.length; i++) {
            this.on(eventNames[i], callback, target, priority);
        }
    }

    /**
     * 取消目标所有事件
     * @param target - 目标
     */
    public targetOff(target: Object) {
        this.removeTargetAllEvent(target);
        CustomEventTarget.removeTargetEventTarget(target, this);
    }

    private removeTargetAllEvent(target: Object) {
        for (let eventName in this._events) {
            let events = this._events[eventName];
            for (let i = 0; i < events.length; i++) {
                let each = events[i];
                if (each.target === target) {
                    events.splice(i, 1);
                    i--;
                }
            }
        }
    }

    /**
     * 取消目标事件
     * @param eventName - 事件名称
     * @param callback - 回调
     * @param target - 目标
     */
    public off(eventName: string | number, callback: Function, target: Object) {
        let events = this._events[eventName];
        if (!events) {
            return;
        }
        for (let i = 0; i < events.length; i++) {
            let each = events[i];
            if (each.target === target && callback === each.callback) {
                events.splice(i, 1);
                i--;
            }
        }
        if (!this.isExistTarget(target)) {
            CustomEventTarget.removeTargetEventTarget(target, this);
        }
    }

    public offEventName(eventName: string | number, target: Object) {
        let events = this._events[eventName];
        if (!events) {
            return;
        }
        for (let i = 0; i < events.length; i++) {
            let each = events[i];
            if (each.target === target) {
                events.splice(i, 1);
                i--;
            }
        }
        if (!this.isExistTarget(target)) {
            CustomEventTarget.removeTargetEventTarget(target, this);
        }
    }

    /**
     * 是否存在目标
     * @param target - 目标
     */
    private isExistTarget(target: Object) {
        for (let eventName in this._events) {
            let events = this._events[eventName];
            for (let i = 0; i < events.length; i++) {
                let each = events[i];
                if (each.target === target) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 发送事件
     * @param eventName - 事件名称
     * @param value - 值
     */
    public emit(eventName: string | number, ...value: any[]) {
        let events = this._events[eventName]?.slice();
        if (!events) {
            return;
        }
        for (let i = 0; i < events.length; i++) {
            let each = events[i];
            each.callback.call(each.target, ...value);
        }
        events = this._events[eventName];
        for (let i = 0; i < events.length; i++) {
            let each = events[i];
            if (each.isOnce) {
                events.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * 类型安全监听一次
     * @param eventName 
     * @param callback 
     * @param target 
     * @param priority 
     */
    public onceSafe<T extends keyof AllEvent>(eventName: T, callback: (value: AllEvent[T]) => void, target: Object, priority: number = 0) {
        this.on(eventName, callback, target, priority, true);
    }

    /**
     * 类型安全监听
     * @param eventName 
     * @param callback 
     * @param target 
     * @param priority 
     * @param isOnce 
     */
    public onSafe<T extends keyof AllEvent>(eventName: T, callback: (value: AllEvent[T]) => void, target: Object, priority: number = 0, isOnce: boolean = false) {
        this.on(eventName, callback, target, priority, isOnce)
    }

    /**
     * 类型安全发送事件
     * @param eventName 
     * @param value 
     */
    public emitSafe<T extends keyof AllEvent>(eventName: T, value?: AllEvent[T]) {
        this.emit(eventName, value);
    }

    /**
     * 类型安全取消事件
     * @param eventName 
     * @param callback 
     * @param target 
     */
    public offSafe<T extends keyof AllEvent>(eventName: T, callback: (value: AllEvent[T]) => void, target: Object) {
        this.off(eventName, callback, target);
    }

    /**
     * 类型安全多个事件监听
     * @param eventNames 
     * @param callback 
     * @param target 
     * @param priority 
     */
    public onMutilSafe<T extends keyof AllEvent>(eventNames: T[], callback: (value: AllEvent[T]) => void, target: Object, priority: number = 0) {
        for (let i = 0; i < eventNames.length; i++) {
            this.on(eventNames[i], callback, target, priority);
        }
    }

    public clear() {
        this._events = {};
    }
}
