// This contains the code for generating a single, random plant badge.
import { all_features, all_foliage, all_palettes, FOLIAGE_SPRITE_DATA, NAMED_SPRITE_DATA, ADDON_SPRITE_DATA, reformatted_named } from "./data.js";
import { hexToRgb } from "./shared.js"

// The colors we'll be replacing. Touch at your peril!
const base_foliage_palette = ["#aed740", "#76c935", "#50aa37", "#2f902b"];
const base_accent_palette = ["fef4cc", "fde47b", "ffd430", "ecb600"];
const base_feature_palette = ["f3addd", "d87fbc", "c059a0", "aa3384"];
const overall_palette = base_foliage_palette.concat(base_accent_palette).concat(base_feature_palette);

const work_canvas_size = 32 // in pixels

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
const ERROR_PLANT = {
    "foliage": 160,
    "simple_feature": 0,
    "complex_feature": 3,
    "foliage_palette": 35,
    "feature_palette": 35,
    "accent_palette": 35
};

// old spotted mushroom: https://i.imgur.com/MyF1tCA.png
// old medium tree with the wonky trunk: https://i.imgur.com/ZMe5J0j.png
// old medium tree with wonky trunk #2 (49 0-idx) https://i.imgur.com/Ps4w9LV.png

var foliage_by_category = {};

// Cache non-component-using plants
var plant_cache = {};
var plant_cache_order = [];
var plant_cache_max_size = 30;
// TODO: this made things way faster, but things kept snatching one another's canvases. Async troubles?
/*var plant_gen_canvas = document.createElement("canvas");
var plant_gen_ctx = plant_gen_canvas.getContext("2d");
plant_gen_canvas.width = work_canvas_size;
plant_gen_canvas.height = work_canvas_size;*/
var plant_gen_scale_canvas = document.createElement("canvas");
var plant_gen_scale_ctx = plant_gen_scale_canvas.getContext("2d");
plant_gen_scale_canvas.width = work_canvas_size;
plant_gen_scale_canvas.height = work_canvas_size;
plant_gen_scale_ctx.imageSmoothingEnabled = false;
var latest_scale = 1;

function assemble_categories(target_list) {
    let by_category = {};
    for (let i = 0; i < target_list.length; i++) {
        let entry = target_list[i];
        for (let category of entry["categories"]) {
            if (!Object.prototype.hasOwnProperty.call(by_category, category)) {
                by_category[category] = [];
            }
            by_category[category].push(i);
        }
    }
    return by_category;
}

function assemble_base_odds(target_categories, base_odd_num) {
    let base_odds = {};
    for (let category of Object.keys(target_categories)) {
        base_odds[category] = base_odd_num;
    }
    return base_odds;
}

function assemble_choice_list_given_odds(target_categories, target_odds) {
    let odds_list = []
    for (let odds_of of Object.keys(target_odds)) {
        for (let i = 0; i < target_odds[odds_of]; i++) {
            odds_list.push(...target_categories[odds_of]);
        }
    }
    return odds_list;
}

foliage_by_category = assemble_categories(all_foliage);
let foliage_base_odds = assemble_base_odds(foliage_by_category, 5);
foliage_base_odds["rare"] = 1;
const foliage_base_list = assemble_choice_list_given_odds(foliage_by_category, foliage_base_odds);

/*message = "";
for (const [key, value] of Object.entries(foliage_by_category)) {
message += `${key}: ${value.length}\n`;
}
alert(message);*/

var simple_features = [0, 1, 14];
var complex_features = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// foliar earthen soft bold strange deep
// metallic celestial verdant senescent
const palettes_by_category = assemble_categories(all_palettes);
let foliage_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
foliage_palettes_base_odds["verdant"] = 5;
foliage_palettes_base_odds["senescent"] = 4;
//foliage_palettes_base_odds["test"] = 99;
let feature_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
feature_palettes_base_odds["earthen"] = 5;
feature_palettes_base_odds["metallic"] = 4;
feature_palettes_base_odds["pastel"] = 3;
feature_palettes_base_odds["strange"] = 1;
let accent_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
accent_palettes_base_odds["bold"] = 4;
accent_palettes_base_odds["celestial"] = 4;
accent_palettes_base_odds["strange"] = 3;
accent_palettes_base_odds["verdant"] = 1;
accent_palettes_base_odds["earthen"] = 1;

