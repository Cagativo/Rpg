// QuestSystem.js

/*:
 * @plugindesc Adds a Quests menu to the game.
 * @author Your Name
 */

(function() {

    // Add quest-related properties and methods to Game_System
    Game_System.prototype.initialize = function() {
        // Existing initialization code...
        this._quests = []; // Array to store quests
    };

    Game_System.prototype.addQuest = function(quest) {
        this._quests.push(quest);
    };

    Game_System.prototype.quests = function() {
        return this._quests;
    };

    Game_System.prototype.hasQuests = function() {
        console.log("Quests in system:", this._quests);
        return this._quests && this._quests.length > 0;
    };

    Game_System.prototype.isQuestMenuDisabled = function() {
        return false; // Add logic here to disable the quest menu if needed
    };

    // Define the Window_Quests class
    function Window_Quests() {
        this.initialize(...arguments);
    }

    Window_Quests.prototype = Object.create(Window_Selectable.prototype);
    Window_Quests.prototype.constructor = Window_Quests;

    Window_Quests.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.refresh();
    };

    Window_Quests.prototype.refresh = function() {
        this.contents.clear();
        this.drawAllQuests();
    };

    Window_Quests.prototype.drawAllQuests = function() {
        const quests = $gameSystem.quests();
        quests.forEach((quest, index) => {
            const y = index * this.lineHeight();
            this.drawQuest(quest, y);
        });
    };

    Window_Quests.prototype.drawQuest = function(quest, y) {
        const status = quest.completed ? "Completed" : "Available";
        this.drawText(`${quest.name}: ${status}`, 0, y, this.contents.width, "left");
    };

    // Define the Scene_Quests class
    function Scene_Quests() {
        this.initialize(...arguments);
    }

    Scene_Quests.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Quests.prototype.constructor = Scene_Quests;

    Scene_Quests.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Quests.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createQuestsWindow();
    };

    Scene_Quests.prototype.createQuestsWindow = function() {
        const rect = this.questsWindowRect();
        this._questsWindow = new Window_Quests(rect);
        this._questsWindow.setHandler("ok", this.onQuestsOk.bind(this));
        this._questsWindow.setHandler("cancel", this.onQuestsCancel.bind(this));
        this.addWindow(this._questsWindow);
    };

    Scene_Quests.prototype.questsWindowRect = function() {
        const wx = 0;
        const wy = this.mainAreaTop();
        const ww = Graphics.boxWidth;
        const wh = Graphics.boxHeight - this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_Quests.prototype.onQuestsOk = function() {
        // Handle the OK action (e.g., view quest details)
    };

    Scene_Quests.prototype.onQuestsCancel = function() {
        SceneManager.pop();
    };

    // Add the Quests command to the menu
    Window_MenuCommand.prototype.addQuestsCommand = function() {
        console.log("Adding Quests command...");
        if (this.needsCommand("quests")) {
            const enabled = this.isQuestsEnabled();
            this.addCommand("Quests", "quests", enabled);
        }
    };

    Window_MenuCommand.prototype.isQuestsEnabled = function() {
        const enabled = $gameSystem.hasQuests() && !$gameSystem.isQuestMenuDisabled();
        console.log(`Quests command enabled: ${enabled}`);
        return enabled;
    };

    Window_MenuCommand.prototype.makeCommandList = function() {
        this.addMainCommands();
        this.addFormationCommand();
        this.addOriginalCommands();
        this.addQuestsCommand(); // Add the Quests command
        this.addSaveCommand();
        this.addGameEndCommand();
    };

})();