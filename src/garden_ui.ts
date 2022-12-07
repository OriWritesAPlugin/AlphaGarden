/** This module holds the UI logic for garden creation. **/

const PROPERTIES = {"base": {"defaultPalette": "CoHC9CNzEt", "mainColor": "#FF0000", "secondColor": "#AA0000", "accentColor": "#FFAA00", "icon": "▒"},
                    "garden": {"defaultPalette": "CoHC9CNzEt", "mainColor": "#1C2121", "secondColor": "#151818", "accentColor": "#273831", "icon": "⚘"},
                    "decor": {"defaultPalette": "CoHC9CNzEt", "mainColor": "#262221", "secondColor": "#1C1919", "defaultContent": "mountains", "accentColor": "#3D362B", "icon": "ꕔ"},
                    "overlay": {"mainColor": "#211515", "secondColor": "#171213", "accentColor": "#3C2121", "defaultColor": "night", "defaultOpacity": 0.25, "icon": "☾"},
                    "celestial": {"defaultPalette": "early evening", "mainColor": "#1B1D24", "secondColor": "#141519", "accentColor": "#252A3C", "defaultContent": "Sky_Gradient", "icon": "☁"}}// old overlay: 1F191A

class LayerDiv {
  selfDiv: HTMLDivElement;
  mainColor: string;
  editDiv: HTMLDivElement;
  secondColor: string;
  accentColor: string;
  editButton: HTMLButtonElement;
  name: string;
  editMode = true;
  layer: Layer;
  id: string;
  // Labels require IDs, and unique IDs don't seem to be trivial with Javascript
  // Semi-meaningful IDs are assigned as layer_this.id_descriptor_childIds[descriptor],
  // and then incremented.
  childIds = {"selectbox": 0, "fillin": 0, "generic": 0, "numberBox": 0};
  // Lets ups propagate changes up to the layer manager
  onEditCallback: Function;

  // TODO: https://htmldom.dev/drag-and-drop-element-in-a-list/

  constructor(layer: Layer, id: number, onEditCallback: Function, type="base"){
    // This properties stuff is to save some pain with super() and derived class colors
    this.mainColor = PROPERTIES[type]["mainColor"];
    this.secondColor = PROPERTIES[type]["secondColor"];
    this.accentColor = PROPERTIES[type]["accentColor"];
    this.selfDiv = this.buildGenericDiv(this.mainColor);
    this.selfDiv.className = "draggable_layer_div";
    this.selfDiv.style.cursor = "move";
    this.selfDiv.style.userSelect = "none";
    this.selfDiv.style.width = "95%";
    this.onEditCallback = async function(){
      if(this.layer){await this.layer.update();}
      onEditCallback();
    }.bind(this);
    this.selfDiv.addEventListener('mousedown', draggableLayerMouseDownHandler);
    this.selfDiv.style.border = "3px solid "+this.accentColor;
    this.layer = layer
    this.id = "layer_"+id;
    this.selfDiv.id = this.id;
    let decorDiv = this.buildGenericDiv(this.mainColor);
    this.editButton = this.buildEditButton();
    let deleteButton = this.buildDeleteButton();
    this.editDiv = this.buildEditDiv();
    decorDiv.style.padding = "0vh";
    decorDiv.style.margin = "0vh";
    decorDiv.style.width = "95%";
    this.selfDiv.appendChild(this.editButton);
    let namePlate = document.createElement("input");
    namePlate.value = this.id
    this.selfDiv.appendChild(namePlate);
    this.selfDiv.appendChild(deleteButton);
    decorDiv.appendChild(this.editDiv);
    this.selfDiv.appendChild(decorDiv);
    this.editDiv.style.transition = "margin 0.4s ease-in-out 0s";
    this.editDiv.style.height = "fit-content";
    this.toggleEditMode();
  }

  buildGenericDiv(color: string){
    let genericDiv = document.createElement("div");
    genericDiv.className = "layer_div";
    genericDiv.style.backgroundColor = color;
    genericDiv.id = this.generateId("generic");
    genericDiv.style.cursor = "default";
    genericDiv.style.userSelect = "default";
    genericDiv.style.width = "fit-content"
    return genericDiv;
  }

