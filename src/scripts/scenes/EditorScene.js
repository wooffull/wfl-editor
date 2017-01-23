"use strict";

const Scene    = wfl.display.Scene;
const {Action} = require('../tools');

class EditorScene extends Scene {
  constructor(canvas) {
    super(canvas);
  }
  
  // TODO: Figure out a neater way to trigger events instead of copying
  // perform() from SubwindowView
  perform(type = Action.Type.DEFAULT, data = {}, reversable = true, state = Action.State.IN_PROGRESS) {
    let action;
    
    if (type instanceof Action) {
      action = type;
    } else {
      action = new Action(type, data, reversable, state);
    }
    
    $(this).trigger(Action.Event.DEFAULT, action);
  }
}

module.exports = EditorScene;