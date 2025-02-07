(() => {
    class Sprite_ExpBar extends Sprite {
        constructor() {
            super();
            this.bitmap = new Bitmap(Graphics.boxWidth, 10); // Wider, thinner bar
            this.x = 3;  // Stretch across the full width
            this.y = Graphics.boxHeight - 0; // Set it at the very bottom
            this.drawExpBar();
        }

        drawExpBar() {
            this.bitmap.clear();
            const actor = $gameParty.leader();
            if (!actor) return;

            const expNeeded = actor.nextLevelExp() - actor.currentLevelExp();
            const expGained = actor.currentExp() - actor.currentLevelExp();
            const width = (expGained / expNeeded) * Graphics.boxWidth; // Full width

            // Background bar (dark gray)
            this.bitmap.fillRect(0, 0, Graphics.boxWidth, 10, "rgba(30, 30, 30, 1)");
            // Filled EXP bar (blue-green)
            this.bitmap.fillRect(0, 0, width, 10, "rgba(0, 200, 255, 1)");
        }

        update() {
            super.update();
            this.drawExpBar();
        }
    }

    const alias_SceneMapCreateSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        alias_SceneMapCreateSpriteset.call(this);
        this.createExpBar();
    };

    Scene_Map.prototype.createExpBar = function() {
        this._expBar = new Sprite_ExpBar();
        this.addChild(this._expBar);
    };
})();
