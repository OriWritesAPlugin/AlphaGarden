var img_loadup = [];
var current_ground = "grass [palette]";
const available_ground = {"grass [palette]": "https://i.imgur.com/yPNa3WB.png", "sand": "https://i.imgur.com/Ejupy26.png",
                          "sand [palette]": "https://i.imgur.com/Rzr07Ev.png", "none": "https://i.imgur.com/Hq3VDgi.png",
                          "snow": "https://i.imgur.com/ljWMvBo.png", "dirt": "https://i.imgur.com/CqQDCgC.png"};
const available_overlay_colors = {"blue": "0000FF", "red": "FF0000", "green": "00FF00", "black": "000000", "white": "FFFFFF", "default": "201920",
                                  "murk": "31402d", "ocean": "015481", "fog": "c3cdcc", "sunset": "fdd35b", "night": "16121d", "midday": "438bd2"}
var x_coords = [];
var smart_coords = {};
var garden_width = 450;
var current_x_coord;
var used_smart_coords;
var used_fallback_coords;
var use_smart_spacing = true;
var last_non_overlay_component_idx = 0; // Used for adding overlays to the ground
var height_offset = 0; // How far down to draw everything in case someone changes the height.
var ground_palette = {"foliage": null, "feature": null, "accent": null}
var possible_ground_palettes = {"foliage": [], "feature": [], "accent": []};
var components_to_place = [];  // Format: {"x_pos": , "seed": , "canvas": }. Note idx 0=placed first, 1=placed second, ...n=placed last (topmost)


async function gen_randogarden(reuse_and_scramble_positions=false) {
    // canvases seem to be stranger than I thought. It's like...every time I call this, it's
    // a "new" canvas. Even without clearRect, the old garden gets "replaced", instead of having more
    // drawn onto it. Why? Am I calling something wrong someplace?
    // Not re-creating ctx didn't help. I tried global and I'm still seeing the "replacement" behavior.
    var canvas = document.getElementById("output_canvas");
    var ctx = canvas.getContext("2d");
    possible_ground_palettes = {"foliage": [], "feature": [], "accent": []};
    // I'm noticing that Firefox insists I'm in Quirks mode despite the doctype while working locally. Related?
    // I'd really prefer not to have to push to test.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    components_to_place = [];
    // What does it mean if someone changes their option for smart spacing, then scrambles?
    // Functionally it's nonsense --you're saying both "I want my coords to obey a different rule" and "I don't want my coords to change"
    // We have to pick between nothing changing (confusing), everything getting wiped (alarming), and regenerating the garden (not a scramble)
    // We go with that last case, if only because it seems the least unexpected. So we check against the use_smart_spacing from last time...
    if(use_smart_spacing != document.getElementById("use_smart_spacing").checked && reuse_and_scramble_positions){
        reuse_and_scramble_positions = false;
    }
    use_smart_spacing = document.getElementById("use_smart_spacing").checked;
    garden_width = Math.max(64, document.getElementById("garden_width").value);
    garden_height = Math.max(70, document.getElementById("garden_height").value);
    document.getElementById("garden_width").value = garden_width;  // min in the HTML doesn't seem to enforce itself.
    document.getElementById("garden_height").value = garden_height;
    canvas.width = garden_width;
    canvas.height = garden_height;
    height_offset = garden_height - 70;
    ctx.imageSmoothingEnabled = false;
    // Remove spaces and leading/trailing commas, then split on remaining commas
    var seeds = document.getElementById("seed_list").value.split(" ").join("").replace(/(^,)|(,$)/g, '').split(",");
    var promises = []
    // Generate a set of coordinates to place items at
    if(!reuse_and_scramble_positions){
        if(use_smart_spacing){
            smart_coords = {};
            // TODO: Surely I can simplify this
            smart_coords["short"] = createSpacedPlacementQueue(garden_width, with_spacing=32);
            smart_coords["medium"] = createSpacedPlacementQueue(garden_width, with_spacing=40);
            smart_coords["tall"] = createSpacedPlacementQueue(garden_width, with_spacing=64);
            smart_coords["short_named"] = createSpacedPlacementQueue(garden_width, with_spacing=32);
            smart_coords["medium_named"] = createSpacedPlacementQueue(garden_width, with_spacing=40);
            smart_coords["tall_named"] = createSpacedPlacementQueue(garden_width, with_spacing=64);
        }
        // Even when using smart spacing, we want these as a fallback.
        x_coords = [];
        for(var i=0; i<seeds.length; i++){
            x_coords.push(Math.floor(Math.random()*(garden_width-64)));
        }
    // Reuse the coordinates from last time
    } else {
        if(use_smart_spacing){
            // TODO: SURELY I CAN SIMPLIFY THIS
            smart_coords["short"] = used_smart_coords["short"].sort(() => Math.random() - 0.5);
            smart_coords["medium"] = used_smart_coords["medium"].sort(() => Math.random() - 0.5);
            smart_coords["tall"] = used_smart_coords["tall"].sort(() => Math.random() - 0.5);
            smart_coords["short_named"] = used_smart_coords["short_named"].sort(() => Math.random() - 0.5);
            smart_coords["medium_named"] = used_smart_coords["medium_named"].sort(() => Math.random() - 0.5);
            smart_coords["tall_named"] = used_smart_coords["tall_named"].sort(() => Math.random() - 0.5);
            x_coords = used_fallback_coords.sort(() => Math.random() - 0.5);
        } else {
            x_coords.push(...used_fallback_coords);  // Recycle anything used for ex: named seeds
            x_coords.sort(() => Math.random() - 0.5);
        }
    }
    // TODO Seriously I am sure there's some list comprehension-like thing I could use to trim like 12 lines of tall_named nonsense.
    used_smart_coords = {"short": [], "medium": [], "tall": [], "short_named": [], "medium_named": [], "tall_named": []};  // Reset
    used_fallback_coords = []  // Reset too

    // Keep track of whether we'll have to add overlays to the grass
    last_non_overlay_component_idx = 0;
    let background_overlay = null;
    // Dispatch logic for figuring out where everything goes
    for(var i=0; i<seeds.length; i++){
        if(seeds[i][0] == "!"){
            components_to_place.push(assign_named_component(seeds[i].slice(1), ctx, x_coords[i], use_smart_spacing));
            last_non_overlay_component_idx = i;
        } else if(seeds[i][0] == "#"){
            components_to_place.push({"IOU": true, "color": seeds[i].slice(1)});
            if(i==0){
                background_overlay = components_to_place[0];
            }
        } else {
            // Smart_spacing logic goes inside here so we only have to draw the plant once. x_coords[i] acts as fallback.
            components_to_place.push(assign_plants(seeds[i], ctx, x_coords[i], use_smart_spacing));
            last_non_overlay_component_idx = i;
        }
    }
    // Wait for logic to complete and place (this is how we maintain a layering order)
    for(var i=0; i<components_to_place.length; i++){
        if(i==0 && background_overlay != null){continue;}
        component = await components_to_place[i];
        await place_component(ctx, component);
    }
    place_ground();
    if(background_overlay != null){
        let underlay_canvas = document.createElement("canvas");
        let underlay_ctx = underlay_canvas.getContext("2d");
        underlay_canvas.width = garden_width;
        underlay_canvas.height = garden_height;
        rgb_code = get_rgb_from_overlay_name(background_overlay["color"]);
        rgb_code[3] = rgb_code[3]/255.0  // we need to convert to fillStyle's form 
        underlay_ctx.fillStyle = 'rgba('+rgb_code.toString()+')';
        underlay_ctx.fillRect(0, 0, underlay_canvas.width, underlay_canvas.height);
        underlay_ctx.drawImage(canvas, 0, 0);
        // There HAS to be a better way
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(underlay_canvas, 0, 0);
    }
}

