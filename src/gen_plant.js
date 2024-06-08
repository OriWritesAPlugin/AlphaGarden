// This contains the code for generating a single, random plant badge.

// The colors we'll be replacing. Touch at your peril!
const base_foliage_palette = ["#aed740", "#76c935", "#50aa37", "#2f902b"];
const base_accent_palette = ["fef4cc", "fde47b", "ffd430", "ecb600"];
const base_feature_palette = ["f3addd", "d87fbc", "c059a0", "aa3384"];
const overall_palette = base_foliage_palette.concat(base_accent_palette).concat(base_feature_palette);

var work_canvas_size = 32;  // in pixels

// A pixel of these colors indicates we should place the corresponding feature type
const place_complex_feature = "ff943a";
const place_simple_feature = "e900ff";
// A pixel of this color indicates we should place the brightest accent color at 25% alpha (used for glow)
const place_25a_accent = "c8ffb7";
// As above, but 10% for a fainter glow
const place_10a_accent = "9fe389";

// Holder for all the images we'll need
var refs = {};

// In case of error (probably CORS)
const BAD_IMG_URL = "https://i.imgur.com/kxStIJE.png";

// In case of error (probably subtly malformed seed)
const ERROR_PLANT = {"foliage": 160,
                     "simple_feature": 0,
                     "complex_feature": 3,
                     "foliage_palette": 35,
                     "feature_palette": 35,
                     "accent_palette": 35};

// old spotted mushroom: https://i.imgur.com/MyF1tCA.png
// old medium tree with the wonky trunk: https://i.imgur.com/ZMe5J0j.png
// old medium tree with wonky trunk #2 (49 0-idx) https://i.imgur.com/Ps4w9LV.png

var foliage_by_category = {};

// Cache non-component-using plants
var plant_cache = {};
var plant_cache_max_size = 30;

function assemble_categories(target_list){
    by_category = {};
    for(let i=0; i<window[target_list].length; i++){
        let entry = window[target_list][i];
        for(category of entry["categories"]){
            if(!by_category.hasOwnProperty(category)){
                by_category[category] = [];
            }
            by_category[category].push(i);
        } 
    }
    return by_category;
}

function assemble_base_odds(target_categories, base_odd_num){
    base_odds = {};
    for(category of Object.keys(target_categories)){
        base_odds[category] = base_odd_num;
    }
    return base_odds;
}

function assemble_choice_list_given_odds(target_categories, target_odds){
    odds_list = []
    for(odds_of of Object.keys(target_odds)){
        for(let i=0; i<target_odds[odds_of]; i++){
            odds_list.push(...target_categories[odds_of]);
        }
    }
    return odds_list;
}

foliage_by_category = assemble_categories("all_foliage");
foliage_base_odds = assemble_base_odds(foliage_by_category, 5);
foliage_base_odds["rare"] = 1;
foliage_base_list = assemble_choice_list_given_odds(foliage_by_category, foliage_base_odds);

/*message = "";
for (const [key, value] of Object.entries(foliage_by_category)) {
    message += `${key}: ${value.length}\n`;
  }
alert(message);*/

override_foliage = [];

temp_boost_foliage = [];

var simple_features = [0, 1, 14];
var complex_features = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// foliar earthen soft bold strange deep
// metallic celestial verdant senescent
palettes_by_category = assemble_categories("all_palettes");
foliage_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
foliage_palettes_base_odds["verdant"] = 5;
foliage_palettes_base_odds["senescent"] = 4;
//foliage_palettes_base_odds["test"] = 99;
feature_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
feature_palettes_base_odds["earthen"] = 5;
feature_palettes_base_odds["metallic"] = 4;
feature_palettes_base_odds["pastel"] = 3;
feature_palettes_base_odds["strange"] = 1;
accent_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
accent_palettes_base_odds["bold"] = 4;
accent_palettes_base_odds["celestial"] = 4;
accent_palettes_base_odds["strange"] = 3;
accent_palettes_base_odds["verdant"] = 1;
accent_palettes_base_odds["earthen"] = 1;

const foliage_palettes = assemble_choice_list_given_odds(palettes_by_category, foliage_palettes_base_odds);
const feature_palettes = assemble_choice_list_given_odds(palettes_by_category, feature_palettes_base_odds);
const accent_palettes = assemble_choice_list_given_odds(palettes_by_category, accent_palettes_base_odds);


async function place_image_at_coords_with_chance(img_url, list_of_coords, ctx, chance, anchor_to_bottom=false){
    // In canvas context ctx, place image at img_path "centered" at each (x,y) in list_of_coords with chance odds (ex 0.66 for 66%)
    img = await refs[img_url];
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
}


async function place_foliage(img_idx, ctx){
    let img = await refs["foliage"+img_idx.toString()]
    ctx.drawImage(img, 0, 0);
}