  toggleEditMode(){
    this.editMode = !this.editMode;
    if(!this.editMode){
      this.editDiv.style.marginTop = "-18vh";
      this.selfDiv.style.height = "5vh";
    } else {
      this.editDiv.style.marginTop = "0vh";
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
    editButton.style.backgroundColor = this.accentColor;
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
      this.onEditCallback();
    }.bind(this));
    deleteButton.style.backgroundColor = this.accentColor;
    return deleteButton;
  }

  buildGenericDropdown(target:string, optionList: string[]){
    let selectBox = document.createElement("select");
    selectBox.id = this.generateId("selectbox");
    selectBox.className = "garden_dropdown";
    for (let option of optionList) {
        let newOption = new Option(option, option)
        if(option == this.layer[target]) {
          newOption.selected = true;
        } else {
          newOption.selected = false;
        }
        selectBox.options[selectBox.options.length] = newOption;
    }
    selectBox.onchange = async function(){
      this.layer[target]=selectBox.value;
      await this.onEditCallback();
    }.bind(this, target);
    selectBox.style.backgroundColor = this.secondColor;
    selectBox.style.display = "block";
    return selectBox;
  }

  generateId(childType: string){
    let id = this.id + "_" + childType + "_" + this.childIds[childType];
    this.childIds[childType] ++;
    return id;
  }

  buildGenericFillIn(target:string, labelText:string, color: string, coerceNumber=false){
    let fillIn = document.createElement("input") as HTMLInputElement;
    fillIn.className = "garden-dim-bar";
    fillIn.id = this.generateId("fillin");
    fillIn.style.backgroundColor = color;
    fillIn.onchange = async function(){
      if(coerceNumber){
        this.layer[target]=parseFloat(fillIn.value);
      } else {
        this.layer[target]=fillIn.value;
      }
      await this.onEditCallback();
    }.bind(this, target);
    fillIn.value = this.layer[target];
    let label = document.createElement("label") as HTMLLabelElement;
    label.setAttribute("for", fillIn.id);
    label.innerHTML = labelText;
    return [fillIn, label];
  }

  buildPositionDiv(){
    const pairs = [["x_offset", "x:"], ["y_offset", "y:"], ["width", "<br>width:"]];
    let holdDiv = this.buildGenericDiv(this.mainColor);
    holdDiv.style.display = "inline-block";
    holdDiv.style.height = "auto";
    holdDiv.style.textAlign = "right";
    for(let i=0; i < pairs.length; i++){
      let [fillIn, label] = this.buildGenericFillIn(pairs[i][0], pairs[i][1], this.secondColor, true);
      if(pairs[i][0] != "width"){
        fillIn.style.width = "2vw";
      }
      holdDiv.appendChild(label);
      holdDiv.appendChild(fillIn);
    }
    holdDiv.style.cssFloat = "right";
    holdDiv.style.display = "inline";
    holdDiv.style.height = "80%";
    return holdDiv;
  }

  buildEditDiv(){
    let editDiv = document.createElement("div");
    editDiv.className = "layer_div";
    editDiv.style.backgroundColor = this.secondColor;
    editDiv.appendChild(this.buildGenericDropdown("name", ["Larry", "Moe", "Curly"]));
    editDiv.appendChild(this.buildGenericDropdown("name", ["Sue", "Anne", "Barbara"]));
    editDiv.appendChild(this.buildPositionDiv());
    editDiv.style.height = "10vh";
    editDiv.style.transition = "margin 0.4s ease-in-out 0s";
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
      this.layer.groundCover=groundCoverSelect.value;
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
    let [fillIn, label] = this.buildGenericFillIn("groundPaletteSeed", "ground palette", this.mainColor);
    editDiv.appendChild(label);
    editDiv.appendChild(fillIn);
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
    let dropdownDiv = this.buildGenericDiv(this.mainColor);
    let contentSelect = this.buildGenericDropdown("content", Object.keys(available_tileables))
    dropdownDiv.appendChild(contentSelect);
    let [fillIn, label] = this.buildGenericFillIn("contentPaletteSeed", "palette", this.secondColor);
    dropdownDiv.appendChild(label);
    dropdownDiv.appendChild(fillIn);
    dropdownDiv.style.display = "inline-block"
    dropdownDiv.style.height = "80%"
    dropdownDiv.style.textAlign = "left";
    editDiv.appendChild(dropdownDiv);
    editDiv.appendChild(this.buildPositionDiv());
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
    let dropdownDiv = this.buildGenericDiv(this.secondColor);
    // TODO: Typescript is amazing fantastic awesome but the enums might be worth holding off on
    let contentSelect = this.buildGenericDropdown("content", Object.keys(CelestialType).filter(value => isNaN(Number(value))));
    let skyPaletteSelect = this.buildGenericDropdown("skyPalette", Object.keys(available_backgrounds))
    dropdownDiv.appendChild(contentSelect);
    dropdownDiv.appendChild(skyPaletteSelect);
    editDiv.appendChild(dropdownDiv);
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
  layerHolderDiv: HTMLDivElement;
  activeGardenLayer: GardenLayer;
  layers_created = 0;
  default_width = 500;
  updateCallback: Function;
  isVisible = false;
  divToLayerMapper = {};  // Associates div IDs to the layer they represent

  get_id(){
    this.layers_created ++;
    return this.layers_created;
  }

  constructor(managedCanvas: HTMLCanvasElement){
    this.selfDiv = document.createElement("div");
    this.selfDiv.id = "layer_manager";
    this.selfDiv.style.minWidth = "450px";
    this.layerHolderDiv = document.createElement("div");
    this.layerHolderDiv.id = "layer_holder";
    this.layerHolderDiv.style.width = "100%";
    this.fullCanvas = managedCanvas;
    this.foreCanvas = document.createElement("canvas");
    this.foreCanvas.width = this.fullCanvas.width;
    this.foreCanvas.height = this.fullCanvas.height;
    this.backCanvas = document.createElement("canvas");
    this.backCanvas.width = this.fullCanvas.width;
    this.backCanvas.height = this.fullCanvas.height;
    this.activeLayerDivs = [];
    this.updateCallback = this.redraw.bind(this);
    this.selfDiv.appendChild(this.buildLayerButton("garden", this.makeGardenLayer));
    this.selfDiv.appendChild(this.buildLayerButton("decor", this.makeDecorLayer));
    this.selfDiv.appendChild(this.buildLayerButton("celestial", this.makeCelestialLayer));
    this.selfDiv.appendChild(this.buildLayerButton("overlay", this.makeOverlayLayer));
    this.selfDiv.appendChild(this.layerHolderDiv);
    // Usually we await. Can't in the constructor, so we do it a little funky
    let newGardenLayer = new GardenLayer(this.default_width, 0, 0, [], PROPERTIES["garden"]["defaultPalette"], "grass [palette]", "grass [palette]");
    let newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback);
    this.activeGardenLayer = newGardenLayer;
    this.divToLayerMapper[newGardenLayerDiv.selfDiv.id] = newGardenLayerDiv;
    this.layerHolderDiv.insertBefore(newGardenLayerDiv.selfDiv, this.layerHolderDiv.firstChild);
  }

  toggleVisibility(){
    this.isVisible = !this.isVisible;
    if(!this.isVisible){
      this.selfDiv.style.marginRight = "-30%";
    } else {
      this.selfDiv.style.marginRight = "0%";
    }
  }

  buildLayerButton(type: string, callback: Function){
    let layerButton = document.createElement("input");
    layerButton.type = "button";
    layerButton.className = "chunky_wrap";
    layerButton.value = PROPERTIES[type]["icon"];
    layerButton.addEventListener('click', callback.bind(this));
    layerButton.style.backgroundColor = PROPERTIES[type]["accentColor"];
    layerButton.style.width = "5vw";
    layerButton.style.height = "3vw";
    return layerButton;
  }

  addLayerAndAnimate(newLayerDiv: LayerDiv, openEditMode: Boolean){
    this.divToLayerMapper[newLayerDiv.selfDiv.id] = newLayerDiv;
    this.layerHolderDiv.insertBefore(newLayerDiv.selfDiv, this.layerHolderDiv.firstChild);
    if(openEditMode){
      setTimeout(() => {  newLayerDiv.toggleEditMode();}, 10);
    }
    this.updateCallback();
    return newLayerDiv;
  }

  async makeGardenLayer(openEditMode=true){
    let newGardenLayer = new GardenLayer(this.default_width, 0, 0, [], PROPERTIES["garden"]["defaultPalette"], "grass [palette]", "grass [palette]");
    let newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback);
    await newGardenLayer.updateMain();
    await newGardenLayer.updateGround();
    return this.addLayerAndAnimate(newGardenLayerDiv, openEditMode);
  }

  async makeDecorLayer(openEditMode=true){
    let newDecorLayer = new DecorLayer(this.default_width, 0, 0, PROPERTIES["decor"]["defaultContent"], PROPERTIES["decor"]["defaultPalette"])
    let newDecorLayerDiv = new DecorLayerDiv(newDecorLayer, this.get_id(), this.updateCallback);
    await newDecorLayer.update();
    return this.addLayerAndAnimate(newDecorLayerDiv, openEditMode);
  }

  async makeOverlayLayer(openEditMode=true){
    let newOverlayLayer = new OverlayLayer(this.default_width, 0, 0, PROPERTIES["overlay"]["defaultColor"],
                                           PROPERTIES["overlay"]["default_opacity"], false)
    let newOverlayLayerDiv = new OverlayLayerDiv(newOverlayLayer, this.get_id(), this.updateCallback);
    return this.addLayerAndAnimate(newOverlayLayerDiv, openEditMode);
  }

  async makeCelestialLayer(openEditMode=true){
    let newCelestialLayer = new CelestialLayer(this.default_width, 0, 0, PROPERTIES["celestial"]["defaultContent"],
                                               PROPERTIES["celestial"]["defaultPalette"])
    let newCelestialLayerDiv = new CelestialLayerDiv(newCelestialLayer, this.get_id(), this.updateCallback);
    newCelestialLayer.update();
    return this.addLayerAndAnimate(newCelestialLayerDiv, openEditMode);
  }

  parseSeedList(seedList: string, callback: Function){
    var seeds = seedList.split(" ").join("").replace(/[\r\n]+/gm,'').replace(/(^,)|(,$)/g, '').split(",");
    for(let i=0; i<seeds.length; i++){
       if(seeds[i][0] == "*"){
           let cleaned_seed = seeds[i].split("%")[0];
           if(!all_named.hasOwnProperty(cleaned_seed)){
               imageFromPopup(document.body, cleaned_seed, callback.bind(seedList))
               return;
           }
       }
    }
    return seeds;
  }

  async regenActiveGarden(seedList: string){
    let parsedSeedList = this.parseSeedList(seedList, this.regenActiveGarden.bind(seedList));
    this.activeGardenLayer.seedList = parsedSeedList;
    this.activeGardenLayer.generateContent();
    await this.activeGardenLayer.assignSmartPositions();
    await this.activeGardenLayer.updateMain();
    this.redraw();
  }

  redraw(){
    clearCanvas(this.foreCanvas);
    clearCanvas(this.backCanvas);
    clearCanvas(this.fullCanvas);
    for(let i=this.layerHolderDiv.children.length; i>0; i--){
      // TODO: right now we just free the layer. Should propagate the deletion fully to the manager.
      let layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i-1].id];
      if(layerDivObj.layer === undefined){
        continue;
      }
      layerDivObj.layer.place(this.foreCanvas, this.backCanvas);
    }
    let fullCtx = this.fullCanvas.getContext("2d");
    fullCtx.drawImage(this.backCanvas, 0, 0, this.fullCanvas.width, this.fullCanvas.height);
    fullCtx.drawImage(this.foreCanvas, 0, 0, this.fullCanvas.width, this.fullCanvas.height);
  }
}
