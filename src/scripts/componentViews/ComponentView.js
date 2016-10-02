"use strict";

let $ = wfl.jquery;

class ComponentView {
    constructor() {
        this.container = $('<div>');
    }
    
    destroy() {
        this.container.remove();
    }
    
    add(htmlElement) {
        this.container.append(htmlElement.element);
    }
    
    show() {
        $('#component-subwindow').append(this.container);
    }
    
    hide() {
        this.container.detach();
    }
}

module.exports = ComponentView;