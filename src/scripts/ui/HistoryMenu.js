"use strict";

const $             = wfl.jquery;
const Menu          = require('./Menu');
const HtmlElement   = require('./HtmlElement');
const CssClass      = require('../CssClasses');

class HistoryMenu extends Menu {
  constructor(label, capacity = 50) {
    super(label);
    
    this.lastActiveIndex = -1;
    this.capacity = capacity;
  }
  
  clear() {
    this.lastActiveIndex = -1;
    super.clear();
  }
  
  getCurrentItem() {
    if (this.lastActiveIndex < 0) {
      return null;
    }
    
    return this.getAt(this.lastActiveIndex);
  }

  append(htmlElement) {
    super.append(htmlElement);

    while (this.list.length > this.capacity) {
      // Remove the oldest action from the history
      this.remove(this.getAt(0));
    }
  }

  prepend(htmlElement, position) {
    throw 'History Error: Cannot prepend history.';
  }
  
  insert(htmlElement, position = this.list.length) {
    if (position !== this.list.length) {
      throw 'History Error: Cannot prepend history.';
    }
    
    // If the history menu does not have the most recent action as
    // active, then all later actions need to be undone before the
    // new one is added
    if (this.lastActiveIndex < this.list.length - 1) {
      this._undoRange(this.lastActiveIndex + 1, this.list.length);
      this._removeRange(this.lastActiveIndex + 1, this.list.length);
    }
    super.insert(htmlElement, position);
    this.lastActiveIndex = this.list.length - 1;
  }
  
  select(htmlElement) {
    super.select(htmlElement);
    
    let itemIndex = this.list.indexOf(htmlElement);
    
    if (itemIndex + 1 < this.list.length && itemIndex < this.lastActiveIndex) {
      this._undoRange(itemIndex + 1, this.list.length);
    } else if (this.lastActiveIndex >= 0 && itemIndex > this.lastActiveIndex) {
      this._redoRange(this.lastActiveIndex + 1, itemIndex + 1);
    }
    
    this.lastActiveIndex = itemIndex;
  }
  
  _getItemsInRange(startIndex, endIndex) {
    return this.list.concat().splice(
      startIndex,
      endIndex - startIndex
    );
  }
  
  _undoRange(startIndex, endIndex) {
    if (endIndex - startIndex <= 0) throw "History Error: Cannot undo invalid range.";
    
    let undoSet = this._getItemsInRange(startIndex, endIndex)
    
    // Reverse the order so they get undone from newest-to-oldest order
    .reverse()
    
    // Filter out anything that has already been undone
    .filter((menuItem) => {
      return !menuItem.element.hasClass(CssClass.HISTORY_MENU_UNDO);
    });
    
    // If no elements to undo, return early
    if (undoSet.length === 0) return;
      
    for (let menuItem of undoSet) {
      menuItem.element.addClass(CssClass.HISTORY_MENU_UNDO);
    }
    
    // Pull the data out of each menu item to be undone
    $(this).trigger('undo-set', [undoSet.map((menuItem) => menuItem.data)]);
  }
  
  _redoRange(startIndex, endIndex) {
    if (endIndex - startIndex <= 0) throw "History Error: Cannot redo invalid range.";
    
    let redoSet = this._getItemsInRange(startIndex, endIndex)
    
    // Filter out anything that has not been undone
    .filter((menuItem) => {
      return menuItem.element.hasClass(CssClass.HISTORY_MENU_UNDO);
    });
    
    // If no elements to redo, return early
    if (redoSet.length === 0) return;
      
    for (let menuItem of redoSet) {
      menuItem.element.removeClass(CssClass.HISTORY_MENU_UNDO);
    }
    
    // Pull the data out of each menu item to be redone
    $(this).trigger('redo-set', [redoSet.map((menuItem) => menuItem.data)]);
  }
  
  _removeRange(startIndex, endIndex) {
    // Reverse the order so they get undone from newest-to-oldest order
    let undoSet = this._getItemsInRange(startIndex, endIndex).reverse();

    for (let menuItem of undoSet) {
      this.remove(menuItem);
    }
  }
}

module.exports = HistoryMenu;