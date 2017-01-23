"use strict";

const $            = wfl.jquery;
const path         = require('path');
const HtmlElement  = require('./HtmlElement');
const CssClass     = require('../CssClasses');
const FileMenuItem = require('./FileMenuItem');

class FileMenu extends HtmlElement {
  constructor(label = 'Menu') {
    super();
    
    this._lastSelected = undefined;
    
    this.list = [];
    
    this.label = $("<div>");
    this.label.html(label);
    this.label.addClass(CssClass.FILE_EXPLORER_LABEL);
    
    this.rootPath     = undefined;
    this.rootFileItem = undefined;
    
    this.mainInterior = $('<ul>');
    this.mainInterior.addClass(CssClass.FILE_EXPLORER_MAIN_INTERIOR);
    
    this.element = $('<div>');
    this.element.addClass(CssClass.FILE_EXPLORER);
    this.element.append(this.label);
    this.element.append(this.mainInterior);
    
    this.clear();
    this.update();
  }
  
  prepend(htmlElement) {
    this._addElement(htmlElement);
    this.mainInterior.prepend(htmlElement.element);
  }
  
  append(htmlElement) {
    this._addElement(htmlElement);
    this.mainInterior.append(htmlElement.element);
  }
  
  remove(htmlElement) {
    if (typeof htmlElement === 'undefined') {
      htmlElement = this._lastSelected;
    }
    
    if (typeof htmlElement === 'undefined') {
      return;
    }
    
    if ($.contains(this.mainInterior[0], htmlElement.element[0])) {
      if (htmlElement === this._lastSelected) {
        let sibling = htmlElement.element.next();

        if (sibling.length === 0) {
          sibling = htmlElement.element.prev();
        }
        
        // Select the sibling to switch this._lastSelected to it
        sibling.click();
      }
    }

    let index = this.list.indexOf(htmlElement);
    if (index > -1) this.list.splice(index, 1);

    htmlElement.element.remove();
    
    if (this.list.length === 0) {
      this._lastSelected = undefined;
    }
  }
  
  clear() {
    // Start from the root file
    if (this.rootFileItem) {
      this._lastSelected = this.rootFileItem;
    }
    
    while(this.list.length > 0) {
      this._lastSelected = this.list[0];
      this.remove();
    }
    
    this.mainInterior.html('');
    
    this._lastSelected = undefined;
    this.rootPath      = undefined;
    this.rootFileItem  = new FileMenuItem();
    this.rootFileItem.addFile('project.wfl');
    this.rootFileItem.expand();
    this.append(this.rootFileItem);
  }
  
  getLastSelected() {
    return this._lastSelected;
  }
  
  update() {
    if (typeof this.rootPath !== 'undefined') {
      this.rootFileItem.setTitle(path.basename(this.rootPath));
      this.rootFileItem.setFilepath(this.rootPath);
    }
  }
  
  _addElement(htmlElement) {
    $(htmlElement).on('click', (e, elem = htmlElement) => this._onItemSelect(elem));
    
    // Select the first item added
    if (this._lastSelected === undefined) {
      this._onItemSelect(htmlElement);
    }
    
    this.list.push(htmlElement);
  }
  
  _onItemSelect(htmlElement) {
    if (this._lastSelected) {
      this._lastSelected.element.removeClass('selected');
    }
    
    htmlElement.element.addClass('selected');
    this._lastSelected = htmlElement;
  }
}

module.exports = FileMenu;