function PlayLine(speed) {
    this.speed = speed;
    this.initialX = GetStartCoordinate();
    this.x = this.initialX;
  }
  
  PlayLine.prototype.render = function() {
    line(this.x, 0, this.x, bottomY);
  }
  
  PlayLine.prototype.move = function() {
    this.x += this.speed;
    if (this.x >= furthestX) {
      this.x = GetStartCoordinate();
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
      this.x = GetStartCoordinate();
  }