const foliage_palettes = assemble_choice_list_given_odds(palettes_by_category, foliage_palettes_base_odds);
const feature_palettes = assemble_choice_list_given_odds(palettes_by_category, feature_palettes_base_odds);
const accent_palettes = assemble_choice_list_given_odds(palettes_by_category, accent_palettes_base_odds);


async function place_image_at_coords_with_chance(img_url, list_of_coords, ctx, chance, anchor_to_bottom = false) {
    // In canvas context ctx, place image at img_path "centered" at each (x,y) in list_of_coords with chance odds (ex 0.66 for 66%)
    let img = await refs[img_url];
    var w_offset = Math.floor(img.width / 2);
    let h_offset;
    if (!anchor_to_bottom) {
        h_offset = Math.floor(img.height / 2) - 1;
    } else {
        h_offset = -img.height + 1;
    }
    for (var i = 0; i < list_of_coords.length; i++) {
        if (Math.random() < chance) {
            let [x, y] = list_of_coords[i];
            ctx.drawImage(img, x - w_offset, y + h_offset);
        }
    }
}

// Sound of me not being 100% confident in my async usage yet
function preload_single_image(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { resolve(img) };
        img.onerror = function () { img.src = BAD_IMG_URL; };
        img.src = url;
    });
    // Not yet supported in common versions of Safari
    /*return fetch(url)
    .then(response => response.blob())
    .then(blob => createImageBitmap(blob));*/
}

function load_sprite_from_spritesheet(img, offset) {
    return new Promise(resolve => {
        const new_img = new Image();
        new_img.onload = () => { resolve(new_img); };
        new_img.onerror = function () { new_img.src = BAD_IMG_URL; };
        let canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 32, 32);
        // All spritesheets are 10 wide, N tall
        let source_offset_y = Math.floor(offset / 10) * 32;
        let source_offset_x = (offset % 10) * 32;
        ctx.drawImage(img, source_offset_x, source_offset_y, 32, 32, 0, 0, 32, 32);
        new_img.src = canvas.toDataURL();
    }).then(x => { x.decode(); return x; }, () => { console.log("Failed loading at offset " + offset); });
}

async function preload_spritesheet(name, URL, count) {
    let img = await new Promise(resolve => {
        const base64img = new Image();
        base64img.crossOrigin = "anonymous";
        base64img.onload = () => { resolve(base64img) };
        base64img.onerror = function () { base64img.src = BAD_IMG_URL; };
        base64img.src = URL;
    });
    return img.decode().then(() => {
        let offset = 0;
        while (offset < count) {
            refs[name + offset.toString()] = load_sprite_from_spritesheet(img, offset);
            offset++;
        }
    });
}


function random_from_list(list, prng = null) {
    if (prng == null) { return list[Math.floor(Math.random() * list.length)] };
    return list[Math.floor(prng() * list.length)];
}

function genWithModifiedSeedChances(cust_bases = null, cust_simple = null, cust_complex = null, cust_foliage = null, cust_feature = null, cust_accent = null) {
    return {
        "foliage": random_from_list(cust_bases === null ? foliage_base_list : cust_bases),
        "simple_feature": random_from_list(cust_simple === null ? simple_features : cust_simple),
        "complex_feature": random_from_list(cust_complex === null ? complex_features : cust_complex),
        "foliage_palette": random_from_list(cust_foliage === null ? foliage_palettes : cust_foliage),
        "feature_palette": random_from_list(cust_feature === null ? feature_palettes : cust_feature),
        "accent_palette": random_from_list(cust_accent === null ? accent_palettes : cust_accent)
    }
}

