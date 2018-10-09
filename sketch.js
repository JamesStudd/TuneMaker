let soundLines = [];
var playLine;
var osc;

var scaleArray = [493.88, 466.16, 440, 415.30, 392, 369.99, 349.23, 329.63, 311.13, 
                  293.66, 277.18, 261.63, 246.94];
var notesArray = ["B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", 
                  "D#4", "D4", "C#4", "C4", "B3"];
var furthestX = 0;
var bottomY = 0;
var drumSounds = ["kick03", "kick04", "kick05",
                  "OpHat01", "OpHat02", 
                  "Snr01", "snr02", "snr03",
                  "trash01", "trash02", "trash03",
                  "4OpHat03", "ClHat01", "ClHat02"];
var loadedSounds = [];
var blockWidth = 20;
var blockLineStart = 170;

var MP;
var lineSpeedSlider;
var allSliders = [];

function setup() {
  createCanvas(800, 600);
  frameRate(60);

  // Creating playline
  playLine = new PlayLine(1);

  // Creating soundblocks
  var yBuffer = 60;
  // for (i = 0; i < scaleArray.length; i++) {
  //   soundLines.push(CreateLine(scaleArray[i], 0, yBuffer, 24, 'note', 0.001, 0.5, 0.1, 0.5, notesArray[i]));
  //   yBuffer += 20;
  // }

  var i;
  for(i = 0; i < drumSounds.length; i++){
    soundLines.push(CreateLine(i, blockLineStart, -40, yBuffer, 24, 'sample', 0,0,0,0, drumSounds[i]));
    
    yBuffer += 20;
  }

  lineSpeedSlider = new SliderClass(width/4, height-150, 400, 0, 5, 0.01,
                  true, false, false, "Play Speed", 1);
  allSliders.push(lineSpeedSlider);
}

function preload(){
  soundFormats('wav');
  var i;
  for(i = 0; i < drumSounds.length; i++){
    loadedSounds.push(loadSound('samples/' + drumSounds[i] + '.wav'));
  }
}

function draw() {
  background(220);
  var i;
  for (i = 0; i < soundLines.length; i++) {
    soundLines[i].render();
  }
  playLine.move();
  playLine.checkContacts();
  playLine.render();
  
  textSize(20)
  fill(65);
  text("Press space to reset play position.", width / 3.1, height - 50);
  text("Press R to remove all the notes.", width / 3, height - 30);

  for(var j = 0; j < allSliders.length; j++){
    allSliders[j].move();
    allSliders[j].display();
  }
}

function mousePressed() {
  MP = true;
  for (i = 0; i < soundLines.length; i++) {
    for (j = 0; j < soundLines[i].blocks.length; j++) {
      soundLines[i].blocks[j].click();
    }
  }
}

function mouseReleased(){
  MP = false;
  ChangeLineSpeed();
}

function ChangeLineSpeed(){
  playLine.speed = lineSpeedSlider.sliderValue;
}

function keyPressed() {
  if(key == " "){
  	playLine.reset(); 
  } else if (key == "r"){
    var i;
    for(i = 0; i < soundLines.length; i++){
      for (var j = 0; j < soundLines[i].blocks.length; j++){
        soundLines[i].blocks[j].toggled = false;
      }
    }
  }
}

function CreateLine(soundFreq, bStart, x, y, amount, type, attack, decay, sustain, release, noteText) {
  let s = new SoundBlockLine(soundFreq, bStart, x, y, amount, type, attack, decay, sustain, release, noteText);
  return s;
}

function SoundBlock(parentLine, x, y, sWidth, sHeight, type) {

  this.parentLine = parentLine;
  this.x = x;
  this.y = y;
  this.sWidth = sWidth;
  this.sHeight = sHeight;

  this.toggled = false;
  this.canPlay = true;
  this.type = type;
}

