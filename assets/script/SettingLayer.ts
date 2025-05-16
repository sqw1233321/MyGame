import { _decorator, Component, Label, Node } from 'cc';
import { GameEvent, GlobalEventTarget } from './event/GlobalEventTarget';
import { GameMode } from './GameMgr';
const { ccclass, property } = _decorator;

@ccclass('SettingLayer')
export class SettingLayer extends Component {

    @property(Label)
    modeLb: Label;

    public onClickModeBtn() {
        GlobalEventTarget.emit(GameEvent.GameModeChange);
    }

    public changeModeLb(mode: GameMode) {
        switch (mode) {
            case GameMode.PLAY:
                this.modeLb.string = "当前模式为：游玩模式"
                break;
            case GameMode.EDITOR:
                this.modeLb.string = "当前模式为：编辑模式"
                break;
        }
    }
    
}


