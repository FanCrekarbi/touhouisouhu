//=============================================================================
// FC_CardBook.js
//===============================================================================
// Copyright (c) 2017 FantasticCreative
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//===============================================================================

/*:
 * ==============================================================================
 * @plugindesc (v 1.0.1) カード図鑑プラグイン
 * @author FantasticCreative
 *
 * @help
 *
 * 1."カード"として扱う装備タイプを設定します。
 *
 * 2."カード"として防具をデータベースに登録してください。
 *   このとき、[装備タイプ]に1で作成したタイプを指定してください。
 *
 * 3.作成した防具のメモ欄に以下を設定します。
 *   <card_picture:カードファイル名>
 *   <card_rank:カードランク>
 *   <card_illust:イラストレーター名>
 *
 *   ※カードファイル名,カードランク,イラストレーター名は
 *     それぞれ置き換えてください。
 *     カードファイルはpng形式でimg/pictures以下に配置します。
 *
 * 4.カードを装備することで特定のスキルを使えるようにする場合は、
 *   カードの特徴から[スキル追加]を行ってください。
 *   追加したスキル名がカード詳細の[特殊技]欄に表示されます。
 *
 * ==============================================================================
 *
 * @param card_background
 * @text カード図鑑背景
 * @desc カード図鑑画面の背景画像を措定します。
 * @type file
 * @require 1
 * @dir /img/pictures/
 *
 * @param card_opacity
 * @text カード図鑑の不透明度
 * @desc カード図鑑画面のウィンドウ不透明度を措定します。0で透明になります。(デフォルト:0)
 * @type number
 * @max 255
 * @min 0
 * @default 0
 *
 * @param card_type
 * @text 装備タイプ
 * @desc "カード"として扱う装備タイプIDを指定します。(デフォルト:6)
 * @type number
 * @min 1
 * @default 6
 *
 * @param unknown_data
 * @text 未獲得カード名
 * @desc 未獲得のカード表示名を指定します。(デフォルト:？？？？？？)
 * @default ？？？？？？
 *
 * @param row_number
 * @text カードブックの行数
 * @desc カード索引リストの行数を指定します。(デフォルト:6)
 * @type number
 * @min 1
 * @default 6
 *
 * @param column_number
 * @text カードブックの列数
 * @desc カード索引リストの列数を指定します。(デフォルト:3)
 * @type number
 * @min 1
 * @default 3
 *
 * @param menu_command
 * @text メニュー項目名称
 * @desc メニューに表示するカードリストコマンドの名称を入力してください。(デフォルト:カード)
 * @default カード
 *
 * @param special_skill
 * @text 特殊技名称
 * @desc カード図鑑に表示する[特殊技]の名称を入力してください。(デフォルト:特殊技)
 * @default 特殊技
 *
 * @param none_skill
 * @text 特殊技なし
 * @desc 特殊技が存在しない場合に表示する文章を指定してください。(デフォルト:なし)
 * @default なし
 *
 * @param progress_window
 * @text 進捗ウィンドウ設定
 * @desc 設定(デフォルト:true, 収集： $1 / $2, 576, 252, 240, 1)
 * @type struct<progressWindow>
 * @default {"progress_use":"true","progress_format":"収集： $1 / $2","Window_X":"576","Window_Y":"252","Window_Width":"240","Window_Row":"1"}
 *
*/
/*~struct~ProgressWindow:
 *
 * @param progress_use
 * @text 進捗表示
 * @desc 進捗を表示するか選択します。
 * @type boolean
 * @on 表示する
 * @off 表示しない
 *
 * @param progress_format
 * @text 進捗表示フォーマット
 * @desc 進捗として表示するテキストを指定します。$1はカード獲得種類数、$2はカード総種類数、$3はカード獲得率に置換されます。
 *
 * @param Window_X
 * @text ウィンドウX座標
 * @desc ウィンドウのX座標(横軸)を入力します。
 * @type Number
 * @min 0
 *
 * @param Window_Y
 * @text ウィンドウY座標
 * @desc ウィンドウのY座標(縦軸)を入力します。
 * @type Number
 * @min 0
 *
 * @param Window_Width
 * @text ウィンドウ横幅
 * @desc ウィンドウの横幅を入力します。
 * @type Number
 * @min 1
 *
 * @param Window_Row
 * @text ウィンドウ表示行数
 * @desc ウィンドウ内に表示可能な最大行数を入力します。(行数の分、ウィンドウ高さが増減します)
 * @type Number
 * @min 1
 *
 */
