"use strict";

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
