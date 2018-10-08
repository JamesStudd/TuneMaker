let soundLines = [];
var playLine;
var osc;

var scaleArray = [493.88, 440, 392, 349.23, 329.63, 293.66, 261.63, 246.94];
var furthestX = 0;

function setup() {
  createCanvas(600, 400);

  // Creating playline
  playLine = new PlayLine(10);

  // Creating soundblocks
  var yBuffer = 20;
  for (i = 0; i < scaleArray.length; i++) {
    soundLines.push(CreateLine(scaleArray[i], 20, yBuffer, 25, 'note', 0.001, 0.5, 0.1, 0.5));
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

}

function mousePressed() {
  for (i = 0; i < soundLines.length; i++) {
    for (j = 0; j < soundLines[i].blocks.length; j++) {
      soundLines[i].blocks[j].click();
    }
  }
}

function CreateLine(soundFreq, x, y, amount, type, attack, decay, sustain, release) {
  let s = new SoundBlockLine(soundFreq, x, y, amount, type, attack, decay, sustain, release);
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
    setTimeout(() => this.canPlay = true, 300);
  }
}

function SoundBlockLine(soundFreq, x, y, amount, type, attack, decay, sustain, release) {

  this.soundFreq = soundFreq;
  this.x = x;
  this.y = y;
  this.amount = amount;
  this.type = type;

  this.blocks = [];

  this.env = new p5.Envelope();
  this.env.setADSR(attack, decay, sustain, release);
  this.env.setRange(1, 0);

  this.osc = new p5.Oscillator();
  this.osc.setType('sine');
  this.osc.amp(this.env);
  this.osc.start();

  this.createBlocks();
}

SoundBlockLine.prototype.createBlocks = function() {
  var buffer = 0;
  var i;
  for (i = 0; i < this.amount; i++) {
    let s = new SoundBlock(this, buffer, this.y, 20, 15, this.type);
    console.log("passing " + this.y);
    if (buffer > furthestX) {
      furthestX = buffer;
    }
    buffer += 25;
    this.blocks.push(s);
  }
}

SoundBlockLine.prototype.render = function() {
  for (var i = 0; i < this.blocks.length; i++) {
    this.blocks[i].render();
  }
}

function PlayLine(bpm) {
  this.bpm = bpm;
  this.x = 0;
}

PlayLine.prototype.render = function() {
  line(this.x, 0, this.x, height);
}

PlayLine.prototype.move = function() {
  this.x += 1;
  if (this.x >= furthestX) {
    this.x = 0;
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