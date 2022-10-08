var img_loadup = [];
var current_ground = "grass [palette]";
const available_ground = {"grass [palette]": "https://i.imgur.com/yPNa3WB.png", "sand": "https://i.imgur.com/Ejupy26.png",
                          "sand [palette]": "https://i.imgur.com/Rzr07Ev.png", "none": "https://i.imgur.com/Hq3VDgi.png",
                          "snow": "https://i.imgur.com/ljWMvBo.png", "dirt": "https://i.imgur.com/CqQDCgC.png"};
const available_overlay_colors = {"blue": "0000FF", "red": "FF0000", "green": "00FF00", "black": "000000", "white": "FFFFFF", "default": "201920",
                                  "murk": "31402d", "ocean": "015481", "fog": "c3cdcc", "sunset": "fdd35b", "night": "16121d", "midday": "438bd2"}

const scaled_seed_width = 64;  // not used everywhere, being refactored in.
var x_coords = [];
var smart_coords = {};
var garden_width = 450;
var current_x_coord;
var used_fallback_coords;
var use_smart_spacing = true;
var last_non_overlay_component_idx = 0; // Used for adding overlays to the ground
var height_offset = 0; // How far down to draw everything in case someone changes the height.
var ground_palette = {"foliage": null, "feature": null, "accent": null}
var possible_ground_palettes = {"foliage": [], "feature": [], "accent": []};
// components_to_place functionally "saves" the garden state.
// Note idx 0=placed first, 1=placed second, ...n=placed last (topmost)
var components_to_place = [];  // Format: {"x_pos": , "seed": , "canvas": , "height_category":, "do_not_scramble_pos": }
var background_overlay = null;


