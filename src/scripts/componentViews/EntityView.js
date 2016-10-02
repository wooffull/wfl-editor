"use strict";

let $ = wfl.jquery;
let ComponentView = require('./ComponentView');
let {ExpandableMenu} = require('../ui');

class EntityView extends ComponentView {
    constructor() {
        super();
        
        this.entitiesMenu = new ExpandableMenu();
        this.add(this.entitiesMenu);
    }
}

module.exports = EntityView;