// This contains the code for generating a random plant badge.

// Javascript can't access images by path.
// This workaround is hideous, but what can ya do :) (while hosting to github and not using ajax, I mean)
var foliage = ["https://i.imgur.com/DHEhYZb.png", "https://i.imgur.com/YVmcV0F.png", "https://i.imgur.com/zqt4vSP.png", 
               "https://i.imgur.com/jplFR6T.png", "https://i.imgur.com/VdpvRzM.png", "https://i.imgur.com/ygeds4o.png",
               "https://i.imgur.com/ZF7Qrri.png"];
var basic_flowers = ["https://i.imgur.com/MguYO3C.png", "https://i.imgur.com/wWEcDGb.png", "https://i.imgur.com/91qw9lR.png",
                     "https://i.imgur.com/wbp9xX6.png", "https://i.imgur.com/Yif3R6i.png", "https://i.imgur.com/D6EF5qt.png"];
var complex_flowers = ["https://i.imgur.com/JnS0o47.png", "https://i.imgur.com/qzCN0hL.png", "https://i.imgur.com/yCnPCSK.png",
                       "https://i.imgur.com/JAjNhuw.png", "https://i.imgur.com/cinsz3D.png", "https://i.imgur.com/8k4MgSd.png"];

var base_foliage_light = "#8f974a";
var base_foliage_dark = "#4b692f";
var base_flower_light = "#d77bba";
var base_flower_dark = "bd4b99";
var base_flower_accent = "fbf236";

var work_canvas_size = 32;  // in pixels

// Roll more than two_foliage_roll out of 10 to have two pieces of base foliage, etc.
var two_foliage_roll = 0.5;
var three_foliage_roll = 0.9;

var place_complex_flower = "#ff943a";
var place_simple_flower = "#e900ff";

var foliage_palettes = [["#8f974a", "4b692f"], ["468816", "4b692f"], ["207316", "0d4f2e"], ["ad6f30", "942020"], ["23943a", "0a713d"],
// repeats to cheaply up the likelihood of green
["8f974a", "4b692f"], ["468816", "4b692f"], ["207316", "0d4f2e"]];
var flower_palettes = [["d77bba", "bd4b99"], ["d77bba", "bd4b99"], ["fbf236", "efce35"], ["7835ef", "5a23e6"], ["fefeee", "f2f2d6"]];


async function place_image_at_coords_with_chance(img_url, list_of_coords, ctx, chance, anchor_to_bottom=false){
    // In canvas context ctx, place image at img_path "centered" at each (x,y) in list_of_coords with chance odds (ex 0.66 for 66%)
    var img = new Image();
    img.src = img_url;
    img.crossOrigin = "anonymous"
    // closure to load an image because yes
    img.onload = (function(list_of_coords) {
      return function() {
      var w_offset = Math.floor(img.width/2);
      if(!anchor_to_bottom){
        var h_offset = Math.floor(img.height/2);
      } else {
        var h_offset = -img.height + 1;
      }
      for (var i=0;i<list_of_coords.length;i++) {
        if (Math.random() < chance){
          [x,y] = list_of_coords[i];
          ctx.drawImage(img, x-w_offset, y+h_offset);
        }
      }
    }})(list_of_coords);
    await img.decode();
    return img;
}

function preload_plants()
// TODO: Gross prototype nonsense.
{
  refs = []
  lists_to_load = [foliage, basic_flowers, complex_flowers]
  for(var i=0; i<lists_to_load.length; i++){
      for(var j=0; j<lists_to_load[i].length;j++){
        var img=new Image();
        img.src=lists_to_load[i][j];
        img.crossOrigin = "anonymous"
        refs.push(img);
      }
  }
  // to keep in memory
  return refs
}


