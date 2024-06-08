/** This module holds the UI logic for garden creation. **/
const PROPERTIES = { "base": { "defaultPalette": "CunEjC0KIh", "mainColor": "#FF0000", "secondColor": "#AA0000", "accentColor": "#FFAA00", "icon": "▒", "hovertext": "unused..." },
    "garden": { "defaultPalette": "CunEjC0KIh", "mainColor": "#1C2121", "secondColor": "#151818", "accentColor": "#273831", "icon": "⚘", "hovertext": "Create a new garden layer. This is where all the plants and goodies go!" },
    "decor": { "defaultPalette": "CunEjC0KIh", "mainColor": "#262221", "secondColor": "#1C1919", "defaultContent": "mountains", "accentColor": "#3D362B", "icon": "ꕔ", "hovertext": "Create a new decor layer. This lets you add mountains and the like." },
    "overlay": { "mainColor": "#211515", "secondColor": "#171213", "accentColor": "#3C2121", "defaultColor": "#night", "defaultOpacity": 0.25, "icon": "⚙", "hovertext": "Currently unused, how mysterious!" },
    "celestial": { "defaultPalette": "early evening", "mainColor": "#1B1D24", "secondColor": "#141519", "accentColor": "#252A3C", "defaultContent": "Sky_Gradient", "defaultCustomPalette": ["#192446", "#335366", "#426f7a"], "icon": "☾", "hovertext": "Create a new celestial layer, for adding skies, stars, fog, etc. Don't forget to drag the new layer up a bit if you're doing fog!" } }; // old overlay: 1F191A