async function gen_randogarden(reuse_and_scramble_positions=false) {
    // canvases seem to be stranger than I thought. It's like...every time I call this, it's
    // a "new" canvas. Even without clearRect, the old garden gets "replaced", instead of having more
    // drawn onto it. Why? Am I calling something wrong someplace?
    // Not re-creating ctx didn't help. I tried global and I'm still seeing the "replacement" behavior.
    var canvas = document.getElementById("output_canvas");
    var ctx = canvas.getContext("2d");
    possible_ground_palettes = {"foliage": [], "feature": [], "accent": []};
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // What does it mean if someone changes their option for smart spacing, then scrambles?
    // Functionally it's nonsense, and no one toggles smart spacing off, so we just scramble.
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

    // Next, we generate the x positions for everything in the garden

    // We have two cases. One, we're generating a fresh garden. Two, we're operating on an existing one.
    // Our fresh garden case:   ////////////////////////////////////////////////////////////////////////////
    if(!reuse_and_scramble_positions){
        components_to_place = [];
        // Remove spaces and leading/trailing commas, then split on remaining commas
        var seeds = document.getElementById("seed_list").value.split(" ").join("").replace(/(^,)|(,$)/g, '').split(",");
        var promises = []
        // Generate a set of coordinates to place items at
        if(use_smart_spacing){
            smart_coords = {};
            // TODO: Surely I can simplify this
            smart_coords["short"] = createSpacedPlacementQueue(garden_width, with_spacing=32);
            smart_coords["medium"] = createSpacedPlacementQueue(garden_width, with_spacing=40);
            smart_coords["tall"] = createSpacedPlacementQueue(garden_width, with_spacing=64);
        }
        // Even when using smart spacing, we want these as a fallback, in case we have more seeds than smart spaces
        x_coords = [];
        for(var i=0; i<seeds.length; i++){
            x_coords.push(Math.floor(Math.random()*(garden_width-64)));
        }

        // Keep track of whether we'll have to add overlays to the grass
        last_non_overlay_component_idx = 0;
        background_overlay = null;

        // Build up our components from the list of seeds
        for(let i=0; i<seeds.length; i++){
            if(seeds[i][0] == "#"){
                // Note: we only store the """seed""" so we can more easily garden_to_string().
                components_to_place.push({"IOU": true, "color": seeds[i].slice(1), "do_not_scramble_pos": true, "seed": seeds[i]});
                if(i==0){
                    background_overlay = components_to_place[0];
                }
            } else {
                last_non_overlay_component_idx = i;
                // Check for a forced position
                let canvas;
                let force_pos = seeds[i].indexOf('%');
                if(force_pos > -1) {
                    x_coords[i] = garden_width*(parseFloat(seeds[i].slice(force_pos+1))/100) - scaled_seed_width/2;
                    seeds[i] = seeds[i].slice(0, force_pos);
                }
                if(seeds[i][0] == "*"){
                    if(!all_named.hasOwnProperty(seeds[i])){
                        let url = prompt("Enter URL for image you want to use for "+seeds[i]+" (if it's from FR, you'll have to host it someplace like Imgur or Discord due to FR's settings):");
                        all_named[seeds[i]] = url;
                        let temp_img = await preload_single_image(url);
                        // Forcibly resize to 32x32
                        let wildcard_canvas = document.createElement("canvas");
                        wildcard_canvas.width = 32;
                        wildcard_canvas.height = 32;
                        let wildcard_ctx = wildcard_canvas.getContext("2d");
                        wildcard_ctx.drawImage(temp_img, 0, 0, 32, 32);
                        refs[url] = await preload_single_image(wildcard_canvas.toDataURL(temp_img.type));
                    }
                    canvas = get_canvas_for_named_component(seeds[i]);
                }
                else if(seeds[i][0] == "!"){
                    seeds[i] = seeds[i].slice(1);
                    canvas = get_canvas_for_named_component(seeds[i]);
                } else if(seeds[i].length == 0){
                    continue;
                } else if(seeds[i].length != 10){
                    alert("You seem to have a malformed seed! Seeds are 10 characters long, but got \""+seeds[i]+"\". Skipping!")
                    continue;
                } else {
                    canvas = get_canvas_for_plant(seeds[i]);
                }
                components_to_place.push(assign_component(canvas, x_coords[i], seeds[i], use_smart_spacing && !(force_pos > -1)));
            }
        }

    // Our existing garden case:   ////////////////////////////////////////////////////////////////////////////
    } else {
        if(use_smart_spacing){
            smart_coords = {"short": [], "medium": [], "tall": []};
            for(let i=0; i<components_to_place.length; i++){
                component = components_to_place[i];
                if(component.do_not_scramble_pos){ 
                    continue;
                } else {
                    smart_coords[component.height_category].push(component.x_pos);
                }
            }
            smart_coords["short"] = smart_coords["short"].sort(() => Math.random() - 0.5);
            smart_coords["medium"] = smart_coords["medium"].sort(() => Math.random() - 0.5);
            smart_coords["tall"] = smart_coords["tall"].sort(() => Math.random() - 0.5);
            for(let i=0; i<components_to_place.length; i++){
                let component = components_to_place[i];
                if(component.do_not_scramble_pos){ 
                    continue;
                } else {
                    component.x_pos = smart_coords[component.height_category].pop();
                }
            }
        } else {
            let available_coords = [];
            for(let i=0; i<components_to_place.length; i++){
                if(components_to_place[i].do_not_scramble_pos){ 
                    continue;
                } else {
                    available_coords.push(components_to_place[i].x_pos);
                }
            }
            available_coords.sort(() => Math.random() - 0.5);
            for(let i=0; i<components_to_place.length; i++){
                let component = components_to_place[i];
                if(component.do_not_scramble_pos){ 
                    continue;
                } else {
                    component.x_pos = available_coords.pop();
                }
            }
        }
    }

    // Wait for logic to complete and place (this is how we maintain a layering order)
    for(var i=0; i<components_to_place.length; i++){
        if(i==0 && background_overlay != null){continue;}
        components_to_place[i] = await components_to_place[i];
        await place_component(ctx, components_to_place[i]);
    }
    place_ground();
    let do_draw_outline = document.getElementById("draw_outline").checked;
    if(do_draw_outline){
        let outline_color = null;
        if(background_overlay != null) {
            outline_color = get_rgb_from_overlay_name(background_overlay["color"]);
            outline_color[3] = 255;
        }
        draw_outline(outline_color, ctx);}
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
    let new_window = claimCanvas(document.getElementById("output_canvas"));
    let garden_code_info = new_window.document.createElement('p');
    garden_code_info.innerHTML = "Garden code (beta): "
    let garden_code = new_window.document.createElement('p');
    garden_code.innerHTML = garden_to_string();
    new_window.document.body.appendChild(garden_code_info);
    new_window.document.body.appendChild(garden_code);
}

// Assign a position to a component depending on its type, height, and use of smart spacing.
async function assign_component(canvas, x_pos, seed, use_smart_spacing){
    // We'll get the canvas in a sec
    canvas = await canvas;
    let component_info = {"canvas": canvas, "seed": seed, "y_pos": height_offset + 4, "width": 64, "height": 64};
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
        // We need to make sure there's coords left to take
        smart_coord = smart_coords[height].pop();
        if(smart_coord!=undefined){x_pos = smart_coord;}
    }
    component_info["x_pos"]=x_pos;
    component_info["height_category"]=height;
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

