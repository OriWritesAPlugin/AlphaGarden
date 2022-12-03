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
  ctx: CanvasRenderingContext2D;
  height = LAYER_HEIGHT;

  constructor(width: number, x_offset: number, y_offset: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = LAYER_HEIGHT;
    this.x_offset = x_offset;
    this.y_offset = y_offset;
    this.width = width;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
  }

  place_fore(place_onto_canvas: HTMLCanvasElement, place_onto_ctx: CanvasRenderingContext2D) {
    place_onto_ctx.drawImage(this.canvas, this.x_offset,
                             place_onto_canvas.height-this.y_offset-this.height,
                             this.width, this.height);
  }

  place_back(place_onto_canvas: HTMLCanvasElement, place_onto_ctx: CanvasRenderingContext2D) {
    place_onto_ctx.drawImage(this.canvas, this.x_offset,
                             place_onto_canvas.height-this.y_offset-this.height,
                             this.width, this.height);
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

  abstract place(place_onto_canvas: HTMLCanvasElement, place_onto_ctx: CanvasRenderingContext2D): void;
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

  async place(place_onto_canvas: HTMLCanvasElement, place_onto_ctx: CanvasRenderingContext2D){
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

  place(place_onto_canvas: HTMLCanvasElement, place_onto_ctx: CanvasRenderingContext2D){
    applyOverlay(place_onto_canvas, place_onto_ctx, this.identity, this.opacity);
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
  canvasMain: HTMLCanvasElement;
  canvasGround: HTMLCanvasElement;

  constructor(width: number, x_offset: number, y_offset: number, seedList: string[]){
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
    this.canvasMain = document.createElement("canvas") as HTMLCanvasElement;
    this.canvasMain.width = this.width;
    this.canvasMain.height = LAYER_HEIGHT;
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
    var ctxMain = this.canvasMain.getContext("2d");
    ctxMain.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
    ctxMain.imageSmoothingEnabled = false;
    for(let i=0; i<this.content.length; i++){
      let gardenItem = await this.content[i];
      gardenItem.place(this.canvasMain, ctxMain);
    }
    this.draw();
  }

  /** Update the contents of the ground canvas, grass/sand/stone/etc.**/
  async updateGround(){
    let ctxGround = this.canvasGround.getContext("2d");
    ctxGround.clearRect(0, 0, this.canvasGround.width, this.canvasGround.height);

  }

  /** Applies both canvases to the main one, preparing it to be drawn. **/
  draw(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.canvasMain, 0, 0, this.canvasMain.width, this.canvasMain.height);
  }

  /** Gardens never go on the background layer. **/
  place_back(_place_onto_canvas: HTMLCanvasElement, _place_onto_ctx: CanvasRenderingContext2D) {
    return
  }
}

///////////////////////  DECOR LAYER   /////////////////////////////////////////
