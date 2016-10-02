"use strict";

const {ipcRenderer} = require('electron');

var $         = wfl.jquery;
var WflEditor = require('./scripts/WflEditor');

// Create a new WFL Editor when the window loads
$(window).on("load", () => new WflEditor());

// Prevent highlighting elements when dragging on UI
$(".ui-element-container").on("mousedown", (e) => {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault)  e.preventDefault();
    e.cancelBubble = true;
    e.returnValue  = false;
    return false;
});

$(".app-icon").on('click', (e) => {
    
});

$(".close").on("click", (e) => {
    ipcRenderer.send('window-close');
});

$(".minimize").on("click", (e) => {
    ipcRenderer.send('window-minimize');
});

$(".maximize").on("click", (e) => {
    ipcRenderer.send('window-maximize');
});