/**
Defines classes for the various types of layer we can have in a garden.

Layers behave in much the same way as they do in an art program, allowing us to edit
only part of the piece at a time, as well as reorder which sits "on top".

There are a total of 3 types of layer: garden (the main one, arguably), color
(for applying overlays and backgrounds), and decor (for applying things like mountains).

Additionally, there's the generic layer the rest inherit from.

Each should be able to build its completed canvas from its raw "save form", generally
its content (image URL, list of seeds, ...), a seed palette, width, and offset. So
there's quite a bit of logic in this module.
**/

const LAYER_HEIGHT = 64;
const GARDEN_ITEM_SIZE = 32;

///////////////////////  GENERIC LAYER   ///////////////////////////////////////


/**
The base, abstract Layer.

Defines the only functionality guaranteed by any layer--making it and placing it.
**/
abstract class Layer {
  x_offset: number;
  y_offset: number;
  width: number;
  canvas: HTMLCanvasElement;
  height = LAYER_HEIGHT;

  constructor(width: number, x_offset: number, y_offset: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = LAYER_HEIGHT;
    this.x_offset = x_offset;
    this.y_offset = y_offset;
    this.width = width;
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    let place_onto_ctx = place_onto_canvas.getContext("2d");
    place_onto_ctx.drawImage(this.canvas, this.x_offset,
                             place_onto_canvas.height-this.y_offset-this.height,
                             this.width, this.height);
  }

  place_back(place_onto_canvas: HTMLCanvasElement) {
    let place_onto_ctx = place_onto_canvas.getContext("2d");
    place_onto_ctx.drawImage(this.canvas, this.x_offset,
                             place_onto_canvas.height-this.y_offset-this.height,
                             this.width, this.height);
  }