async function gen_plant() {
    // Returns the image data for a generated plant
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    // How much base foliage to combine
    var foliage_amount;
    const foliage_roll = Math.random();
    if(foliage_roll < two_foliage_roll){
        foliage_amount = 1;
    } else if(foliage_roll < three_foliage_roll){
        foliage_amount = 2;
    } else {
        foliage_amount = 3;
    }
    // https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
    // TODO look up =>...probably not a cursed GTE :)
    var imgs = foliage.sort(() => .5 - Math.random()).slice(0,foliage_amount);
    var do_flip = false;
    for(var i=0;i<imgs.length;i++){
      if(Math.random() < 0.5){
        do_flip=true;
        work_ctx.save();
        work_ctx.translate(work_canvas.width, 0);
        work_ctx.scale(-1, 1);
      } else {do_flip=false;} // horizontally flip at random
      await place_image_at_coords_with_chance(imgs[i], [[Math.floor(work_canvas_size/2)-1, work_canvas_size-1]], work_ctx, 1, true);
      if(do_flip){work_ctx.restore();}
    }

    // Figure out where to put each kind of flower, replacing marker pixels as we go
    simple_flower_coords = get_flower_coords(place_simple_flower, work_ctx);
    complex_flower_coords = get_flower_coords(place_complex_flower, work_ctx);

    // Recolor the foliage
    // If the recoloring is slow, there's no reason why we couldn't do it in one pass...but it's 16x16, so let's hold off for now.
    var new_light, new_dark, new_accent;
    [new_light, new_dark] = foliage_palettes[Math.floor(Math.random()*foliage_palettes.length)];
    replace_color(hexToRgb(base_foliage_light), hexToRgb(new_light), work_ctx);
    replace_color(hexToRgb(base_foliage_dark), hexToRgb(new_dark), work_ctx);

    // Place the flowers
    var flower_url;
    if(simple_flower_coords.length > 0){
        flower_url = basic_flowers[Math.floor(Math.random()*basic_flowers.length)];
        await place_image_at_coords_with_chance(flower_url, simple_flower_coords, work_ctx, 0.75);
    }
    if(complex_flower_coords.length > 0){
        // Chance that if there's already simple flowers, we keep using that flower
        if(simple_flower_coords.length == 0 || Math.random()>0.5){
            flower_url = complex_flowers[Math.floor(Math.random()*complex_flowers.length)];
        }
        await place_image_at_coords_with_chance(flower_url, complex_flower_coords, work_ctx, 0.9, true);
    }

    // Recolor the flowers
    [new_light, new_dark] = flower_palettes[Math.floor(Math.random()*flower_palettes.length)];
    new_accent = flower_palettes[Math.floor(Math.random()*flower_palettes.length)][0];
    replace_color(hexToRgb(base_flower_light), hexToRgb(new_light), work_ctx);
    replace_color(hexToRgb(base_flower_dark), hexToRgb(new_dark), work_ctx);
    replace_color(hexToRgb(base_flower_accent), hexToRgb(new_accent), work_ctx);

    // We can draw a canvas directly on another canvas
    return work_canvas;
}

function hexToRgb(hex) {
  // taken from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}


function replace_color(old_rgb, new_rgb, ctx) {
    // `old_rgb` and `new_rgb`: (r, g, b)
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    var oldRed, oldGreen, oldBlue;
    var newRed, newGreen, newBlue;
    [oldRed, oldGreen, oldBlue] = old_rgb;
    [newRed, newGreen, newBlue] = new_rgb;
    for (var i=0;i<imageData.data.length;i+=4)
      {
          // is this pixel the old rgb?
          if(imageData.data[i]==oldRed &&
             imageData.data[i+1]==oldGreen &&
             imageData.data[i+2]==oldBlue
          ){
              // change to your new rgb
              imageData.data[i]=newRed;
              imageData.data[i+1]=newGreen;
              imageData.data[i+2]=newBlue;
          }
      }
    // put the data back on the canvas  
    ctx.putImageData(imageData,0,0);
}

function get_flower_coords(flower_hex, ctx) {
    // Go through an image and find where to place the flowers. Very similar to replace_color().
    // NOTE: replaces flower_rgb pixels with base_foliage_light ones! This is because we don't always
    // place flowers and don't want a pixel escaping.
    var ret_coords = [];
    var imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    [oldRed, oldGreen, oldBlue] = hexToRgb(flower_hex);
    [newRed, newGreen, newBlue] = hexToRgb(base_foliage_light);
    var pixel = 0;
    for (var i=0;i<imageData.data.length;i+=4)
      {
          // is this pixel the old rgb?
          if(imageData.data[i]==oldRed &&
             imageData.data[i+1]==oldGreen &&
             imageData.data[i+2]==oldBlue
          ){
              // change to your new rgb
              imageData.data[i]=newRed;
              imageData.data[i+1]=newGreen;
              imageData.data[i+2]=newBlue;
              // Ready to get a little cursed? Because there's probably a better way to do this, but it's a dumb project so...
              pixel = i/4;
              ret_coords.push([pixel%work_canvas_size, Math.floor(pixel/work_canvas_size)]);
          }
      }
    ctx.putImageData(imageData,0,0);
    return ret_coords
  }
