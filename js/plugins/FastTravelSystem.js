(() => {
    // Initialize discovered locations
    const alias_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        alias_Game_System_initialize.call(this);
        this._discoveredLocations = {}; // Now an object storing mapId, x, y
    };

    // Mark a location as discovered with coordinates
    Game_System.prototype.discoverLocation = function(locationId, mapId, x, y) {
        if (!this._discoveredLocations[locationId]) {
            this._discoveredLocations[locationId] = { mapId, x, y };
            console.log(`Discovered location: ${locationId} at Map ${mapId} (${x}, ${y})`);
        }
    };

    // Check if a location is discovered
    Game_System.prototype.isLocationDiscovered = function(locationId) {
        return !!this._discoveredLocations[locationId];
    };

    // Fast Travel Scene
    function Scene_FastTravel() {
        this.initialize(...arguments);
    }

    Scene_FastTravel.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_FastTravel.prototype.constructor = Scene_FastTravel;

    Scene_FastTravel.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createMapWindow();
    };

    Scene_FastTravel.prototype.createMapWindow = function() {
        const rect = new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight);
        this._mapWindow = new Window_FastTravel(rect);
        this._mapWindow.setHandler("ok", this.onLocationSelect.bind(this));
        this._mapWindow.setHandler("cancel", this.onLocationCancel.bind(this));
        this.addWindow(this._mapWindow);
        this._mapWindow.activate();
    };

    Scene_FastTravel.prototype.onLocationSelect = function() {
        const locationId = this._mapWindow.currentLocationId();
        if (locationId) {
            this.fastTravelTo(locationId);
        }
    };

    Scene_FastTravel.prototype.onLocationCancel = function() {
        this.popScene(); // Return to previous menu
    };

    Scene_FastTravel.prototype.fastTravelTo = function(locationId) {
        const locationData = $gameSystem._discoveredLocations[locationId];
        if (locationData) {
            SceneManager.goto(Scene_Map); // Exit the menu immediately
            $gamePlayer.reserveTransfer(locationData.mapId, locationData.x, locationData.y, 0, 2);
        }
    };
  
    // Fast Travel Window
    function Window_FastTravel() {
        this.initialize(...arguments);
    }

    Window_FastTravel.prototype = Object.create(Window_Selectable.prototype);
    Window_FastTravel.prototype.constructor = Window_FastTravel;

    Window_FastTravel.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.refresh();
    };

    Window_FastTravel.prototype.refresh = function() {
        this.contents.clear();
        this._data = Object.keys($gameSystem._discoveredLocations);
        this.drawAllLocations();
    };

    Window_FastTravel.prototype.drawAllLocations = function() {
        this._data.forEach((locationId, index) => {
            const locationName = this.getLocationName(locationId);
            const iconIndex = this.getLocationIcon(locationId);
            this.drawIcon(iconIndex, 0, index * this.lineHeight());
            this.drawTextEx(locationName, 32, index * this.lineHeight());
        });
    };

    Window_FastTravel.prototype.getLocationName = function(locationId) {
        const locationNames = {
            1: "Forest Village",
            2: "Mountain Pass",
        };
        return locationNames[locationId] || `Unknown Location (${locationId})`;
    };

    Window_FastTravel.prototype.getLocationIcon = function(locationId) {
        const locationIcons = {
            1: 10, // Town icon
            2: 11, // Dungeon icon
        };
        return locationIcons[locationId] || 0;
    };

    Window_FastTravel.prototype.currentLocationId = function() {
        return this._data[this.index()];
    };

    Window_FastTravel.prototype.maxItems = function() {
        return this._data.length;
    };

    Window_FastTravel.prototype.processOk = function() {
        if (this.index() >= 0) {
            this.callOkHandler();
        }
    };

    // Add Fast Travel to the Menu
    const alias_Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {
        alias_Window_MenuCommand_makeCommandList.call(this);
        this.addCommand("Fast Travel", "fastTravel", Object.keys($gameSystem._discoveredLocations).length > 0);
    };

    const alias_Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        alias_Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("fastTravel", this.commandFastTravel.bind(this));
    };

    Scene_Menu.prototype.commandFastTravel = function() {
        SceneManager.push(Scene_FastTravel);
    };
})();
