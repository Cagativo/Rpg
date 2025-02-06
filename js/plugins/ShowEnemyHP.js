/*:
 * @target MZ
 * @plugindesc Displays enemy HP bar and numbers above their sprites in battle.
 * @author André Do2g
 */

(function() {
    // Override the Sprite_Enemy class to draw HP bar and numbers
    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        this.drawEnemyHP();
    };

    Sprite_Enemy.prototype.drawEnemyHP = function() {
        if (this._enemy) {
            const enemy = this._enemy;
            const hp = enemy.hp;
            const maxHp = enemy.mhp;
            const hpText = `${hp}/${maxHp}`;
            const hpRatio = hp / maxHp;

            // Clear previous graphics
            if (this._hpBar) {
                this.removeChild(this._hpBar);
            }
            if (this._hpText) {
                this.removeChild(this._hpText);
            }

            // Draw HP bar
            this._hpBar = new PIXI.Graphics();
            this._hpBar.beginFill(0xFF0000); // Red background (missing HP)
            this._hpBar.drawRect(-50, -this.height - 30, 100, 10); // Bar dimensions
            this._hpBar.endFill();
            this._hpBar.beginFill(0x00FF00); // Green foreground (current HP)
            this._hpBar.drawRect(-50, -this.height - 30, 100 * hpRatio, 10); // Fill based on HP ratio
            this._hpBar.endFill();

            // Draw HP text
            this._hpText = new PIXI.Text(hpText, {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });

            // Position the bar and text
            this._hpBar.x = 0;
            this._hpBar.y = 0;
            this._hpText.x = -this._hpText.width / 2;
            this._hpText.y = -this.height - 40;

            // Add the bar and text to the sprite
            this.addChild(this._hpBar);
            this.addChild(this._hpText);
        }
    };
})();