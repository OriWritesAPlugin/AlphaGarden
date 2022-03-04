// This contains the code for generating a random plant badge.
// I wrote it with limited internet access, meaning that it looks like Python and uses no clever Javascript tricks.
// You've been warned!

// Javascript can't access images by path.
// This workaround is hideous, but what can ya do :) (while hosting to github and not using ajax, I mean)
all_foliage = ["https://i.imgur.com/PabdLnL.png", "https://i.imgur.com/WN2m2Aa.png", "https://i.imgur.com/wsC3ifp.png",
               "https://i.imgur.com/NFM09J5.png", "https://i.imgur.com/urBlTiV.png", "https://i.imgur.com/kyfs2Yl.png",
               "https://i.imgur.com/nMW2bBb.png", "https://i.imgur.com/tBQb6yy.png", "https://i.imgur.com/5j6u58a.png",
               "https://i.imgur.com/Mb1wqi1.png", "https://i.imgur.com/Rk7vvo3.png", "https://i.imgur.com/DdEYVYA.png",
               "https://i.imgur.com/IF5MQWY.png", "https://i.imgur.com/Z6njdmV.png", "https://i.imgur.com/cDAqt4U.png",
               "https://i.imgur.com/117aiCY.png", "https://i.imgur.com/7ZrX05Y.png", "https://i.imgur.com/ZMe5J0j.png",
               "https://i.imgur.com/wLsuJSX.png", "https://i.imgur.com/dxJbfgi.png", "https://i.imgur.com/l1MK3yJ.png",
               "https://i.imgur.com/kTbrzeL.png", "https://i.imgur.com/s4Uav2q.png", "https://i.imgur.com/6GPgZzr.png",
               "https://i.imgur.com/E6ikrq8.png", "https://i.imgur.com/MyF1tCA.png", "https://i.imgur.com/5y1UeDM.png",
               "https://i.imgur.com/uYswz0s.png", "https://i.imgur.com/qGczjJf.png", "https://i.imgur.com/PaWgGAq.png"];
// Doing it this way lets us preserve the numbering to know which plant is which.
// But it's also key to how the seeds work!
common_foliage = [0]  // (expand this later)
// for testing
foliage = all_foliage;

//seed format is 1<foliage><flower>1<color><color><color><rngnum>
//random 1s are to avoid the encoding dropping the leading 0s
//foliage, flower, and the colors are all fixed-length 3 digits (ex: 100102310140060012147483647) for a max of 999 possibilities
//this number's way too big for Javascript without mantissa (Maxint is 9007199254740992 and we need highest precision and I don't know how Javascript does Things) so we break it like this:

// 1foliageflower-1colorcolorcolor-actualrandomnumberseed
// and then we put it in base64 for slightly-shorter-fixed-length purposes (yes I checked on the fixed-length, don't worry!)

// 1001023 ->  D0Y/

// 1014006001 -> 8cIDx

// D0Y/8cIDx  that's...more or less typable? And also shorter which is important for our purposes

// if you don't break on the proper lengths, you get 1074841275891953 which is Big Wrong



// Rarity level:
// 1: only common things available
// 2: adds uncommon foliage
// 3?: adds complex flowers, use common ones instead at lower rarities??
// 3/4: adds uncommon foliage colors
// 4?: adds chance of doubles? triples need to die. maybe doubles too. add uncommon flower colors instead?
// 4/6: adds rare foliage
// 5/7: adds rare foliage colors
// 8: add rare flower colors
// 9: increased weight of uncommon + rare colors?
// 10: increased weight of rare colors?

// bingo difficulty could be difficulty*size_rating+1. so an easy*small is (1*1+1=2), easy*medium is (1*2+1), hard*big is (3*3+1=10), pain*medium is (2*4+1=9)
// maybe you sometimes get a free max(1,difficulty-2) plant as a bonus so that that level 1 is somewhat relevant. or something.


