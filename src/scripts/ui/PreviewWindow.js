"use strict";

const $           = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass    = require('../CssClasses');

class PreviewWindow extends HtmlElement {
  constructor() {
    super();
    
    this._previewImage = undefined;
    
    this.imageContainer = $('<div>');
    this.imageContainer.addClass(CssClass.IMAGE_CONTAINER);
    
    this.element = $('<div>');
    this.element.addClass(CssClass.PREVIEW_WINDOW);
    this.element.addClass(CssClass.ARROW_LEFT);
    this.element.append(this.imageContainer);
  }
  
  empty() {
    this.element.empty();
    this.imageContainer.empty();
  }
  
  setImage(img) {
    this.empty();
    
    this._previewImage = img;
    
    if (img) {
      this.imageContainer.append(this._previewImage);
      this.element.append(this.imageContainer);
    }
  }
  
  setImageSource(imgSrc) {
    this.empty();
    
    if (imgSrc) {
      this._previewImage = new Image();
      this._previewImage.onload = (e) => this._onImageLoadSuccess(e);
      this._previewImage.src = imgSrc;
    } else {
      this._previewImage = undefined;
    }
  }
  
  _onImageLoadSuccess(e) {
    this.empty();
    
    this.imageContainer.append(this._previewImage);
    this.element.append(this.imageContainer);
  }
}

module.exports = PreviewWindow;