async function place_ground(scramble_ground=false){
    let canvas = document.getElementById("output_canvas");
    let ctx = canvas.getContext("2d");
    let ground_ctx = await draw_ground_canvas(scramble_ground);
    for(let i=last_non_overlay_component_idx+1; i<components_to_place.length; i++){
        component = await components_to_place[i];
        await place_component(ground_ctx, component);
    }
    purge_transparency(ground_ctx.canvas);
    ctx.drawImage(ground_ctx.canvas, 0, height_offset);
}

async function scramble_randogarden(){
    gen_randogarden(reuse_and_scramble_positions=true);
}

function purge_transparency(canvas){
    let ctx = canvas.getContext("2d");
    let img = ctx.getImageData(0, 0, canvas.width, canvas.height),
    imgData = img.data;
    // Loops through bytes and change pixel to white if alpha is not zero.
    for ( var i = 0; i < imgData.length; i += 4 ) {
        if ( imgData[i + 3] < 255 ) {
            imgData[i + 3] = 0;
        }}
    // Draw the results
    ctx.putImageData(img, 0, 0);
}

async function draw_ground_canvas(scramble_ground=false){
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = garden_width;
    ctx.imageSmoothingEnabled = false;
    for (const palette_type of Object.keys(ground_palette)) {
        let palette = ground_palette[palette_type];
        if(palette==null){
          ground_palette[palette_type] = all_palettes[random_from_list(possible_ground_palettes[palette_type])];
        } else if(scramble_ground){
          // Try to avoid picking the same one twice
          for(let allowed_attempts=20; allowed_attempts>0; allowed_attempts--){
            let temp_palette = all_palettes[random_from_list(possible_ground_palettes[palette_type])];
            if(JSON.stringify(temp_palette) != JSON.stringify(palette)){
              ground_palette[palette_type] = temp_palette;
              break;
            }
          }
        }
    }
    // Order is important, so we have to hardcode our keys
    let new_palette = ground_palette["foliage"].concat(ground_palette["accent"]).concat(ground_palette["feature"]);
    var recolored_ground = replace_color_palette_single_image(overall_palette, new_palette, refs[available_ground[current_ground]]);
    var ground_x_pos = 0;
    while(ground_x_pos < garden_width){
        ctx.drawImage(recolored_ground, ground_x_pos, 64, 200, 6);
        ground_x_pos += 200;
    }
    return ctx;
}

