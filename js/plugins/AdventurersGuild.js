(function() {
    // Extend Game_System to handle both quests and guild rank
    const alias_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        alias_Game_System_initialize.call(this);
        this._quests = [];
        this._guildRank = 'F';
        this._guildPoints = 0;
    };

    Game_System.prototype.addQuest = function(quest) {
        this._quests.push(quest);
        if (SceneManager._scene instanceof Scene_Quests) {
            SceneManager._scene.refreshScene();
        }
    };

    Game_System.prototype.quests = function() {
        return this._quests;
    };

    Game_System.prototype.hasQuests = function() {
        return this._quests.length > 0;
    };

    Game_System.prototype.guildRank = function() {
        return this._guildRank;
    };

    Game_System.prototype.guildPoints = function() {
        return this._guildPoints;
    };

    Game_System.prototype.addGuildPoints = function(points) {
        this._guildPoints += points;
        console.log(`Added ${points} guild points. Total: ${this._guildPoints}`);
        this.checkRankUp();
    };
    
    Game_System.prototype.checkRankUp = function() {
        const rankRequirements = {
            'F': { points: 0, nextRank: 'E' },
            'E': { points: 10, nextRank: 'D' },
            'D': { points: 25, nextRank: 'C' },
            'C': { points: 50, nextRank: 'B' },
            'B': { points: 100, nextRank: 'A' },
            'A': { points: 200, nextRank: 'S' },
            'S': { points: Infinity, nextRank: null }
        };
        
        const currentRank = this._guildRank;
        if (rankRequirements[currentRank].nextRank && this._guildPoints >= rankRequirements[currentRank].points) {
            this._guildRank = rankRequirements[currentRank].nextRank;
            console.log(`Rank up! New rank: ${this._guildRank}`);
            this.rankUpNotification();
        }
    };

    Game_System.prototype.rankUpNotification = function() {
        $gameMessage.add("Congratulations! You have been promoted to Rank " + this._guildRank + "!");
    };

    Game_System.prototype.completeQuest = function(quest) {
        quest.status = "completed";
        this.addGuildPoints(quest.guildPoints);
    
        // Grant gold reward
        if (quest.reward) {
            $gameParty.gainGold(quest.reward);
            console.log(`Received ${quest.reward} gold for completing ${quest.name}`);
        }
    };

    // Rank Window
    function Window_Rank() {
        this.initialize(...arguments);
    }

    Window_Rank.prototype = Object.create(Window_Base.prototype);
    Window_Rank.prototype.constructor = Window_Rank;

    Window_Rank.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this.refresh();
    };

    Window_Rank.prototype.refresh = function() {
        this.contents.clear();
        const rank = $gameSystem.guildRank();
        const points = $gameSystem.guildPoints();

        // Draw the rank inside a triangle
        this.drawRankTriangle(rank, 10, 10);

        // Draw guild points below the triangle
        this.drawTextEx(`Guild Points: ${points}`, 60, 40);
    };

    Window_Rank.prototype.drawRankTriangle = function(rank, x, y) {
        const triangleSize = 50; // Size of the triangle
        const ctx = this.contents.context;

        // Draw the outer triangle
        ctx.beginPath();
        ctx.moveTo(x + triangleSize / 2, y);
        ctx.lineTo(x + triangleSize, y + triangleSize);
        ctx.lineTo(x, y + triangleSize);
        ctx.closePath();
        ctx.strokeStyle = "#FFFFFF"; // White border
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the rank text inside the triangle
        const textX = x + triangleSize / 2 - this.textWidth(rank) / 2;
        const textY = y + triangleSize / 2 + this.lineHeight() / 4;
        this.drawTextEx(rank, textX, textY);
    };

    // Quest List Window
    function Window_Quests() {
        this.initialize(...arguments);
    }
    
    Window_Quests.prototype = Object.create(Window_Selectable.prototype);
    Window_Quests.prototype.constructor = Window_Quests;
    
    Window_Quests.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._filter = "available"; 
        this.refresh();
    };
    
    Window_Quests.prototype.setFilter = function(filter) {
        this._filter = filter;
        this.refresh();
    };
    
    Window_Quests.prototype.refresh = function() {
        this.contents.clear();
        this.filterQuestsByRank();
        this.drawAllQuests();
    };
    
    Window_Quests.prototype.filterQuestsByRank = function() {
        const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
        const playerRank = $gameSystem.guildRank();
        
        this._data = $gameSystem.quests().filter(quest => {
            const questRankIndex = rankOrder.indexOf(quest.requiredRank);
            const playerRankIndex = rankOrder.indexOf(playerRank);
            return playerRankIndex >= questRankIndex && quest.status === this._filter;
        });
    };
    
    Window_Quests.prototype.drawAllQuests = function() {
        this.makeItemList();
        this.drawItems();
    };
    
    Window_Quests.prototype.makeItemList = function() {
        this._data = $gameSystem.quests().filter(q => q.status === this._filter);
    };
    
    Window_Quests.prototype.drawItems = function() {
        const startY = 0; // Start drawing quests from the top
        this._data.forEach((quest, i) => {
            const icon = quest.status === "available" ? "⚔️" : "✅"; // Use icons for status
            const line = `${icon} ${quest.name}`;
            const rect = new Rectangle(0, startY + i * (this.lineHeight() + 5), this.contents.width, this.lineHeight());
            
            // Highlight the selected quest
            if (i === this.index()) {
                this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "#FFD70022"); // Gold highlight
            }
            
            this.drawTextEx(line, rect.x, rect.y);
        });
    };
    
    Window_Quests.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };
    
    Window_Quests.prototype.processOk = function() {
        if (this.index() >= 0) {
            const selectedQuest = this._data[this.index()];
            SceneManager._scene.displayQuestDetails(selectedQuest);
        }
    };
    
    Window_Quests.prototype.processCancel = function() {
        if (this._filter === "available" || this._filter === "completed") {
            SceneManager._scene.activateSubmenu();
        } else {
            this.deselect();
            this.refresh();
        }
    };

    // Quest Details Window
    function Window_QuestDetails() {
        this.initialize(...arguments);
    }

    Window_QuestDetails.prototype = Object.create(Window_Base.prototype);
    Window_QuestDetails.prototype.constructor = Window_QuestDetails;

    Window_QuestDetails.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._quest = null;
        this.refresh();
    };

    Window_QuestDetails.prototype.setQuest = function(quest) {
        this._quest = quest;
        this.refresh();
    };

    Window_QuestDetails.prototype.drawWrappedText = function(text, x, y, maxWidth) {
        let words = text.split(" ");
        let line = "";
        let lineY = y;
        
        words.forEach(word => {
            let testLine = line + (line.length > 0 ? " " : "") + word;
            let testWidth = this.textWidth(testLine);
    
            if (testWidth > maxWidth) {
                this.drawTextEx(line, x, lineY);
                line = word;
                lineY += this.lineHeight();
            } else {
                line = testLine;
            }
        });
    
        if (line.length > 0) {
            this.drawTextEx(line, x, lineY);
        }
    };
    

    Window_QuestDetails.prototype.refresh = function() {
        this.contents.clear();
        if (this._quest) {
            this.drawTextEx(`\\c[1]${this._quest.name}\\c[0]`, 0, 0);
            this.drawTextEx(`★ Difficulty: ${this._quest.rDifficulty}`, 0, this.lineHeight());
            this.drawTextEx(`💰 Reward: ${this._quest.reward}`, 0, this.lineHeight() * 2);
            this.drawTextEx(`📜 Description:`, 0, this.lineHeight() * 3);
            this.drawWrappedText(this._quest.description, 0, this.lineHeight() * 4, this.contentsWidth());
        } else {
            this.drawText("Select a quest to view details.", 0, 0, this.contentsWidth());
        }
    };

    // Scene for Quests
    function Scene_Quests() {
        this.initialize(...arguments);
    }

    Scene_Quests.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Quests.prototype.constructor = Scene_Quests;

    Scene_Quests.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createRankWindow(); // Add rank window
        this.createSubmenuWindow();
        this.createQuestsWindow();
        this.createQuestDetailsWindow();
        this._submenuWindow.activate();
    };

    Scene_Quests.prototype.createRankWindow = function() {
        const rect = new Rectangle(0, this.mainAreaTop(), Graphics.boxWidth, this.calcWindowHeight(2, true));
        this._rankWindow = new Window_Rank(rect);
        this.addWindow(this._rankWindow);
    };

    Scene_Quests.prototype.createSubmenuWindow = function() {
        const rect = new Rectangle(0, this.mainAreaTop() + this.calcWindowHeight(2, true), Graphics.boxWidth, this.calcWindowHeight(2, true));
        this._submenuWindow = new Window_Submenu(rect);
        this._submenuWindow.setHandler("ok", this.onSubmenuOk.bind(this));
        this._submenuWindow.setHandler("cancel", this.onSubmenuCancel.bind(this));
        this.addWindow(this._submenuWindow);
        this._submenuWindow.select(0);
    };

    Scene_Quests.prototype.onSubmenuOk = function() {
        const index = this._submenuWindow.index();
        const filter = index === 0 ? "available" : "completed";
        this._questsWindow.setFilter(filter);
        this._questsWindow.refresh();
        this._questDetailsWindow.setQuest(null);
        this._questsWindow.activate();
    };

    Scene_Quests.prototype.onSubmenuCancel = function() {
        this.popScene();
    };

    Scene_Quests.prototype.createQuestsWindow = function() {
        const rect = new Rectangle(0, this.mainAreaTop() + this.calcWindowHeight(4, true), Graphics.boxWidth / 2, Graphics.boxHeight - this.mainAreaTop() - this.calcWindowHeight(4, true));
        this._questsWindow = new Window_Quests(rect);
        this._questsWindow.setHandler("ok", this.onQuestSelect.bind(this));
        this._questsWindow.setHandler("cancel", this.onQuestCancel.bind(this));
        this.addWindow(this._questsWindow);
    };

    Scene_Quests.prototype.createQuestDetailsWindow = function() {
        const rect = new Rectangle(Graphics.boxWidth / 2, this.mainAreaTop() + this.calcWindowHeight(4, true), Graphics.boxWidth / 2, Graphics.boxHeight - this.mainAreaTop() - this.calcWindowHeight(4, true));
        this._questDetailsWindow = new Window_QuestDetails(rect);
        this.addWindow(this._questDetailsWindow);
    };

    Scene_Quests.prototype.onQuestSelect = function() {
        const selectedQuest = this._questsWindow._data[this._questsWindow.index()];
        if (selectedQuest) {
            this.displayQuestDetails(selectedQuest);
        }
    };

    Scene_Quests.prototype.displayQuestDetails = function(quest) {
        this._questDetailsWindow.setQuest(quest);
    };

    Scene_Quests.prototype.onQuestCancel = function() {
        this._questDetailsWindow.setQuest(null);
        this._questsWindow.activate();
        this._questsWindow.setFilter("available");
        this._questsWindow.refresh();
    };

    Scene_Quests.prototype.refreshScene = function() {
        this._questsWindow.refresh();
        this._questDetailsWindow.refresh();
    };

    Scene_Quests.prototype.activateSubmenu = function() {
        this._submenuWindow.activate();
    };

    // Submenu Window
    function Window_Submenu() {
        this.initialize(...arguments);
    }

    Window_Submenu.prototype = Object.create(Window_Selectable.prototype);
    Window_Submenu.prototype.constructor = Window_Submenu;

    Window_Submenu.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.refresh();
        this.select(0);
    };

    Window_Submenu.prototype.refresh = function() {
        this.contents.clear();
        this.drawText("Available Quests", 0, 0, this.contents.width, "center");
        this.drawText("Completed Quests", 0, this.lineHeight(), this.contents.width, "center");
    };

    Window_Submenu.prototype.maxItems = function() {
        return 2;
    };

    // Add "Quests" option to menu
    const alias_Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {
        alias_Window_MenuCommand_makeCommandList.call(this);
        this.addCommand("Quests", "quests", true);
    };

    const alias_Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        alias_Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("quests", this.commandQuests.bind(this));
    };

    Scene_Menu.prototype.commandQuests = function() {
        SceneManager.push(Scene_Quests);
    };
})();