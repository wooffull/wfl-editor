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
    
    this.buttonContainer = $('<span>');
    this.label.append(this.buttonContainer);
    
    this.label.addClass(CssClass.MENU_LABEL);
    this.mainInterior.addClass(CssClass.MENU_MAIN_INTERIOR);
    this.element.addClass(CssClass.MENU);
    
    this.element.on('mousemove', (e) => this._onMouseMove(e));
    this.element.on('mouseout',  (e) => this._onMouseOut(e));
    this.element.on('mousedown', (e) => this._onMouseDown(e));
  }
  
  find(label) {
    for (let menuItem of this.list) {
      if (menuItem.element.html() === label) {
        return menuItem;
      }
    }
    
    return null;
  }
  
  getAt(index) {
    if (index < 0  || index > this.list.length - 1) {
      return null;
    }
    
    return this.list[index];
  }
  
  indexOf(menuItem) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i] === menuItem) {
        return i;
      }
    }
    
    return -1;
  }
  
  prepend(htmlElement) {
    return this.insert(htmlElement, 0);
  }
  
  append(htmlElement) {
    return this.insert(htmlElement, this.list.length);
  }
  
  insert(htmlElement, position = this.list.length) {
    // Force position to be between 0 and the list's length
    position = Math.max(0, Math.min(position, this.list.length));
    this._addElement(htmlElement, position);
    
    // _addElement will add the htmlElement into the list at position,
    // so try to get the element before that and append after it
    if (position - 1 >= 0 && this.list[position - 1]) {
      this.list[position - 1].element.after(htmlElement.element);
      
    // Otherwise if the position isn't 0, append to the mainInterior 
    } else if (position !== 0) {
      this.mainInterior.append(htmlElement.element);
      
    // Prepend if the position is 0
    } else {
      this.mainInterior.prepend(htmlElement.element);      
    }
    
    return htmlElement;
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
            this.select(item);
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
    
    return htmlElement;
  }
  
  select(htmlElement) {
    if (this._lastSelected) {
      this._lastSelected.element.removeClass('selected');
    }
    
    htmlElement.element.addClass('selected');
    this._lastSelected = htmlElement;
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
    this.buttonContainer.prepend(button.element);
  }
  
  getLastSelected() {
    return this._lastSelected;
  }
  
  _addElement(htmlElement, position) {
    // Instead of push, splice the element into the given position
    this.list.splice(position, 0, htmlElement);
    
    htmlElement.element.on('click',     () => this.select(htmlElement));
    htmlElement.element.on('mouseover', () => this._onItemHover(htmlElement));
    htmlElement.element.on('mouseout',  () => this._onItemLeave(htmlElement));
    
    // Select the first item added
    if (this._lastSelected === undefined) {
      this.select(htmlElement);
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
  
  _onMouseDown(e) {
    var target = e.target;
    var found = this.find(target.innerHTML);
    
    if (found && found.element[0] === target) {
      if (!this._lastSelected || this._lastSelected !== found) {
        $(this).trigger("change", [found]);
      }
    }
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