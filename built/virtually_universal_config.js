// Handles stuff that's universal to all the pages, so I can copy-paste blindly and only worry about editing this file.
// If we get flashes of unstyled content, I could probably inject the list of all palettes into here as part of my usual
// "spritesheet" building script.
import { all_palettes } from "./data.js";
const broadcast_number = 0.1;
const broadcast_title = "Hello, Alphagarden user!";
const broadcast_text = "Dev here. Just adding a popup to let you know I'm actively developing on the alphagarden version and wasn't sure if anyone's using it. If you're reading this, someone is! :)</br></br>Usually I only push to alpha when I'm reasonably happy with the state of the code, but this is a major under-the-hood rework and I need to test it on phones. It shouldn't affect save data, but you might get test palettes/broken pages/etc while I tweak the rework, so it might be worth switching to the <a href='https://oriwritesaplugin.github.io/EndlessGarden/collection.html'>main site</a> for stability. Once you dismiss this popup, it won't appear until there's a new message (hopefully the release one, possibly an alert if there's another disruptive push, I won't update this for all the little fixes/tweaks/improvements). Happy gardening!";
function load_customizations() {
    let jraphics;
    if (localStorage.jraphicsTM == undefined) {
        jraphics = [124, 125, 126];
    }
    else {
        jraphics = JSON.parse(localStorage.jraphicsTM);
    }
    const bg_palette = all_palettes[jraphics[0]]["palette"];
    document.documentElement.style.setProperty("--background-color", "#" + bg_palette[3]);
    document.documentElement.style.setProperty("--input-color", "#" + bg_palette[2]);
    document.documentElement.style.setProperty("--hover-color", "#" + bg_palette[1]);
    document.documentElement.style.setProperty("--flash-color", "#" + bg_palette[0]);
    const font_palette = all_palettes[jraphics[1]]["palette"];
    document.documentElement.style.setProperty("--text-outline", "#" + font_palette[3]);
    document.documentElement.style.setProperty("--font-color", "#" + font_palette[1]);
    document.documentElement.style.setProperty("--link-color", "#" + font_palette[0]);
    const accent_palette = all_palettes[jraphics[2]]["palette"];
    document.documentElement.style.setProperty("--accent-medium", "#" + accent_palette[2]);
    document.documentElement.style.setProperty("--accent-bright", "#" + accent_palette[0]);
}
function display_release_note() {
    let last_broadcast_number;
    if (localStorage.last_broadcast_number == undefined) {
        last_broadcast_number = 0;
    }
    else {
        last_broadcast_number = JSON.parse(localStorage.last_broadcast_number);
    }
    if (last_broadcast_number != -1 && last_broadcast_number < broadcast_number) {
        const modal = document.createElement("div");
        modal.classList.add("block_window");
        document.body.appendChild(modal);
        const modal_display = document.createElement("div");
        modal_display.classList.add("bingo-popup");
        modal_display.style.padding = "2em";
        const header = document.createElement("h2");
        header.textContent = broadcast_title;
        header.style.textAlign = "center";
        modal_display.appendChild(header);
        const modal_text = document.createElement("p");
        modal_text.innerHTML = broadcast_text;
        modal_display.appendChild(modal_text);
        const accept_button = document.createElement("button");
        accept_button.onclick = function () { localStorage.last_broadcast_number = broadcast_number; document.body.removeChild(modal); };
        accept_button.innerText = "Accept";
        accept_button.classList.add("chunky_fullwidth");
        modal_display.appendChild(accept_button);
        modal.appendChild(modal_display);
    }
    ;
}
load_customizations();
display_release_note();
export { load_customizations };
