let soundLines = [];

var playLine;

var furthestX = 0;
var bottomY = 0;
var initialTopBuffer = 30;

var loadedSounds = [];
var blockWidth = 20;
var startCoordinate = 0;

var MP;
var lineSpeedSlider;
var allSliders = [];
var initialLineSpeed = 2;

var categoryDropDown, sampleDropDown, addSampleButton;

function setup() {
  // Canvas and Frame Rate
  createCanvas(800, 600);
  frameRate(60);
  
  // Create a slider to adjust the PlayLine speed
  lineSpeedSlider = new SliderClass(width / 4, height - 150, 400, 0, 10, 0.1,
    true, false, false, "Play Speed", initialLineSpeed);
  allSliders.push(lineSpeedSlider);

  // PlayLine is to show which notes will be played next, '1' being speed.
  playLine = new PlayLine(initialLineSpeed);

  categoryDropDown = createSelect();
  categoryDropDown.size(60, 30);
  categoryDropDown.position(250, height - 100);
  categoryDropDown.changed(ChangeCategory);

  sampleDropDown = createSelect();
  sampleDropDown.size(120, 30);
  sampleDropDown.position(330, height - 100);

  addSampleButton = createButton("Add Sample");
  addSampleButton.size(100, 30);
  addSampleButton.position(470, height - 100);
  addSampleButton.mousePressed(AddSample);
  LoadSamples();
}

function LoadSamples(){
  soundFormats('mp3');
  
  for (var category in samples){
    if (!samples.hasOwnProperty(category)) continue;
    categoryDropDown.option(category);

    for(var i = 0; i < samples[category]["Labels"].length; i++){
      samples[category]["Samples"].push(loadSound('samples/'+category+'/'+samples[category]["Labels"][i]));
    }
  }
  ChangeCategory();
}

function ChangeCategory(){
  for (var category in samples){
    if (!samples.hasOwnProperty(category) || category != categoryDropDown.value()) continue;

    var sampleList = samples[category]["Labels"];
  
    for(var i = sampleDropDown["elt"].length - 1; i >= 0; i--){
      sampleDropDown["elt"][i].remove();
    }

    for (var sample in sampleList){
      if (!sampleList.hasOwnProperty(sample)) continue;
      sampleDropDown.option(sampleList[sample]);
    }
  }
}

function AddSample(){
  if(categoryDropDown.value() != "" && sampleDropDown.value() != ""){
    var c = categoryDropDown.value();
    var s = sampleDropDown.value();
    CreateLine(150, samples[c]["Samples"][samples[c]["Labels"].indexOf(s)], 24, s);
  }
}

var lastCall, fps;
// Render loop
function draw() {
  // Fill the background
  background(200);
  // Render each sound line
  for (var i = 0; i < soundLines.length; i++) {
    soundLines[i].render();
  }

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
  text("Press N to remove all note lines.", width / 3, height - 10);
  if (soundLines.length > 0){
    playLine.move();
    playLine.checkContacts();
    playLine.render();
  }
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
  key = key.toLowerCase();
  if (key == " ") {
    playLine.reset();
  } else if (key == "r") {
    // Go through each sound block and reset it's toggled value
    for (var i = 0; i < soundLines.length; i++) {
      for (var j = 0; j < soundLines[i].blocks.length; j++) {
        soundLines[i].blocks[j].toggled = false;
      }
    }
  } else if (key == "n"){
    for (var i = soundLines.length - 1; i >= 0; i--){
      soundLines.pop();
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

