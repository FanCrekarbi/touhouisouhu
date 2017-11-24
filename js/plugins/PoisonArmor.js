//=============================================================================
// PoisonArmor.js
//=============================================================================

/*:ja
 * @plugindesc ver1.01 お体のほうは・・・。
 * @author まっつＵＰ
 *
 * @help
 * 
 * RPGで笑顔を・・・
 * 
 * このヘルプとパラメータの説明をよくお読みになってからお使いください。
 * 
 * 武器または防具のノートタグ
 * <PAadd: x>
 * xはステートID
 * 
 * <PAadd: 3>
 * このノートタグのついた装備をアクターが装備した時に
 * そのアクターにID3のステートを付加します。
 * 
 * 注意：初期装備には効果がありません。
 * 普通に装備させなおしてください。
 * 
 * このプラグインを利用する場合は
 * readmeなどに「まっつＵＰ」の名を入れてください。
 * また、素材のみの販売はダメです。
 * 上記以外の規約等はございません。
 * もちろんツクールMVで使用する前提です。
 * 何か不具合ありましたら気軽にどうぞ。
 * 
 * ver1.01　致命的なバグがあったので直しました。
 *  
 * 免責事項：
 * このプラグインを利用したことによるいかなる損害も制作者は一切の責任を負いません。
 * 
 */

(function() {
    
//var parameters = PluginManager.parameters('PoisonArmor');

var _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
Game_Actor.prototype.changeEquip = function(slotId, item) {
    _Game_Actor_changeEquip.call(this, slotId, item);
    if(item && this.equips()[slotId] === item){
        this.PAaddstate(item);
    }
};

Game_Actor.prototype.PAaddstate = function(item) {
    if(item.wtypeId){
        var PAequip = Number($dataWeapons[item.id].meta['PAadd'] || 0);
    }else{
        var PAequip = Number($dataArmors[item.id].meta['PAadd'] || 0);
    }
    if(PAequip){
        this.addState(PAequip);
        this.refresh();
    }
};

})();
