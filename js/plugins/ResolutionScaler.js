/*:
 * @target MZ
 * @plugindesc Dynamically resizes the game to fit the screen resolution. v1.1
 * @author YourName
 *
 * @help
 * This plugin forces RPG Maker MZ to use the resolution defined in the plugin parameters.
 * It ensures that all scenes, windows, and graphical elements scale properly.
 *
 * @param Screen Width
 * @desc The desired game screen width.
 * @type number
 * @default 1920
 *
 * @param Screen Height
 * @desc The desired game screen height.
 * @type number
 * @default 1080
 */

(() => {
    const parameters = PluginManager.parameters('ResolutionScaler');
    const SCREEN_WIDTH = Math.max(Number(parameters["Screen Width"]) || 1920, 800);
    const SCREEN_HEIGHT = Math.max(Number(parameters["Screen Height"]) || 1080, 600);

    // Resize Graphics when game starts
    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        Graphics.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    };

    // Resize SceneManager to fit new screen size
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        Graphics.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    };

    // Resize all windows to fit new resolution
    const _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(rect) {
        if (!rect) {
            rect = new Rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        }
        _Window_Base_initialize.call(this, rect);
    };
})();