SoundBlock.prototype.render = function() {
  fill(this.toggled ? 0 : 255);
  rect(this.x, this.y, this.sWidth, this.sHeight);
  if (!this.canPlay && !(playLine.x >= this.x && playLine.x <= this.x + this.sWidth)){
    this.canPlay = true;
  }
}


SoundBlock.prototype.click = function() {
  var xW, yW;
  xW = this.x + this.sWidth;
  yW = this.y + this.sHeight;
  if (mouseX >= this.x && mouseX <= xW && mouseY >= this.y && mouseY <= yW) {
    this.toggled = !this.toggled;
  }
}

SoundBlock.prototype.playSound = function() {
  if (this.canPlay) {
    if (this.type == "drum") {
      this.parentLine.env.play(noise);
    } else if (this.type == "note") {
      this.parentLine.osc.freq(this.parentLine.soundFreq);
      this.parentLine.env.play();
    } else if (this.type == "sample"){
      if (this.parentLine.sampleSound != null){
        this.parentLine.sampleSound.setVolume(1);
        this.parentLine.sampleSound.play();
      }
    }
    this.canPlay = false;
  }
}

function SoundBlockLine(soundFreq, originalBuffer, x, y, amount, type, attack, decay, sustain, release, noteText) {

  this.soundFreq = soundFreq;
  this.x = x;
  this.y = y;
  this.amount = amount;
  this.type = type;
	this.noteText = noteText;
  
  this.blocks = [];

  this.env = new p5.Envelope();
  this.env.setADSR(attack, decay, sustain, release);
  this.env.setRange(1, 0);

  this.osc = new p5.Oscillator();
  this.osc.setType('sine');
  this.osc.amp(this.env);
  this.osc.start();

  this.sampleSound = null;
  if (this.type == "sample"){
    this.sampleSound = loadedSounds[soundFreq];
  }

  this.originalBuffer = originalBuffer;
  this.buffer = this.originalBuffer;
  this.createBlocks();
}

SoundBlockLine.prototype.createBlocks = function() {
  var i;
  for (i = 0; i < this.amount; i++) {
    let s = new SoundBlock(this, this.buffer, this.y, blockWidth, 15, this.type);
    if (this.y > bottomY){
    	bottomY = this.y + 15; 
    }
    if (this.buffer + blockWidth > furthestX) {
      furthestX = this.buffer + blockWidth;
    }
    this.buffer += blockWidth;
    this.blocks.push(s);
  }
}

SoundBlockLine.prototype.render = function() {
  for (var i = 0; i < this.blocks.length; i++) {
    this.blocks[i].render();
    if (i % 4 == 0){
      line(this.blocks[i].x-1, this.y, this.blocks[i].x-1, this.y + 20);
      line(this.blocks[i].x, this.y, this.blocks[i].x, this.y + 20);
      line(this.blocks[i].x+1, this.y, this.blocks[i].x+1, this.y + 20);
    }
  }
  fill(0);
  textSize(15)
  text(this.noteText, blockLineStart - (this.noteText.length * 9), this.y + this.blocks[0].sHeight);
}

function PlayLine(speed) {
  this.speed = speed;
  this.initialX = blockLineStart;
  this.x = this.initialX;
}

PlayLine.prototype.render = function() {
  line(this.x, 0, this.x, bottomY);
}

PlayLine.prototype.move = function() {
  this.x += this.speed;
  if (this.x >= furthestX) {
    this.x = blockLineStart;
  }
}

PlayLine.prototype.checkContacts = function() {
  var i;
  for (i = 0; i < soundLines.length; i++) {
    for (var j = 0; j < soundLines[i].blocks.length; j++) {
      var xW;
      xW = soundLines[i].blocks[j].x + soundLines[i].blocks[j].sWidth;
      if (soundLines[i].blocks[j].canPlay && this.x >= soundLines[i].blocks[j].x && this.x <= xW) {
        if (soundLines[i].blocks[j].toggled) {
          soundLines[i].blocks[j].playSound();
        }
      }
    }
  }
}

PlayLine.prototype.reset = function(){
	this.x = this.initialX;
}