async function preload_plants() {
    // TODO: Replace with spritesheet
    for(var i=0; i<all_features.length; i++){
        refs["feature"+i] = preload_single_image(all_features[i]);
    }
    await preload_spritesheet("foliage", FOLIAGE_SPRITESHEET, all_foliage.length);
}

async function preload_named() {
    await preload_spritesheet("named", NAMED_SPRITESHEET, Object.keys(reformatted_named).length);
}

// Sound of me not being 100% confident in my async usage yet
function preload_single_image(url){
    return new  Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {resolve(img)};
        img.onerror = function() { img.src = BAD_IMG_URL;};
        img.src=url;
    });
    // Not yet supported in common versions of Safari
    /*return fetch(url)
           .then(response => response.blob())
           .then(blob => createImageBitmap(blob));*/
}

async function load_sprite_from_spritesheet(img, offset){
    let canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 32, 32);
    // All spritesheets are 10 wide, N tall
    source_offset_y = Math.floor(offset/10)*32;
    source_offset_x = (offset % 10)*32;
    ctx.drawImage(img, source_offset_x, source_offset_y, 32, 32, 0, 0, 32, 32);
    let new_img = new Image;
    new_img.src = canvas.toDataURL();
    await new_img.decode();
    return new_img;
}

async function preload_spritesheet(name, URL, count){
    let img = await new Promise(resolve => {
        const base64img = new Image();
        base64img.crossOrigin = "anonymous";
        base64img.onload = () => {resolve(base64img)};
        base64img.onerror = function() { base64img.src = BAD_IMG_URL;};
        base64img.src=URL;
    });
    await img.decode();
    offset = 0
    while(offset < count){
        refs[name+offset.toString()] = load_sprite_from_spritesheet(img, offset)
        offset ++;
    }
}


function random_from_list(list, prng=null) {
    if(prng==null){return list[Math.floor(Math.random()*list.length)]};
    return list[Math.floor(prng()*list.length)];
}

function random_from_foliage(list, prng=null) {
    let diceroll;
    if(prng==null){ diceroll = Math.random(); }
    else { diceroll = prng(); }

    return random_from_list(list, prng);
}


//Seeded prng. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Seed generator. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function parse_plant_data(plant_data){
    // Validate and, if any number is bad, give back Worst Plant
    if(plant_data["simple_feature"] >= all_features.length || plant_data["complex_feature"] >= all_features.length ||
       plant_data["foliage_palette"] >= all_palettes.length || plant_data["feature_palette"] >= all_palettes.length ||
       plant_data["accent_palette"] >= all_palettes.length){
        return parse_plant_data(ERROR_PLANT);
    }
    return {"foliage": plant_data["foliage"],
            "simple_feature": "feature"+plant_data["simple_feature"],
            "complex_feature": "feature"+plant_data["complex_feature"],
            "foliage_palette": all_palettes[plant_data["foliage_palette"]]["palette"],
            "feature_palette": all_palettes[plant_data["feature_palette"]]["palette"],
            "accent_palette": all_palettes[plant_data["accent_palette"]]["palette"]}
}


function gen_plant_data(rarity, seed_string=null) {

    var prng;
    if(seed_string == null){prng = null;}
    else{prng = mulberry32(xmur3(seed_string)());}

    return {"foliage": random_from_foliage(foliage_base_list, prng),
            "simple_feature": random_from_list(simple_features, prng),
            "complex_feature": random_from_list(complex_features, prng),
            "foliage_palette": random_from_list(foliage_palettes, prng),
            "feature_palette": random_from_list(feature_palettes, prng),
            "accent_palette": random_from_list(accent_palettes, prng)}
}

//seed format is 1<foliage><simple_feature><complex_feature>1<color><color><color><rngnum>
//random 1s are to avoid the encoding dropping the leading 0s
//foliage, feature, and the colors are all fixed-length 3 digits (ex: 100102310140060012147483647) for a max of 999 possibilities
//this number's way too big for Javascript without mantissa (Maxint is 9007199254740992 and we need highest precision and I don't know how Javascript does Things) so we break it like this:

// 1foliagesimplefeaturecomplexfeature-1colorcolorcolor-actualrandomnumberseed
// and then we put it in base64 for slightly-shorter-fixed-length purposes
function encode_plant_data(plant_data) {
    function to_padstr(entry){
        return String(plant_data[entry]).padStart(3, '0');
    }
    var part_one = parseInt("1"+to_padstr("foliage")+to_padstr("simple_feature")+to_padstr("complex_feature"));
    var part_two = parseInt("1"+to_padstr("foliage_palette")+to_padstr("feature_palette")+to_padstr("accent_palette"));
    return Base64.fromInt(part_one)+Base64.fromInt(part_two);
}