var Imported = Imported || {};
Imported.FC_CardBook = true;

(function () {
    'use strict';

    const PN = "FC_CardBook";

    const paramParse = function(obj) {
        return JSON.parse(JSON.stringify(obj, paramReplace));
    }

    const paramReplace = function(key, value) {
        try {
            return JSON.parse(value || null);
        } catch (e) {
            return value;
        }
    };

    const parameters = paramParse(PluginManager.parameters(PN));

    const Params = {
        "CardBg" : String(parameters["card_background"] || ""),
        "CardOpacity" : Number(parameters["card_opacity"] || 0),
        "CardType" : Number(parameters["card_type"] || 6),
        "UnknownData" : String(parameters["unknown_data"] || "？？？？？？"),
        "RowNumber" : Number(parameters["row_number"] || 6),
        "ColNumber" : Number(parameters["column_number"] || 3),
        "MenuCommand" : String(parameters["menu_command"] || "カード"),
        "SpecialSkill" : String(parameters["special_skill"] || "特殊技"),
        "NoneSkill" : String(parameters["none_skill"] || "なし"),
        "ProgressWindow" : {
            "ProgressUse" : Boolean(parameters["progress_window"]["progress_use"]),
            "ProgressFormat" : String(parameters["progress_window"]["progress_format"] || "$1 ／ $2"),
            "X" : Number(parameters["progress_window"]["Window_X"] || 0),
            "Y" : Number(parameters["progress_window"]["Window_Y"] || 0),
            "W" : Number(parameters["progress_window"]["progress_width"] || 240),
            "R" : Number(parameters["progress_window"]["Window_Row"] || 1),
        },
    };

    //=========================================================================
    // Game_Interpreter
    //  ・カード図鑑のプラグインコマンドを定義します。
    //
    //=========================================================================
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command.toLowerCase() === "cardbook") {
            switch (args[0].toLowerCase()) {
                case 'open':
                    SceneManager.push(Scene_CardBook);
                    break;
                case 'add':
                    $gameSystem.addToCardBook(args[1], Number(args[2]));
                    break;
                case 'remove':
                    $gameSystem.removeFromCardBook(args[1], Number(args[2]));
                    break;
                case 'complete':
                    $gameSystem.completeCardBook();
                    break;
                case 'clear':
                    $gameSystem.clearCardBook();
                    break;
            }
        }
    };


    //=========================================================================
    // Game_System
    //  ・カード図鑑のシステム関数を定義します。
    //
    //=========================================================================
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function(){
        _Game_System_initialize.call(this);

    };

    Game_System.prototype.addToCardBook = function(cardId) {
        if (!this._cardBookFlags) {
            this.clearCardBook();
        }
        this._cardBookFlags[cardId] = true;
    };

    Game_System.prototype.removeFromCardBook = function(cardId) {
        if (this._cardBookFlags) {
            this._cardBookFlags[cardId] = false;
        }
    };

    Game_System.prototype.completeCardBook = function() {
        let cardList, i;
        cardList = this.makeCardList();

        this.clearCardBook();
        for (i = 1; i < cardList.length; i++) {
            this._cardBookFlags[i] = true;
        }
    };

    Game_System.prototype.clearCardBook = function() {
        this._cardBookFlags = [];
    };

    Game_System.prototype.isInCardBook = function(card) {
        if (this._cardBookFlags && card) {
            return !!this._cardBookFlags[card.id];
        } else {
            return false;
        }
    };

    Game_System.prototype.getCardCount = function() {
        if(!this._cardBookFlags || this._cardBookFlags.length < 1) {
            return 0;
        }
        return this._cardBookFlags.filter(function(flag){ return !!flag; }).length;
    };

    Game_System.prototype.makeCardList = function() {
        return $dataArmors.filter(function(item) {
            return item && item.etypeId == Params.CardType;
        });
    };


    //=========================================================================
    // Game_Party
    //  ・アイテムをゲットした時の処理を再定義します。
    //
    //=========================================================================
    const _Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        _Game_Party_gainItem.call(this, item, amount, includeEquip);
        if (item && amount > 0 && item.etypeId == Params.CardType) {
            $gameSystem.addToCardBook(item.id);
        }
    };


    //=========================================================================
    // Window_CardBookIndex
    //  ・カード図鑑索引ウィンドウを定義します。
    //
    //=========================================================================
    function Window_CardBookIndex() {
        this.initialize.apply(this, arguments);
    }

    Window_CardBookIndex.prototype = Object.create(Window_Selectable.prototype);
    Window_CardBookIndex.prototype.constructor = Window_CardBookIndex;

    Window_CardBookIndex.lastTopCol = 0;
    Window_CardBookIndex.lastIndex  = 0;

    Window_CardBookIndex.prototype.initialize = function(x, y) {
        let width, height;
        width = Graphics.boxWidth;
        height = this.fittingHeight(Params.RowNumber);

        Window_Selectable.prototype.initialize.call(this, x, y, width, height);

        this.createArrows();

        this.refresh();
        this.setTopCol(Window_CardBookIndex.lastTopCol);
        this.select(Window_CardBookIndex.lastIndex);
        this.activate();
    };

    Window_CardBookIndex.prototype.createArrows = function() {
        this.leftArrowVisible = false;
        this.rightArrowVisible = false;
        this.leftArrowSprite = new Sprite();
        this.rightArrowSprite = new Sprite();
        this.addChild(this.leftArrowSprite);
        this.addChild(this.rightArrowSprite);
    };

    Window_CardBookIndex.prototype.maxCols = function() {
        return Math.max(Math.ceil(this.maxItems() / this.maxRows()), 1);
    };

    Window_CardBookIndex.prototype.maxRows = function() {
        return Params.RowNumber;
    };

    Window_CardBookIndex.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };

    Window_CardBookIndex.prototype.numVisibleCols = function() {
        return Params.ColNumber;
    };

    Window_CardBookIndex.prototype.itemRect = function(index) {
        let rect, maxRows, topCol;
        rect = new Rectangle();
        maxRows = this.maxRows();
        topCol = this.topCol();

        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = (Math.floor(index / maxRows) - topCol) * (rect.width + this.spacing());
        rect.y = index % maxRows * rect.height - this._scrollY;
        return rect;
    };

    Window_CardBookIndex.prototype.itemWidth = function() {
        return Math.floor((this.width - this.padding * 2 +
                           this.spacing()) / this.numVisibleCols() - this.spacing());
    };

    Window_CardBookIndex.prototype.itemHeight = function() {
        return this.lineHeight();
    };

    Window_CardBookIndex.prototype.maxPageRows = function() {
        return Params.RowNumber;
    };

    Window_CardBookIndex.prototype.maxPageCols = function() {
        let pageWidth;
        pageWidth = this.width - this.padding * 2;

        return Math.floor(pageWidth / this.itemWidth());
    };

    Window_CardBookIndex.prototype.maxPageItems = function() {
        return this.maxPageRows() * this.numVisibleCols();
    };

    Window_CardBookIndex.prototype.select = function(index) {
        Window_Selectable.prototype.select.call(this, index);
    };

    Window_CardBookIndex.prototype.cursorDown = function(wrap) {
        let index, maxItems;
        index = this.index();
        maxItems = this.maxItems();

        if (index < maxItems - 1) {
            this.select((index + 1) % maxItems);
        }
    };

    Window_CardBookIndex.prototype.cursorUp = function(wrap) {
        let index, maxItems;
        index = this.index();
        maxItems = this.maxItems();

        if (index > 0) {
            this.select((index - 1) % maxItems);
        }
    };

    Window_CardBookIndex.prototype.cursorRight = function(wrap) {
        let index, maxItems, maxRows, maxCols;
        index = this.index();
        maxItems = this.maxItems();
        maxRows = this.maxRows();
        maxCols = this.maxCols();

        if (maxCols >= 2) {
            if(index < maxItems - maxRows) {
                this.select((index + maxRows) % maxItems);
            } else if((index + maxRows - Math.floor(index % maxRows)) < maxItems) {
                this.select(index + maxRows - Math.floor(index % maxRows));
            }
        }
    };

    Window_CardBookIndex.prototype.cursorLeft = function(wrap) {
        let index, maxItems, maxRows, maxCols;
        index = this.index();
        maxItems = this.maxItems();
        maxRows = this.maxRows();
        maxCols = this.maxCols();

        if (maxCols >= 2 && index > maxRows - 1) {
            this.select((index - maxRows + maxItems) % maxItems);
        }
    };

    Window_CardBookIndex.prototype.cursorPagedown = function() {
        if (this.topCol() + this.maxPageCols() < this.maxCols()) {
            this.setTopCol(this.topCol() + this.maxPageCols());
            this.select(Math.min(this.index() + this.maxPageItems(), this.maxItems() - 1));
        }
    };

    Window_CardBookIndex.prototype.cursorPageup = function() {
        if (this.topCol() > 0) {
            this.setTopCol(this.topCol() - this.maxPageCols());
            this.select(Math.max(this.index() - this.maxPageItems(), 0));
        }
    };

    Window_CardBookIndex.prototype.scrollDown = function() {
        if (this.topCol() + this.maxPageCols() < this.maxCols()) {
            this.setTopCol(this.topCol() + 1);
        }
    };

    Window_CardBookIndex.prototype.scrollUp = function() {
        if (this.topCol() > 0) {
            this.setTopCol(this.topCol() - 1);
        }
    };

    Window_CardBookIndex.prototype.ensureCursorVisible = function() {
        let col;
        col = this.col();

        if (col < this.topCol()) {
            this.setTopCol(col);
        } else if (col > this.bottomCol()) {
            this.setBottomCol(col);
        }
    };

    Window_CardBookIndex.prototype.col = function() {
        return Math.floor(this.index() / this.maxRows());
    };

    Window_CardBookIndex.prototype.topCol = function() {
        return Math.floor(this._scrollX / (this.itemWidth() + this.textPadding() * 2));
    };

    Window_CardBookIndex.prototype.maxTopCol = function() {
        return Math.max(0, this.maxCols() - this.numVisibleCols());
    };

    Window_CardBookIndex.prototype.setTopCol = function(col) {
        let scrollX;
        scrollX = col.clamp(0, this.maxTopCol()) * this.itemWidth();

        if(scrollX > 0) {
            scrollX += this.spacing() * col;
        } else if(scrollX < 0){
            scrollX += this.spacing() * col;
        }
        if (this._scrollX !== scrollX) {
            this._scrollX = scrollX;
            this.refresh();
            this.updateCursor();
        }
    };

    Window_CardBookIndex.prototype.bottomCol = function() {
        return Math.max(0, this.topCol() + this.numVisibleCols() - 1);
    };

    Window_CardBookIndex.prototype.setBottomCol = function(col) {
        this.setTopCol(col - (this.numVisibleCols() - 1));
    };

    Window_CardBookIndex.prototype.topIndex = function() {
        return this.topCol() * this.maxRows();
    };

    Window_CardBookIndex.prototype.resetScroll = function() {
        this.setTopCol(0);
    };

    Window_CardBookIndex.prototype.setStatusWindow = function(statusWindow) {
        this._statusWindow = statusWindow;
        this.updateStatus();
    };

    Window_CardBookIndex.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStatus();
    };

    Window_CardBookIndex.prototype.updateStatus = function() {
        if (this._statusWindow) {
            this._statusWindow.setCard(this._list[this.index()]);
        }
    };

    Window_CardBookIndex.prototype.refresh = function() {
        this._list = [];

        let cardList, i;
        cardList = $gameSystem.makeCardList();

        for (i = 0; i < cardList.length; i++) {
            this._list.push(cardList[i]);
        }
        this.createContents();
        this.drawAllItems();
        this.refreshArrows();
    };

    Window_CardBookIndex.prototype.drawItem = function(index) {
        let card, rect, name;
        card = this._list[index];
        rect = this.itemRectForText(index);

        if ($gameSystem.isInCardBook(card)) {
            name = card.name;
        } else {
            name = Params.UnknownData;
        }
        this.drawText(name, rect.x, rect.y, rect.width);
    };

    Window_CardBookIndex.prototype.processCancel = function() {
        Window_Selectable.prototype.processCancel.call(this);
        Window_CardBookIndex.lastTopCol = this.topCol();
        Window_CardBookIndex.lastIndex = this.index();
    };

    Window_CardBookIndex.prototype.updateArrows = function() {
        let topCol, maxTopCol;
        topCol = this.topCol();
        maxTopCol = this.maxTopCol();

        this.rightArrowVisible = maxTopCol > 0 && topCol < maxTopCol;
        this.leftArrowVisible = topCol > 0;
        this.rightArrowSprite.visible = this.isOpen() && this.rightArrowVisible;
        this.leftArrowSprite.visible = this.isOpen() && this.leftArrowVisible;
    };

    Window_CardBookIndex.prototype.refreshArrows = function() {
        let w, h, p, q, sx, sy;
        w = this._width;
        h = this._height;
        p = 24;
        q = p/2;
        sx = 96+p;
        sy = 40;

        this.leftArrowSprite.bitmap = this.windowskin;
        this.leftArrowSprite.anchor.x = 0.5;
        this.leftArrowSprite.anchor.y = 0.5;
        this.leftArrowSprite.setFrame(sx, sy, q, p);
        this.leftArrowSprite.move(q, h/2);
        this.rightArrowSprite.bitmap = this.windowskin;
        this.rightArrowSprite.anchor.x = 0.5;
        this.rightArrowSprite.anchor.y = 0.5;
        this.rightArrowSprite.setFrame(sx+q+p, sy, q, p);
        this.rightArrowSprite.move(w-q, h/2);
    };


    //=========================================================================
    // Window_CardBookStatus
    //  ・カード図鑑の詳細ウィンドウを定義します。
    //
    //=========================================================================
    function Window_CardBookProgress() {
        this.initialize.apply(this, arguments);
    }

    Window_CardBookProgress.prototype = Object.create(Window_Gold.prototype);
    Window_CardBookProgress.prototype.constructor = Window_CardBookProgress;

    Window_CardBookProgress.prototype.initialize = function(value, maxValue) {
        let width, height, x, y;
        width = this.windowWidth();
        height = this.windowHeight();
        x = Params.ProgressWindow.X;
        y = Params.ProgressWindow.Y;
        this._value = value;
        this._maxValue = maxValue;

        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_CardBookProgress.prototype.windowWidth = function() {
        return Params.ProgressWindow.W;
    };

    Window_CardBookProgress.prototype.refresh = function() {
        let messageWidth, text;
        messageWidth = Math.floor(this.contents.width - this.textPadding());
        text = this.format()
                .replace("$1", this._value)
                .replace("$2", this._maxValue)
                .replace("$3", Math.floor(this._value / this._maxValue * 100));

        this.contents.clear();
        this.drawText(text, 0, 0, messageWidth, "right");
    };

    Window_CardBookProgress.prototype.format = function() {
        return Params.ProgressWindow.ProgressFormat;
    };


    //=========================================================================
    // Window_CardBookStatus
    //  ・カード図鑑の詳細ウィンドウを定義します。
    //
    //=========================================================================
    function Window_CardBookStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_CardBookStatus.prototype = Object.create(Window_Base.prototype);
    Window_CardBookStatus.prototype.constructor = Window_CardBookStatus;

    Window_CardBookStatus.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._card = null;
        this._cardSprite = new Sprite();
        this._cardSprite.anchor.x = 0;
        this._cardSprite.anchor.y = 0;
        this._cardSprite.x = this.standardPadding();
        this._cardSprite.y = this.standardPadding();
        this.addChildToBack(this._cardSprite);
        this.refresh();
    };

    Window_CardBookStatus.prototype.setCard = function(card) {
        if (this._card !== card) {
            this._card = card;
            this.refresh();
        }
    };

    Window_CardBookStatus.prototype.update = function() {
        Window_Base.prototype.update.call(this);

        let bitmapHeight, contentsHeight, scale;
        scale = 1;

        if (this._cardSprite.bitmap) {
            bitmapHeight = this._cardSprite.bitmap.height;
            contentsHeight = this.contents.height;
            if (bitmapHeight > contentsHeight) {
                scale = contentsHeight / bitmapHeight;
            }
            this._cardSprite.scale.x = scale;
            this._cardSprite.scale.y = scale;
        }
    };

    Window_CardBookStatus.prototype.refresh = function() {
        let card, x, x2, y, y2, lineHeight, lineHeight2, picture, bitmap, name, rank,
            illust, i, traits, iconBoxWidth, skill;
        card = this._card;
        x = 280;
        x2 = 0;
        y = 0;
        y2 = 0;
        lineHeight = this.lineHeight();
        lineHeight2 = this.lineHeight() - 8;

        this.contents.clear();

        if (!card || !$gameSystem.isInCardBook(card)) {
            this._cardSprite.bitmap = null;
            return;
        }

        picture = card.meta.card_picture || "";
        bitmap = null;
        if(picture) {
            bitmap = ImageManager.loadPicture(picture);
        }
        this._cardSprite.bitmap = bitmap;

        name = card.name || "";
        this.resetTextColor();
        this.drawText(name, x, y);

        rank = card.meta.card_rank || "";
        y = lineHeight + this.textPadding();
        this.drawText(rank, x, y);

        illust = card.meta.card_illust || "";
        x2 = x + 70;
        this.drawText(illust, x2, y);

        this.contents.fontSize = 20;
        y += lineHeight;
        y2 = y;
        x2 = x;
        for(i = 0; i < 8; i++) {
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(i), x2, y2, 80);
            this.drawText(":", x2 + 70, y2, 30, 'right');
            this.resetTextColor();
            this.drawText(card.params[i], x2 + 80, y2, 60, 'right');
            y2 += lineHeight2;
            if(i == 3) {
                x2 += 170;
                y2 = y;
            }
        }

        traits = card.traits.filter(function(trait) {
            return trait.code == Game_BattlerBase.TRAIT_SKILL_ADD;
        });
        y = y2 + lineHeight2;
        this.changeTextColor(this.powerUpColor());
        this.drawText(Params.SpecialSkill + ":", x, y);
        this.resetFontSettings();
        x += 20;
        y += lineHeight;
        iconBoxWidth = Window_Base._iconWidth + 4;
        if(traits.length) {
            for(i = 0; i < traits.length; i++) {
                skill = $dataSkills[traits[i].dataId];
                this.drawIcon(skill.iconIndex, x + 2, y + 2);
                this.drawText(skill.name, x + iconBoxWidth, y);
                y += lineHeight;
            }
        } else {
            this.drawText(Params.NoneSkill, x, y);
        }

        this.resetFontSettings();
    };


    //=========================================================================
    // Scene_CardBook
    //  ・カード図鑑シーンを定義します。
    //
    //=========================================================================
    function Scene_CardBook() {
        this.initialize.apply(this, arguments);
    }

    Scene_CardBook.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CardBook.prototype.constructor = Scene_CardBook;

    Scene_CardBook.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_CardBook.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);

        let wy, ww, wh;
        this._indexWindow = new Window_CardBookIndex(0, 0);
        this._indexWindow.opacity = Params.CardOpacity;
        this._indexWindow.setHandler('cancel', this.popScene.bind(this));
        wy = this._indexWindow.height;
        ww = Graphics.boxWidth;
        wh = Graphics.boxHeight - wy;
        this._progressWindow = new Window_CardBookProgress($gameSystem.getCardCount(), $gameSystem.makeCardList().length);
        this._progressWindow.opacity = Params.CardOpacity;
        if(!Params.ProgressWindow.ProgressUse) {
            this._progressWindow.hide();
        }
        this._statusWindow = new Window_CardBookStatus(0, wy, ww, wh);
        this._statusWindow.opacity = Params.CardOpacity;
        this.addWindow(this._indexWindow);
        this.addWindow(this._statusWindow);
        this.addWindow(this._progressWindow);
        this._indexWindow.setStatusWindow(this._statusWindow);
    };

    Scene_CardBook.prototype.createBackground = function() {
        if(Params.CardBg){
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = ImageManager.loadPicture(Params.CardBg);
            this.addChild(this._backgroundSprite);
        } else {
            Scene_MenuBase.prototype.createBackground.call(this);
        }
    };


    //=========================================================================
    // Window_MenuCommand
    //  ・メニュー画面にカードリストコマンドを定義します。
    //
    //=========================================================================
    const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _Window_MenuCommand_addOriginalCommands.call(this);

        this.addCommand(Params.MenuCommand, 'cardbook', true);
    };


    //=========================================================================
    // Scene_Menu
    //  ・メニュー画面にカードリストコマンドを定義します。
    //
    //=========================================================================
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('cardbook', this.commandCardBook.bind(this));
    };

    Scene_Menu.prototype.commandCardBook = function() {
        SceneManager.push(Scene_CardBook);
    };

})();