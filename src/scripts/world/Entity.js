"use strict";

class Entity {
  constructor(config = {}) {
    this.name = 'Entity';
    
    Object.assign(this, config);
  }
}

module.exports = Entity;