async function get_canvas_for_named_component(name){
    // TODO: This is hideous and terrible but I am very tired and wanted to write something before bed
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    place_image_at_coords_with_chance(all_named[name], [[Math.floor(work_canvas_size/2), work_canvas_size-1]], work_ctx, 1, true);
    return work_canvas;
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

// TODO: this was hastily-written. Really needs some cleanup
// Note: color needs to be in RGBA form, or null to use closest.
async function draw_outline(color, ctx){
   let output_canvas = document.getElementById("output_canvas");
   let main_img = ctx.getImageData(0, 0, output_canvas.width, output_canvas.height);
   let main_imgData = main_img.data;
   // We go left to right, marking each position where we switch from background to non-background and vice versa
   // we also get an additional pixel to the left or right to create a 2 pixel wide outline
   let points_to_color = [];
   // If no color is specified, we'll use the nearest (more or less) and darken it
   let colors_to_use = [];
   var background_color;
   // We try to be smart with transparent overlays; we search for a background color.
   // We expect this loop to either die early or let us leave early
   for (let i=0; i < main_imgData.length; i += 4) {
       if ( main_imgData[i + 3] < 255 ) {
           background_color = [main_imgData[i], main_imgData[i+1], main_imgData[i+2], main_imgData[i+3]];
           break;
       }
   }
   // If we didn't find any non-opaque pixels, we have nothing to outline.
   if(background_color == undefined){return;}
   // Otherwise, we start the first proper loop, left to right.
   let last_was_background = (main_imgData.slice(0,4).toString() == background_color.toString());
   let this_is_background;
   let most_recent_color = [0, 0, 0];
   for (let i=4; i < main_imgData.length; i += 4) {
       // Preemptive optimization is the enemy of progress, and yet. And yet.
       if ( main_imgData[i + 3] < 200 || (main_imgData[i + 3] == background_color[3] && main_imgData[i + 0] == background_color[0] &&
                main_imgData[i + 1] == background_color[1] &&  main_imgData[i + 2] == background_color[2])) {
           this_is_background = true;
       } else {
           this_is_background = false;
           most_recent_color = [main_imgData[i] * 0.75, main_imgData[i+1] * 0.75, main_imgData[i+2] * 0.75, 255];
       }
       // Note: because our "pixels" are 2x2, this shouldn't cause troubles at the corners...I think
       if(last_was_background && !this_is_background){
           points_to_color.push(i-4);
           //points_to_color.push(i-8);
           // NOTE: push twice due to double-thickness
           // TODO: could we do this before the resize? Easy 4x efficiency
           colors_to_use.push(most_recent_color);
           //colors_to_use.push(most_recent_color);
           
       } else if (this_is_background && !last_was_background){
           points_to_color.push(i);
           colors_to_use.push(most_recent_color);
           //points_to_color.push(i+4);
           //colors_to_use.push(most_recent_color);
       }
       last_was_background = this_is_background;
   }
   // Now we repeat, drawing our lines top to bottom.
   last_was_background = (main_imgData.slice(0,4).toString() == background_color.toString());
   this_is_background = undefined;
   for (let j=0; j < output_canvas.width; j ++) {
       for (let k=0; k < output_canvas.height; k++){
           // This is so, so silly...
           if( j==0 && k==0 ){k=4};  // skip our first again.
           // We use our loops to format us up so we look like the prior inner loop for easier troubleshooting.
           // TODO: At this point, I think the remainder could be refactored into a function. Would be a lot cleaner.
           let i = (j + k*output_canvas.width)*4;
           if ( main_imgData[i + 3] < 200 || (main_imgData[i + 3] == background_color[3] && main_imgData[i + 0] == background_color[0] &&
                main_imgData[i + 1] == background_color[1] &&  main_imgData[i + 2] == background_color[2])) {
               this_is_background = true;
           } else {
               this_is_background = false;
               most_recent_color = [main_imgData[i] * 0.75, main_imgData[i+1] * 0.75, main_imgData[i+2] * 0.75, 255];
           }
           if(last_was_background && !this_is_background){
               points_to_color.push(i-output_canvas.width*4);
               //points_to_color.push(i-output_canvas.width*2*4);
               colors_to_use.push(most_recent_color);
               //colors_to_use.push(most_recent_color);
           } else if (this_is_background && !last_was_background){
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
   if(color != null){ color_to_use = color};
   for (let i=0; i<points_to_color.length; i++){
       if(color == null){ color_to_use = colors_to_use[i]; }
       main_imgData[points_to_color[i]] = color_to_use[0];
       main_imgData[points_to_color[i]+1] = color_to_use[1];
       main_imgData[points_to_color[i]+2] = color_to_use[2];
       main_imgData[points_to_color[i]+3] = color_to_use[3];
   }
   ctx.putImageData(main_img, 0, 0);
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

async function get_canvas_for_plant(seed){
    return await gen_plant_from_seed(seed);
}

async function gen_plant_from_seed(seed) {
    var plant_data = decode_plant_data(seed);
    for (const palette_type of Object.keys(possible_ground_palettes)){
        possible_ground_palettes[palette_type].push(plant_data[palette_type+"_palette"]);
    }
    var ret_canvas = await gen_plant(plant_data);
    return ret_canvas;
}

// Mmm, scuff.
function garden_to_string() {
    outstring = "";
    for(let i=0; i<components_to_place.length; i++){
        let component = components_to_place[i];
        if(!component.seed.startsWith("#")){
            if(all_named.hasOwnProperty(component.seed) && !component.seed.startsWith("*")){
                outstring += "!"
            }
            outstring += component.seed + "%" + (((component.x_pos+scaled_seed_width/2)/garden_width)*100).toFixed(2);
        } else {
            outstring += component.seed;
        }
        outstring += ", ";
    }
    return outstring;
}


async function do_preload() {
    for (const key in available_ground){
      refs[available_ground[key]] = await preload_single_image(available_ground[key]);
    }
    await preload_all_images();
    gen_ground_selection("pick_ground");
}