function encode_plant_data_v2(plant_data) {
    function to_padstr(entry){
        return String(plant_data[entry]).padStart(3, '0');
    }
    function to_lesser_padstr(entry){
        return String(plant_data[entry]).padStart(2, '0');
    }
    var part_one = parseInt("2"+to_padstr("foliage")+to_padstr("foliage_palette")+to_lesser_padstr("simple_feature"));
    var part_two = parseInt("2"+to_padstr("feature_palette")+to_padstr("accent_palette")+to_lesser_padstr("complex_feature"));
    return Base64.fromInt(part_one)+Base64.fromInt(part_two);
}


function decode_plant_data(plant_data) {
    // Conversion city baybeee
    // Might be able to do something clever with mods instead, but we'll check performance first
    var part_one = String(Base64.toInt(plant_data.slice(0,5)));
    var part_two = String(Base64.toInt(plant_data.slice(5)));
    // alert("Part one"+part_one+" Part two: "+part_two);
    if(parseInt(part_one.slice(0,1))==2){
    return {"foliage": parseInt(part_one.slice(1,4)),
            "foliage_palette": parseInt(part_one.slice(4,7)),
            "simple_feature": parseInt(part_one.slice(7,9)),
            "feature_palette": parseInt(part_two.slice(1,4)),
            "accent_palette": parseInt(part_two.slice(4,7)),
            "complex_feature": parseInt(part_two.slice(7,9))
           }
    } else {
     return {"foliage": parseInt(part_one.slice(1,4)),
            "simple_feature": parseInt(part_one.slice(4,7)),
            "complex_feature": parseInt(part_one.slice(7,10)),
            "foliage_palette": parseInt(part_two.slice(1,4)),
            "feature_palette": parseInt(part_two.slice(4,7)),
            "accent_palette": parseInt(part_two.slice(7,10))}
    }
}

// Stolen from https://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript
Base64 = (function () {
    var digitsStr =
    //   0       8       16      24      32      40      48      56     63
    //   v       v       v       v       v       v       v       v      v
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
    var digits = digitsStr.split('');
    var digitsMap = {};
    for (var i = 0; i < digits.length; i++) {
        digitsMap[digits[i]] = i;
    }
    return {
        fromInt: function(int32) {
            var result = '';
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0)
                    break;
            }
            return result;
        },
        toInt: function(digitsStr) {
            var result = 0;
            var digits = digitsStr.split('');
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        }
    };
})();

async function gen_plant(plant_data, with_color_key=false) {
    // Returns the image data for a generated plant
    // First we check cache
    let seed = encode_plant_data_v2(plant_data);
    let cachable = true;
    if(encode_plant_data.hasOwnProperty(seed)){return encode_plant_data(seed);}
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    plant_data = parse_plant_data(plant_data);
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    if(with_color_key){
        await place_foliage(160, work_ctx);  // Place I AM ERROR, actually the palette display sprite
    }
    await place_foliage(plant_data["foliage"], work_ctx);

    // Figure out where to put each kind of feature, replacing marker pixels as we go
    let marker_coords = getSpecialMarkers(work_ctx);

    if(marker_coords[place_simple_feature].length > 0 || marker_coords[place_complex_feature].length > 0){
        cachable = false;
        replace_color_palette([place_simple_feature, place_complex_feature], [base_foliage_palette[1], base_foliage_palette[1]], work_ctx);
        // Place the features
        if(marker_coords[place_simple_feature].length > 0){
            var place_simple = await place_image_at_coords_with_chance(plant_data["simple_feature"], marker_coords[place_simple_feature], work_ctx, 0.5);
        }
        if(marker_coords[place_complex_feature].length > 0){
            /* Chance that if there's already simple flowers, we keep using that flower
            if(simple_flower_coords.length == 0 || Math.random()>0.5){
                flower_url = complex_flowers[Math.floor(Math.random()*complex_flowers.length)];
            } else {*/
            var place_complex = await place_image_at_coords_with_chance(plant_data["complex_feature"], marker_coords[place_complex_feature], work_ctx, 0.8, true);
        }
        replace_color_palette([place_25a_accent], [plant_data["accent_palette"][0]], work_ctx, work_canvas_size, work_canvas_size, 0.25*255);
        replace_color_palette([place_10a_accent], [plant_data["accent_palette"][0]], work_ctx, work_canvas_size, work_canvas_size, 0.10*255);
    } else {  // If we place a feature above, we do the below no matter what, hence the else.
        if(marker_coords[place_25a_accent].length > 0){
            replace_color_palette([place_25a_accent], [plant_data["accent_palette"][0]], work_ctx, work_canvas_size, work_canvas_size, 0.35*255);
        }
        if(marker_coords[place_10a_accent].length > 0){
            replace_color_palette([place_10a_accent], [plant_data["accent_palette"][0]], work_ctx, work_canvas_size, work_canvas_size, 0.15*255);
        }

    }

    // We do all the recolors at once because Speed?(TM)?
    var new_overall_palette = plant_data["foliage_palette"].concat(plant_data["accent_palette"]).concat(plant_data["feature_palette"]);
    replace_color_palette(overall_palette, new_overall_palette, work_ctx);
    if(cachable){
        let keys = Object.keys(plant_cache);
        if(keys.length < plant_cache_max_size){
            plant_cache[seed] = work_canvas;
        } else {
            delete plant_cache[keys[ keys.length * Math.random() << 0]];
            plant_cache[seed] = work_canvas;
        }
    }
    // We can draw a canvas directly on another canvas
    return work_canvas;
}

