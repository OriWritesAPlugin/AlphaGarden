/** This module holds the UI logic for garden creation. **/

const PROPERTIES = {"base": {"defaultPalette": "CoHC9CNzEt", "mainColor": "#FF0000", "secondColor": "#AA0000"},
                    "garden": {"defaultPalette": "CoHC9CNzEt", "mainColor": "#1C2121", "secondColor": "#151818"},
                    "decor": {"defaultPalette": "CoHC9CNzEt", "mainColor": "#262221", "secondColor": "#1C1919", "defaultContent": "mountains"},
                    "overlay": {"mainColor": "#1F191A", "secondColor": "#171213", "defaultColor": "night", "defaultOpacity": 0.25},
                    "celestial": {"defaultPalette": "early_evening", "mainColor": "#1B1D24", "secondColor": "#141519", "defaultContent": "Sky_Gradient"}}

class LayerDiv {
  selfDiv: HTMLDivElement;
  mainColor: string;
  editDiv: HTMLDivElement;
  secondColor: string;
  editButton: HTMLButtonElement;
  name: string;
  editMode = false;
  layer: Layer;
  id: string;
  // Labels require IDs, and unique IDs don't seem to be trivial with Javascript
  // Semi-meaningful IDs are assigned as layer_this.id_descriptor_childIds[descriptor],
  // and then incremented.
  childIds = {"selectbox": 0, "fillin": 0, "generic": 0};
  // Lets ups propagate changes up to the layer manager
  onEditCallback: Function;

  // TODO: https://htmldom.dev/drag-and-drop-element-in-a-list/

  constructor(layer: Layer, id: number, onEditCallback: Function, type="base"){
    // This properties stuff is to save some pain with super() and derived class colors
    this.mainColor = PROPERTIES[type]["mainColor"];
    this.secondColor = PROPERTIES[type]["secondColor"];
    this.selfDiv = this.buildGenericDiv(this.mainColor);
    this.onEditCallback = onEditCallback;
    this.layer = layer
    this.id = "layer_"+id;
    this.selfDiv.id = this.id;
    let decorDiv = this.buildGenericDiv(this.mainColor);
    this.editButton = this.buildEditButton();
    let deleteButton = this.buildDeleteButton();
    this.editDiv = this.buildEditDiv();
    this.editDiv.style.height = "10vh";
    decorDiv.style.paddingTop = "0vh";
    this.selfDiv.appendChild(this.editButton);
    let namePlate = document.createElement("input");
    namePlate.value = this.id
    this.selfDiv.appendChild(namePlate);
    this.selfDiv.appendChild(deleteButton);
    decorDiv.appendChild(this.editDiv);
    this.selfDiv.appendChild(decorDiv);
    this.toggleEditMode();
  }

  buildGenericDiv(color: string){
    let genericDiv = document.createElement("div");
    genericDiv.className = "layer_div";
    genericDiv.style.backgroundColor = color;
    genericDiv.id = this.generateId("generic");
    return genericDiv;
  }

  toggleEditMode(){
    this.editMode = !this.editMode;
    if(!this.editMode){
      this.editDiv.style.marginTop = "-18vh";
      this.selfDiv.style.height = "5vh";
    } else {
      this.editDiv.style.marginTop = "0%";
      this.selfDiv.style.height = "18vh";
    }
    this.editButton.classList.toggle('active');
  }

  buildEditButton(){
    let editButton = document.createElement("input");
    editButton.type = "button";
    editButton.className = "chunky_wrap";
    editButton.value = "✎";
    editButton.addEventListener('click', this.toggleEditMode.bind(this));
    return editButton;
  }

  buildDeleteButton(){
    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.className = "chunky_wrap";
    deleteButton.value = "✕";
    deleteButton.addEventListener('click', function(){
      delete this.layer;
      document.getElementById(this.id).remove();
    }.bind(this));
    return deleteButton;
  }

