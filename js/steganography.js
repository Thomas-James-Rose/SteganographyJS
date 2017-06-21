/* This method can be use to embed any image among four carrier images */

function valueToBinary(decimal) { // returns an 8-bit binary string value
    var binaryString = decimal.toString(2);
    while (binaryString.length < 8) {
      binaryString = "0" + binaryString;
    }
    return binaryString;
}

function arrayToBinary(array) { // returns an array of 8-bit string values
  var binaryArray = [];
  for (var i = 0; i < array.length; i++) {
    binaryArray[i] = valueToBinary(array[i]);
  }
  return binaryArray;
}

String.prototype.replaceAt = function(index, characters) {
  // using a number for the character argument will insert and not replace
  if(typeof characters != 'string') {
    throw characters + ' is not a string.';
    return null;
  }
  return this.slice(0, index) + characters + this.slice(index+characters.length);
}

function multiEmbed(e, c) {
  for (var i = 0; i < e.length; i++) { // for every bit of binary data
    //console.log("Bits to embed = " + e[i]);

    // chop first two bits of e and place it in the last two bits of c[0]
    var bits12 = e[i].slice(0, 2);
    c[0][i] = c[0][i].replaceAt(6, bits12);

    // chop second two bits of e and place it in the last two bits of c[1]
    var bits34 = e[i].slice(2, 4);
    c[1][i] = c[1][i].replaceAt(6, bits34);

    // chop third two bits of e and place it in the last two bits of c[2]
    var bits56 = e[i].slice(4, 6);
    c[2][i] = c[2][i].replaceAt(6, bits56);

    // chop last two bits of e and place it in the last two bits of c[3]
    var bits78 = e[i].slice(6, 8);
    c[3][i] = c[3][i].replaceAt(6, bits78);
  }

  return c; // return the array of carrier images
}

function extract(c) {
  /* pass in an array of carrier files - could use 2 lsb of alpha for determining order
  of embedded bits?
  00 = 1st two bits
  01 = 2nd two bits
  10 = 3rd two bits
  11 = 4th and final 2 bits.
  */
  var binary = [];
  for (var i = 0; i < c[0].length; i++) {
    binary[i] = c[0][i].slice(6, 8) + c[1][i].slice(6, 8) + c[2][i].slice(6, 8)
      + c[3][i].slice(6, 8);
  }
  return binary;
}

class CanvasContext2d {
  constructor(img) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = img.getBoundingClientRect().width;
    this.canvas.height = img.getBoundingClientRect().height;
    this.context = this.canvas.getContext('2d');
    this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
  }

  getBinary() {
    return arrayToBinary(this.context.getImageData(0, 0,
      this.canvas.width, this.canvas.height).data);
  }
}

function init() {
  // heightmap
  var heightmapImg = document.getElementById('heightmap');
  var heightmap = new CanvasContext2d(heightmapImg);
  heightmapImg.style.display = 'none';

  // textures
  var textureImgs = document.getElementsByClassName('texture');
  var textures = [];
  for (var i = 0; i < textureImgs.length; i++) {
    textures[i] = new CanvasContext2d(textureImgs[i]);
    textureImgs[i].style.display = 'none';
  }

  // append heightmap to the page
  var mapCell = document.getElementById('map-cell');
  mapCell.appendChild(heightmap.canvas);

  // append textures to the page
  var texCell = document.getElementsByClassName('tex-cell');
  for (var i = 0; i < textures.length; i++) {
    texCell[i].appendChild(textures[i].canvas);
  }

  // get the binary data
  var mapBinary = heightmap.getBinary(); // NOTE: Test that getBinary() works!!!
  var texBinary = [];
  for (var i = 0; i < textures.length; i++) {
    texBinary[i] = textures[i].getBinary(); // NOTE: Test that getBinary() works!!!
  }

  // embed the heightmap within the textures
  var texBinary = multiEmbed(mapBinary, texBinary);

  // render the updated texBinary
  var stegoTexCtx = [];
  var stegoCell = document.getElementsByClassName('stego-cell');
  for (var i = 0; i < texBinary.length; i++) {
    // create a canvas and the context
    var canvas = document.createElement('canvas');
    canvas.width = Math.sqrt(texBinary[i].length / 4);
    canvas.height = canvas.width;
    stegoTexCtx[i] = canvas.getContext('2d');

    // attach the canvas to the page
    stegoCell[i].appendChild(stegoTexCtx[i].canvas);

    // render the binary data on the canvas
    renderBinary(stegoTexCtx[i], texBinary[i]);
  }

  // extract the data and reassemble the heightmap
  var extractedData = extract(texBinary);
  var canvas = document.createElement('canvas');
  canvas.width = Math.sqrt(extractedData.length / 4);
  canvas.height = canvas.width;
  var extractCtx = canvas.getContext('2d');
  document.getElementById('extract-cell').appendChild(extractCtx.canvas);
  renderBinary(extractCtx, extractedData);
}

document.addEventListener('DOMContentLoaded', init);

function renderBinary(context, binary) {
    var i = 0;
    for (var y = 0; y < context.canvas.height; y++) {
      for (var x = 0; x < context.canvas.width; x++) {
        context.fillStyle = 'rgba(' +
            parseInt(binary[i++],2) + ',' +
            parseInt(binary[i++],2) + ',' +
            parseInt(binary[i++],2) + ',' +
            parseInt(binary[i++],2) + ')';
        context.fillRect(x, y, 1, 1);
      }
    }
}
