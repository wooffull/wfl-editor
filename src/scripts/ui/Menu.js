"use strict";

const $             = wfl.jquery;
const HtmlElement   = require('./HtmlElement');
const PreviewWindow = require('./PreviewWindow');
const CssClass      = require('../CssClasses');

class Menu extends HtmlElement {
  constructor(label = 'Menu') {
    super();
    
    this._lastSelected = undefined;
    this._lastHovered  = undefined;
    this._mousePos     = {x: 0, y: 0};
    
    this._previewWindow = new PreviewWindow();
    this._previewWindow.hide();
    
    this.list = [];
    
    this.label = $("<div>");
    this.label.html(label);
    
    this.mainInterior = $('<div>');
    
    this.element = $('<div>');
    this.element.append(this.label);
    this.element.append(this._previewWindow.element);
    this.element.append(this.mainInterior);
    
    this.label.addClass(CssClass.MENU_LABEL);
    this.mainInterior.addClass(CssClass.MENU_MAIN_INTERIOR);
    this.element.addClass(CssClass.MENU);
    
    this.element.on('mousemove', (e) => this._onMouseMove(e));
    this.element.on('mouseout',  (e) => this._onMouseOut(e));
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
        for (let item of this.list) {
          if (item.element.is(sibling)) {
            this._onItemSelect(item);
            break;
          }
        }
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
    while(this.list.length > 0) {
      this._lastSelected = this.list[0];
      this.remove();
    }
    
    this.mainInterior.html('');
    this._lastSelected = undefined;
  }
  
  addButton(button) {
    this.element.prepend(button.element);
  }
  
  getLastSelected() {
    return this._lastSelected;
  }
  
  _addElement(htmlElement) {
    this.list.push(htmlElement);
    
    htmlElement.element.on('click',     () => this._onItemSelect(htmlElement));
    htmlElement.element.on('mouseover', () => this._onItemHover(htmlElement));
    htmlElement.element.on('mouseout',  () => this._onItemLeave(htmlElement));
    
    // Select the first item added
    if (this._lastSelected === undefined) {
      this._onItemSelect(htmlElement);
    }
  }
  
  _onMouseMove(e) {
    this._mousePos.x = e.clientX;
    this._mousePos.y = e.clientY;
  }
  
  _onMouseOut(e) {
    this._mousePos.x = 0;
    this._mousePos.y = 0;
    
    this._previewWindow.hide();
    this._previewWindow.setImage(undefined);
  }
  
  _onItemSelect(htmlElement) {
    if (this._lastSelected) {
      this._lastSelected.element.removeClass('selected');
    }
    
    htmlElement.element.addClass('selected');
    this._lastSelected = htmlElement;
  }
  
  _onItemHover(htmlElement) {
    let elemWidth    = htmlElement.element.outerWidth();
    let elemPosition = htmlElement.element.position();
    
    if (htmlElement.data && htmlElement.data.imageSource) {
      // Show the element's image in the preview window
      this._previewWindow.setImageSource(htmlElement.data.imageSource);
      this._previewWindow.show();

      // Move the preview window to the right of the menu item in the list
      this._previewWindow.element.css({
        left: elemPosition.left + elemWidth,
        top: elemPosition.top,
      });
    }
    
    this._lastHovered = htmlElement;
  }
  
  _onItemLeave(htmlElement) {
    if (htmlElement === this._lastHovered) {
      this._lastHovered = undefined;
    }
  }
}

module.exports = Menu;