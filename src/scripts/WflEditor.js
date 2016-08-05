"use strict";

var $      = wfl.jquery;
var scenes = require('./scenes');
var tools  = require('./tools');

class WflEditor {
    constructor() {
        this.mainSubwindow   = document.querySelector("#main-subwindow");
        this.canvasDomObject = document.querySelector("#main-canvas");
        this.mainEditor      = wfl.create(this.canvasDomObject);
        this.animationId     = 0;
        this.prevUpdateTime  = 0;

        // Set main editor's iniital scene
        this.mainEditorScene = new scenes.WorldEditorScene(
            this.canvasDomObject,
            this.mainEditor.mouse,
            this.mainEditor.keyboard
        );
        this.mainEditor.setScene(this.mainEditorScene);

        this.setupTools();

        // Resize main editor's canvas when window resizes
        $(window).on("resize", () => this.onResize());

        // Give canvas its initial size
        this.onResize();
    }

    setupTools() {
        var currentScene = this.mainEditor.getScene();
        var sceneTools   = currentScene.tools;

        // Add listeners to each tool so they can be clicked and used
        for (let toolId of sceneTools) {
            let toolDomObj = document.querySelector(toolId);
            $(toolDomObj).on("click", () => {
                var prevSelected = $(".tool-selected");
                for (let selected of prevSelected) {
                    selected.classList.remove("tool-selected");
                };

                toolDomObj.classList.add("tool-selected");
                currentScene.tool = new tools.list[toolId](currentScene);
            });
        }

        // Select the first tool in the list for the current scene
        if (sceneTools.length > 0) {
            var toolDomObj = document.querySelector(sceneTools[0]);
            $(toolDomObj).click();
        }
     }

    onResize(e) {
        var style   = window.getComputedStyle(this.mainSubwindow, null);
        var width   = parseInt(style.getPropertyValue("width"));
        var height  = parseInt(style.getPropertyValue("height"));
        var padding = parseInt(style.getPropertyValue("padding"))

        this.canvasDomObject.width  = width  - padding * 2;
        this.canvasDomObject.height = height - padding * 2;
    }
}

module.exports = WflEditor;
