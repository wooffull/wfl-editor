"use strict";

const $           = wfl.jquery;
const fs          = require('fs');
const path        = require('path');
const HtmlElement = require('./HtmlElement');
const CssClass    = require('../CssClasses');

class FileMenuItem extends HtmlElement {
  constructor(filepath) {
    super();
    
    this.isFolder      = (typeof filepath === 'undefined') || 
                         path.extname(filepath) === '';
    this.filepath      = filepath;
    this.files         = undefined;
    this.expanded      = undefined;
    this.folderWrapper = undefined;
    this.folderUl      = undefined;
    this.rootFile      = this;
    this.depth         = 0;
    
    this.labelSpacing = $('<span>');
    this.label = $('<span>');
    this.label.addClass(CssClass.FILE_MENU_ITEM_LABEL);
    this.labelWrapper = $('<div>');
    this.labelWrapper.addClass(CssClass.FILE_MENU_ITEM_LABEL_WRAPPER);
    this.labelWrapper.append(this.labelSpacing);
    this.labelWrapper.append(this.label);
    $(this.labelWrapper).on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this._toggleExpand();
        $(this.rootFile).trigger('click', this);
      }
    });
    
    this.element = $('<li>');
    this.element.addClass(CssClass.FILE_MENU_ITEM);
    this.element.append(this.labelWrapper);
    
    if (this.isFolder) {
      this.files         = [];
      this.expanded      = false;
      this.folderWrapper = $('<div>');
      this.folderUl      = $('<ul>');
      
      this.folderWrapper.addClass(CssClass.FILE_MENU_ITEM_FOLDER_WRAPPER);
      this.folderUl.addClass(CssClass.FILE_MENU_ITEM_FOLDER_UL);
      this.label.addClass(CssClass.FILE_MENU_ITEM_FOLDER);
      this.folderWrapper.append(this.folderUl);
      this.element.append(this.folderWrapper);
      this.folderWrapper.hide();
    }
    
    if (typeof filepath === 'undefined') {
      this.setTitle('untitled');  
    } else {
      this.setTitle(path.basename(filepath));
    }
    
    this.setDepth(this.depth);
  }
  
  destroy() {
    this.element.remove();
  }
  
  setTitle(title) {
    this.label.html(title);
  }
  
  setDepth(depth) {
    this.depth = depth;
    
    let labelSpace = '';
    for (let i = 0; i < this.depth; i++) {
      labelSpace += '   ';
    }
    this.labelSpacing.html(labelSpace);    
  }
  
  setFilepath(filepath, _allowUpdate = true) {
    this.filepath = filepath;
    
    if (_allowUpdate) {
      return this.update();
    }
    
    return Promise.resolve();
  }
  
  addFile(filepath, _allowUpdate = true) {
    if (this.isFolder) {
      let fileItem = new FileMenuItem(filepath);
      fileItem.rootFile = this.rootFile;
      fileItem.setDepth(this.depth + 1);
      this.files.push(fileItem);
      this.folderUl.append(fileItem.element);
      
      if (_allowUpdate) {
        return this.update();
      }
    }
    
    return Promise.resolve();
  }
  
  expand(_allowUpdate = true) {
    if (this.isFolder && !this.expanded) {
      this.expanded = true;
      this.label.addClass('expanded');
      this.folderWrapper.show();
      
      if (_allowUpdate) {
        return this.update();
      }
    }
    
    return Promise.resolve();
  }
  
  collapse() {
    if (this.isFolder && this.expanded) {
      this.expanded = false;
      this.label.removeClass('expanded');
      this.folderWrapper.hide();
    }
  }
  
  update() {
    if (this.isFolder && this.expanded) {
      if (typeof this.filepath === 'undefined') {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        fs.readdir(this.filepath, (err, filepaths) => {
          if (err) {
            reject(err);
          }

          let missingFiles = this.files.concat();
          let updateFilePromises = [];

          // Update contained files and add new files
          for (const filepath of filepaths) {
            let fullPath      = path.join(this.filepath, filepath);
            let containedFile = this._contains(fullPath);

            if (containedFile) {
              let index = missingFiles.indexOf(containedFile);
              missingFiles.splice(index, 1);

              if (containedFile.isFolder && containedFile.expanded) {
                updateFilePromises.push(containedFile.update());
              }
            } else {
              this.addFile(fullPath, false);
            }
          }

          // Remove missing files
          for (const file of missingFiles) {
            let index = this.files.indexOf(file);
            file.destroy();
            this.files.splice(index, 1);
          }
          
          return Promise.all(updateFilePromises);
        });
      });
    }
    
    return Promise.resolve();
  }
  
  _contains(filepath) {
    if (this.isFolder) {
      for (const file of this.files) {
        if (file.filepath === filepath) {
          return file;
        }
      }
    }
    
    return false;
  }
  
  _toggleExpand() {
    if (this.isFolder) {
      if (this.expanded) {
        this.collapse();
      } else {
        this.expand();
      }
    }
  }
}

module.exports = FileMenuItem;