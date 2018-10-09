function SoundBlockLine(xPos, sampleSound, y, amount, noteText) {

    this.y = y;
    this.amount = amount;
    this.textSize = 15;
    this.textColor = 0;
    this.noteText = noteText;

    this.sampleSound = sampleSound;
    this.originalBuffer = xPos;
    SetStartCoordinate(this.originalBuffer);
    this.buffer = this.originalBuffer;
    this.blocks = [];
    this.createBlocks();
}

SoundBlockLine.prototype.createBlocks = function () {
    var i;
    for (i = 0; i < this.amount; i++) {
        let s = new SoundBlock(this, this.buffer, this.y, blockWidth, 15, this.type);
        if (this.y > bottomY) {
            bottomY = this.y + 15;
        }
        if (this.buffer + blockWidth > furthestX) {
            furthestX = this.buffer + blockWidth;
        }
        this.buffer += blockWidth;
        this.blocks.push(s);
    }
}

SoundBlockLine.prototype.render = function () {
    for (var i = 0; i < this.blocks.length; i++) {
        this.blocks[i].render();
        if (i % 4 == 0) {
            line(this.blocks[i].x - 1, this.y, this.blocks[i].x - 1, this.y + 20);
            line(this.blocks[i].x, this.y, this.blocks[i].x, this.y + 20);
            line(this.blocks[i].x + 1, this.y, this.blocks[i].x + 1, this.y + 20);
        }
    }
    fill(this.textColor);
    textSize(this.textSize)
    text(this.noteText, this.originalBuffer - textWidth(this.noteText) - 5, this.y + this.blocks[0].sHeight);
}