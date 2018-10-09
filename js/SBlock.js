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

SoundBlock.prototype.playSound = function () {
  if (this.canPlay) {
    if (this.parentLine.sampleSound != null) {
      this.parentLine.sampleSound.setVolume(1);
      this.parentLine.sampleSound.play();
    }
    this.canPlay = false;
  }
}