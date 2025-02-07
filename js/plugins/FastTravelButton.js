/*:
 * @target MZ
 * @plugindesc Adds a Fast Travel button on the screen for quick access to discovered locations.
 * @author YourName
 * @help
 * This plugin creates a clickable Fast Travel button on the screen.
 * 
 * - Clicking the button opens the Fast Travel menu.
 * - The button is positioned in the bottom-left corner by default.
 * - It will only appear if at least one location is discovered.
 *
 * No plugin commands required—just enable the plugin.
 */

(() => {
    class Sprite_FastTravelButton extends Sprite_Clickable {
        constructor() {
            super();
            this.initialize();
        }

        initialize() {
            super.initialize();
            this.createButton();
        }

        createButton() {
            this.bitmap = ImageManager.loadSystem("FastTravelIcon"); // Use an image from /img/system/
            this.x = 10;  // Adjust position (Left side)
            this.y = Graphics.boxHeight - 80;  // Bottom corner
            this.opacity = Object.keys($gameSystem._discoveredLocations).length > 0 ? 255 : 0; // Hide if no locations
        }

        update() {
            super.update();
            if (Object.keys($gameSystem._discoveredLocations).length > 0) {
                this.opacity = 255; // Show when locations are available
            } else {
                this.opacity = 0;  // Hide if no discovered locations
            }
        }

        onClick() {
            if (this.opacity > 0) {
                SceneManager.push(Scene_FastTravel); // Open Fast Travel Menu
            }
        }
    }

    const alias_SceneMapCreateSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        alias_SceneMapCreateSpriteset.call(this);
        this.createFastTravelButton();
    };

    Scene_Map.prototype.createFastTravelButton = function() {
        this._fastTravelButton = new Sprite_FastTravelButton();
        this.addChild(this._fastTravelButton);
    };
})();
