/*:
 * @target MZ
 * @plugindesc Moves the main menu to the top-left corner of the screen.
 * @author YourName
 * @help
 * This plugin repositions the main menu in RPG Maker MZ
 * so that it appears in the top-left corner instead of the top-right.
 *
 * No parameters needed. Just enable the plugin.
 */

(() => {
    Scene_Menu.prototype.commandWindowRect = function() {
        const ww = this.mainCommandWidth(); // Menu width
        const wh = this.mainAreaHeight();  // Menu height
        const wx = 10;  // Move to the left side
        const wy = 10;  // Keep it at the top
        return new Rectangle(wx, wy, ww, wh);
    };
})();
