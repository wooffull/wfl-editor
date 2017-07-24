"use strict";

const $             = wfl.jquery;
const Menu          = require('./Menu');
const HtmlElement   = require('./HtmlElement');
const PreviewWindow = require('./PreviewWindow');
const CssClass      = require('../CssClasses');

class ExpandableMenu extends Menu {
  constructor(label) {
    super(label);
    
    this.mainInterior.addClass(CssClass.EXPANDABLE_MENU_MAIN_INTERIOR);
    
    this.collapseBtn = $('<button>');
    this.collapseBtn.html($('<i class="material-icons">arrow_drop_up</i>'));
    this.collapseBtn.addClass(CssClass.EXPANDABLE_MENU_COLLAPSE_BUTTON);
    this.collapseBtn.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this._onToggleCollapse(e);
      }
    });
    this.element.append(this.collapseBtn);
  }
  
  _onToggleCollapse(e) {
    this.mainInterior.toggleClass('collapsed');
  }
}

module.exports = ExpandableMenu;