let soundLines = [];
var playLine;
var osc;

var scaleArray = [493.88, 466.16, 440, 415.30, 392, 369.99, 349.23, 329.63, 311.13, 
                  293.66, 277.18, 261.63, 246.94];
var notesArray = ["B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", 
                  "D#4", "D4", "C#4", "C4", "B3"];
var furthestX = 0;
var bottomY = 0;

function setup() {
  createCanvas(800, 400);

  // Creating playline
  playLine = new PlayLine(10);

  // Creating soundblocks
  var yBuffer = 60;
  for (i = 0; i < scaleArray.length; i++) {
    soundLines.push(CreateLine(scaleArray[i], 0, yBuffer, 25, 'note', 0.001, 0.5, 0.1, 0.5, notesArray[i]));
    yBuffer += 20;
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
  text("Press space to reset play position.", width / 3, height - 20);

}

function mousePressed() {
  for (i = 0; i < soundLines.length; i++) {
    for (j = 0; j < soundLines[i].blocks.length; j++) {
      soundLines[i].blocks[j].click();
    }
  }
}

function keyPressed() {
  if(key == " "){
  	playLine.reset(); 
  }
}

function CreateLine(soundFreq, x, y, amount, type, attack, decay, sustain, release, noteText) {
  let s = new SoundBlockLine(soundFreq, x, y, amount, type, attack, decay, sustain, release, noteText);
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
    }
    this.canPlay = false;
    setTimeout(() => this.canPlay = true, 500);
  }
}

function SoundBlockLine(soundFreq, x, y, amount, type, attack, decay, sustain, release, noteText) {

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

  this.originalBuffer = 80;
  this.buffer = this.originalBuffer;
  this.createBlocks();
}

SoundBlockLine.prototype.createBlocks = function() {
  var i;
  for (i = 0; i < this.amount; i++) {
    let s = new SoundBlock(this, this.buffer, this.y, 20, 15, this.type);
    if (this.y > bottomY){
    	bottomY = this.y + 15; 
    }
    if (this.buffer > furthestX) {
      furthestX = this.buffer + 20;
    }
    this.buffer += 25;
    this.blocks.push(s);
  }
}

SoundBlockLine.prototype.render = function() {
  for (var i = 0; i < this.blocks.length; i++) {
    this.blocks[i].render();
  }
  textSize(15)
  text(this.noteText, this.x + this.originalBuffer - this.blocks[0].sWidth -10, this.y + this.blocks[0].sHeight);
}

function PlayLine(bpm) {
  this.bpm = bpm;
  this.initialX = 80;
  this.x = this.initialX;
}

PlayLine.prototype.render = function() {
  line(this.x, 0, this.x, bottomY);
}

PlayLine.prototype.move = function() {
  this.x += 1;
  if (this.x >= furthestX) {
    this.x = 80;
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


