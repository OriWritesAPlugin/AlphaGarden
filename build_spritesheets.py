import io
import json
import math
import os
import requests
import time

from PIL import Image

SPRITES_PER_ROW = 10
SPRITE_DIMENSION = 32  # ex: 32 x 32 px. Also sounds refreshing, too sweet for me though.
DATA_FILE = "src/gen_plant.js"
OUTPATH = "images"


fetch_out = [#"all_foliage",
             "reformatted_named"]


def extract_json_from_js_var(var_name):
    with open(DATA_FILE, "r") as f:
        json_string = ""
        for line in f:
            if (var_name + " =") in line:  # fragile, could do with regex
                json_string += "=".join(line.split("=")[1:])
                break
        for line in f:
            if ("// END " + var_name) in line:  # I leave this there myself
                break
            json_string += line
    formatted = json.loads(json_string)
    # One of them is weird because it's much easier to have it as a dict in js
    if var_name == "reformatted_named":
        return [y for y in formatted.values()]
    return formatted        


def assemble_spritesheet_from_list(var_name):
    json_list = extract_json_from_js_var(var_name)
    num_rows = math.ceil(len(json_list)/SPRITES_PER_ROW)
    spritesheet = Image.new("RGBA",(SPRITES_PER_ROW * SPRITE_DIMENSION, num_rows * SPRITE_DIMENSION))
    for idx, sprite_info in enumerate(json_list):
        if idx % 10 == 0:
            print(f"Finished {idx} of {var_name}")
        x_offset = (idx % SPRITES_PER_ROW) * SPRITE_DIMENSION
        y_offset = (math.floor(idx / SPRITES_PER_ROW)) * SPRITE_DIMENSION
        response = requests.get(sprite_info["source"], headers= {"user-agent": "curl/8.1.1", "accept": "*/*"})
        sprite = Image.open(io.BytesIO(response.content))
        # For some godforsaken reason I didn't always standardize my filesizes, so we gotta do some dancing
        width, height = sprite.size
        spritesheet.paste(sprite, (x_offset + (SPRITE_DIMENSION - width)//2, y_offset + (SPRITE_DIMENSION - height)))
    spritesheet.save(f"{OUTPATH}/{var_name}.png")


if __name__ == "__main__":
    for var in fetch_out:
        assemble_spritesheet_from_list(var)