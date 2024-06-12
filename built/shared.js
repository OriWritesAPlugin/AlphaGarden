// Contains general utility functions used by multiple pages.
// Modified version of the Okabe-Ito colorblind palette, replacing black with white due to dark website background
const OFFSET_COLORS = ["#FFFFFF", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#999999"];
// Stolen from https://stackoverflow.com/questions/17386707/how-to-check-if-a-canvas-is-blank
// returns true if every pixel's uint32 representation is 0 (or "blank")
function isCanvasBlank(canvas) {
    const context = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    return !pixelBuffer.some(color => color !== 0);
}
// Generate some spaced x-coordinates to ex: assign plants to
// Used with smart placement
function createSpacedPlacementQueue(total_width, with_spacing = 64) {
    x_coords = [];
    // Random number between, by default, 0 and 16 (remember we already place ground-centered in a 64x area)
    var range = Math.floor(with_spacing / 4);
    current_x = Math.floor(Math.random() * range);
    // 64 below to avoid plants getting cut off on the edges.
    while (current_x < (total_width - 64)) {
        x_coords.push(current_x);
        current_x += with_spacing + Math.floor(Math.random() * range * 2 - range);
    }
    return x_coords;
}
// Open a new page to claim the contents of a canvas.
function claimCanvas(canvas) {
    var new_window = window.open();
    var image = new_window.document.createElement('img');
    var instructions = new_window.document.createElement('p');
    instructions.innerHTML = "Right-click the image and save it, or copy it to a host like Imgur or Discord";
    image.src = canvas.toDataURL();
    new_window.document.body.appendChild(image);
    new_window.document.body.appendChild(instructions);
    return new_window;
}
function collectSeed(seed) {
    let seeds = sortAndVerifySeedList(seed);
    if (seeds.length == 0) {
        return;
    }
    else if (localStorage.seed_collection == undefined) {
        localStorage.seed_collection = seeds;
    }
    else {
        localStorage.seed_collection = seeds + "," + localStorage.seed_collection;
    }
}
function buildColorMessage(raw_plant_data, do_links = true) {
    let color_msg = "";
    if (raw_plant_data["foliage"] == 160) {
        color_msg += "This seed is malformed";
    }
    else {
        for (category of ["foliage_palette", "feature_palette", "accent_palette"]) {
            let link_color = "#" + all_palettes[raw_plant_data[category]]["palette"][0];
            if (do_links) {
                color_msg += ("<a href='javascript:forceFilter(-1, " + raw_plant_data[category] + ");' style='text-decoration-color: " + link_color + "'><span style='color: " + link_color + "'>" + all_palettes[raw_plant_data[category]]["name"] + "<\a><\span> ");
            }
            else {
                color_msg += ("<span style='color: " + link_color + "'>" + all_palettes[raw_plant_data[category]]["name"] + "<\span> ");
            }
        }
    }
    return color_msg;
}
function getDissolvingRS(parent, amount, chance) {
    return function (e) {
        if (Math.random() > chance) {
            return;
        }
        addSeedPoints(amount);
        let p = document.createElement("p");
        p.innerHTML = "+" + amount + " rs";
        p.className = "rs_message";
        //p.style.position = 'absolute';
        //p.style.top = `${e.clientY}`;
        //p.style.left = `${e.clientX}`;
        parent.appendChild(p);
        const anim = p.animate([
            {
                transform: `translate(0px, 0px)`,
                opacity: 1
            },
            {
                transform: `translate(0px, -50px)`,
                opacity: 0
            }
        ], {
            duration: 1000,
            easing: 'linear',
        });
        anim.onfinish = () => { p.remove(); };
    }.bind(parent, amount, chance);
}
function addSeedPoints(amount_to_add) {
    if (localStorage.seed_points == undefined) {
        localStorage.seed_points = amount_to_add;
    }
    else {
        localStorage.seed_points = Number(localStorage.seed_points) + amount_to_add;
    }
}
function getSeedPoints() {
    if (localStorage.seed_points == undefined) {
        localStorage.seed_points = 10;
    }
    return Number(localStorage.seed_points);
}
// Niche method for find-replace, you probably want its neighbor
function getSeedCollectionAsString() {
    if (localStorage.seed_collection == undefined) {
        return "";
    }
    return localStorage.seed_collection;
}
function getSeedCollection() {
    collection = getSeedCollectionAsString();
    if (collection == "") {
        return [];
    }
    return collection.split(",");
}
function getGoodieCollection() {
    if (localStorage.goodie_collection == undefined) {
        localStorage.goodie_collection = ["nigel"];
    }
    return localStorage.goodie_collection.split(",");
}
function getMarkedBases() {
    if (localStorage.marked_bases == undefined) {
        return [];
    }
    return localStorage.marked_bases.split(",").map(Number);
}
// Check if plant_data fulfills any "mark" criteria
// (which users set up in the completion tracker, lets them tag plants using
// a certain palette, etc) and adds the corresponding marks.
async function addMarkings(plant_data, plant_canvas) {
    const ctx = plant_canvas.getContext("2d");
    let colors = getMarkedPalettes();
    let draw_offset = 0;
    for (const palette of ["foliage_palette", "feature_palette", "accent_palette"]) {
        color_offset = colors.indexOf(plant_data[palette]);
        if (color_offset != -1) {
            ctx.fillStyle = getOffsetColor(color_offset);
            ctx.fillRect(plant_canvas.width - 4, draw_offset, 4, 4);
            draw_offset += 4;
        }
    }
    let base_offset = getMarkedBases().indexOf(plant_data["foliage"]);
    if (base_offset != -1) {
        ctx.fillStyle = getOffsetColor(base_offset);
        ctx.strokeRect(plant_canvas.width - 4, 0, 4, 4);
    }
    return plant_canvas;
}
function getMarkedPalettes() {
    if (localStorage.marked_palettes == undefined) {
        return [];
    }
    return localStorage.marked_palettes.split(",").map(Number);
}
function collectGoodie(goodie_name) {
    if (localStorage.goodie_collection == undefined) {
        getGoodieCollection(); // Initialize
    }
    localStorage.goodie_collection = goodie_name + "," + localStorage.goodie_collection;
}
// Used mostly in the collection, parses a list of seeds, splitting it into named and unnamed
function sortAndVerifySeedList(raw_list) {
    true_seeds = [];
    if (raw_list.length == 0) {
        return true_seeds;
    }
    split_seeds = raw_list.split(" ").join("").replace(/(^,)|(,$)/g, '').split(",");
    ;
    for (seed of split_seeds) {
        if (seed.startsWith("!")) {
            continue; // we skip these here
        }
        else if (seed.length != 10) {
            alert("You seem to have a malformed seed! Seeds are 10 characters long, but got \"" + seed + "\". Skipping!");
        }
        else {
            true_seeds.push(seed);
        }
    }
    return true_seeds;
}
// Given an index, retrieve the associated color. Color palette loops.
function getOffsetColor(idx) {
    return OFFSET_COLORS[idx % OFFSET_COLORS.length];
}
// Returns true if there's a non-transparent pixel in `row` in ImageData `image_data`. Row is 0-indexed.
// Modified from https://stackoverflow.com/questions/11796554/automatically-crop-html5-canvas-to-contents
function hasPixelInRow(image_data, row, width = 32) {
    var index, x;
    for (x = 0; x < width; x++) {
        index = (row * width + x) * 4;
        if (image_data.data[index + 3] > 0) {
            return true;
        }
    }
    return false;
}
// Shuffles an array in place
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
const randomFromArray = (arr) => { return arr[Math.floor(Math.random() * arr.length)]; };
function get_overlay_color_from_name(color, alpha) {
    color = color.slice(1);
    if (available_overlay_colors.hasOwnProperty(color)) {
        color = available_overlay_colors[color];
    }
    let rgb_code = hexToRgb(color);
    rgb_code.push(255 * alpha);
    return rgb_code;
}
function get_hex_from_name(color, alpha) {
    color = color.slice(1);
    if (available_overlay_colors.hasOwnProperty(color)) {
        color = available_overlay_colors[color];
    }
    return color;
}
function drawSkyGradient(canvas, actingPalette, opacity) {
    let ctx = canvas.getContext("2d");
    ctx.globalAlpha = opacity;
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    let step = 1 / (actingPalette.length);
    for (let i = 0; i < actingPalette.length - 1; i++) {
        grad.addColorStop(i * step, actingPalette[i]);
    }
    grad.addColorStop(1, actingPalette[actingPalette.length - 1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}
function getRandomKeyFromObj(obj) {
    return Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];
}
async function applyOverlay(stencil_canvas, palette, opacity) {
    let stencil_ctx = stencil_canvas.getContext("2d");
    let return_canvas = document.createElement("canvas");
    let return_ctx = return_canvas.getContext("2d");
    let pick_canvas = document.createElement("canvas");
    let pick_ctx = pick_canvas.getContext("2d");
    return_canvas.width, pick_canvas.width = stencil_canvas.width;
    return_canvas.height, pick_canvas.height = stencil_canvas.height;
    if (!Array.isArray(palette)) {
        palette = ["#" + get_hex_from_name(palette, opacity)];
    }
    pick_canvas = drawSkyGradient(pick_canvas, palette, opacity);
    return_canvas.width = stencil_canvas.width;
    return_canvas.height = stencil_canvas.height;
    // With our color info loaded, we apply the color itself to its own canvas
    let main_imgData = stencil_ctx.getImageData(0, 0, return_canvas.width, return_canvas.height).data;
    let pick_imgData = pick_ctx.getImageData(0, 0, return_canvas.width, return_canvas.height).data;
    let return_img = return_ctx.getImageData(0, 0, return_canvas.width, return_canvas.height);
    let return_imgData = return_img.data;
    // Loops through bytes and only place color if the area below has some alpha.
    for (var i = 0; i < main_imgData.length; i += 4) {
        if (main_imgData[i + 3] > 0) {
            return_imgData[i] = pick_imgData[i];
            return_imgData[i + 1] = pick_imgData[i + 1];
            return_imgData[i + 2] = pick_imgData[i + 2];
            return_imgData[i + 3] = pick_imgData[i + 3];
        }
    }
    return_ctx.putImageData(return_img, 0, 0);
    stencil_ctx.drawImage(return_canvas, 0, 0);
    return ({ "canvas": return_canvas, "x_pos": 0, "y_pos": 0, "width": return_canvas.width, "height": return_canvas.height });
}
// tile an image left to right across a canvas at some y
// optionally, offset them all to the left (or right, if you prefer) to
// make the tileables look somewhat different from garden to garden
async function tileAlongY(tileCtx, img, yPos, width, xOffset = 0) {
    let groundXPos = xOffset;
    while (groundXPos < width) {
        tileCtx.drawImage(img, groundXPos, yPos, img.width * 2, img.height * 2);
        groundXPos += img.width * 2;
    }
}
function clearCanvas(canvas) {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
// Flexibly take input (URL, drag-and-drop, paste, or file upload) for a wildcard by creating a popup box
// attached to some parent. Load whatever we find into all_named
// This is far jankier than it needs to be since Javascript only pauses for prompt, alert, and confirm
// Largely taken from https://soshace.com/the-ultimate-guide-to-drag-and-drop-image-uploading-with-pure-javascript/
async function imageFromPopup(parent, name_of_image, callback) {
    var form = document.createElement("div");
    form.className = "wildcard-popup";
    let helptext = document.createElement("div");
    helptext.innerHTML = "<h3>" + name_of_image + "</h3>Paste an image (or image URL), or drag-and-drop one from your files:";
    helptext.style.padding = "1vw";
    helptext.style.textAlign = "center";
    let urlTaker = document.createElement("input");
    urlTaker.style.min_height = "3vh";
    var preview = document.createElement("img");
    let preview_container = document.createElement("div");
    preview_container.className = "scaled_preview_container";
    preview_container.appendChild(preview);
    let confirm_button = document.createElement("input");
    confirm_button.type = "button";
    confirm_button.value = "Confirm";
    confirm_button.style.width = "auto";
    urlTaker.addEventListener("input", async function () {
        if (urlTaker.files == null) {
            preview.src = await resize_for_garden(name_of_image, urlTaker.value);
        }
        else {
            await handleImage(urlTaker.files, name_of_image, preview);
        }
    });
    urlTaker.addEventListener("paste", function (event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (index in items) {
            var item = items[index];
            if (item.kind === 'file') {
                var blob = item.getAsFile();
                handleImage([blob], name_of_image, preview);
            }
        }
    });
    confirm_button.addEventListener("click", function () {
        parent.removeChild(form);
        // we got here by interrupting initial garden generation; restart it
        callback();
    });
    function preventDefault(e) { e.preventDefault(); e.stopPropagation; }
    function handleDrop(e) { handleImage(e.dataTransfer.files, name_of_image, preview); }
    form.addEventListener("dragenter", preventDefault, false);
    form.addEventListener("dragleave", preventDefault, false);
    form.addEventListener("dragover", preventDefault, false);
    form.addEventListener("drop", preventDefault, false);
    form.addEventListener("drop", handleDrop, false);
    form.appendChild(helptext);
    form.appendChild(urlTaker);
    form.appendChild(preview_container);
    form.appendChild(confirm_button);
    parent.appendChild(form);
    urlTaker.focus();
    return form;
}
// Helper for imageFromPopup, handles image file validation
async function handleImage(files, name_of_image, preview_img) {
    if (files.length > 1) {
        alert("Multiple uploads detected, only the first will be used");
    }
    let file = files[0];
    let validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (validTypes.indexOf(file.type) == -1) {
        alert("Bad file type, please use a png, gif, or jpeg");
    }
    else {
        let dataURL = await getBase64(file);
        preview_img.src = await resize_for_garden(name_of_image, dataURL);
    }
}
// Shrinks an image at a URL down to 32, then up to 64, then loads it into our refs
async function resize_for_garden(name_of_image, sourceURL) {
    let refURL = name_of_image + "_wildcard_data_url";
    all_named[name_of_image] = refURL;
    let temp_img = await preload_single_image(sourceURL);
    // Forcibly resize to 32x32
    let wildcard_canvas = document.createElement("canvas");
    wildcard_canvas.width = 32;
    wildcard_canvas.height = 32;
    let max_side = Math.max(temp_img.naturalHeight, temp_img.naturalWidth);
    let wildcard_ctx = wildcard_canvas.getContext("2d");
    wildcard_ctx.imageSmoothingEnabled = false;
    // Do a bit of math so that, if the image isn't a perfect square, we don't squash it.
    wildcard_ctx.drawImage(temp_img, 0, 32 - temp_img.naturalHeight * (32 / max_side), temp_img.naturalWidth * (32 / max_side), temp_img.naturalHeight * (32 / max_side));
    let resized_dataURL = wildcard_canvas.toDataURL(temp_img.type);
    refs[refURL] = await preload_single_image(resized_dataURL);
    let preview_canvas = document.createElement("canvas");
    let preview_context = preview_canvas.getContext("2d");
    preview_canvas.width = 64;
    preview_canvas.height = 64;
    preview_context.imageSmoothingEnabled = false;
    preview_context.drawImage(refs[refURL], 0, 0, 64, 64);
    return preview_canvas.toDataURL(temp_img.type);
}
function addRadioButton(parent, name, label, checked, onclick = null) {
    let radio_button = document.createElement('input');
    radio_button.setAttribute('type', 'radio');
    radio_button.setAttribute('name', name);
    let id = name + "_" + label;
    radio_button.id = id;
    radio_button.checked = checked;
    radio_button.value = label;
    let radio_button_label = document.createElement('label');
    radio_button_label.setAttribute('for', id);
    radio_button_label.textContent = label;
    radio_button_label.classList.add("unselectable");
    if (onclick != null) {
        radio_button.onclick = onclick;
    }
    parent.appendChild(radio_button);
    parent.appendChild(radio_button_label);
}
function getRadioValue(name) {
    var ele = document.getElementsByName(name);
    for (i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            return ele[i].value;
        }
        ;
    }
}
function makeSortCheckmark(prefix, name, parent, checked = false) {
    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.value = name;
    checkbox.id = prefix + name;
    checkbox.checked = checked;
    label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.innerHTML = name;
    label.classList.add("unselectable");
    label.style.marginRight = "15px";
    parent.appendChild(checkbox);
    parent.appendChild(label);
    parent.appendChild(document.createElement("br"));
}
// Radiobuttons are weird and cursed
// https://stackoverflow.com/questions/118693/how-do-you-dynamically-create-a-radio-button-in-javascript-that-works-in-all-bro
function makeRadioButtonCursed(name, label, checked, onclick = false) {
    let id = name + "_" + label;
    function makeRadioButtonViaDiv() {
        var radioHtml = '<input type="radio" id="' + id + ' "name="' + name + '"';
        if (checked) {
            radioHtml += ' checked="checked"';
        }
        if (onclick) {
            radioHtml += ' onclick=' + onclick;
        }
        radioHtml += '/>';
        var radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;
        return radioFragment.firstChild;
    }
    let radio_button_label = document.createElement('label');
    radio_button_label.setAttribute('for', id);
    radio_button_label.setAttribute('value', label);
    radio_button_label.appendChild(makeRadioButtonViaDiv());
    return radio_button_label;
}
// From https://css-tricks.com/converting-color-spaces-in-javascript/
// Slight modification: we only need hue, and use lightness to break ties.
function toHue(H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    }
    else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0)
        h += 360;
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return h + (1 - l / 100);
}
function getBase64(file) {
    return new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onloadend = function () {
            resolve(reader.result);
        };
        reader.readAsDataURL(file);
    });
}