  buildGenericDropdown(target:string, optionList: string[]){
    let selectBox = document.createElement("select");
    selectBox.id = this.generateId("selectbox");
    selectBox.className = "garden_dropdown";
    for(let option of optionList){
        selectBox.options[selectBox.options.length] = (new Option(option, option));
    }
    selectBox.onchange = async function(){
      this.layer[target]=selectBox.value;
      await this.layer.update();
      this.onEditCallback();
    }.bind(this, target);
    return selectBox;
  }

  generateId(childType: string){
    let id = this.id + "_" + childType + "_" + this.childIds[childType];
    this.childIds[childType] ++;
    return id;
  }

  buildGenericFillIn(target:string){
    let fillIn = document.createElement("number") as HTMLInputElement;
    fillIn.className = "garden-dim-bar";
    fillIn.id = this.generateId("fillin");
    fillIn.onchange = function(){
      this.layer[target]=fillIn.value;
      this.layer.update();
      this.onEditCallback();
    }.bind(this, target);
    let label = document.createElement("label") as HTMLLabelElement;
    label.setAttribute("for", fillIn.id);
    label.innerHTML = target;
    return fillIn;
  }

  buildEditDiv(){
    let editDiv = document.createElement("div");
    editDiv.className = "layer_div";
    editDiv.style.backgroundColor = this.secondColor;
    editDiv.appendChild(this.buildGenericDropdown("name", ["Larry", "Moe", "Curly"]));
    editDiv.appendChild(this.buildGenericDropdown("name", ["Sue", "Anne", "Barbara"]));
    editDiv.appendChild(this.buildGenericFillIn("name"));
    return editDiv;
  }
}

class GardenLayerDiv extends LayerDiv {

  constructor(layer: Layer, id: number, onEditCallback: Function){
    super(layer, id, onEditCallback, "garden");
  }

  buildEditDiv(){
    let editDiv = document.createElement("div");
    editDiv.className = "layer_div";
    editDiv.style.backgroundColor = this.secondColor;
    let groundCoverSelect = this.buildGenericDropdown("groundCover", Object.keys(available_ground))
    let groundSelect = this.buildGenericDropdown("ground", Object.keys(available_ground))
    groundCoverSelect.onchange = async function(){
      this.layer.ground=groundSelect.value;
      await this.layer.updateGround();
      this.onEditCallback();
    }.bind(this);
    groundSelect.onchange = async function(){
      this.layer.ground=groundSelect.value;
      await this.layer.updateGround();
      this.onEditCallback();
    }.bind(this);
    editDiv.appendChild(groundCoverSelect);
    editDiv.appendChild(groundSelect);
    editDiv.appendChild(this.buildGenericFillIn("groundPaletteSeed"));
    return editDiv;
  }
}

class DecorLayerDiv extends LayerDiv {
  constructor(layer: Layer, id: number, onEditCallback: Function){
    super(layer, id, onEditCallback, "decor");
  }

  buildEditDiv(){
    let editDiv = document.createElement("div");
    editDiv.className = "layer_div";
    editDiv.style.backgroundColor = this.secondColor;
    let contentSelect = this.buildGenericDropdown("content", Object.keys(available_tileables))
    editDiv.appendChild(contentSelect);
    editDiv.appendChild(this.buildGenericFillIn("contentPaletteSeed"));
    return editDiv;
  }
}

class OverlayLayerDiv extends LayerDiv {
  constructor(layer: Layer, id: number, onEditCallback: Function){
    super(layer, id, onEditCallback, "overlay");
  }
}

class CelestialLayerDiv extends LayerDiv {
  constructor(layer: Layer, id: number, onEditCallback: Function){
    super(layer, id, onEditCallback, "celestial");
  }

  buildEditDiv(){
    let editDiv = document.createElement("div");
    editDiv.className = "layer_div";
    editDiv.style.backgroundColor = this.secondColor;
    let contentSelect = this.buildGenericDropdown("content", Object.keys(CelestialType))
    let skyPaletteSelect = this.buildGenericDropdown("skyPalette", Object.keys(available_backgrounds))
    editDiv.appendChild(contentSelect);
    editDiv.appendChild(skyPaletteSelect);
    return editDiv;
  }
}

