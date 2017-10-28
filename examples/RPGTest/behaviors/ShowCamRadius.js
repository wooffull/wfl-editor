"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const $ = wfl.jquery;
const PIXI = wfl.PIXI;

const fragSrc =
`
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform vec2 cameraPosition;
uniform vec4 tint0;
uniform vec4 tint1;
uniform float tintBias;
uniform float minRadius;
uniform float maxRadius;
uniform float radiusFadeSize;

void main() {
  vec2 screenCoord = (vTextureCoord * filterArea.xy + filterArea.zw);
  vec2 clampedCoord = clamp(vTextureCoord, filterClamp.xy, filterClamp.zw);
  vec4 color = texture2D(uSampler, clampedCoord);
  vec2 normalizedCoord = screenCoord / dimensions;
  vec2 offset = vec2(0.5, 0.5);
  offset.x *= dimensions.x;
  offset.y *= dimensions.y;
  normalizedCoord.x *= dimensions.x;
  normalizedCoord.y *= dimensions.y;
  
  vec2 displacement = offset - normalizedCoord;
  float distSquared = dot(displacement, displacement);
  
  vec4 currentTint = mix(tint0, tint1, tintBias);
  color = color * currentTint;
  
  float currentRadius = mix(minRadius, maxRadius, tintBias);
  float currentMaxRadius = currentRadius + radiusFadeSize;
 
  // TODO: Remove branches
  if (distSquared < currentRadius * currentRadius) {
    gl_FragColor = color;
  } else if (distSquared < currentMaxRadius * currentMaxRadius)  {
    float radiusDiffSquared = radiusFadeSize * radiusFadeSize;
    float remainingDist = distSquared - currentRadius * currentRadius;
    color *= 1.0 - remainingDist / radiusDiffSquared;
    gl_FragColor = vec4(color.r, color.g, color.b, 1);
  } else {
    gl_FragColor = vec4(0, 0, 0, 1);
  }
}
`.split('\n').reduce((c, a) => c + a.trim() + '\n');

class ShowCamRadius extends Behavior {
  constructor() {
    super();
    
    // Reset filters
    this._scene = world.findScene('wfl');
    this._scene._stage.filters = [];
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    this._player = this._scene.findGameObjectByName('player');
    this.canvas = this._scene.canvas;
    
    let scene = this._scene;
    let minRadius = this.minRadius;
    let maxRadius = this.maxRadius;
    let radiusFadeSize = this.radiusFadeSize;
    let r0 = this.tintR0;
    let g0 = this.tintG0;
    let b0 = this.tintB0;
    let r1 = this.tintR1;
    let g1 = this.tintG1;
    let b1 = this.tintB1;
    let tintShiftTime = this.tintShiftTime * 1000;
    let lastRender = Date.now();
    let renderTimer = 0;
    
    this.filter = new PIXI.Filter(null, fragSrc);
    this.filter.autoFit = false;
    this.filter.apply = function(filterManager, input, output) {
      let now = Date.now();
      renderTimer += now - lastRender;
      lastRender = now;
    
      this.uniforms.dimensions[0] = scene.renderer.view.width;
      this.uniforms.dimensions[1] = scene.renderer.view.height;
      this.uniforms.cameraPosition[0] = scene.camera.position.x;
      this.uniforms.cameraPosition[1] = scene.camera.position.y;
      this.uniforms.minRadius = minRadius;
      this.uniforms.maxRadius = maxRadius;
      this.uniforms.radiusFadeSize = radiusFadeSize;
      this.uniforms.tint0[0] = r0;
      this.uniforms.tint0[1] = g0;
      this.uniforms.tint0[2] = b0;
      this.uniforms.tint0[3] = 1;
      this.uniforms.tint1[0] = r1;
      this.uniforms.tint1[1] = g1;
      this.uniforms.tint1[2] = b1;
      this.uniforms.tint1[3] = 1;
      this.uniforms.tintBias = 1 + 0.5 * Math.sin(Math.PI * 2 * renderTimer / tintShiftTime);
      
      // Draw the filter
      filterManager.applyFilter(this, input, output);
    }
     
    this._scene._stage.filters = [this.filter];
    
    this.fullSizeGameObject = new GameObject();
    this.fullSizeGraphics = new PIXI.Graphics;
    
    this._scene.addGameObject(this.fullSizeGameObject, Infinity);
  }
  
  update(dt) {
    this.fullSizeGraphics.clear();
    this.fullSizeGraphics.beginFill(0, 0);
    this.fullSizeGraphics.drawRect(
      -this._scene.renderer.view.width * 0.5,
      -this._scene.renderer.view.height * 0.5,
      this._scene.renderer.view.width,
      this._scene.renderer.view.height
    );
    this.fullSizeGraphics.endFill();
    this.fullSizeGameObject.addChild(this.fullSizeGraphics);
    this.fullSizeGameObject.position.x = this._scene.camera.position.x;
    this.fullSizeGameObject.position.y = this._scene.camera.position.y;
  }
}

ShowCamRadius.minRadius = property.Number(200, 1);
ShowCamRadius.maxRadius = property.Number(250, 1);
ShowCamRadius.radiusFadeSize = property.Number(50, 0);
ShowCamRadius.tintR0    = property.Number(1, 0, 1);
ShowCamRadius.tintG0    = property.Number(1, 0, 1);
ShowCamRadius.tintB0    = property.Number(1, 0, 1);
ShowCamRadius.tintR1    = property.Number(1, 0, 1);
ShowCamRadius.tintG1    = property.Number(1, 0, 1);
ShowCamRadius.tintB1    = property.Number(1, 0, 1);
ShowCamRadius.tintShiftTime = property.Number(5, 1);

module.exports = ShowCamRadius;