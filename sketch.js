let soundLines = [];
var playLine;

var furthestX = 0;
var bottomY = 0;
var initialTopBuffer = 30;

var drumSounds = ["Kick03", "Kick04", "Kick05",
  "OpHat01", "OpHat02",
  "Snr01", "Snr02", "Snr03",
  "Trash01", "Trash02", "Trash03",
  "4OpHat03", "ClHat01", "ClHat02"];
var loadedSounds = [];
var blockWidth = 20;
var startCoordinate = 0;

var MP;
var lineSpeedSlider;
var allSliders = [];

function setup() {
  // Canvas and Frame Rate
  createCanvas(800, 600);
  frameRate(60);

  // Create a slider to adjust the PlayLine speed
  lineSpeedSlider = new SliderClass(width / 4, height - 150, 400, 0, 5, 0.01,
    true, false, false, "Play Speed", 1);
  allSliders.push(lineSpeedSlider);

  // Create initial soundlines
  for(var i = 0; i < drumSounds.length; i++){
    CreateLine(150, i, 24, drumSounds[i]);
  }

  // PlayLine is to show which notes will be played next, '1' being speed.
  playLine = new PlayLine(1);
}

// Load all the samples
function preload() {
  soundFormats('mp3');
  var i;
  for (i = 0; i < drumSounds.length; i++) {
    loadedSounds.push(loadSound('samples/' + drumSounds[i]));
  }
}

// Render loop
function draw() {
  // Fill the background
  background(200);
  // Render each sound line
  for (var i = 0; i < soundLines.length; i++) {
    soundLines[i].render();
  }
  // Move the playline, check which notes it is colliding with, render it
  playLine.move();
  playLine.checkContacts();
  playLine.render();

  // Update the sliders
  for (var j = 0; j < allSliders.length; j++) {
    allSliders[j].move();
    allSliders[j].display();
  }

  // Create the help text at the bottom of the page
  textSize(20)
  fill(65);
  text("Press space to reset play position.", width / 3.1, height - 50);
  text("Press R to remove all the notes.", width / 3, height - 30);
}

function mousePressed() {
  MP = true;
  // Loop through each soundline, check if a block should be clicked
  for (i = 0; i < soundLines.length; i++) {
    for (j = 0; j < soundLines[i].blocks.length; j++) {
      soundLines[i].blocks[j].click();
    }
  }
}

function mouseReleased() {
  MP = false;
  ChangeLineSpeed();
}

function ChangeLineSpeed() {
  playLine.speed = lineSpeedSlider.sliderValue;
}

function keyPressed() {
  if (key == " ") {
    playLine.reset();
  } else if (key == "r") {
    // Go through each sound block and reset it's toggled value
    for (var i = 0; i < soundLines.length; i++) {
      for (var j = 0; j < soundLines[i].blocks.length; j++) {
        soundLines[i].blocks[j].toggled = false;
      }
    }
  }
}

/**
 * Creates a soundblock line, adds it to an array then increases a local buffer variable
 * to move the next line down.
 * @param {string} sampleName The index of the sample for this sound block line to own.
 * @param {number} amount The amount of blocks to create in this line.
 * @param {string} noteText The label to show the name of the sample to the user.
 */
function CreateLine(xPos, sampleIndex, amount, noteText) {
  var yBuffer = initialTopBuffer;
  yBuffer += (20 * soundLines.length);
  let s = new SoundBlockLine(xPos, sampleIndex, yBuffer, amount, noteText);
  soundLines.push(s);
}

function GetLoadedSounds() {
  return loadedSounds;
}

function SetStartCoordinate(coord){
  startCoordinate = coord;
}

function GetStartCoordinate(){
  return startCoordinate;
}

