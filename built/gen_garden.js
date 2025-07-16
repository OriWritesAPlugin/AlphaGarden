import { available_midgrounds, all_named, all_palettes, available_ground, GROUND_BASE_SPRITESHEET, available_ground_base } from "./data.js";
import { createSpacedPlacementQueue, claimCanvas, hasPixelInRow, hexToRgb } from "./shared.js";
import { overall_palette, base_foliage_palette, gen_named, decode_plant_data, gen_plant, random_from_list } from "./gen_plant.js";
import { refs, preload_single_image, preload_spritesheet, imageFromPopup, tile_along_y, replace_color_palette_single_image, wildcard_canvases } from "./image_handling.js";
var current_ground = "grass [palette]";
const available_overlay_colors = {
    "blue": "0000FF", "red": "FF0000", "green": "00FF00", "black": "000000", "white": "FFFFFF", "default": "201920",
    "murk": "31402d", "ocean": "015481", "fog": "c3cdcc", "sunset": "fdd35b", "night": "16121d", "midday": "438bd2"
};
// REMEMBER: TOP DOWN
const available_backgrounds = { "custom": [],
    "dusk": ["#424270", "#4c4a73", "#5b5577", "#6f617f", "#7f6d82", "#8f7887", "#a2828a", "#b7938e", "#c29b8d"],
    "early evening": ["#4f6f94", "#5a839e", "#6da3ad", "#7eb9b8", "#9ccdbd", "#afdac4", "#c1e4cc", "#d0edd5", "#e0f6e1"],
    "forest murk": ["#fef4c9", "#8e9a7b", "#567654", "#1d2e22"],
    "lilac dawn": ["#b88fe5", "#e0a9eb", "#f0c0e7", "#f3d2e6", "#f8f6eb"],
    "magically charged": ["#3c085c", "#571170", "#66167a", "#85238f", "#a2319e", "#c550a9", "#f487bc"],
    "midday": ["#74a3c7", "#91c2e7", "#a8def6", "#b7e6fb", "#d5f2f8", "#ecfdfd"],
    "night": ["#000304", "#000407", "#00070c", "#000910", "#010c14", "#02111d"],
    "overcast": ["#c2c7c7", "#c9c8c7", "#d1cec9", "#d9d1c4", "#e1d6ca", "#e9ddc7", "#e7d7b5"],
    "predawn": ["#071b24", "#0a2630", "#0e3241", "#0e3e49", "#114b51", "#1a5a5b", "#226763", "#358375"],
    "purple night": ["#0a0618", "#0c071c", "#110823", "#150a29", "#1d0b32", "#290d3e", "#370f4b", "#561160"],
    "rainy": ["#879aa1", "#677a81", "#5d7076", "#56696f", "#4d5f65", "#46585f", "#2a3e44"],
    "rose dusk": ["#4d2b40", "#532d45", "#5f324d", "#723756", "#843c63", "#964269", "#9c4667", "#a84864", "#b94860"],
    "shallow water": ["#29abbe", "#237d99", "#1b6380", "#145a70", "#0f5061", "#0c4b5a", "#09434e"],
    "sickly": ["#3a392f", "#424134", "#4c4d3a", "#595b41", "#606345", "#6a704a", "#737d4d", "#78854f", "#809552"],
    "soft sunset": ["#eb8d7c", "#ed9489", "#efa38f", "#f1b296", "#f5c8a3", "#f7d2a9", "#fae0b2", "#fff5c2",],
    "sunrise": ["#ffd0db", "#ffc7cd", "#fdc3bb", "#fcc8ae", "#fbcda8", "#fde795"],
    "sunset": ["#68267a", "#843681", "#9a4d7f", "#a86080", "#b47084", "#bd7f88", "#c58c8d", "#d1a49e", "#efe4d7"]
};
// TODO: merge available_ground into this once I do the UI refactor.
const available_tileables = available_midgrounds;
var custom_background_colors = [];
const star_colors = ["ffbbff", "bbffff", "ffffbb", "ffdddd", "ddffdd", "ffdddd", "dddddd"];
const scaled_seed_width = 64; // not used everywhere, being refactored in.
var x_coords = [];
var smart_coords = {};
var garden_width = 450;
var midground;
var use_smart_spacing = true;
var last_non_overlay_component_idx = 0; // Used for adding overlays to the ground
var height_offset = 0; // How far down to draw everything in case someone changes the height.
var ground_palette = { "foliage": null, "feature": null, "accent": null };
var possible_ground_palettes = { "foliage": [], "feature": [], "accent": [] };
// components_to_place functionally "saves" the garden state.
// Note idx 0=placed first, 1=placed second, ...n=placed last (topmost)
var components_to_place = []; // Format: {"x_pos": , "seed": , "canvas": , "height_category":, "do_not_scramble_pos": }
var background_overlay = null;
var background_color = "none";
var background_style = "gradient";
async function gen_randogarden(reuse_and_scramble_positions = false) {
    // Because Javascript doesn't have a way of cleanly pausing execution besides prompt() and the like, we
    // have to produce the dialogues for adding in wildcard seeds first. Basically, each time we encounter
    // a wildcard, we cancel our attempt at making a garden, hand control to the wildcard assigner, and trust it
    // to retry making the garden.
    if (!reuse_and_scramble_positions) {
        // Remove spaces and leading/trailing commas and newlines, then split on remaining commas
        // Couldn't regex strip the whitespace? TODO: check in on that.
        var seeds = document.getElementById("seed_list").value.split(" ").join("").replace(/[\r\n]+/gm, '').replace(/(^,)|(,$)/g, '').split(",");
        for (let i = 0; i < seeds.length; i++) {
            if (seeds[i][0] == "*") {
                let cleaned_seed = seeds[i].split("%")[0];
                if (!Object.prototype.hasOwnProperty.call(all_named, cleaned_seed)) {
                    imageFromPopup(document.body, cleaned_seed);
                    return;
                }
            }
        }
    }
    // With all the wildcards handled, proceed to drawing the actual garden.
    var canvas = document.getElementById("output_canvas");
    var ctx = canvas.getContext("2d");
    possible_ground_palettes = { "foliage": [], "feature": [], "accent": [] };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // What does it mean if someone changes their option for smart spacing, then scrambles?
    // Functionally it's nonsense, and no one toggles smart spacing off, so we just scramble.
    if (use_smart_spacing != document.getElementById("use_smart_spacing").checked && reuse_and_scramble_positions) {
        reuse_and_scramble_positions = false;
    }
    use_smart_spacing = document.getElementById("use_smart_spacing").checked;
    garden_width = Math.max(64, document.getElementById("garden_width").value);
    let garden_height = Math.max(70, document.getElementById("garden_height").value);
    document.getElementById("garden_width").value = garden_width; // min in the HTML doesn't seem to enforce itself.
    document.getElementById("garden_height").value = garden_height;
    canvas.width = garden_width;
    canvas.height = garden_height;
    height_offset = garden_height - 70;
    ctx.imageSmoothingEnabled = false;
    // Next, we generate the x positions for everything in the garden
    // We have two cases. One, we're generating a fresh garden. Two, we're operating on an existing one.
    // Our fresh garden case:   ////////////////////////////////////////////////////////////////////////////
    if (!reuse_and_scramble_positions) {
        components_to_place = [];
        // Remove spaces and leading/trailing commas and newlines, then split on remaining commas
        // Fun fact: we have to do two replaces so that newline commas don't get flagged as trailing ones. Smarter regex might fix this...
        seeds = document.getElementById("seed_list").value.split(" ").join("").replace(/[\r\n]+/gm, '').replace(/(^,)|(,$)/g, '').split(",");
        // Generate a set of coordinates to place items at
        if (use_smart_spacing) {
            smart_coords = {};
            // TODO: Surely I can simplify this
            smart_coords["short"] = createSpacedPlacementQueue(garden_width, 32);
            smart_coords["medium"] = createSpacedPlacementQueue(garden_width, 40);
            smart_coords["tall"] = createSpacedPlacementQueue(garden_width, 64);
        }
        // Even when using smart spacing, we want these as a fallback, in case we have more seeds than smart spaces
        x_coords = [];
        for (var i = 0; i < seeds.length; i++) {
            x_coords.push(Math.floor(Math.random() * (garden_width - 64)));
        }
        // Keep track of whether we'll have to add overlays to the grass
        last_non_overlay_component_idx = 0;
        background_overlay = null;
        // Build up our components from the list of seeds
        for (let i = 0; i < seeds.length; i++) {
            if (seeds[i][0] == "#") {
                // Note: we only store the """seed""" so we can more easily garden_to_string().
                components_to_place.push({ "IOU": true, "color": seeds[i].slice(1), "do_not_scramble_pos": true, "seed": seeds[i], "width": canvas.width, "height": canvas.height });
                if (i == 0) {
                    background_overlay = components_to_place[0];
                }
            }
            else {
                last_non_overlay_component_idx = i;
                // Check for a forced position
                let canvas;
                let force_pos = seeds[i].indexOf('%');
                if (force_pos > -1) {
                    x_coords[i] = garden_width * (parseFloat(seeds[i].slice(force_pos + 1)) / 100) - scaled_seed_width / 2;
                    seeds[i] = seeds[i].slice(0, force_pos);
                }
                if (seeds[i][0] == "!") {
                    seeds[i] = seeds[i].slice(1);
                    canvas = get_canvas_for_named_component(seeds[i]);
                }
                else if (seeds[i][0] == "*") {
                    // Note we don't do the slice here, that's in case of ex: someone having *crate and then I add !crate.
                    canvas = get_canvas_for_named_component(seeds[i]);
                }
                else if (seeds[i].length == 0) {
                    continue;
                }
                else if (seeds[i].length != 10) {
                    alert("You seem to have a malformed seed! Seeds are 10 characters long, but got \"" + seeds[i] + "\". Skipping!");
                    continue;
                }
                else {
                    canvas = get_canvas_for_plant(seeds[i]);
                }
                components_to_place.push(assign_component(canvas, x_coords[i], seeds[i], use_smart_spacing && !(force_pos > -1)));
            }
        }
        // Our existing garden case:   ////////////////////////////////////////////////////////////////////////////
    }
    else {
        if (use_smart_spacing) {
            smart_coords = { "short": [], "medium": [], "tall": [] };
            for (let i = 0; i < components_to_place.length; i++) {
                let component = components_to_place[i];
                if (component.do_not_scramble_pos) {
                    continue;
                }
                else {
                    smart_coords[component.height_category].push(component.x_pos);
                }
            }
            smart_coords["short"] = smart_coords["short"].sort(() => Math.random() - 0.5);
            smart_coords["medium"] = smart_coords["medium"].sort(() => Math.random() - 0.5);
            smart_coords["tall"] = smart_coords["tall"].sort(() => Math.random() - 0.5);
            for (let i = 0; i < components_to_place.length; i++) {
                let component = components_to_place[i];
                if (component.do_not_scramble_pos) {
                    continue;
                }
                else {
                    component.x_pos = smart_coords[component.height_category].pop();
                }
            }
        }
        else {
            let available_coords = [];
            for (let i = 0; i < components_to_place.length; i++) {
                if (components_to_place[i].do_not_scramble_pos) {
                    continue;
                }
                else {
                    available_coords.push(components_to_place[i].x_pos);
                }
            }
            available_coords.sort(() => Math.random() - 0.5);
            for (let i = 0; i < components_to_place.length; i++) {
                let component = components_to_place[i];
                if (component.do_not_scramble_pos) {
                    continue;
                }
                else {
                    component.x_pos = available_coords.pop();
                }
            }
        }
    }
    // Place any midground elements (we want them to be affected by any overlays)
    // This is also (temporarily) where we'll need to ensure we have ground palettes chosen
    // In the future, midgrounds will be able to roll their color independently.
    if (ground_palette["foliage"] == null) {
        scramble_tileable_palette();
    }
    if (midground != undefined) {
        place_tileable(midground);
    }
    // Wait for logic to complete and place plants and etc. (this is how we maintain a layering order)
    for (let i = 0; i < components_to_place.length; i++) {
        if (i == 0 && background_overlay != null) {
            continue;
        }
        components_to_place[i] = await components_to_place[i];
        await place_component(ctx, components_to_place[i]);
    }
    place_ground();
    let do_draw_outline = document.getElementById("draw_outline").checked;
    if (do_draw_outline) {
        let outline_color = null;
        if (background_overlay != null) {
            outline_color = get_rgb_from_overlay_name(background_overlay["color"]);
            outline_color[3] = 255;
        }
        draw_outline(outline_color, ctx);
    }
    if (background_overlay != null) {
        let underlay_canvas = document.createElement("canvas");
        let underlay_ctx = underlay_canvas.getContext("2d");
        underlay_canvas.width = garden_width;
        underlay_canvas.height = garden_height;
        let rgb_code = get_rgb_from_overlay_name(background_overlay["color"]);
        rgb_code[3] = rgb_code[3] / 255.0; // we need to convert to fillStyle's form
        underlay_ctx.fillStyle = 'rgba(' + rgb_code.toString() + ')';
        underlay_ctx.fillRect(0, 0, underlay_canvas.width, underlay_canvas.height);
        underlay_ctx.drawImage(canvas, 0, 0);
        // There HAS to be a better way
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(underlay_canvas, 0, 0);
    }
    // Background elements are cleanest on their own canvas. Includes colors, stars, etc.
    let background_canvas = document.createElement("canvas");
    let background_ctx = background_canvas.getContext("2d");
    background_canvas.width = garden_width;
    background_canvas.height = garden_height;
    // Custom colors only remain set while custom is selected.
    if (background_color != "custom") {
        custom_background_colors = [];
    }
    if (background_color != "none") {
        let colors = [];
        if (background_color == "from overlays (all)") {
            for (let i = 0; i < components_to_place.length; i++) {
                if (Object.prototype.hasOwnProperty.call(components_to_place[i], "color")) {
                    colors.push("#" + get_hex_from_overlay_name(components_to_place[i]["color"]));
                }
            }
        }
        else if (background_color == "custom") {
            if (custom_background_colors.length == 0) {
                let custom_colors_str = prompt("Enter your custom gradient (in the form #topmost_hex_color,#second_hex_color,#third...)");
                custom_background_colors = custom_colors_str.split(" ").join("").replace(/(^,)|(,$)/g, '').split(",");
                ;
            }
            colors = custom_background_colors;
        }
        else {
            colors = available_backgrounds[background_color];
        }
        if (background_style == "gradient") {
            let grad = background_ctx.createLinearGradient(0, 0, 0, garden_height);
            let step = 1 / (colors.length);
            for (let i = 0; i < colors.length - 1; i++) {
                grad.addColorStop(i * step, colors[i]);
            }
            grad.addColorStop(1, colors[colors.length - 1]);
            background_ctx.fillStyle = grad;
            background_ctx.fillRect(0, 0, garden_width, garden_height);
        }
        if (background_style == "chunks") {
            let step = 1 / (colors.length);
            for (let i = colors.length - 1; i >= 0; i--) {
                background_ctx.fillStyle = colors[i];
                background_ctx.fillRect(0, 0, garden_width, garden_height * step * (i + 1));
            }
        }
    }
    let do_draw_starfield = document.getElementById("draw_starfield").checked;
    if (do_draw_starfield) {
        generate_starfield(background_canvas, background_ctx);
    }
    background_ctx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background_canvas, 0, 0);
}
async function place_tileable(tileable_name) {
    let tile_canvas = document.getElementById("output_canvas");
    let tile_ctx = tile_canvas.getContext("2d");
    if (Object.prototype.hasOwnProperty.call(available_tileables[tileable_name], "bottom") || Object.prototype.hasOwnProperty.call(available_tileables[tileable_name], "middle")) {
        let bottom_canvas;
        if (!Object.prototype.hasOwnProperty.call(available_tileables[tileable_name], "bottom")) {
            bottom_canvas = await get_recolored_with_ground_palette(refs[available_tileables[tileable_name]["middle"]]);
        }
        else {
            bottom_canvas = await get_recolored_with_ground_palette(refs[available_tileables[tileable_name]["bottom"]]);
        }
        tile_along_y(bottom_canvas, tile_ctx, tile_canvas.height - bottom_canvas.height * 2);
        // "middle" only has any meaning if there's also a bottom
        if (Object.prototype.hasOwnProperty.call(available_tileables[tileable_name], "middle")) {
            const middle_canvas = await get_recolored_with_ground_palette(refs[available_tileables[tileable_name]["middle"]]);
            const bottom_img_height = bottom_canvas.height * 2;
            const middle_img_height = refs[available_tileables[tileable_name]["middle"]].height * 2;
            let current_y = tile_canvas.height - bottom_img_height - middle_img_height;
            while (current_y > -middle_img_height) {
                tile_along_y(middle_canvas, tile_ctx, current_y);
                current_y -= middle_img_height;
            }
        }
    }
    if (Object.prototype.hasOwnProperty.call(available_tileables[tileable_name], "top")) {
        const top_canvas = await get_recolored_with_ground_palette(refs[available_tileables[tileable_name]["top"]]);
        tile_along_y(top_canvas, tile_ctx, 0);
    }
}
// palette swap using the ground palettes
// this is largely a temporary function, since I expect midground tileables
// to be individually re-rollable eventually
async function get_recolored_with_ground_palette(img) {
    // Order is important, so we have to hardcode our keys
    img = await img;
    let new_palette = ground_palette["foliage"].concat(ground_palette["accent"]).concat(ground_palette["feature"]);
    return replace_color_palette_single_image(overall_palette, new_palette, img);
}
async function place_ground(scramble_ground = false) {
    if (scramble_ground) {
        scramble_tileable_palette();
    }
    ;
    let canvas = document.getElementById("output_canvas");
    let ctx = canvas.getContext("2d");
    let ground_ctx = await draw_ground_canvas(scramble_ground);
    for (let i = last_non_overlay_component_idx + 1; i < components_to_place.length; i++) {
        let component = await components_to_place[i];
        await place_component(ground_ctx, component);
    }
    //purge_transparency(ground_ctx.canvas);
    ctx.drawImage(ground_ctx.canvas, 0, height_offset);
}
async function scramble_randogarden() {
    gen_randogarden(true);
}
// Replace the current palette with another from the image, trying to avoid
// picking the same one twice
async function scramble_tileable_palette() {
    for (const palette_type of Object.keys(ground_palette)) {
        let palette = ground_palette[palette_type];
        if (palette == null) {
            if (possible_ground_palettes[palette_type].length == 0) {
                // No seeds, use default grass color.
                // Of course, this gives you bright green sand...but it -is- essentially an error state.
                ground_palette[palette_type] = base_foliage_palette;
            }
            else {
                ground_palette[palette_type] = all_palettes[possible_ground_palettes[palette_type][0]]["palette"];
            }
        }
        else {
            // Try to avoid picking the same one twice
            for (let allowed_attempts = 20; allowed_attempts > 0; allowed_attempts--) {
                let temp_palette = all_palettes[random_from_list(possible_ground_palettes[palette_type])]["palette"];
                if (JSON.stringify(temp_palette) != JSON.stringify(palette)) {
                    ground_palette[palette_type] = temp_palette;
                    break;
                }
            }
        }
    }
}
// Draw a field of stars onto an existing canvas, with a specified color for star trails/distant stars
function generate_starfield(star_canvas, star_ctx) {
    let star_work_canvas = document.createElement("canvas");
    let star_work_ctx = star_work_canvas.getContext("2d");
    star_work_canvas.width = star_canvas.width;
    star_work_canvas.height = star_canvas.height;
    // First we need to decide how many stars to make relative to pixels in the canvas, at max
    // There's essentially 3 levels: [1, 2, 3] in a thousand
    let star_ratio = (Math.random() * 3 + 1) / 1000;
    let pixel_indices = star_canvas.width * star_canvas.height - 1; // Let's get that 0 index out of the way
    // Now we pick our potential star positions
    let dim_pixel_pos = [];
    let bright_pixel_pos = [];
    for (let i = 0; i < (pixel_indices * star_ratio); i++) {
        let star_roll = Math.random() * 1000;
        // To give some variation in the star count, there's a 30% chance that any given star gets cut.
        if (star_roll < 300) {
            continue;
        }
        // Now small, dim stars...
        if (star_roll < 800) {
            dim_pixel_pos.push(Math.round(Math.random() * pixel_indices));
        }
        else if (star_roll < 870) {
            bright_pixel_pos.push(Math.round(Math.random() * pixel_indices));
        }
        else {
            // Math out the large, cross-shaped stars
            let star_core = Math.round(Math.random() * pixel_indices);
            bright_pixel_pos.push(star_core);
            if (star_core > 0) {
                dim_pixel_pos.push(star_core - 1);
            }
            if (star_core < pixel_indices) {
                dim_pixel_pos.push(star_core + 1);
            }
            if (star_core > star_canvas.width) {
                dim_pixel_pos.push(star_core - star_canvas.width);
            }
            if (star_core < pixel_indices - star_canvas.width) {
                dim_pixel_pos.push(star_core + star_canvas.width);
            }
        } // Might add shooting stars and the like later
    }
    let main_img = star_work_ctx.getImageData(0, 0, star_canvas.width, star_canvas.height);
    let main_imgData = main_img.data;
    let rgb_to_use = get_rgb_from_overlay_name(star_colors[Math.floor(Math.random() * star_colors.length)]);
    for (let i = 0; i < bright_pixel_pos.length; i++) {
        let pos = bright_pixel_pos[i] * 4;
        main_imgData[pos] = 255;
        main_imgData[pos + 1] = 255;
        main_imgData[pos + 2] = 255;
        main_imgData[pos + 3] = 255;
    }
    for (let i = 0; i < dim_pixel_pos.length; i++) {
        let pos = dim_pixel_pos[i] * 4;
        main_imgData[pos] = rgb_to_use[0];
        main_imgData[pos + 1] = rgb_to_use[1];
        main_imgData[pos + 2] = rgb_to_use[2];
        main_imgData[pos + 3] = 100 + Math.random() * 155;
    }
    star_work_ctx.putImageData(main_img, 0, 0);
    star_ctx.drawImage(star_work_canvas, 0, 0);
}
// Draw the groundcover...and ONLY the groundcover.
// Why doesn't it use the tileable function, which is almost exactly identical?
// Simple: my pixel art is trash. The original version of this function contained a bug that slightly squashes
// the art vertically, which somehow makes it look much, *much* better, especially the riverbed and meat ones.
// Until I can make something that looks equally good, this "bug" is promoted to feature
async function draw_ground_canvas() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = garden_width;
    ctx.imageSmoothingEnabled = false;
    // Order is important, so we have to hardcode our keys
    let new_palette = ground_palette["foliage"].concat(ground_palette["accent"]).concat(ground_palette["feature"]);
    var recolored_ground = replace_color_palette_single_image(overall_palette, new_palette, refs[available_ground[current_ground]]);
    var ground_x_pos = 0;
    while (ground_x_pos < garden_width) {
        // the world isn't ready for this truth:
        //ctx.drawImage(recolored_ground, ground_x_pos, 70-recolored_ground.height*2, 200, recolored_ground.height*2);
        ctx.drawImage(recolored_ground, ground_x_pos, 64, 200, 6);
        ground_x_pos += 200;
    }
    return ctx;
}
function claim_garden() {
    let new_window = claimCanvas(document.getElementById("output_canvas"));
    let garden_code_info = new_window.document.createElement('p');
    garden_code_info.innerHTML = "Garden code (beta): ";
    let garden_code = new_window.document.createElement('p');
    garden_code.innerHTML = garden_to_string();
    new_window.document.body.appendChild(garden_code_info);
    new_window.document.body.appendChild(garden_code);
}
// Assign a position to a component depending on its type, height, and use of smart spacing.
async function assign_component(canvas, x_pos, seed, use_smart_spacing) {
    // We'll get the canvas in a sec
    canvas = await canvas;
    let component_info = { "canvas": canvas, "seed": seed, "y_pos": height_offset + 4, "width": 64, "height": 64 };
    if (use_smart_spacing) {
        var smart_coord;
        // We estimate the height by seeing if there's a pixel found at a specific row
        // That does mean we think clouds are short...but those go behind everything else anyways.
        var image_data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        var height;
        if (!hasPixelInRow(image_data, 32 - 7, canvas.width)) {
            height = "short";
        }
        else if (!hasPixelInRow(image_data, 32 - 19, canvas.width)) {
            height = "medium";
        }
        else {
            height = "tall";
        }
        // We need to make sure there's coords left to take
        smart_coord = smart_coords[height].pop();
        if (smart_coord != undefined) {
            x_pos = smart_coord;
        }
    }
    component_info["x_pos"] = x_pos;
    component_info["height_category"] = height;
    return component_info;
}
async function place_component(ctx, component) {
    if (Object.prototype.hasOwnProperty.call(component, "IOU")) {
        // Is reliant on other seeds going first. Really only applies to overlays, so...
        component = await assign_overlay_canvas(component["color"], ctx);
    }
    ctx.drawImage(component["canvas"], component["x_pos"], component["y_pos"], component["width"], component["height"]);
}
// Gets a dropdown by ID and sets its content to be the ground names
function gen_ground_selection(dropdown_id) {
    let select = document.getElementById(dropdown_id);
    for (let key in available_ground) {
        select.options[select.options.length] = (new Option(key, key));
    }
}
// Gets a dropdown by ID and sets its content to be the background colors
function gen_background_color_selection(dropdown_id) {
    let select = document.getElementById(dropdown_id);
    for (let key in available_backgrounds) {
        select.options[select.options.length] = (new Option(key, key));
    }
    select.value = "none";
}
// Gets a dropdown by ID and sets its content to be the available midgrounds
function gen_midground_selection(dropdown_id) {
    let select = document.getElementById(dropdown_id);
    for (let key in available_midgrounds) {
        select.options[select.options.length] = (new Option(key, key));
    }
    select.value = "none";
}
// Gets a dropdown by ID and sets its content to be the background styles
function gen_background_style_selection(dropdown_id) {
    let select = document.getElementById(dropdown_id);
    select.options[0] = (new Option("gradient", "gradient"));
    select.options[1] = (new Option("chunks", "chunks"));
}
function get_canvas_for_named_component(name) {
    // The great de-async-ening definitely breaks wildcards.
    if (name.startsWith("*")) {
        return wildcard_canvases[name];
    }
    return gen_named(name);
}
function get_rgb_from_overlay_name(color) {
    let color_cutoff = color.indexOf("%");
    let alpha = 25; // percent to match the user input, we convert it later
    if (color_cutoff != -1) {
        alpha = parseInt(color.slice(color_cutoff + 1));
    }
    let rgb_code = hexToRgb(get_hex_from_overlay_name(color));
    rgb_code.push(255 * (alpha / 100.0));
    return rgb_code;
}
function get_hex_from_overlay_name(color) {
    let color_cutoff = color.indexOf("%");
    let hex_code = color;
    if (color_cutoff != -1) {
        hex_code = color.slice(0, color_cutoff);
    }
    // We also let folks input the names of colors as shortcuts
    if (Object.prototype.hasOwnProperty.call(available_overlay_colors, hex_code)) {
        hex_code = available_overlay_colors[hex_code];
    }
    return hex_code;
}
// TODO: this was hastily-written. Really needs some cleanup
// Note: color needs to be in RGBA form, or null to use closest.
async function draw_outline(color, ctx) {
    let output_canvas = document.getElementById("output_canvas");
    let main_img = ctx.getImageData(0, 0, output_canvas.width, output_canvas.height);
    let main_imgData = main_img.data;
    // We go left to right, marking each position where we switch from background to non-background and vice versa
    // we also get an additional pixel to the left or right to create a 2 pixel wide outline
    let points_to_color = [];
    // If no color is specified, we'll use the nearest (more or less) and darken it
    let colors_to_use = [];
    var outline_color;
    // We try to be smart with transparent overlays; we search for a background color.
    // We expect this loop to either die early or let us leave early
    for (let i = 0; i < main_imgData.length; i += 4) {
        if (main_imgData[i + 3] < 255) {
            outline_color = [main_imgData[i], main_imgData[i + 1], main_imgData[i + 2], main_imgData[i + 3]];
            break;
        }
    }
    // If we didn't find any non-opaque pixels, we have nothing to outline.
    if (outline_color == undefined) {
        return;
    }
    // Otherwise, we start the first proper loop, left to right.
    let last_was_background = (main_imgData.slice(0, 4).toString() == outline_color.toString());
    let this_is_background;
    let most_recent_color = [0, 0, 0];
    for (let i = 4; i < main_imgData.length; i += 4) {
        // Preemptive optimization is the enemy of progress, and yet. And yet.
        if (main_imgData[i + 3] < 200 || (main_imgData[i + 3] == outline_color[3] && main_imgData[i + 0] == outline_color[0] && main_imgData[i + 1] == outline_color[1] && main_imgData[i + 2] == outline_color[2])) {
            this_is_background = true;
        }
        else {
            this_is_background = false;
            most_recent_color = [main_imgData[i] * 0.75, main_imgData[i + 1] * 0.75, main_imgData[i + 2] * 0.75, 255];
        }
        // Note: because our "pixels" are 2x2, this shouldn't cause troubles at the corners...I think
        if (last_was_background && !this_is_background) {
            points_to_color.push(i - 4);
            //points_to_color.push(i-8);
            // NOTE: push twice due to double-thickness
            // TODO: could we do this before the resize? Easy 4x efficiency
            colors_to_use.push(most_recent_color);
            //colors_to_use.push(most_recent_color);
        }
        else if (this_is_background && !last_was_background) {
            points_to_color.push(i);
            colors_to_use.push(most_recent_color);
            //points_to_color.push(i+4);
            //colors_to_use.push(most_recent_color);
        }
        last_was_background = this_is_background;
    }
    // Now we repeat, drawing our lines top to bottom.
    last_was_background = (main_imgData.slice(0, 4).toString() == outline_color.toString());
    this_is_background = undefined;
    for (let j = 0; j < output_canvas.width; j++) {
        for (let k = 0; k < output_canvas.height; k++) {
            // This is so, so silly...
            if (j == 0 && k == 0) {
                k = 4;
            }
            ; // skip our first again.
            // We use our loops to format us up so we look like the prior inner loop for easier troubleshooting.
            // TODO: At this point, I think the remainder could be refactored into a function. Would be a lot cleaner.
            let i = (j + k * output_canvas.width) * 4;
            if (main_imgData[i + 3] < 200 || (main_imgData[i + 3] == outline_color[3] && main_imgData[i + 0] == outline_color[0] && main_imgData[i + 1] == outline_color[1] && main_imgData[i + 2] == outline_color[2])) {
                this_is_background = true;
            }
            else {
                this_is_background = false;
                most_recent_color = [main_imgData[i] * 0.75, main_imgData[i + 1] * 0.75, main_imgData[i + 2] * 0.75, 255];
            }
            if (last_was_background && !this_is_background) {
                points_to_color.push(i - output_canvas.width * 4);
                //points_to_color.push(i-output_canvas.width*2*4);
                colors_to_use.push(most_recent_color);
                //colors_to_use.push(most_recent_color);
            }
            else if (this_is_background && !last_was_background) {
                points_to_color.push(i);
                //points_to_color.push(i+output_canvas.width*4);
                colors_to_use.push(most_recent_color);
                //colors_to_use.push(most_recent_color);
            }
            last_was_background = this_is_background;
        }
    }
    // And now we apply the color!
    // Note the reason we store points instead of coloring them in place is to avoid the top-down picking up the left-right
    // we want that little "curve" on the pixel outlines.
    let color_to_use;
    if (color != null) {
        color_to_use = color;
    }
    ;
    for (let i = 0; i < points_to_color.length; i++) {
        if (color == null) {
            color_to_use = colors_to_use[i];
        }
        main_imgData[points_to_color[i]] = color_to_use[0];
        main_imgData[points_to_color[i] + 1] = color_to_use[1];
        main_imgData[points_to_color[i] + 2] = color_to_use[2];
        main_imgData[points_to_color[i] + 3] = color_to_use[3];
    }
    ctx.putImageData(main_img, 0, 0);
}
async function assign_overlay_canvas(color, ctx) {
    let output_canvas = document.getElementById("output_canvas");
    let color_canvas = document.createElement("canvas");
    let color_ctx = color_canvas.getContext("2d");
    color_canvas.width = output_canvas.width;
    color_canvas.height = output_canvas.height;
    let rgb_code = get_rgb_from_overlay_name(color);
    // With our color info loaded, we apply the color itself to its own canvas
    let main_imgData = ctx.getImageData(0, 0, color_canvas.width, color_canvas.height).data;
    let color_img = color_ctx.getImageData(0, 0, color_canvas.width, color_canvas.height);
    let color_imgData = color_img.data;
    // Loops through bytes and only place color if the area below has some alpha.
    for (var i = 0; i < main_imgData.length; i += 4) {
        if (main_imgData[i + 3] > 0) {
            color_imgData[i] = rgb_code[0];
            color_imgData[i + 1] = rgb_code[1];
            color_imgData[i + 2] = rgb_code[2];
            color_imgData[i + 3] = rgb_code[3];
        }
    }
    color_ctx.putImageData(color_img, 0, 0);
    return ({ "canvas": color_canvas, "x_pos": 0, "y_pos": 0, "width": color_canvas.width, "height": color_canvas.height });
}
function get_canvas_for_plant(seed) {
    return gen_plant_from_seed(seed);
}
function gen_plant_from_seed(seed) {
    var plant_data = decode_plant_data(seed);
    for (const palette_type of Object.keys(possible_ground_palettes)) {
        possible_ground_palettes[palette_type].push(plant_data[palette_type + "_palette"]);
    }
    var ret_canvas = gen_plant(plant_data);
    return ret_canvas;
}
// Mmm, scuff.
function garden_to_string() {
    let outstring = "";
    for (let i = 0; i < components_to_place.length; i++) {
        let component = components_to_place[i];
        if (!component.seed.startsWith("#")) {
            if (Object.prototype.hasOwnProperty.call(all_named, component.seed) && !component.seed.startsWith("*")) {
                outstring += "!";
            }
            outstring += component.seed + "%" + (((component.x_pos + scaled_seed_width / 2) / garden_width) * 100).toFixed(2);
        }
        else {
            outstring += component.seed;
        }
        outstring += ", ";
    }
    return outstring;
}
async function do_preload() {
    await do_preload_initial();
    gen_ground_selection("pick_ground");
    gen_background_color_selection("pick_background_color");
    gen_background_style_selection("pick_background_style");
    gen_midground_selection("pick_midground");
}
async function preload_ground_bases() {
    await preload_spritesheet("ground_base", GROUND_BASE_SPRITESHEET, Object.keys(available_ground_base).length);
}
// This is the only portion that needs run for the new layer-based interface, so for now they live in parallel.
async function do_preload_initial() {
    await preload_ground_bases(); // Chrome demands this come first
    //await preload_named();
    let tileables = new Set();
    // Grounds and midgrounds have variable sizes, so can't be stored in spritesheets
    for (const key in available_ground) {
        tileables.add(available_ground[key]);
    }
    /*for (const key in available_ground_base){
    tileables.add(available_ground_base[key]);
    }*/
    for (const key in available_midgrounds) {
        for (const subkey in available_midgrounds[key]) {
            tileables.add(available_midgrounds[key][subkey]);
        }
    }
    // const...of works, const...in does not
    for (const img of tileables) {
        refs[img] = await preload_single_image(img);
    }
}
export { scramble_randogarden, claim_garden, do_preload, get_canvas_for_named_component, get_canvas_for_plant, available_overlay_colors, available_tileables, available_backgrounds, do_preload_initial, available_ground_base };
