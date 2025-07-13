// Handles stuff that's universal to all the pages, so I can copy-paste blindly and only worry about editing this file.
// If we get flashes of unstyled content, I could probably inject the list of all palettes into here as part of my usual
// "spritesheet" building script.
import { all_palettes } from "./data.js";

function load_customizations(){
    let jraphics;
    if (localStorage.jraphicsTM == undefined) { jraphics = [124, 125, 126];}
    else {jraphics = JSON.parse(localStorage.jraphicsTM);}
    const bg_palette = all_palettes[jraphics[0]]["palette"];
    document.documentElement.style.setProperty("--background-color", "#"+bg_palette[3]);
    document.documentElement.style.setProperty("--input-color", "#"+bg_palette[2]);
    document.documentElement.style.setProperty("--hover-color", "#"+bg_palette[1]);
    document.documentElement.style.setProperty("--flash-color", "#"+bg_palette[0]);
    const font_palette = all_palettes[jraphics[1]]["palette"];
    document.documentElement.style.setProperty("--text-outline", "#"+font_palette[3]);
    document.documentElement.style.setProperty("--font-color", "#"+font_palette[1]);
    document.documentElement.style.setProperty("--link-color", "#"+font_palette[0]);
    const accent_palette = all_palettes[jraphics[2]]["palette"];
    document.documentElement.style.setProperty("--accent-medium", "#"+accent_palette[2]);
    document.documentElement.style.setProperty("--accent-bright", "#"+accent_palette[0]);
}
load_customizations();

export{load_customizations};