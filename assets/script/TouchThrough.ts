/*
    描述: 触摸穿透
    创建人: yjy
    创建时间: 2022.4.22
*/

import { _decorator, Component, Node, EventTouch, EventMouse, Button, ScrollView, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TouchThrough')
export class TouchThrough extends Component {
    @property({ tooltip: '除自身的触摸事件外，注册自定义触摸事件并穿透\n自身没有触摸事件则直接自定义事件' })
    customSwallow = false;

    protected onLoad() {
        if (!this.customSwallow && this.getComponent(ScrollView)) {
            this.refactorScrollView();
        } else if (!this.customSwallow && this.getComponent(Button)) {
            this.refactorButtonTouch();
        } else {
            this.registerTouchEvents();
        }
    }

    private refactorScrollView() {
        const scrollView = this.getComponent(ScrollView);
        // @ts-expect-error access private method
        const beganFunc = scrollView._onTouchBegan;
        // @ts-expect-error access private method
        scrollView._onTouchBegan = (event?: EventTouch, captureListeners?: Node[]) => {
            beganFunc.call(scrollView, event, captureListeners);
            this.setSwallowTouch(event);
        }
        // @ts-expect-error access private method
        const moveFunc = scrollView._onTouchMoved;
        // @ts-expect-error access private method
        scrollView._onTouchMoved = (event?: EventTouch, captureListeners?: Node[]) => {
            moveFunc.call(scrollView, event, captureListeners);
            this.setSwallowTouch(event);
        }
        // @ts-expect-error access private method
        const endFunc = scrollView._onTouchEnded;
        // @ts-expect-error access private method
        scrollView._onTouchEnded = (event?: EventTouch, captureListeners?: Node[]) => {
            endFunc.call(scrollView, event, captureListeners);
            this.setSwallowTouch(event);
        }
        // @ts-expect-error access private method
        const cancelFunc = scrollView._onTouchCancelled;
        // @ts-expect-error access private method
        scrollView._onTouchCancelled = (event?: EventTouch, captureListeners?: Node[]) => {
            cancelFunc.call(scrollView, event, captureListeners);
            this.setSwallowTouch(event);
        }
    }

    private refactorButtonTouch() {
        const button = this.getComponent(Button);
        // @ts-expect-error access private method
        const beganFunc = button._onTouchBegan;
        // @ts-expect-error access private method
        button._onTouchBegan = (event?: EventTouch) => {
            beganFunc.call(button, event);
            if (event) event.propagationStopped = false;
        }
        // @ts-expect-error access private method
        const moveFunc = button._onTouchMove;
        // @ts-expect-error access private method
        button._onTouchMove = (event?: EventTouch) => {
            moveFunc.call(button, event);
            if (event) event.propagationStopped = false;
        }
        // @ts-expect-error access private method
        const endFunc = button._onTouchEnded;
        // @ts-expect-error access private method
        button._onTouchEnded = (event?: EventTouch) => {
            endFunc.call(button, event);
            if (event) event.propagationStopped = false;
        }
        // @ts-expect-error access private method
        const cancelFunc = button._onTouchCancel;
        // @ts-expect-error access private method
        button._onTouchCancel = (event?: EventTouch) => {
            cancelFunc.call(button, event);
            if (event) event.propagationStopped = false;
        }
    }

    private registerTouchEvents() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancelled, this);
        this.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    protected onTouchBegan(event: EventTouch) {
        this.setSwallowTouch(event);
    }

    protected onTouchMoved(event: EventTouch) {
        this.setSwallowTouch(event);
    }

    protected onTouchEnded(event: EventTouch) {
        this.setSwallowTouch(event);
    }

    protected onTouchCancelled(event: EventTouch) {
        this.setSwallowTouch(event);
    }

    protected onMouseWheel(event: EventMouse) {
        this.setSwallowTouch(event);
    }

    private setSwallowTouch(event: EventTouch | EventMouse) {
        if (!event) {
            return;
        }
        event.preventSwallow = true;
        event.propagationStopped = false;
    }
}