function claim_garden(){
    claimCanvas(document.getElementById("output_canvas"));
}

// Assign a position to a component depending on its type, height, and use of smart spacing.
async function assign_component(canvas, ctx, x_pos, seed, is_named, use_smart_spacing){
    var component_info = {"canvas": canvas, "seed": seed, "y_pos": height_offset + 4, "width": 64, "height": 64};
    if(use_smart_spacing){
        var smart_coord;
        // We estimate the height by seeing if there's a pixel found at a specific row
        // That does mean we think clouds are short...but those go behind everything else anyways.
        var image_data = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
        var height;
        if(!hasPixelInRow(image_data, 32-7, width=canvas.width)){
            height = "short";
        }
        else if(!hasPixelInRow(image_data, 32-19, width=canvas.width)){
            height = "medium";
        }
        else {
            height = "tall";
        }
        if(is_named){height+="_named";}  // TODO enum this
        // We need to make sure there's coords left to take
        smart_coord = smart_coords[height].pop();
        if(smart_coord!=undefined){x_pos = smart_coord;}
        used_smart_coords[height].push(x_pos);
    }
    component_info["x_pos"]=x_pos;
    return component_info;
    
}

async function place_component(ctx, component){
    if(component.hasOwnProperty("IOU")){
        // Is reliant on other seeds going first. Really only applies to overlays, so...
        component = await assign_overlay_canvas(component["color"], ctx);
    }
    ctx.drawImage(component["canvas"], component["x_pos"], component["y_pos"], component["width"], component["height"]);
}


// Gets a dropdown by ID and sets its content to be the ground names
function gen_ground_selection(dropdown_id){
    select = document.getElementById(dropdown_id);
    for(key in available_ground){
        select.options[select.options.length] = (new Option(key, key));
    }
}

function set_ground_selection(opt){
    current_ground = opt;  
}

async function assign_named_component(name, ctx, x_pos, use_smart_spacing=false){
    // TODO: This is hideous and terrible but I am very tired and wanted to write something before bed
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    await place_image_at_coords_with_chance(all_named[name], [[Math.floor(work_canvas_size/2), work_canvas_size-1]], work_ctx, 1, true);
    return assign_component(work_canvas, ctx, x_pos, name, is_named=true, use_smart_spacing=use_smart_spacing);
}

function get_rgb_from_overlay_name(color){
    let color_cutoff = color.indexOf("%");
    let alpha = 25  // percent to match the user input, we convert it later
    let hex_code = color
    if(color_cutoff != -1){
      alpha = parseInt(color.slice(color_cutoff+1));
      hex_code = color.slice(0,color_cutoff);
    }
    // We also let folks input the names of colors as shortcuts
    if(available_overlay_colors.hasOwnProperty(hex_code)){ hex_code = available_overlay_colors[hex_code]; }
    let rgb_code = hexToRgb(hex_code)
    rgb_code.push(255*(alpha/100.0))
    return rgb_code;
}

async function assign_overlay_canvas(color, ctx){
    let output_canvas = document.getElementById("output_canvas");
    let color_canvas = document.createElement("canvas");
    let color_ctx=color_canvas.getContext("2d");
    color_canvas.width = output_canvas.width;
    color_canvas.height = output_canvas.height;
    let rgb_code = get_rgb_from_overlay_name(color);

    // With our color info loaded, we apply the color itself to its own canvas
    let main_imgData = ctx.getImageData(0, 0, color_canvas.width, color_canvas.height).data;
    let color_img = color_ctx.getImageData(0, 0, color_canvas.width, color_canvas.height);
    let color_imgData = color_img.data;
    // Loops through bytes and only place color if the area below is opaque.
    for ( var i = 0; i < main_imgData.length; i += 4 ) {
        if ( main_imgData[i + 3] > 0 ) {
            color_imgData[i] = rgb_code[0];
            color_imgData[i+1] = rgb_code[1];
            color_imgData[i+2] = rgb_code[2];
            color_imgData[i+3] = rgb_code[3];
        }}
    color_ctx.putImageData(color_img, 0, 0);
    return({"canvas": color_canvas, "x_pos": 0, "y_pos": 0, "width": color_canvas.width, "height": color_canvas.height});
}

async function assign_plants(seed, ctx, x_pos, use_smart_spacing=false){
    plant_canvas = await gen_plant_from_seed(seed);
    return assign_component(plant_canvas, ctx, x_pos, seed, is_named=false, use_smart_spacing);
}

async function gen_plant_from_seed(seed) {
    var plant_data = decode_plant_data(seed);
    for (const palette_type of Object.keys(possible_ground_palettes)){
        possible_ground_palettes[palette_type].push(plant_data[palette_type+"_palette"]);
    }
    var ret_canvas = await gen_plant(plant_data);
    return ret_canvas;
}


async function do_preload() {
    for (const key in available_ground){
      refs[available_ground[key]] = await preload_single_image(available_ground[key]);
    }
    await preload_all_images();
    gen_ground_selection("pick_ground");
}
