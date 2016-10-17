"use strict";

const $           = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass    = require('../CssClasses');

class ExpandableMenu extends HtmlElement {
  constructor(label = 'Menu') {
    super();
    
    this._lastSelected = null;
    
    this.element = $('<div>');
    this.element.addClass(CssClass.EXPANDABLE_MENU);
    
    this.label = $("<span>");
    this.label.html(label);
    this.label.addClass(CssClass.EXPANDABLE_MENU_LABEL);
    
    this.mainInterior = $('<div>');
    this.mainInterior.addClass(CssClass.EXPANDABLE_MENU_MAIN_INTERIOR);
    
    this.collapseBtn = $('<button>');
    this.collapseBtn.html($('<i class="material-icons">arrow_drop_up</i>'));
    this.collapseBtn.addClass(CssClass.EXPANDABLE_MENU_COLLAPSE_BUTTON);
    this.collapseBtn.on('click', (e) => this._onToggleCollapse(e));
    
    this.element.append(this.label);
    this.element.append(this.mainInterior);
    this.element.append(this.collapseBtn);
  }
  
  add(htmlElement) {
    htmlElement.element.on('click', (e) => this._onSelectItem(e));
    this.mainInterior.append(htmlElement.element);
  }
  
  _onSelectItem(e) {
    if (this._lastSelected) {
      $(this._lastSelected).toggleClass('selected');
    }
    
    $(e.target).toggleClass('selected');
    this._lastSelected = e.target;
  }
  
  _onToggleCollapse(e) {
    this.mainInterior.toggleClass('collapsed');
  }
}

module.exports = ExpandableMenu;