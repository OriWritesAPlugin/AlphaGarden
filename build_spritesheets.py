import base64
import io
import json
import math
import os
import requests
import subprocess  # used to run pngcrush

from PIL import Image

SPRITES_PER_ROW = 10
SPRITE_DIMENSION = 32  # ex: 32 x 32 px. Also sounds refreshing, too sweet for me though.
DATA_FILE = "src/data.js"
OUTPATH = "images"


fetch_out = [#"all_foliage",
             "reformatted_named",
             "available_ground_base"
            ]


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
    if var_name in ("reformatted_named", "available_ground_base"):
        return [y for y in formatted.values()]
    return formatted        

def assemble_spritesheet_from_list(var_name):
    json_list = extract_json_from_js_var(var_name)
    num_rows = math.ceil(len(json_list)/SPRITES_PER_ROW)
    spritesheet = Image.new("RGBA",(SPRITES_PER_ROW * SPRITE_DIMENSION, num_rows * SPRITE_DIMENSION))
    sprite_calc_info = []
    for idx, sprite_info in enumerate(json_list):
        if idx % 10 == 0:
            print(f"Finished {idx} of {var_name}")
        x_offset = (idx % SPRITES_PER_ROW) * SPRITE_DIMENSION
        y_offset = (math.floor(idx / SPRITES_PER_ROW)) * SPRITE_DIMENSION
        response = requests.get(sprite_info["source"], headers= {"user-agent": "curl/8.1.1", "accept": "*/*"})
        sprite = Image.open(io.BytesIO(response.content))
        # For some godforsaken reason I didn't always standardize my filesizes, so we gotta do some dancing
        width, height = sprite.size
        bounding_box = sprite.getbbox()
        if(bounding_box is None):
            sprite_calc_info.append({"w": width, "h": height, "wc": width/2})
        else:
            left, upper, right, _ = sprite.getbbox()
            sprite_calc_info.append({"w": right - left, "h": height-upper, "wc": (right + left)/2})
        spritesheet.paste(sprite, (x_offset + (SPRITE_DIMENSION - width)//2, y_offset + (SPRITE_DIMENSION - height)))
    spritesheet.save(f"{OUTPATH}/{var_name}-uncrushed.png")
    subprocess.run([os.path.expanduser("~/misc_tools/pngcrush/pngcrush"), f"{OUTPATH}/{var_name}-uncrushed.png", f"{OUTPATH}/{var_name}.png"])
    # Base64 encode and embed into files
    encoded = base64.b64encode(io.BytesIO(open(f"{OUTPATH}/{var_name}-uncrushed.png", "rb").read()).getvalue()).decode("utf-8")
    indexed_base64_val = base64.b64encode(io.BytesIO(open(f"{OUTPATH}/{var_name}.png", "rb").read()).getvalue()).decode("utf-8")
    if len(indexed_base64_val) < len(encoded):
        print(f"using indexed for {var_name}")
        encoded = indexed_base64_val
    if(var_name == "all_foliage"):
        sedstr = f'/var FOLIAGE_SPRITE_DATA/c\ var FOLIAGE_SPRITE_DATA = {sprite_calc_info}'
        subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/data.js")])
        sedstr = f'/var FOLIAGE_SPRITESHEET/c\ var FOLIAGE_SPRITESHEET = "data:image/png;base64,{encoded}";'
    elif(var_name == "reformatted_named"):
        sedstr = f'/var NAMED_SPRITE_DATA/c\ var NAMED_SPRITE_DATA = {sprite_calc_info}'
        subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/data.js")])
        sedstr = f'/var NAMED_SPRITESHEET/c\ var NAMED_SPRITESHEET = "data:image/png;base64,{encoded}";'
    elif(var_name == "available_ground_base"):
        sedstr = f'/var GROUND_BASE_SPRITESHEET/c\ var GROUND_BASE_SPRITESHEET = "data:image/png;base64,{encoded}";'
    else:
        raise ValueError(f"sedstr is unconfigured for {var_name}!")
    subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/data.js")])

if __name__ == "__main__":
    for var in fetch_out:
        assemble_spritesheet_from_list(var)