/*function random_from_foliage(list, prng=null) {
let diceroll;
if(prng==null){ diceroll = Math.random(); }
else { diceroll = prng(); }

return random_from_list(list, prng);
}*/


//Seeded prng. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Seed generator. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function parse_plant_data(plant_data) {
    // Validate and, if any number is bad, give back Worst Plant
    if (plant_data["simple_feature"] >= all_features.length || plant_data["complex_feature"] >= all_features.length || plant_data["foliage_palette"] >= all_palettes.length || plant_data["feature_palette"] >= all_palettes.length || plant_data["accent_palette"] >= all_palettes.length) {
        return parse_plant_data(ERROR_PLANT);
    }
    return {
        "foliage": plant_data["foliage"],
        "simple_feature": plant_data["simple_feature"],
        "complex_feature": plant_data["complex_feature"],
        "foliage_palette": all_palettes[plant_data["foliage_palette"]]["palette"],
        "feature_palette": all_palettes[plant_data["feature_palette"]]["palette"],
        "accent_palette": all_palettes[plant_data["accent_palette"]]["palette"]
    }
}


function gen_plant_data(rarity, seed_string = null) {
    var prng;
    if (seed_string == null) { prng = null; }
    else { prng = mulberry32(xmur3(seed_string)()); }

    return {
        "foliage": random_from_list(foliage_base_list, prng),
        "simple_feature": random_from_list(simple_features, prng),
        "complex_feature": random_from_list(complex_features, prng),
        "foliage_palette": random_from_list(foliage_palettes, prng),
        "feature_palette": random_from_list(feature_palettes, prng),
        "accent_palette": random_from_list(accent_palettes, prng)
    }
}

//seed format is 1<foliage><simple_feature><complex_feature>1<color><color><color><rngnum>
//random 1s are to avoid the encoding dropping the leading 0s
//foliage, feature, and the colors are all fixed-length 3 digits (ex: 100102310140060012147483647) for a max of 999 possibilities
//this number's way too big for Javascript without mantissa (Maxint is 9007199254740992 and we need highest precision and I don't know how Javascript does Things) so we break it like this:

// 1foliagesimplefeaturecomplexfeature-1colorcolorcolor-actualrandomnumberseed
// and then we put it in base64 for slightly-shorter-fixed-length purposes
function encode_plant_data(plant_data) {
    function to_padstr(entry) {
        return String(plant_data[entry]).padStart(3, '0');
    }
    var part_one = parseInt("1" + to_padstr("foliage") + to_padstr("simple_feature") + to_padstr("complex_feature"));
    var part_two = parseInt("1" + to_padstr("foliage_palette") + to_padstr("feature_palette") + to_padstr("accent_palette"));
    return Base64.fromInt(part_one) + Base64.fromInt(part_two);
}

function encode_plant_data_v2(plant_data) {
    function to_padstr(entry) {
        return String(plant_data[entry]).padStart(3, '0');
    }
    function to_lesser_padstr(entry) {
        return String(plant_data[entry]).padStart(2, '0');
    }
    var part_one = parseInt("2" + to_padstr("foliage") + to_padstr("foliage_palette") + to_lesser_padstr("simple_feature"));
    var part_two = parseInt("2" + to_padstr("feature_palette") + to_padstr("accent_palette") + to_lesser_padstr("complex_feature"));
    return Base64.fromInt(part_one) + Base64.fromInt(part_two);
}