class LayerDiv {
    type;
    selfDiv;
    mainColor;
    editDiv;
    secondColor;
    accentColor;
    editButton;
    name;
    editMode = true;
    layer;
    id;
    // In order to allow people to sync sizes, we need to be able to feed sizes back into the fields after creation. Bit gross but there you go.
    widthInput;
    yOffsetInput;
    xOffsetInput;
    scaleInput;
    // Lets ups propagate changes up to the layer manager
    onEditCallback;
    // TODO: https://htmldom.dev/drag-and-drop-element-in-a-list/
    constructor(layer, id, onEditCallback, type = "base") {
        // This properties stuff is to save some pain with super() and derived class colors
        this.mainColor = PROPERTIES[type]["mainColor"];
        this.secondColor = PROPERTIES[type]["secondColor"];
        this.accentColor = PROPERTIES[type]["accentColor"];
        this.selfDiv = this.buildGenericDiv(this.mainColor);
        this.selfDiv.className = "draggable_layer_div";
        this.selfDiv.style.cursor = "move";
        this.selfDiv.style.userSelect = "none";
        this.selfDiv.style.width = "95%";
        this.onEditCallback = async function () {
            if (this.layer) {
                await this.layer.update();
            }
            onEditCallback();
        }.bind(this);
        this.selfDiv.addEventListener('mousedown', draggableLayerMouseDownHandler);
        this.selfDiv.style.border = "3px solid " + this.accentColor;
        this.layer = layer;
        this.id = "layer_" + id;
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
        namePlate.value = this.id;
        this.selfDiv.appendChild(namePlate);
        this.selfDiv.appendChild(deleteButton);
        decorDiv.appendChild(this.editDiv);
        this.selfDiv.appendChild(decorDiv);
        this.editDiv.style.transition = "margin 0.4s ease-in-out 0s";
        this.editDiv.style.height = "fit-content";
        this.toggleEditMode();
    }
    buildGenericDiv(color) {
        let genericDiv = document.createElement("div");
        genericDiv.className = "layer_div";
        genericDiv.style.backgroundColor = color;
        //genericDiv.id = this.generateId("generic");
        genericDiv.style.cursor = "default";
        genericDiv.style.userSelect = "default";
        genericDiv.style.width = "fit-content";
        genericDiv.style.height = "fit-content";
        return genericDiv;
    }
    buildOptionsHolderDiv() {
        let optionsHolderDiv = this.buildGenericDiv(this.mainColor);
        optionsHolderDiv.style.display = "inline-block";
        optionsHolderDiv.style.height = "80%";
        optionsHolderDiv.style.textAlign = "left";
        optionsHolderDiv.style.width = "43%";
        return optionsHolderDiv;
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
        if (!this.editMode) {
            this.editDiv.style.marginTop = "-18vh";
            this.selfDiv.style.height = "2em";
            //this.selfDiv.style.minHeight = "0vh";
        }
        else {
            this.editDiv.style.marginTop = "0vh";
            //this.selfDiv.style.minHeight = "fit-content";
            this.selfDiv.style.height = "12em";
        }
        this.editButton.classList.toggle('active');
    }
    buildEditButton() {
        let editButton = document.createElement("input");
        editButton.type = "button";
        editButton.className = "chunky_wrap";
        editButton.value = "✎";
        editButton.title = "expand layer for editing";
        editButton.addEventListener('click', this.toggleEditMode.bind(this));
        editButton.style.backgroundColor = this.accentColor;
        return editButton;
    }
    buildDeleteButton() {
        let deleteButton = document.createElement("input");
        deleteButton.type = "button";
        deleteButton.className = "chunky_wrap";
        deleteButton.value = "✕";
        deleteButton.title = "delete layer";
        deleteButton.addEventListener('click', function () { this.doDelete(); }.bind(this));
        deleteButton.style.backgroundColor = this.accentColor;
        return deleteButton;
    }
    doDelete() {
        delete this.layer;
        document.getElementById(this.id).remove();
        this.onEditCallback();
    }
    buildGenericDropdown(target, optionList) {
        let selectBox = document.createElement("select");
        selectBox.id = this.generateId("selectbox", target);
        selectBox.className = "garden_dropdown";
        selectBox.style.width = "90%";
        for (let option of optionList) {
            let newOption = new Option(option, option);
            if (option == this.layer[target]) {
                newOption.selected = true;
            }
            else {
                newOption.selected = false;
            }
            selectBox.options[selectBox.options.length] = newOption;
        }
        selectBox.onchange = async function () {
            this.layer[target] = selectBox.value;
            await this.onEditCallback();
        }.bind(this, target);
        selectBox.style.backgroundColor = this.secondColor;
        selectBox.style.display = "block";
        return selectBox;
    }
    generateId(childType, descriptor) {
        let id = this.id + "_" + childType + "_" + descriptor;
        return id;
    }
    buildGenericFillIn(target, labelText, color, hovertext, coerceNumber = false) {
        let fillIn = document.createElement("input");
        fillIn.className = "garden-dim-bar";
        fillIn.id = this.generateId("fillin", target);
        fillIn.style.width = "50%";
        fillIn.style.backgroundColor = color;
        fillIn.style.backgroundColor = color;
        fillIn.onchange = async function () {
            if (coerceNumber) {
                this.layer[target] = parseFloat(fillIn.value);
            }
            else {
                this.layer[target] = fillIn.value;
            }
            await this.onEditCallback();
        }.bind(this, target);
        fillIn.value = this.layer[target] == 1 ? this.layer[target].toPrecision(2) : this.layer[target];
        let label = document.createElement("label");
        label.setAttribute("for", fillIn.id);
        label.setAttribute("title", hovertext);
        label.innerHTML = labelText;
        return [fillIn, label];
    }
    buildPositionDiv() {
        const pairs = [["x_offset", "x:", "layer's horizontal offset"], ["y_offset", "y:", "layer's vertical offset"], ["width", "<br>width:", "width of layer"], ["scale", "scale:", "multiply layer size by this amount"]];
        let holdDiv = this.buildGenericDiv(this.mainColor);
        holdDiv.style.display = "inline-block";
        holdDiv.style.height = "auto";
        holdDiv.style.textAlign = "right";
        for (let i = 0; i < pairs.length; i++) {
            let [fillIn, label] = this.buildGenericFillIn(pairs[i][0], pairs[i][1], this.secondColor, pairs[i][2], true);
            fillIn.style.width = "2em";
            if (pairs[i][0] != "width") {
                if (pairs[i][0] == "y_offset") {
                    this.yOffsetInput = fillIn;
                }
                else if (pairs[i][0] == "x_offset") {
                    this.xOffsetInput = fillIn;
                }
                else if (pairs[i][0] == "scale") {
                    this.scaleInput = fillIn;
                }
            }
            else {
                this.widthInput = fillIn;
                this.widthInput.onchange = async function () {
                    await this.layer.setWidth(parseFloat(this.widthInput.value));
                    await this.onEditCallback();
                }.bind(this);
            }
            holdDiv.appendChild(label);
            holdDiv.appendChild(fillIn);
        }
        holdDiv.style.cssFloat = "right";
        holdDiv.style.display = "inline";
        holdDiv.style.height = "80%";
        holdDiv.style.width = "43%";
        return holdDiv;
    }
    buildEditDiv() {
        let editDiv = document.createElement("div");
        editDiv.className = "layer_div";
        editDiv.style.backgroundColor = this.secondColor;
        editDiv.style.textAlign = "right";
        editDiv.appendChild(this.buildGenericDropdown("name", ["Larry", "Moe", "Curly"]));
        editDiv.appendChild(this.buildGenericDropdown("name", ["Sue", "Anne", "Barbara"]));
        editDiv.appendChild(this.buildPositionDiv());
        editDiv.style.height = "10vh";
        editDiv.style.transition = "margin 0.4s ease-in-out 0s";
        return editDiv;
    }
}
class GardenLayerDiv extends LayerDiv {
    swapButton;
    onChangeGardenCallback;
    constructor(layer, id, onEditCallback, onChangeGardenCallback) {
        super(layer, id, onEditCallback, "garden");
        // see note on these fields in the parent class, this is bad kludge.
        // Maybe we could pass a modified callback? It's wasteful for the x offset,
        // but that's about it.
        this.onChangeGardenCallback = onChangeGardenCallback;
        this.swapButton = this.buildSwapButton();
        this.selfDiv.insertBefore(this.swapButton, this.selfDiv.childNodes[3]);
        this.yOffsetInput.onchange = async function () {
            this.layer["y_offset"] = parseFloat(this.yOffsetInput.value);
            await this.layer.updateMain();
            await this.layer.updateGround();
            await this.onEditCallback();
        }.bind(this);
    }
    buildEditDiv() {
        let editDiv = document.createElement("div");
        editDiv.className = "layer_div";
        editDiv.style.backgroundColor = this.secondColor;
        let dropdownDiv = this.buildGenericDiv(this.mainColor);
        let groundCoverSelect = this.buildGenericDropdown("groundCover", Object.keys(available_ground));
        let groundSelect = this.buildGenericDropdown("ground", Object.keys(available_ground_base));
        groundCoverSelect.onchange = async function () {
            this.layer.groundCover = groundCoverSelect.value;
            await this.layer.updateGround();
            this.onEditCallback();
        }.bind(this);
        groundSelect.onchange = async function () {
            this.layer.ground = groundSelect.value;
            await this.layer.updateGround();
            this.onEditCallback();
        }.bind(this);
        dropdownDiv.appendChild(groundCoverSelect);
        dropdownDiv.appendChild(groundSelect);
        let [fillIn, label] = this.buildGenericFillIn("groundPaletteSeed", "colors:", this.secondColor, "seed providing colors for ground");
        fillIn.onchange = async function () {
            this.layer.groundPaletteSeed = fillIn.value;
            await this.layer.updateGround();
            this.onEditCallback();
        }.bind(this);
        dropdownDiv.appendChild(label);
        dropdownDiv.appendChild(fillIn);
        dropdownDiv.style.display = "inline-block";
        dropdownDiv.style.height = "80%";
        dropdownDiv.style.textAlign = "left";
        dropdownDiv.style.width = "43%";
        editDiv.appendChild(dropdownDiv);
        editDiv.appendChild(this.buildPositionDiv());
        return editDiv;
    }
    buildSwapButton() {
        let swapButton = document.createElement("input");
        swapButton.type = "button";
        swapButton.className = "chunky_wrap";
        swapButton.value = "☆"; // ★
        swapButton.title = "edit this garden layer's seed list";
        swapButton.addEventListener('click', this.setActiveGarden.bind(this));
        swapButton.style.backgroundColor = this.accentColor;
        return swapButton;
    }
    setActiveGarden() {
        if (this.layer.isActive) {
            return;
        }
        this.layer.isActive = true;
        this.swapButton.value = "★";
        this.onChangeGardenCallback();
    }
    unsetActiveGarden() {
        this.layer.isActive = false;
        this.swapButton.value = "☆";
    }
}
class DecorLayerDiv extends LayerDiv {
    constructor(layer, id, onEditCallback) {
        super(layer, id, onEditCallback, "decor");
    }
    buildEditDiv() {
        let editDiv = document.createElement("div");
        editDiv.className = "layer_div";
        editDiv.style.backgroundColor = this.secondColor;
        let dropdownDiv = this.buildOptionsHolderDiv();
        let contentSelect = this.buildGenericDropdown("content", Object.keys(available_tileables));
        dropdownDiv.appendChild(contentSelect);
        let [fillIn, label] = this.buildGenericFillIn("contentPaletteSeed", "colors:", this.secondColor, "seed providing colors for decor");
        dropdownDiv.appendChild(label);
        dropdownDiv.appendChild(fillIn);
        editDiv.appendChild(dropdownDiv);
        editDiv.appendChild(this.buildPositionDiv());
        return editDiv;
    }
}
class OverlayLayerDiv extends LayerDiv {
    constructor(layer, id, onEditCallback) {
        super(layer, id, onEditCallback, "overlay");
    }
    buildEditDiv() {
        let editDiv = document.createElement("div");
        editDiv.className = "layer_div";
        editDiv.style.backgroundColor = this.secondColor;
        editDiv.innerHTML = "Effects layer under construction! The overlay stuff was moved to the celestial (blue moon) tab, pick \"fog\".<br><br>Eventually, I want this to handle decor like picture frames";
        /*let leftOptionsDiv = this.buildOptionsHolderDiv();
        let rightOptionsDiv = this.buildOptionsHolderDiv();
        let [_fillInCast, label] = this.buildGenericFillIn("color", "color:", this.mainColor);
        let fillIn = _fillInCast as HTMLInputElement;
        fillIn.value = PROPERTIES["overlay"]["defaultColor"];
        leftOptionsDiv.appendChild(label);
        leftOptionsDiv.appendChild(fillIn);
        let [_fillIn2Cast, label2] = this.buildGenericFillIn("opacity", "alpha:", this.mainColor, true);
        let fillIn2 = _fillIn2Cast as HTMLInputElement;
        fillIn2.value = ""+PROPERTIES["overlay"]["defaultOpacity"];
        rightOptionsDiv.appendChild(label2);
        rightOptionsDiv.appendChild(fillIn2);
        editDiv.appendChild(leftOptionsDiv);
        editDiv.appendChild(rightOptionsDiv);*/
        return editDiv;
    }
}
class CelestialLayerDiv extends LayerDiv {
    constructor(layer, id, onEditCallback) {
        super(layer, id, onEditCallback, "celestial");
    }
    buildEditDiv() {
        let editDiv = document.createElement("div");
        editDiv.className = "layer_div";
        editDiv.style.backgroundColor = this.secondColor;
        let dropdownDiv = this.buildGenericDiv(this.secondColor);
        // TODO: Typescript is amazing fantastic awesome but the enums might be worth holding off on
        let contentSelect = this.buildGenericDropdown("content", Object.keys(CelestialType).filter(value => isNaN(Number(value))));
        let skyPaletteSelect = this.buildGenericDropdown("skyPalette", Object.keys(available_backgrounds));
        skyPaletteSelect.onchange = async function () {
            this.layer["skyPalette"] = skyPaletteSelect.value;
            await this.onEditCallback();
            if (skyPaletteSelect.value == "custom") {
                this.get_custom_palette(this.layer, this.onEditCallback);
            }
        }.bind(this, "skyPalette");
        let [opacityFillIn, opacityLabel] = this.buildGenericFillIn("opacity", "opacity:", this.mainColor, "opacity of layer", true);
        dropdownDiv.appendChild(contentSelect);
        dropdownDiv.appendChild(skyPaletteSelect);
        dropdownDiv.appendChild(opacityLabel);
        dropdownDiv.appendChild(opacityFillIn);
        editDiv.appendChild(dropdownDiv);
        return editDiv;
    }
    get_custom_palette(cl, callback) {
        let modal = document.createElement("div");
        //modal.classList.add("block_window");
        let modal_display = document.createElement("div");
        modal_display.classList.add("popup");
        document.body.appendChild(modal);
        let textbox = document.createElement("text");
        textbox.textContent = "Enter a comma-separated list of hex colors. You can also put just one for a solid color, or a seed to use its first palette";
        let fillIn = document.createElement("input");
        fillIn.value = cl.customPalette.toString();
        fillIn.oninput = async function () {
            cl.setCustomPalette(fillIn.value);
            await callback();
        };
        let button_container = document.createElement("div");
        button_container.style.padding = "20px";
        let accept_button = document.createElement("input");
        accept_button.type = "button";
        accept_button.onclick = async function () {
            cl.setCustomPalette(fillIn.value);
            document.body.removeChild(modal);
            await callback();
        };
        accept_button.value = "Set Gradient";
        accept_button.classList.add("chunky_fullwidth");
        button_container.appendChild(textbox);
        button_container.appendChild(fillIn);
        button_container.appendChild(document.createElement("br"));
        button_container.appendChild(document.createElement("br"));
        button_container.appendChild(accept_button);
        modal_display.appendChild(button_container);
        modal.appendChild(modal_display);
    }
}
// This big box of layers that goes on the right and lets you make more.
class LayerManager {
    foreCanvas;
    backCanvas;
    fullCanvas;
    activeLayerDivs;
    selfDiv;
    layerHolderDiv;
    activeGardenDiv;
    layers_created = 0;
    width = 450;
    height = 80;
    scale = 1;
    updateCallback;
    gardenToggleCallback;
    activeGardenSeeds;
    isVisible = false;
    divToLayerMapper = {}; // Associates div IDs to the layer they represent
    get_id() {
        this.layers_created++;
        return this.layers_created;
    }
    constructor(managedCanvas, activeGardenSeeds) {
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
        this.activeGardenSeeds = activeGardenSeeds;
        this.updateCallback = this.redraw.bind(this);
        this.gardenToggleCallback = this.swapActiveGarden.bind(this);
        this.selfDiv.appendChild(this.buildLayerButton("garden", this.makeGardenLayer));
        this.selfDiv.appendChild(this.buildLayerButton("decor", this.makeDecorLayer));
        this.selfDiv.appendChild(this.buildLayerButton("celestial", this.makeCelestialLayer));
        this.selfDiv.appendChild(this.buildLayerButton("overlay", this.makeOverlayLayer));
        this.selfDiv.appendChild(this.layerHolderDiv);
        // Usually we await. Can't in the constructor, so we do it a little funky
        let newGardenLayer = new GardenLayer(this.fullCanvas.width, this.fullCanvas.height, 0, 0, [], PROPERTIES["garden"]["defaultPalette"], "grass [palette]", "clumpy dirt", 1);
        let newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback, this.gardenToggleCallback);
        this.activeGardenDiv = newGardenLayerDiv;
        newGardenLayerDiv.setActiveGarden();
        this.divToLayerMapper[newGardenLayerDiv.selfDiv.id] = newGardenLayerDiv;
        this.layerHolderDiv.insertBefore(newGardenLayerDiv.selfDiv, this.layerHolderDiv.firstChild);
    }
    clearAllButActive() {
        for (let id of Object.keys(this.divToLayerMapper)) {
            let layerDiv = this.divToLayerMapper[id];
            // TODO: See swapActiveGarden(), there's something odd in deletion propagation
            // While we could probably clean that up "in post", it might be better served as refactor.
            if (layerDiv.layer === undefined) {
                continue;
            }
            if (!layerDiv.layer.isActive) {
                layerDiv.doDelete();
                delete this.divToLayerMapper[id];
            }
        }
    }
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        if (!this.isVisible) {
            this.selfDiv.style.marginRight = "-300%";
        }
        else {
            this.selfDiv.style.marginRight = "0%";
        }
    }
    async setHeight(height) {
        this.height = height;
        this.fullCanvas.height = height;
        this.foreCanvas.height = height;
        this.backCanvas.height = height;
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            let layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id];
            if (layerDivObj.layer === undefined) {
                continue;
            }
            await layerDivObj.layer.setHeight(height);
        }
    }
    async setWidth(width) {
        this.width = width;
        this.fullCanvas.width = width;
        this.foreCanvas.width = width;
        this.backCanvas.width = width;
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            let layer = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id].layer;
            if (layer === undefined) {
                continue;
            }
            if ((layer instanceof CelestialLayer) || (layer instanceof OverlayLayer)) {
                layer.setWidth(width);
            }
        }
    }
    setScale(scale) {
        this.scale = scale;
    }
    buildLayerButton(type, callback) {
        let layerButton = document.createElement("input");
        layerButton.type = "button";
        layerButton.className = "chunky_wrap";
        layerButton.value = PROPERTIES[type]["icon"];
        layerButton.title = PROPERTIES[type]["hovertext"];
        layerButton.addEventListener('click', callback.bind(this));
        layerButton.style.backgroundColor = PROPERTIES[type]["accentColor"];
        layerButton.style.width = "5vw";
        layerButton.style.height = "3vw";
        return layerButton;
    }
    addLayerAndAnimate(newLayerDiv, openEditMode) {
        this.divToLayerMapper[newLayerDiv.selfDiv.id] = newLayerDiv;
        this.layerHolderDiv.appendChild(newLayerDiv.selfDiv);
        if (openEditMode) {
            setTimeout(() => { newLayerDiv.toggleEditMode(); }, 10);
        }
        this.updateCallback();
        return newLayerDiv;
    }
    async loadFromSaveString(save_string) {
        const save_obj = JSON.parse(save_string);
        this.clearAllButActive();
        let layer;
        //await (<GardenLayer>this.activeGardenDiv.layer).updateMain();
        //await (<GardenLayer>this.activeGardenDiv.layer).updateGround();
        //this.setScale(save_string["s"]);
        for (let i = 0; i < save_obj["layers"].length; i++) {
            // Javascript not having true named args will kill me in the end
            layer = save_obj["layers"][i];
            if (layer["type"] == LayerType.Garden) {
                await this.makeGardenLayer(false, layer["seeds"], layer["palette"], layer["gcover"], layer["ground"], layer["w"], layer["h"], layer["x"], layer["y"], layer["s"]);
            }
            else if (layer["type"] == LayerType.Decor) {
                await this.makeDecorLayer(false, layer["content"], layer["palette"], layer["w"], this.fullCanvas.height, layer["x"], layer["y"], layer["s"]);
            }
            else if (layer["type"] == LayerType.Celestial) {
                const cust = layer["palette"] == "custom" ? layer["cust"] : PROPERTIES["celestial"]["defaultCustomPalette"];
                await this.makeCelestialLayer(false, layer["content"], layer["palette"], layer["a"], cust);
            }
        }
        ;
    }
    async makeGardenLayer(openEditMode = true, seedList = [], palette = PROPERTIES["garden"]["defaultPalette"], groundCover = "grass [palette]", ground = "clumpy dirt", width = this.fullCanvas.width / this.scale, height = this.fullCanvas.height / this.scale, x_offset = 0, y_offset = 0, scale = 1) {
        let newGardenLayer = new GardenLayer(width, height, x_offset, y_offset, seedList, palette, groundCover, ground, scale);
        let newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback, this.gardenToggleCallback);
        //await newGardenLayer.updateMain().then(_ => newGardenLayer.updateGround());
        return this.addLayerAndAnimate(newGardenLayerDiv, openEditMode);
    }
    async makeDecorLayer(openEditMode = true, content = PROPERTIES["decor"]["defaultContent"], palette = PROPERTIES["decor"]["defaultPalette"], width = this.fullCanvas.width / this.scale, height = this.fullCanvas.height / this.scale, x_offset = 0, y_offset = 0, scale = 1) {
        let newDecorLayer = new DecorLayer(width, height, x_offset, y_offset, content, palette, scale);
        let newDecorLayerDiv = new DecorLayerDiv(newDecorLayer, this.get_id(), this.updateCallback);
        await newDecorLayer.update();
        return this.addLayerAndAnimate(newDecorLayerDiv, openEditMode);
    }
    async makeOverlayLayer(openEditMode = true) {
        let newOverlayLayer = new OverlayLayer(this.fullCanvas.width / this.scale, this.fullCanvas.height / this.scale, 0, 0, PROPERTIES["overlay"]["defaultColor"], PROPERTIES["overlay"]["default_opacity"], false, 1);
        let newOverlayLayerDiv = new OverlayLayerDiv(newOverlayLayer, this.get_id(), this.updateCallback);
        return this.addLayerAndAnimate(newOverlayLayerDiv, openEditMode);
    }
    // If you're wondering why palette and customPalette are split -- bad JS "overloading", the customPalette-free form is useful for the randomize button
    async makeCelestialLayer(openEditMode = true, type = PROPERTIES["celestial"]["defaultContent"], palette = PROPERTIES["celestial"]["defaultPalette"], opacity = 1, customPalette = PROPERTIES["celestial"]["defaultCustomPalette"]) {
        let newCelestialLayer = new CelestialLayer(this.fullCanvas.width / this.scale, this.fullCanvas.height / this.scale, 0, 0, type, palette, customPalette, opacity, 1);
        let newCelestialLayerDiv = new CelestialLayerDiv(newCelestialLayer, this.get_id(), this.updateCallback);
        newCelestialLayer.update();
        return this.addLayerAndAnimate(newCelestialLayerDiv, openEditMode);
    }
    parseSeedList(seedList, callback) {
        var seeds = seedList.split(" ").join("").replace(/[\r\n]+/gm, '').replace(/(^,)|(,$)/g, '').split(",");
        for (let i = 0; i < seeds.length; i++) {
            if (seeds[i][0] == "*") {
                let cleaned_seed = seeds[i].split("%")[0].replace("<", "");
                if (!all_named.hasOwnProperty(cleaned_seed)) {
                    imageFromPopup(document.body, cleaned_seed, callback.bind(seedList));
                    return [];
                }
            }
        }
        return seeds;
    }
    async regenActiveGarden(seedList) {
        let parsedSeedList;
        if (seedList) {
            parsedSeedList = this.parseSeedList(seedList, this.regenActiveGarden.bind(this, seedList));
        }
        else {
            parsedSeedList = [];
        }
        this.activeGardenDiv.layer.seedList = parsedSeedList;
        this.activeGardenDiv.layer.generateContent();
        this.activeGardenDiv.layer.assignSmartPositions();
        await this.activeGardenDiv.layer.updateMain();
        await this.activeGardenDiv.layer.updateGround();
        this.redraw();
    }
    swapActiveGarden(delete_old = false) {
        var oldActiveGarden;
        var newActiveGarden;
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            // TODO: right now we just free the layer. Should propagate the deletion fully to the manager.
            let layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id];
            if (layerDivObj.layer === undefined) {
                continue;
            }
            if (layerDivObj.layer.isActive) {
                if (this.activeGardenDiv.id === layerDivObj.id) {
                    oldActiveGarden = layerDivObj;
                }
                else {
                    newActiveGarden = layerDivObj;
                }
            }
        }
        if (newActiveGarden) {
            this.activeGardenDiv = newActiveGarden;
            this.activeGardenSeeds.value = newActiveGarden.layer.seedList;
            if (oldActiveGarden) {
                oldActiveGarden.unsetActiveGarden();
            }
        }
    }
    getSaveString() {
        let save_struct = { "version": 0.1, "w": this.width, "h": this.height, "s": this.scale, "layers": [] };
        for (let i = 0; i < this.layerHolderDiv.children.length; i++) {
            save_struct["layers"].push(this.divToLayerMapper[this.layerHolderDiv.children[i].id].layer.getSaveData());
        }
        return JSON.stringify(save_struct);
    }
    redraw() {
        clearCanvas(this.foreCanvas);
        clearCanvas(this.backCanvas);
        clearCanvas(this.fullCanvas);
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            // TODO: right now we just free the layer. Should propagate the deletion fully to the manager.
            let layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id];
            if (layerDivObj.layer === undefined) {
                continue;
            }
            layerDivObj.layer.place(this.foreCanvas, this.backCanvas);
        }
        let fullCtx = this.fullCanvas.getContext("2d");
        this.fullCanvas.height = this.height * this.scale;
        this.fullCanvas.width = this.width * this.scale;
        fullCtx.imageSmoothingEnabled = false;
        fullCtx.drawImage(this.backCanvas, 0, 0, this.width * this.scale, this.height * this.scale);
        fullCtx.drawImage(this.foreCanvas, 0, 0, this.width * this.scale, this.height * this.scale);
    }
}