// This big box of layers that goes on the right and lets you make more.
class LayerManager {
  foreCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement;
  fullCanvas: HTMLCanvasElement;
  activeLayerDivs: LayerDiv[];
  selfDiv: HTMLDivElement;
  activeGardenLayer: GardenLayer;
  layers_created = 0;
  default_width = 500;
  updateCallback: Function;

  get_id(){
    this.layers_created ++;
    return this.layers_created;
  }
  // ⚘ꕔ★☁☾▒
  constructor(managedCanvas: HTMLCanvasElement, activeGardenLayer: GardenLayer){
    this.selfDiv = document.createElement("div");
    this.selfDiv.id = "layer_manager";
    this.fullCanvas = managedCanvas;
    this.foreCanvas = document.createElement("canvas");
    this.foreCanvas.width = this.fullCanvas.width;
    this.foreCanvas.height = this.fullCanvas.height;
    this.backCanvas = document.createElement("canvas");
    this.backCanvas.width = this.fullCanvas.width;
    this.backCanvas.height = this.fullCanvas.height;
    this.activeLayerDivs = [];
    this.activeGardenLayer = activeGardenLayer;
    this.updateCallback = this.redraw.bind(this);
  }

  makeGardenLayer(){
    let newGardenLayer = cloneGardenLayer(this.activeGardenLayer);
    let newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback);
    this.activeLayerDivs.push(newGardenLayerDiv);
    this.selfDiv.appendChild(newGardenLayerDiv.selfDiv);
  }

  makeDecorLayer(){
    let newDecorLayer = new DecorLayer(this.default_width, 0, 0, PROPERTIES["decor"]["default_content"], PROPERTIES["decor"]["defaultPalette"])
    let newDecorLayerDiv = new DecorLayerDiv(newDecorLayer, this.get_id(), this.updateCallback);
    this.activeLayerDivs.push(newDecorLayerDiv);
    this.selfDiv.appendChild(newDecorLayerDiv.selfDiv);
  }

  makeOverlayLayer(){
    let newOverlayLayer = new OverlayLayer(this.default_width, 0, 0, PROPERTIES["overlay"]["default_color"],
                                           PROPERTIES["overlay"]["default_opacity"], false)
    let newOverlayLayerDiv = new OverlayLayerDiv(newOverlayLayer, this.get_id(), this.updateCallback);
    this.activeLayerDivs.push(newOverlayLayerDiv);
    this.selfDiv.appendChild(newOverlayLayerDiv.selfDiv);
  }

  makeCelestialLayer(){
    let newCelestialLayer = new CelestialLayer(this.default_width, 0, 0, PROPERTIES["celestial"]["defaultContent"],
                                               PROPERTIES["celestial"]["defaultPalette"])
    let newCelestialLayerDiv = new CelestialLayerDiv(newCelestialLayer, this.get_id(), this.updateCallback);
    this.activeLayerDivs.push(newCelestialLayerDiv);
    this.selfDiv.appendChild(newCelestialLayerDiv.selfDiv);
  }

  redraw(){
    clearCanvas(this.foreCanvas);
    clearCanvas(this.backCanvas);
    clearCanvas(this.fullCanvas);
    for(let layerDiv of this.activeLayerDivs){
      layerDiv.layer.place_fore(this.foreCanvas);
      layerDiv.layer.place_back(this.backCanvas);
    }
    this.activeGardenLayer.place_fore(this.foreCanvas);
    this.activeGardenLayer.place_back(this.backCanvas);
    let fullCtx = this.fullCanvas.getContext("2d");
    fullCtx.drawImage(this.backCanvas, 0, 0, this.fullCanvas.width, this.fullCanvas.height);
    fullCtx.drawImage(this.foreCanvas, 0, 0, this.fullCanvas.width, this.fullCanvas.height);
  }
}
