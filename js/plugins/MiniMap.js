/*:
 * @target MZ
 * @plugindesc Adds a minimap to the game, displaying the player's position and discovered locations.
 * @author YourName
 * @help
 * This plugin adds a minimap to the screen that shows:
 * - The player's position
 * - Discovered locations (if using a fast travel system)
 *
 * The minimap appears in the **top-right corner** by default.
 *
 * No plugin commands needed—just enable the plugin.
 */

(() => {
    function Window_Minimap() {
        this.initialize(...arguments);
    }

    Window_Minimap.prototype = Object.create(Window_Base.prototype);
    Window_Minimap.prototype.constructor = Window_Minimap;

    Window_Minimap.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this.opacity = 150; // Semi-transparent
        this.refresh();
    };

    Window_Minimap.prototype.refresh = function() {
        this.contents.clear();
        this.drawMap();
    };

    Window_Minimap.prototype.drawMap = function() {
        const mapId = $gameMap.mapId();
        const playerX = $gamePlayer.x;
        const playerY = $gamePlayer.y;

        // Draw the player as a small dot
        this.contents.fillRect(playerX * 2, playerY * 2, 4, 4, ColorManager.textColor(2));

        // Draw discovered locations
        if ($gameSystem._discoveredLocations) {
            for (const locId in $gameSystem._discoveredLocations) {
                const loc = $gameSystem._discoveredLocations[locId];
                if (loc.mapId === mapId) {
                    this.contents.fillRect(loc.x * 2, loc.y * 2, 4, 4, ColorManager.textColor(4));
                }
            }
        }
    };

    // Add the minimap to the Scene_Map
    const alias_SceneMapCreateAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        alias_SceneMapCreateAllWindows.call(this);
        const rect = new Rectangle(Graphics.boxWidth - 150, 10, 140, 140);
        this._minimapWindow = new Window_Minimap(rect);
        this.addWindow(this._minimapWindow);
    };

    // Update minimap when player moves
    const alias_GamePlayerUpdate = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        alias_GamePlayerUpdate.call(this, sceneActive);
        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._minimapWindow) {
            SceneManager._scene._minimapWindow.refresh();
        }
    };
})();