function decode_plant_data(plant_data) {
    // Conversion city baybeee
    // Might be able to do something clever with mods instead, but we'll check performance first
    var part_one = String(Base64.toInt(plant_data.slice(0, 5)));
    var part_two = String(Base64.toInt(plant_data.slice(5)));
    // alert("Part one"+part_one+" Part two: "+part_two);
    if (parseInt(part_one.slice(0, 1)) == 2) {
        return {
            "foliage": parseInt(part_one.slice(1, 4)),
            "foliage_palette": parseInt(part_one.slice(4, 7)),
            "simple_feature": parseInt(part_one.slice(7, 9)),
            "feature_palette": parseInt(part_two.slice(1, 4)),
            "accent_palette": parseInt(part_two.slice(4, 7)),
            "complex_feature": parseInt(part_two.slice(7, 9))
        }
    } else {
        return {
            "foliage": parseInt(part_one.slice(1, 4)),
            "simple_feature": parseInt(part_one.slice(4, 7)),
            "complex_feature": parseInt(part_one.slice(7, 10)),
            "foliage_palette": parseInt(part_two.slice(1, 4)),
            "feature_palette": parseInt(part_two.slice(4, 7)),
            "accent_palette": parseInt(part_two.slice(7, 10))
        }
    }
}

// Stolen from https://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript
let Base64 = (function () {
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
        fromInt: function (int32) {
            var result = '';
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0)
                    break;
            }
            return result;
        },
        toInt: function (digitsStr) {
            var result = 0;
            var digits = digitsStr.split('');
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        }
    };
})();


function gen_plant(plant_data, with_color_key = false, with_scale = 1) {
    // Returns the image data for a generated plant
    // First we check cache
    let seed = encode_plant_data_v2(plant_data);
    if (Object.prototype.hasOwnProperty.call(encode_plant_data, seed)) { return encode_plant_data(seed); }
    var plant_gen_canvas = document.createElement("canvas");
    var plant_gen_ctx = plant_gen_canvas.getContext("2d");
    plant_gen_canvas.width = work_canvas_size;
    plant_gen_canvas.height = work_canvas_size;
    plant_gen_ctx.clearRect(0, 0, 32, 32);
    plant_data = parse_plant_data(plant_data);
    if (with_color_key) {
        // We need a new canvas to handle layering
        var plant_gen_overlay_canvas = document.createElement("canvas");
        var plant_gen_overlay_ctx = plant_gen_overlay_canvas.getContext("2d");
        plant_gen_overlay_canvas.width = work_canvas_size;
        plant_gen_overlay_canvas.height = work_canvas_size;

        // Place I AM ERROR, actually the palette display sprite
        let color_key_data = structuredClone(plant_data);
        color_key_data["foliage"] = 160;
        draw_plant_with_color_palette(plant_gen_ctx, color_key_data, false);

        // Now draw up the plant on the other canvas
        plant_gen_overlay_ctx.clearRect(0, 0, 32, 32);
        plant_gen_overlay_ctx.scale(with_scale, with_scale);
        draw_plant_with_color_palette(plant_gen_overlay_ctx, plant_data, true);

        // And place the plant onto the canvas
        plant_gen_ctx.drawImage(plant_gen_overlay_canvas, 0, 0);

    } else if (seed in plant_cache) {
        plant_gen_canvas = plant_cache[seed];
    } else {
        draw_plant_with_color_palette(plant_gen_ctx, plant_data, true);
        // s is for subparts
        if (!FOLIAGE_SPRITE_DATA[plant_data["foliage"]["s"]]) {
            plant_cache[seed] = plant_gen_canvas;
            plant_cache_order.push(seed);
            if (plant_cache.length > plant_cache_max_size) {
                let to_remove = plant_cache_order.shift();
                delete plant_cache[to_remove];
            }
        }
    }
    if (with_scale != 1) {
        if (with_scale != latest_scale) {
            latest_scale = with_scale;
            plant_gen_scale_canvas.width = work_canvas_size * with_scale;
            plant_gen_scale_canvas.height = work_canvas_size * with_scale;
            plant_gen_scale_ctx.scale(with_scale, with_scale);
        }
        plant_gen_scale_ctx.clearRect(0, 0, plant_gen_scale_canvas.width, plant_gen_scale_canvas.width);
        plant_gen_scale_ctx.imageSmoothingEnabled = false;
        plant_gen_scale_ctx.drawImage(plant_gen_canvas, 0, 0);
        return plant_gen_scale_canvas;
    } else {
        return plant_gen_canvas;
    }
}