async function gen_named(name){
    let work_canvas = document.createElement("canvas");
    let work_ctx = work_canvas.getContext("2d");
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    place_image_at_coords_with_chance("named"+reformatted_named[name]["offset"], [[Math.floor(work_canvas_size/2), work_canvas_size-1]], work_ctx, 1, true);
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


function replace_color(old_rgb, new_rgb, ctx, width=work_canvas_size, height=work_canvas_size) {
    // `old_rgb` and `new_rgb`: (r, g, b)
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData = ctx.getImageData(0, 0, width, height);
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


// Basically just wraps replace_color_palette
function replace_color_palette_single_image(old_palette, new_palette, img){
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    work_canvas.width = img.width;
    work_canvas.height = img.height;
    work_ctx.drawImage(img, 0, 0);
    replace_color_palette(old_palette, new_palette, work_ctx, img.width, img.height);
    return work_canvas;
}

// Palettes MUST be the same length, FYI
function replace_color_palette(old_palette, new_palette, ctx, work_canvas_width=work_canvas_size, work_canvas_height=work_canvas_size, alpha=null) {
    const paletteSwap = buildPaletteSwapLookup(old_palette, new_palette);
    let newRGB;
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    let imageData;
    imageData = ctx.getImageData(0, 0, work_canvas_width, work_canvas_height);
    for (let i=0;i<imageData.data.length;i+=4)
      {
          // god this is painful to look at. I'm sorry.
          if(inPaletteSwapLookup(paletteSwap, [imageData.data[i], imageData.data[i+1], imageData.data[i+2]])){
              newRGB = paletteSwap[imageData.data[i]][imageData.data[i+1]][imageData.data[i+2]];
              imageData.data[i]=newRGB[0];
              imageData.data[i+1]=newRGB[1];
              imageData.data[i+2]=newRGB[2];
              if(alpha != null){ imageData.data[i+3]=alpha};
          }
      }
    // put the data back on the canvas
    ctx.putImageData(imageData,0,0);
}

// Build a "lookup tree" (implemented as a nested obj) used for checking if some pixel exists in a set of palettes.
// new_palettes must be the same length as old_palettes, and its corresponding idx'd palette RGB will be the leaf.
function buildPaletteSwapLookup(old_palettes, new_palettes, leaf_as_rgb=false){
    let lookup = {};
    for(let i=0; i<old_palettes.length; i++){
        old_rgb = hexToRgb(old_palettes[i]);
        if(lookup[old_rgb[0]] == undefined){lookup[old_rgb[0]] = {};}
        if(lookup[old_rgb[0]][old_rgb[1]] == undefined){lookup[old_rgb[0]][old_rgb[1]] = {};}
        lookup[old_rgb[0]][old_rgb[1]][old_rgb[2]] = hexToRgb(new_palettes[i]);
    }
    return lookup
}
const inPaletteSwapLookup = function(lookup, rgb) {return lookup[rgb[0]] != undefined && lookup[rgb[0]][rgb[1]] != undefined && lookup[rgb[0]][rgb[1]][rgb[2]] != undefined}

function getSpecialMarkers(ctx){
    const swappables = [place_simple_feature, place_complex_feature, place_25a_accent, place_10a_accent];
    let lookup = buildPaletteSwapLookup(swappables, swappables);
    let coords = {};
    for (const key of swappables) { coords[key] = []; }
    let rgb;
    let hexmap = {};
    for (const key of swappables) { hexmap[hexToRgb(key)] = key; }
    const imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    let pixel = 0;
    for (var i=0;i<imageData.data.length;i+=4){
        rgb = [imageData.data[i], imageData.data[i+1], imageData.data[i+2]];
        if(inPaletteSwapLookup(lookup, rgb)){
            pixel = i/4;
            coords[hexmap[lookup[rgb[0]][rgb[1]][rgb[2]]]].push([pixel%work_canvas_size, Math.floor(pixel/work_canvas_size)]);
        }
    }
    return coords;
}

// Same shuffle as bingo.js. TODO: I should add a baselib
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