var basic_flowers = ["https://i.imgur.com/G4h84Ht.png", "https://i.imgur.com/vXQYMkL.png"];
var complex_flowers = ["https://i.imgur.com/p1ipMdS.png", "https://i.imgur.com/UUFJO7h.png"];

var base_foliage_palette = ["#aed740", "#76c935", "#50aa37", "#2f902b"];
var base_foliage_light = base_foliage_palette[1];  // second from lightest
var base_accent_palette = ["fef4cc", "fde47b", "ffd430", "ecb600"];
var base_flower_palette = ["f3addd", "d87fbc", "c059a0", "aa3384"];
var overall_palette = base_foliage_palette.concat(base_accent_palette).concat(base_flower_palette);

var work_canvas_size = 32;  // in pixels

// Roll more than two_foliage_roll out of 1 to have two pieces of base foliage.
var two_foliage_roll = 0.95;

var place_complex_flower = "#ff943a";
var place_simple_flower = "#e900ff";

var common_foliage_palettes = [["#aed740", "#76c935", "#50aa37", "#2f902b"], ["a2ac4d", "8f974a", "66732a", "4b692f"],
                               ["7ad8b7","5eb995", "3e946d", "277b50"], ["9dbb86", "679465", "476f58", "2f4d47"],
                               ["8fbe99", "7faf89", "3f7252", "285d3c"], ["fdff07", "b9d50f", "669914", "34670b"],
                               ["b0f7a9", "7dcc75", "63aa5a", "448d3c"], ["c5af7a", "a6905c", "806d40", "69582e"],
                               ["6ee964", "54c44b", "3da136", "228036"]];
var uncommon_foliage_palettes = [["e7d7c1", "a78a7f", "735751", "603f3d"], ["9c6695", "734978", "4c2d5c", "2f1847"],
                                 ["f8cd1e", "d3a740", "b2773a", "934634"], ["e4eaf3", "c0cfe7", "9ab3db", "7389ad"],
                                 ["b98838", "8c6526", "8c6526", "54401f"], ["8f8090", "655666", "453946", "2a212b"]];
var med_rarity_foliage_palettes = common_foliage_palettes.concat(uncommon_foliage_palettes);
var rare_foliage_palettes = [["f5dbd7", "eec3c3", "d396a8", "c9829d"], ["d1d2f9", "a3bcf9", "7796cb", "576490"],
                             ["eff0ba", "e2c3b2", "ce86a8", "c56497"], ["e88c50", "d0653e", "af3629", "9b1f1f"]]; 
var high_rarity_foliage_palettes = med_rarity_foliage_palettes.concat(rare_foliage_palettes);

// For testing
var foliage_palettes = high_rarity_foliage_palettes;

var flower_palettes = [["fef4cc", "fde47b", "ffd430", "ecb600"],["f3addd", "d87fbc", "c059a0", "aa3384"]];
flower_palettes = flower_palettes.concat(uncommon_foliage_palettes);

var rare_flower_palettes = [];
rare_flower_palettes = rare_flower_palettes.concat(rare_foliage_palettes);

// For testing
flower_palettes = flower_palettes.concat(rare_flower_palettes);