function gen_named(name) {
    let work_canvas = document.createElement("canvas");
    let work_ctx = work_canvas.getContext("2d");
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    let imageData = draw_arbitrary_onto_imageData_without_color_palette(work_ctx.getImageData(0, 0, work_canvas_size, work_canvas_size), NAMED_SPRITE_DATA[reformatted_named[name]["offset"]], true, 0)
    work_ctx.putImageData(imageData, 0, 0);
    return work_canvas;
}


function replace_color(old_rgb, new_rgb, ctx, width = work_canvas_size, height = work_canvas_size) {
    // `old_rgb` and `new_rgb`: (r, g, b)
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData = ctx.getImageData(0, 0, width, height);
    var oldRed, oldGreen, oldBlue;
    var newRed, newGreen, newBlue;
    [oldRed, oldGreen, oldBlue] = old_rgb;
    [newRed, newGreen, newBlue] = new_rgb;
    for (var i = 0; i < imageData.data.length; i += 4) {
        // is this pixel the old rgb?
        if (imageData.data[i] == oldRed &&
            imageData.data[i + 1] == oldGreen &&
            imageData.data[i + 2] == oldBlue
        ) {
            // change to your new rgb
            imageData.data[i] = newRed;
            imageData.data[i + 1] = newGreen;
            imageData.data[i + 2] = newBlue;
        }
    }
    // put the data back on the canvas
    ctx.putImageData(imageData, 0, 0);
}


// Basically just wraps replace_color_palette
function replace_color_palette_single_image(old_palette, new_palette, img) {
    var work_canvas = document.createElement("canvas");
    var work_ctx = work_canvas.getContext("2d");
    work_canvas.width = img.width;
    work_canvas.height = img.height;
    work_ctx.drawImage(img, 0, 0);
    replace_color_palette(old_palette, new_palette, work_ctx, img.width, img.height);
    return work_canvas;
}

// Palettes MUST be the same length, FYI
function replace_color_palette(old_palette, new_palette, ctx, work_canvas_width = work_canvas_size, work_canvas_height = work_canvas_size, alpha = null) {
    const paletteSwap = buildPaletteSwapLookup(old_palette, new_palette);
    let newRGB;
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    let imageData;
    imageData = ctx.getImageData(0, 0, work_canvas_width, work_canvas_height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        // god this is painful to look at. I'm sorry.
        if (inPaletteSwapLookup(paletteSwap, [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]])) {
            newRGB = paletteSwap[imageData.data[i]][imageData.data[i + 1]][imageData.data[i + 2]];
            imageData.data[i] = newRGB[0];
            imageData.data[i + 1] = newRGB[1];
            imageData.data[i + 2] = newRGB[2];
            if (alpha != null) { imageData.data[i + 3] = alpha };
        }
    }
    // put the data back on the canvas
    ctx.putImageData(imageData, 0, 0);
}

function draw_plant_with_color_palette(ctx, plant_data, center) {
    const plant_num = plant_data["foliage"];
    const hex_palette = plant_data["foliage_palette"].concat(plant_data["accent_palette"]).concat(plant_data["feature_palette"]);
    let imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    const palette = hex_palette.map(hexToRgb);
    imageData = draw_arbitrary_onto_imageData_with_color_palette(imageData, plant_data, FOLIAGE_SPRITE_DATA[plant_num], palette, center);
    ctx.putImageData(imageData, 0, 0);
}

// Get hype for COORDINATE MATH
function get_absolute_offset(inner_offset, offset_data, center_factor) {
    // First line is x pos: offset within the row plus however far we need to shift in to center. Second is y: number of rows finished plus rows from top
    let x_coord = inner_offset % offset_data["w"] + center_factor;
    let y_coord = Math.floor(inner_offset / offset_data["w"]) + (work_canvas_size - offset_data["h"]);
    return 4 * (x_coord + y_coord * work_canvas_size);
}

