'use strict';

class Entity {
  constructor(config = {}) {
    this.name        = 'Entity';
    this.imageSource = null;
    
    Object.assign(this, config);
  }
}

module.exports = Entity;