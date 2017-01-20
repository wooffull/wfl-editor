"use strict";

const $             = wfl.jquery;
const HtmlElement   = require('./HtmlElement');
const PreviewWindow = require('./PreviewWindow');
const CssClass      = require('../CssClasses');

class ExpandableMenu extends HtmlElement {
  constructor(label = 'Menu') {
    super();
    
    this._lastSelected = null;
    this._lastHovered  = null;
    this._mousePos     = {x: 0, y: 0};
    
    this._previewWindow = new PreviewWindow();
    this._previewWindow.hide();
    
    this.length = 0;
    
    this.label = $("<div>");
    this.label.html(label);
    this.label.addClass(CssClass.EXPANDABLE_MENU_LABEL);
    
    this.mainInterior = $('<div>');
    this.mainInterior.addClass(CssClass.EXPANDABLE_MENU_MAIN_INTERIOR);
    
    this.collapseBtn = $('<button>');
    this.collapseBtn.html($('<i class="material-icons">arrow_drop_up</i>'));
    this.collapseBtn.addClass(CssClass.EXPANDABLE_MENU_COLLAPSE_BUTTON);
    this.collapseBtn.on('click', (e) => this._onToggleCollapse(e));
    
    this.element = $('<div>');
    this.element.addClass(CssClass.EXPANDABLE_MENU);
    this.element.append(this.label);
    this.element.append(this.mainInterior);
    this.element.append(this.collapseBtn);
    this.element.append(this._previewWindow.element);
    
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
        sibling.click();
      }
      
      htmlElement.element.remove();
      this.length--;
    }
    
    if (this.length === 0) {
      this._lastSelected = null;
    }
  }
  
  addButton(button) {
    this.element.prepend(button.element);
  }
  
  getLastSelected() {
    return this._lastSelected;
  }
  
  _addElement(htmlElement) {
    htmlElement.element.on('click',     () => this._onItemSelect(htmlElement));
    htmlElement.element.on('mouseover', () => this._onItemHover(htmlElement));
    htmlElement.element.on('mouseout',  () => this._onItemLeave(htmlElement));
    
    // Select the first item added
    if (this._lastSelected === null) {
      htmlElement.element.click();
    }
    
    this.length++;
  }
  
  _onMouseMove(e) {
    this._mousePos.x = e.clientX;
    this._mousePos.y = e.clientY;
  }
  
  _onMouseOut(e) {
    this._mousePos.x = 0;
    this._mousePos.y = 0;
    
    this._previewWindow.hide();
    this._previewWindow.setImage(null);
  }
  
  _onItemSelect(htmlElement) {
    if (this._lastSelected) {
      this._lastSelected.element.toggleClass('selected');
    }
    
    htmlElement.element.toggleClass('selected');
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
      this._lastHovered = null;
    }
  }
  
  _onToggleCollapse(e) {
    this.mainInterior.toggleClass('collapsed');
  }
}

module.exports = ExpandableMenu;