// Basically, draw plants
function draw_arbitrary_onto_imageData_with_color_palette(imageData, plant_data, offset_data, palette, center, initial_offset = 0) {
    let i = 0;
    let raw_data = offset_data['e'];
    let x_center = center ? Math.floor((work_canvas_size - offset_data["w"]) / 2) : 0;
    while (i < raw_data.length) {
        let pos = initial_offset + get_absolute_offset(i, offset_data, x_center);
        let char = raw_data.charCodeAt(i);
        if (char == 48 || imageData.data[pos]) { /* empty */ } // 0, an empty pixel, or we already drew something with the subpart system
        // 1, a hard white pixel
        else if (char == 49) { imageData.data[pos] = 255; imageData.data[pos + 1] = 255; imageData.data[pos + 2] = 255; imageData.data[pos + 3] = 255; }
        // Our 12 colors, also a common case
        else if (char > 64 && char < 77) {
            imageData.data[pos] = palette[char - 65][0];
            imageData.data[pos + 1] = palette[char - 65][1];
            imageData.data[pos + 2] = palette[char - 65][2];
            imageData.data[pos + 3] = 255;
        } else if (char == 77 || char == 78) {
            let addon_num, chance;
            if (char === 77) {
                addon_num = plant_data["complex_feature"];
                chance = 0.8
            } else {
                addon_num = plant_data["simple_feature"];
                chance = 0.4;
            }
            if (chance < Math.random()) { continue; }
            let mini_data = ADDON_SPRITE_DATA[addon_num];
            let centerpoint = work_canvas_size * work_canvas_size + Math.floor((work_canvas_size - mini_data["w"]) / 2) - work_canvas_size + Math.floor(mini_data["w"] / 2);
            draw_arbitrary_onto_imageData_with_color_palette(imageData, plant_data, ADDON_SPRITE_DATA[addon_num], palette, center, pos - 4 * centerpoint);
        } else if (char == 79 || char == 80) {
            imageData.data[pos] = palette[4][0];
            imageData.data[pos + 1] = palette[4][1];
            imageData.data[pos + 2] = palette[4][2];
            imageData.data[pos + 3] = char == 80 ? 25 : 60;
        } else {
            let char = raw_data.charAt(i);
            imageData.data[pos] = offset_data['x'][char][0];
            imageData.data[pos + 1] = offset_data['x'][char][1];
            imageData.data[pos + 2] = offset_data['x'][char][2];
            imageData.data[pos + 3] = offset_data['x'][char][3];
        }
        i++;
    }
    return imageData;
}

// Basically, draw named components (perhaps this should go in shared but it's near identical to the above)
function draw_arbitrary_onto_imageData_without_color_palette(imageData, offset_data, center, initial_offset = 0) {
    let i = 0;
    let raw_data = offset_data['e'];
    let x_center = center ? Math.floor((work_canvas_size - offset_data["w"]) / 2) : 0;
    while (i < raw_data.length) {
        let pos = initial_offset + get_absolute_offset(i, offset_data, x_center);
        let char = raw_data.charCodeAt(i);
        if (char == 48 || imageData.data[pos]) { /* empty */ } // 0, an empty pixel, or we already drew something with the subpart system
        // 1, a hard white pixel
        else if (char == 49) { imageData.data[pos] = 255; imageData.data[pos + 1] = 255; imageData.data[pos + 2] = 255; imageData.data[pos + 3] = 255; }
        else {
            let char = raw_data.charAt(i);
            imageData.data[pos] = offset_data['x'][char][0];
            imageData.data[pos + 1] = offset_data['x'][char][1];
            imageData.data[pos + 2] = offset_data['x'][char][2];
            imageData.data[pos + 3] = offset_data['x'][char][3];
        }
        i++;
    }
    return imageData;
}

