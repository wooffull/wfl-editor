"use strict";

const $            = wfl.jquery;
const path         = require('path');
const Menu         = require('./Menu');
const HtmlElement  = require('./HtmlElement');
const CssClass     = require('../CssClasses');
const FileMenuItem = require('./FileMenuItem');

class FileMenu extends Menu {
  constructor(label) {
    super(label);
    
    this.rootPath     = undefined;
    this.rootFileItem = undefined;
    
    this.mainInterior.remove();
    this.mainInterior = $('<ul>');
    this.mainInterior.addClass(CssClass.MENU_MAIN_INTERIOR);
    this.mainInterior.addClass(CssClass.FILE_MENU_MAIN_INTERIOR);
    
    this.element.append(this.mainInterior);
    
    this.clear();
    this.update();
  }
  
  clear() {
    // Start clearing from the root file
    if (this.rootFileItem) {
      this._lastSelected = this.rootFileItem;
    }
    
    super.clear();
    
    this.rootPath     = undefined;
    this.rootFileItem = new FileMenuItem();
    this.rootFileItem.addFile('project.wfl');
    this.rootFileItem.expand();
    this.append(this.rootFileItem);
  }
  
  update() {
    if (typeof this.rootPath !== 'undefined') {
      this.rootFileItem.setTitle(path.basename(this.rootPath));
      this.rootFileItem.setFilepath(this.rootPath);
    }
  }
  
  _addElement(htmlElement) {
    this.list.push(htmlElement);
    
    $(htmlElement).on('click', (e, elem = htmlElement) => this._onItemSelect(elem));
    
    // Select the first item added
    if (this._lastSelected === undefined) {
      this._onItemSelect(htmlElement);
    }
  }
}

module.exports = FileMenu;