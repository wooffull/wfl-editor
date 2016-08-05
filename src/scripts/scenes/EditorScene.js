"use strict";

var Scene = wfl.display.Scene;

class EditorScene extends Scene {
    constructor(canvas, mouse, keyboard) {
        super(canvas);

        this.canvas   = canvas;
        this.mouse    = mouse;
        this.keyboard = keyboard;
        this.tool     = undefined;
        this.tools    = [];
    }
}

module.exports = EditorScene;