// Build a "lookup tree" (implemented as a nested obj) used for checking if some pixel exists in a set of palettes.
// new_palettes must be the same length as old_palettes, and its corresponding idx'd palette RGB will be the leaf.
function buildPaletteSwapLookup(old_palettes, new_palettes) {
    let lookup = {};
    for (let i = 0; i < old_palettes.length; i++) {
        let old_rgb = hexToRgb(old_palettes[i]);
        if (lookup[old_rgb[0]] == undefined) { lookup[old_rgb[0]] = {}; }
        if (lookup[old_rgb[0]][old_rgb[1]] == undefined) { lookup[old_rgb[0]][old_rgb[1]] = {}; }
        lookup[old_rgb[0]][old_rgb[1]][old_rgb[2]] = hexToRgb(new_palettes[i]);
    }
    return lookup
}
const inPaletteSwapLookup = function (lookup, rgb) { return lookup[rgb[0]] != undefined && lookup[rgb[0]][rgb[1]] != undefined && lookup[rgb[0]][rgb[1]][rgb[2]] != undefined }

function getSpecialMarkers(ctx) {
    const swappables = [place_simple_feature, place_complex_feature, place_25a_accent, place_10a_accent];
    let lookup = buildPaletteSwapLookup(swappables, swappables);
    let coords = {};
    for (const key of swappables) { coords[key] = []; }
    let rgb;
    let hexmap = {};
    for (const key of swappables) { hexmap[hexToRgb(key)] = key; }
    const imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    let pixel = 0;
    for (var i = 0; i < imageData.data.length; i += 4) {
        rgb = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
        if (inPaletteSwapLookup(lookup, rgb)) {
            pixel = i / 4;
            coords[hexmap[lookup[rgb[0]][rgb[1]][rgb[2]]]].push([pixel % work_canvas_size, Math.floor(pixel / work_canvas_size)]);
        }
    }
    return coords;
}

// Note that for a screen to make use of this one, it MUST implement a bunch of select/deselect toggles
// returns a list lists [bases, foliage, feature, accent], for use with genWithModifiedSeedChance
// Does nothing with the simple/complex addons
function calculateSeedChances() {
    let foliage_palettes_odds = {};
    let feature_palettes_odds = {};
    let accent_palettes_odds = {};
    let base_odds = {};
    for (let palette of Object.keys(palettes_by_category)) {
        if (document.getElementById("palette_deselect_" + palette).checked) {
            foliage_palettes_odds[palette] = foliage_palettes_base_odds[palette];
            feature_palettes_odds[palette] = feature_palettes_base_odds[palette];
            accent_palettes_odds[palette] = accent_palettes_base_odds[palette];
        }
    }
    for (let base_type of Object.keys(foliage_by_category)) {
        if (document.getElementById("foliage_deselect_" + base_type).checked) {
            base_odds[base_type] = foliage_base_odds[base_type];
        }
    }
    return [
        assemble_choice_list_given_odds(foliage_by_category, base_odds),
        assemble_choice_list_given_odds(palettes_by_category, foliage_palettes_odds),
        assemble_choice_list_given_odds(palettes_by_category, feature_palettes_odds),
        assemble_choice_list_given_odds(palettes_by_category, accent_palettes_odds)
    ];
}

export {
    genWithModifiedSeedChances, palettes_by_category, foliage_by_category, calculateSeedChances, decode_plant_data,
    encode_plant_data_v2, replace_color_palette_single_image, refs, overall_palette, place_image_at_coords_with_chance,
    preload_single_image, preload_spritesheet, gen_plant_data, gen_plant, gen_named, replace_color, getSpecialMarkers,
    base_foliage_palette, base_feature_palette, base_accent_palette, random_from_list, work_canvas_size, parse_plant_data,
    replace_color_palette, assemble_categories, xmur3, mulberry32
};