async function place_image_at_coords_with_chance(img_url, list_of_coords, ctx, chance, anchor_to_bottom=false){
    // In canvas context ctx, place image at img_path "centered" at each (x,y) in list_of_coords with chance odds (ex 0.66 for 66%)
    // 50% chance to horizontally mirror each one? (TODO)
    // Wondering if the shared ctx save/reload and use of async-await is giving me the "floating flowers" issue in here.
    // I may revisit (and mirror the final canvas instead), but it feels like overkill for now.
    var img = new Image();
    img.src = img_url;
    img.crossOrigin = "anonymous"
    // closure to load an image because yes
    img.onload = (function(list_of_coords) {
      return function() {
      var w_offset = Math.floor(img.width/2);
      if(!anchor_to_bottom){
        var h_offset = Math.floor(img.height/2)-1;
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
    } else {
        foliage_amount = 2;
    }
    // https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
    // TODO look up =>...probably not a cursed GTE :)
    var imgs = foliage.sort(() => .5 - Math.random()).slice(0,foliage_amount);
    var do_flip = false;
    for(var i=0;i<imgs.length;i++){
      if(Math.random() < 0.5){
        do_flip=true;
        work_ctx.save();
        //work_ctx.translate(work_canvas_size, 0);
        //work_ctx.scale(-1, 1);
      } else {do_flip=false};
      await place_image_at_coords_with_chance(imgs[i], [[Math.floor(work_canvas_size/2)-1, work_canvas_size-1]], work_ctx, 1, true);
    if(do_flip){work_ctx.restore();}
    }

    // Figure out where to put each kind of flower, replacing marker pixels as we go
    simple_flower_coords = get_flower_coords(place_simple_flower, work_ctx);
    complex_flower_coords = get_flower_coords(place_complex_flower, work_ctx);

    // Place the flowers
    var flower_url;
    if(simple_flower_coords.length > 0){
        flower_url = basic_flowers[Math.floor(Math.random()*basic_flowers.length)];
        await place_image_at_coords_with_chance(flower_url, simple_flower_coords, work_ctx, 0.5);
    }
    if(complex_flower_coords.length > 0){
        // Chance that if there's already simple flowers, we keep using that flower
        if(simple_flower_coords.length == 0 || Math.random()>0.5){
            flower_url = complex_flowers[Math.floor(Math.random()*complex_flowers.length)];
        }
        await place_image_at_coords_with_chance(flower_url, complex_flower_coords, work_ctx, 0.8, true);
    }

    // We do all the recolors at once because Speed?(TM)?
    var new_foliage_palette = foliage_palettes[Math.floor(Math.random()*foliage_palettes.length)];
    var new_flower_palette = flower_palettes[Math.floor(Math.random()*flower_palettes.length)];
    var new_accent_palette = flower_palettes[Math.floor(Math.random()*flower_palettes.length)];
    var new_overall_palette = new_foliage_palette.concat(new_accent_palette).concat(new_flower_palette);
    replace_color_palette(overall_palette, new_overall_palette, work_ctx);

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

// Palettes MUST be the same length, FYI
function replace_color_palette(old_palette, new_palette, ctx) {
    var oldRGB, newRGB;
    // We do some truly hideous hacks because I'm bad at Javascript :)
    // Basically, we use the r, g, and b as a 3-level key into an object
    // If we follow it to the bottom and something exists, it's something we replace
    var paletteSwap = {};
    for(var i=0; i<old_palette.length; i++){
        oldRGB = hexToRgb(old_palette[i]);
        // (cries in defaultdict)
        // but seriously there might be a better way. As is, this stuff's prolly power word kill for JS devs...
        if(paletteSwap[oldRGB[0]] == undefined){paletteSwap[oldRGB[0]] = {};}
        if(paletteSwap[oldRGB[0]][oldRGB[1]] == undefined){paletteSwap[oldRGB[0]][oldRGB[1]] = {};}
        paletteSwap[oldRGB[0]][oldRGB[1]][oldRGB[2]] = hexToRgb(new_palette[i]);
    }
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    for (var i=0;i<imageData.data.length;i+=4)
      {
          // god this is painful to look at. I'm sorry.
          if(paletteSwap[imageData.data[i]] != undefined &&
             paletteSwap[imageData.data[i]][imageData.data[i+1]] != undefined &&
             paletteSwap[imageData.data[i]][imageData.data[i+1]][imageData.data[i+2]] != undefined){
              newRGB = paletteSwap[imageData.data[i]][imageData.data[i+1]][imageData.data[i+2]];
              imageData.data[i]=newRGB[0];
              imageData.data[i+1]=newRGB[1];
              imageData.data[i+2]=newRGB[2];
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