  clearCanvas(){
    let ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

///////////////////////  GARDEN LAYER   ////////////////////////////////////////

/** Describes the type of a GardenItem (seed, catalog) so we know how to draw it.**/
enum GardenItemType {
  Seed = 1,
  Catalog,
  Overlay,
}

/**
Describes the height of the item (ex: a shrub might be short, a tree might be tall).

This is used for "smart spacing", where we try to spread things so similar heights
don't overlap.
**/
enum GardenItemHeightCategory {
  Tiny = 1,
  Short,
  Medium,
  Tall
}

/**
The base, abstract GardenItem.

Like layers, they only guarantee creation and placement.
**/
abstract class GardenItem {
  identity: string;
  type: GardenItemType;

  constructor(identity: string, type:GardenItemType){
    this.identity = identity;
    this.type = type
  }

  abstract place(place_onto_canvas: HTMLCanvasElement): void;
}

/**
Garden items that go "in" the garden.

Things like trees, crystals, various animals, catalog items, etc. Obvious physical objects.
These are the guys we need things like heights and offsets for. They're what first comes to
mind when you think "thing to put in a garden".
**/
class GardenPlacedItem extends GardenItem{
  offset: number;  // fraction of the way across the canvas to put it. .7 = 70%, near the right
  offsetSpecified: Boolean;  // Whether the offset was provided by the user (so don't scramble it!)
  canvas: HTMLCanvasElement;
  heightCategory: GardenItemHeightCategory;
  constructor(identity: string, type:GardenItemType, offset: number,
              canvas: HTMLCanvasElement, height: GardenItemHeightCategory) {
    super(identity, type);
    this.offset = offset;
    this.canvas = canvas;
    this.heightCategory = height;
  }

  async place(place_onto_canvas: HTMLCanvasElement){
    let place_onto_ctx = place_onto_canvas.getContext("2d");
    place_onto_ctx.imageSmoothingEnabled = false;
    place_onto_ctx.drawImage(this.canvas, place_onto_canvas.width*this.offset, 0, GARDEN_ITEM_SIZE*2, GARDEN_ITEM_SIZE*2);
  }
}

/**
Garden items that go "on" the garden.

This covers our weird case of overlays. Overlays are defined by users within the list of seeds,
so it's cleanest to handle them within the same logic as the rest, but they're conceptually
pretty different--essentially a configurable tint, used to visually send things to the
"background" or simulate fog or silhouette.
**/
class GardenOverlayItem extends GardenItem{
  opacity: number;  // Like GardenPlacedItem's offset, is a fraction.
  constructor(identity: string, type:GardenItemType, opacity: number) {
    super(identity, type);
    this.opacity = opacity;
  }

  place(place_onto_canvas: HTMLCanvasElement){
    applyOverlay(place_onto_canvas, this.identity, this.opacity);
  }
}

/**
A Layer representing a garden.

These are the meat and potatoes of the tool. They hold a number of garden items like
flowers and statues, arrange them semi-intelligently based on height (or take heights
provided by users), apply any overlays the users want, and generally account for
most of the first functionality you'd think of in a tool like this.
**/
class GardenLayer extends Layer{
  seedList: string[];
  content: Array<Promise<GardenItem>>;
  smart_coords: object;
  canvasGarden: HTMLCanvasElement;
  canvasGround: HTMLCanvasElement;
  groundPaletteSeed: string;
  groundCover: string;
  ground: string;

  constructor(width: number, x_offset: number, y_offset: number, seedList: string[],
              groundPaletteSeed: string, groundCover: string, ground: string){
    super(width, x_offset, y_offset);
    this.seedList = seedList;
    this.smart_coords = {};
    // Iterating over Typescript enums is very strange and perhaps not worth it? Do NOT remove that filter.
    Object.values(GardenItemHeightCategory).filter(value => !isNaN(Number(value))).forEach(height => {
      this.smart_coords[height] = createSpacedPlacementQueue(this.width, <number>height*24);
    });
    // Javascript's inability to pause execution outside certain special calls (alert()) means we can't handle wildcards while
    // generating a garden. By the time we reach GardenLayer, we expect all wildcards to be resolved and the seeds in a
    // nice list.
    this.content = [];
    seedList.forEach(seed => {
      this.content.push(this.makeGardenItem(seed));
    })
    this.height += y_offset  // Gardens can have terrain below
    this.canvas.height = this.height;
    this.canvasGarden = document.createElement("canvas") as HTMLCanvasElement;
    this.canvasGarden.width = this.width;
    this.canvasGarden.height = LAYER_HEIGHT;
    this.canvasGround = document.createElement("canvas") as HTMLCanvasElement;
    this.canvasGround.width = this.width;
    this.canvasGround.height = this.height;
    this.groundPaletteSeed = groundPaletteSeed;
    this.groundCover = groundCover;
    this.ground = ground;

  }

  /** Use the height of contained GardenPlacedItems to pick (hopefully appealing) spots for them.**/
  async assignSmartPositions(){
    Object.values(GardenItemHeightCategory).filter(value => !isNaN(Number(value))).forEach(height => {
      shuffleArray(this.smart_coords[height])
    });
    let assign_offset = [0, 0, 0, 0, 0];
    for await (let gardenItem of this.content){
      if((gardenItem instanceof GardenPlacedItem) && !gardenItem.offsetSpecified){
        let placeable = <GardenPlacedItem> gardenItem;
        let height = placeable.heightCategory;
        if(assign_offset[height] >= this.smart_coords[height].length){
          // TODO: generating a spaced placement queue and then converting to fraction either
          // either way is a little silly. We do want fractions, though, in case the garden's resized
          placeable.offset = Math.random()*(this.width-height*24)/this.width;
        } else {
          gardenItem.offset = this.smart_coords[height][assign_offset[height]]/this.width;
          assign_offset[height] ++;
        }
      }
    }
  }

  /** Create a GardenItem from an entry in the seed list (like #blue or GawR7as64e%50) **/
  async makeGardenItem(identity: string){
    let type: GardenItemType;
    let canvas: HTMLCanvasElement;
    let percent_pos = identity.indexOf('%');
    let percent_val = null;
    if(percent_pos > -1) {
      percent_val = parseFloat(identity.slice(percent_pos + 1))/100;
      identity = identity.slice(0, percent_pos);
    }
    if(identity.startsWith("#")){
      type = GardenItemType.Overlay;
      if(percent_pos == null){ percent_val = 0.25; }
      return new GardenOverlayItem(identity, type, percent_val)
    } else if(identity.startsWith("!")){
      type = GardenItemType.Catalog;
      canvas = await get_canvas_for_named_component(identity.slice(1));
    } else if(identity.startsWith("*")){
      type = GardenItemType.Catalog;
      // Subtle difference: no slice (to avoid name collisions on ex: !crate and *crate)
      canvas = await get_canvas_for_named_component(identity);
    } else {
      type = GardenItemType.Seed;
      canvas = await get_canvas_for_plant(identity);
    }
    let height = await this.classifyHeight(canvas);
    if(percent_pos == null){ percent_val = Math.random(); }
    return new GardenPlacedItem(identity, type, percent_val, canvas, height)
  }

  /**
  Figure out something's GardenItemHeightCategory based on its first fully-transparent row.

  "Fully-transparent row" meaning a y-coordinate in the image with no alpha anywhere.

  We go top-down to account for hovering sprites like fish.
  **/
  async classifyHeight(canvas_promise: HTMLCanvasElement){
    let canvas = canvas_promise;
    let image_data = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
    if(hasPixelInRow(image_data, 32-24, canvas.width)){
        return GardenItemHeightCategory.Tall;
    }
    else if(hasPixelInRow(image_data, 32-16, canvas.width)){
        return GardenItemHeightCategory.Medium;
    }
    else if(!hasPixelInRow(image_data, 32-8, canvas.width)){
        return GardenItemHeightCategory.Short;
    }
    return GardenItemHeightCategory.Tiny;
  }

  /** Update the contents of the main canvas, which holds all the plants. **/
  async updateMain(){
    var ctxGarden = this.canvasGarden.getContext("2d");
    ctxGarden.clearRect(0, 0, this.canvasGarden.width, this.canvasGarden.height);
    for(let i=0; i<this.content.length; i++){
      let gardenItem = await this.content[i];
      gardenItem.place(this.canvasGarden);
    }
    this.update();
  }

  /** Update the contents of the ground canvas, grass/sand/stone/etc.**/
  async updateGround(){
    let ctxGround = this.canvasGround.getContext("2d");
    ctxGround.imageSmoothingEnabled = false;
    ctxGround.clearRect(0, 0, this.canvasGround.width, this.canvasGround.height);
    let colorData = decode_plant_data(this.groundPaletteSeed);
    let newPalette = all_palettes[colorData["foliage_palette"]].concat(all_palettes[colorData["accent_palette"]]).concat(all_palettes[colorData["feature_palette"]]);
    let recoloredGround = replace_color_palette_single_image(overall_palette, newPalette, await refs[available_ground[this.ground]]);
    // Draw everything but the groundcover. We start at y=64 and keep going til we're fully off the canvas
    let incrementBy = recoloredGround.height;
    let groundYPos = 64;
    while(groundYPos<this.canvasGround.height){
      tileAlongY(ctxGround, recoloredGround, groundYPos);
      groundYPos += incrementBy;
    }
    // Draw the groundcover...and ONLY the groundcover.
    // Why doesn't it use the tileable function, which is almost exactly identical?
    // Simple: my pixel art is trash. The original version of this function contained a bug that slightly squashes
    // the art vertically, which somehow makes it look much, *much* better, especially the riverbed and meat ones.
    // Until I can make something that looks equally good, this "bug" is promoted to feature
    let recoloredGroundCover = replace_color_palette_single_image(overall_palette, newPalette, await refs[available_ground[this.groundCover]]);
    let groundXPos = 0;
    while(groundXPos < this.canvas.width){
        // the world isn't ready for this truth:
        //ctx.drawImage(recolored_ground, ground_x_pos, 70-recolored_ground.height*2, 200, recolored_ground.height*2);
        ctxGround.drawImage(recoloredGroundCover, groundXPos, 64-6, 200, 6);
        groundXPos += 200;
    }
    this.update();
  }

  /** Applies both canvases to the main one, preparing it to be drawn. **/
  update(){
    this.clearCanvas();
    let ctx = this.canvas.getContext("2d");
    ctx.drawImage(this.canvasGarden, 0, 0, this.canvasGarden.width, this.canvasGarden.height);
    ctx.drawImage(this.canvasGround, 0, 0, this.canvasGround.width, this.canvasGround.height);
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    let place_onto_ctx = place_onto_canvas.getContext("2d");
    place_onto_ctx.drawImage(this.canvas, this.x_offset, place_onto_canvas.height-this.canvas.height,
                             this.width, this.height);
  }

  /** Gardens never go on the background layer. **/
  place_back(_place_onto_canvas: HTMLCanvasElement) {
    return
  }
}

///////////////////////  DECOR LAYER   /////////////////////////////////////////

/** The decor layer draws mid/foreground things like stalagmites and trees.**/
class DecorLayer extends Layer{
  content: string;
  contentPaletteSeed: string;
  palette: string[];

  constructor(width: number, x_offset: number, y_offset: number,
              content: string, contentPaletteSeed: string){
    super(width, x_offset, y_offset);
    this.content = content;
    this.contentPaletteSeed = contentPaletteSeed;
  }

  // Really, this can place any tileable, it's just our only tileables are decor.
  async placeDecor(){
    let tileCtx = this.canvas.getContext("2d");
    tileCtx.imageSmoothingEnabled = false;
    if(available_tileables[this.content].hasOwnProperty("bottom")){
        const bottom = await this.recolorOwnTileable("bottom");
        tileAlongY(tileCtx, bottom, this.canvas.height-bottom.height*2);
        // "middle" only has any meaning if there's also a bottom
        if(available_tileables[this.content].hasOwnProperty("middle")){
          const middle = await this.recolorOwnTileable("middle");
          const bottom_img_height = refs[available_tileables[this.content]["bottom"]].height*2;
          const middle_img_height = refs[available_tileables[this.content]["middle"]].height*2;
          let current_y = this.canvas.height - bottom_img_height - middle_img_height;
          while(current_y > -middle_img_height){
            tileAlongY(tileCtx, middle, current_y);
            current_y -= middle_img_height;
          }
        }
    }
    if(available_tileables[this.content].hasOwnProperty("top")){
      const top = await this.recolorOwnTileable("top");
      tileAlongY(tileCtx, top, 0);
    }
  }

  async recolorOwnTileable(portion: string){
    return replace_color_palette_single_image(overall_palette, this.palette, await refs[available_tileables[this.content][portion]]);
  }

  update(){
    let colorData = decode_plant_data(this.contentPaletteSeed);
    this.palette = all_palettes[colorData["foliage_palette"]].concat(all_palettes[colorData["accent_palette"]]).concat(all_palettes[colorData["feature_palette"]]);
    this.clearCanvas();
    this.placeDecor();
  }

  place_back(_place_onto_canvas: HTMLCanvasElement) {
    return
  }
}

///////////////////////  OVERLAY LAYER   ///////////////////////////////////////
class OverlayLayer extends Layer{
  content: string;
  opacity: number;
  affectsBackground: Boolean;
  rgbPalette: number[];

  constructor(width: number, x_offset: number, y_offset: number,
              content: string, opacity: number, affectsBackground: Boolean){
    super(width, x_offset, y_offset);
    this.content = content;
    this.opacity = opacity;
    this.affectsBackground = affectsBackground;
  }

  update(){
    // "Caching" as an overlay layer is pointless; we have to calculate on
    // demand, since the canvas might have updated beneath us.
    return;
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    applyOverlay(place_onto_canvas, this.content, this.opacity);
  }

  place_back(place_onto_canvas: HTMLCanvasElement) {
    if(!this.affectsBackground){ return; }
    applyOverlay(place_onto_canvas, this.content, this.opacity);
  }
}
