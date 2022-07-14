// Contains general utility functions used by multiple pages.

// Stolen from https://stackoverflow.com/questions/17386707/how-to-check-if-a-canvas-is-blank
// returns true if every pixel's uint32 representation is 0 (or "blank")
function isCanvasBlank(canvas) {
  const context = canvas.getContext('2d');
  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
  return !pixelBuffer.some(color => color !== 0);
}


// Generate some spaced x-coordinates to ex: assign plants to
function createSpacedPlacementQueue(total_width, with_spacing=64){
  x_coords = [];
  // Random number between, by default, 0 and 16 (remember we already place ground-centered in a 64x area)
  var range = Math.floor(with_spacing/4);
  current_x = Math.floor(Math.random()*range);
  // 64 below to avoid plants getting cut off on the edges.
  while(current_x < (total_width-64)){
    x_coords.push(current_x);
    current_x += with_spacing+Math.floor(Math.random()*range*2-range);
  }
  shuffleArray(x_coords);
  return x_coords
}


// Open a new page to claim the contents of a canvas.
function claimCanvas(canvas){
  var new_window = window.open();
  var image = new_window.document.createElement('img');
  var instructions = new_window.document.createElement('p');
  instructions.innerHTML = "Right-click the image and save it, or copy it to a host like Imgur or Discord";
  image.src = canvas.toDataURL();
  new_window.document.body.appendChild(image);
  new_window.document.body.appendChild(instructions);
}


// Returns true if there's a non-transparent pixel in `row` in ImageData `image_data`. Row is 0-indexed.
// Modified from https://stackoverflow.com/questions/11796554/automatically-crop-html5-canvas-to-contents
function hasPixelInRow(image_data, row, width=32){
    var index, x;
    for (x = 0; x < width; x++) {
        index = (row * width + x) * 4;
        if (image_data.data[index+3] > 0) {
            return true;
        }
    }
    return false;
}
