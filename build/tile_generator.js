// Copyright (c) 2016 Joe Ridino
var TileGenerator = {};
(function () {
    'use strict';

    TileGenerator.Oop = {};

    TileGenerator.Oop.extend = function (parent, child) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    };
}());
(function () {
    'use strict';

    TileGenerator.Array = {};

    TileGenerator.Array.randomize = function (a) {
        var i,
            len = a.length,
            r,
            tmp;
        for (i = 0; i < a.length; i += 1) {
            r = Math.floor(Math.random() * len);
            tmp = a[r];
            a[r] = a[len - 1];
            a[len - 1] = tmp;
            len -= 1;
        }
    };
    TileGenerator.Array.getRandomWeightedIndex = function (a) {
        var dataArraySum = 0,
            i,
            loopSum = 0,
            rand;
        for (i = 0; i < a.length; i += 1) {
            dataArraySum += a[i];
        }
        rand = Math.floor(Math.random() * dataArraySum);
        for (i = 0; i < a.length; i += 1) {
            loopSum += a[i];
            if (rand < loopSum || i === (a.length - 1)) {
                return i;
            }
        }
        return -1;
    };
}());

(function () {
    'use strict';

    TileGenerator.Dom = {};

    TileGenerator.Dom.getParentNodeByClass = function (element, className) {
        while ((element = element.parentNode) !== null) {
            if (element.classList && element.classList.contains(className)) {
                return element;
            }
        }
        return null;
    };

    TileGenerator.Dom.getSiblingIndex = function (element) {
        var index = 0;
        while ((element = element.previousSibling) !== null) {
            index += 1;
        }
        return index;
    };
}());
(function () {
    'use strict';

    TileGenerator.Hex = {};

    TileGenerator.Hex.Map = {
        '0': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        'a': 10,
        'A': 10,
        'b': 11,
        'B': 11,
        'c': 12,
        'C': 12,
        'd': 13,
        'D': 13,
        'e': 14,
        'E': 14,
        'f': 15,
        'F': 15
    };

    TileGenerator.Hex.simpleToDecArray = function (h) {
        // Convert "#ff00ff" or "#FF00FF" to an array with 3 array elements:
        // r: [0] = 255
        // g: [1] = 0
        // b: [2] = 255
        var a = [];
        a[0] = TileGenerator.Hex.hexComponentToDec(h.slice(1, 3));
        a[1] = TileGenerator.Hex.hexComponentToDec(h.slice(3, 5));
        a[2] = TileGenerator.Hex.hexComponentToDec(h.slice(5));
        return a;
    };

    TileGenerator.Hex.hexComponentToDec = function (component) {
        var i,
            p = 0,
            value = 0;
        for (i = component.length - 1; i >= 0; i -= 1) {
            value += TileGenerator.Hex.Map[component[i]] * Math.pow(16, p);
            p += 1;
        }
        return value;
    };

    TileGenerator.Hex.isSimpleHex = function (h) {
        return /^#([0-9a-f]{2}){3}$/i.test(h);
    };
}());

(function () {
    'use strict';

    TileGenerator.Dec = {};

    TileGenerator.Dec.HexValues = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f'
    ];

    TileGenerator.Dec.decArrayToSimpleHex = function (decArray) {
        // Convert an array of 3 decimal values (each value is from 0-255) to a
        // simple hex string (e.g. "#0000ff").
        var h = '#',
            i;
        for (i = 0; i < decArray.length; i += 1) {
            h += TileGenerator.Dec.decComponentToHex(decArray[i]);
        }
        return h;
    };

    TileGenerator.Dec.decComponentToHex = function (d) {
        var h = '';
        while (d !== 0) {
            h = TileGenerator.Dec.HexValues[d % 16] + h;
            d = Math.floor(d / 16);
        }
        switch (h.length) {
        case 0:
            h = TileGenerator.Dec.HexValues[0] + TileGenerator.Dec.HexValues[0];
            break;

        case 1:
            h = TileGenerator.Dec.HexValues[0] + h;
            break;
        }
        return h;
    };
}());

(function () {
    'use strict';

    TileGenerator.Settings = function () {
        this._width = 128;
        this._height = 128;
        this._colors = [
            [255, 0, 0],
            [0, 255, 0]
        ];
        this._colorWeights = [
            100,
            100
        ];
        this._imageElement = null;
    };

    TileGenerator.Settings.VERSION = '1.1';

    TileGenerator.Settings.prototype.onLoad = function () {
        var settings;
        try {
            settings = window.localStorage.getItem('settings');
            if (settings) {
                settings = JSON.parse(settings);
                this._width = settings.width;
                this._height = settings.height;
                if (!settings.version) {
                    // Old settings that didn't have a version number stored
                    // the colors as #ff00ff instead of [255, 0, 255].
                    // We convert those old color hex values to dec arrays here.
                    this._colors = this._convertHexColors(settings.colors);
                } else {
                    this._colors = settings.colors;
                }
                this._colorWeights = settings.colorWeights;
            }
        } catch (e) {
        }
        window.addEventListener('beforeunload', this._saveSettings.bind(this));
    };

    TileGenerator.Settings.prototype.getWidth = function () {
        return this._width;
    };

    TileGenerator.Settings.prototype.setWidth = function (width) {
        this._width = width;
        return this;
    };

    TileGenerator.Settings.prototype.getHeight = function () {
        return this._height;
    };

    TileGenerator.Settings.prototype.setHeight = function (height) {
        this._height = height;
        return this;
    };

    TileGenerator.Settings.prototype.getColor = function (index) {
        return this._colors[index];
    };

    TileGenerator.Settings.prototype.getColors = function () {
        return this._colors;
    };

    TileGenerator.Settings.prototype.getNumColors = function () {
        return this._colors.length;
    };

    TileGenerator.Settings.prototype.addColor = function (color) {
        this._colors.push(color);
        return this;
    };

    TileGenerator.Settings.prototype.updateColor = function (index, color) {
        this._colors[index] = color;
        return this;
    };

    TileGenerator.Settings.prototype.removeColor = function (index) {
        this._colors.splice(index, 1);
        return this;
    };

    TileGenerator.Settings.prototype.getColorWeight = function (index) {
        return this._colorWeights[index];
    };

    TileGenerator.Settings.prototype.getColorWeights = function () {
        return this._colorWeights;
    };

    TileGenerator.Settings.prototype.getNumColorWeights = function () {
        return this._colorWeights.length;
    };

    TileGenerator.Settings.prototype.addColorWeight = function (colorWeight) {
        this._colorWeights.push(colorWeight);
        return this;
    };

    TileGenerator.Settings.prototype.updateColorWeight = function (index, colorWeight) {
        this._colorWeights[index] = colorWeight;
        return this;
    };

    TileGenerator.Settings.prototype.removeColorWeight = function (index) {
        this._colorWeights.splice(index, 1);
        return this;
    }

    TileGenerator.Settings.prototype.getImageElement = function () {
        return this._imageElement;
    };

    TileGenerator.Settings.prototype.setImageElement = function (imageElement) {
        this._imageElement = imageElement;
        return this;
    };

    TileGenerator.Settings.prototype._saveSettings = function () {
        var settings;
        try {
            var settings = JSON.stringify({
                version: TileGenerator.Settings.VERSION,
                width: this._width,
                height: this._height,
                colors: this._colors,
                colorWeights: this._colorWeights
            });
            window.localStorage.setItem('settings', settings);
        } catch (e) {
        }
    };

    TileGenerator.Settings.prototype._convertHexColors = function (hexColors) {
        var colors = [],
            i;
        for (i = 0; i < hexColors.length; i += 1) {
            colors.push(TileGenerator.Hex.simpleToDecArray(hexColors[i]));
        }
        return colors;
    };
}());
(function () {
    'use strict';

    var mainRef = null;

    TileGenerator.Main = function () {
        this._settings = new TileGenerator.Settings();
        this._ui = new TileGenerator.Ui();
        this._algos = {};
    };

    TileGenerator.Main.getRef = function () {
        return mainRef;
    };

    TileGenerator.Main.prototype.onLoad = function () {
        var algos,
            i;
        this._settings.onLoad();
        this._ui.onLoad();
        algos = TileGenerator.AlgoFactory.getAlgoInstances();
        for (i = 0; i < algos.length; i += 1) {
            this._ui.addAlgoToDom(algos[i]);
            this._algos[algos[i].getId()] = algos[i];
        }
        this._ui.onLoadEnd();
    };

    TileGenerator.Main.prototype.getAlgo = function (algoId) {
        return this._algos[algoId];
    };

    TileGenerator.Main.prototype.getSettings = function () {
        return this._settings;
    };

    window.onload = function () {
        mainRef = new TileGenerator.Main();
        mainRef.onLoad();
    };
}());
(function () {
    'use strict';

    TileGenerator.Ui = function () {
        this._settings = null;
        this._canvasList = {};
        this._ctxList = {};
        this._canvasesContainerElement = null;
        this._canvasesElement = null;
        this._canvasContainerTplElement = null;
        this._dimElement = null;
        this._progressElement = null;
        this._lastDropTarget = null;
        this._fileElement = null;
        this._fileRemoveElement = null;
        this._filePreviewElement = null;
        this._colorsElement = null;
        this._newColorElement = null;
        this._colorContainerTplElement = null;
        this._redrawElement = null;
        this._sizeElement = null;
        this._sizes = [
            [32, 32],
            [64, 64],
            [96, 96],
            [128, 128],
            [160, 160],
            [192, 192]
        ];
        this._map = null;
    };

    TileGenerator.Ui.prototype.onLoad = function () {
        this._settings = TileGenerator.Main.getRef().getSettings();
        this._canvasesContainerElement = document.getElementById('tg-canvases');
        this._canvasesElement = document.getElementById('tg-canvases-dynamic');
        this._canvasesContainerElement.addEventListener('drop', this._onDropCanvases.bind(this));
        this._canvasesContainerElement.addEventListener('dragenter', this._onDragEnterCanvases.bind(this));
        this._canvasesContainerElement.addEventListener('dragover', this._onDragOverCanvases.bind(this));
        this._canvasesContainerElement.addEventListener('dragleave', this._onDragLeaveCanvases.bind(this));
        this._canvasContainerTplElement = document.getElementById('tg-canvas-container-template');
        this._dimElement = document.getElementById('tg-dim');
        this._progressElement = document.getElementById('tg-progress');
        this._fileElement = document.getElementById('tg-file');
        this._fileRemoveElement = document.getElementById('tg-file-remove');
        this._filePreviewElement = document.getElementById('tg-file-preview');
        this._fileElement.addEventListener('change', this._onFileChange.bind(this));
        this._fileRemoveElement.addEventListener('click', this._onFileRemove.bind(this));
        this._colorsElement = document.getElementById('tg-colors-dynamic');
        this._newColorElement = document.getElementById('tg-new-color-btn');
        this._newColorElement.addEventListener('click', this._onAddColor.bind(this));
        this._colorContainerTplElement = document.getElementById('tg-color-container-template');
        this._redrawElement = document.getElementById('tg-redraw-btn');
        this._redrawElement.addEventListener('click', this._onRedraw.bind(this));
        this._sizeElement = document.getElementById('tg-size');
        this._populateSizes();
        this._sizeElement.addEventListener('change', this._onChangeSize.bind(this));
        this._sizeElement.addEventListener('keyup', this._onKeySize.bind(this));
        this._addColorsFromSettings();
        this._map = new TileGenerator.Map(this);
        this._map.onLoad();
    };

    TileGenerator.Ui.prototype.onLoadEnd = function () {
        this._redraw();
    };

    TileGenerator.Ui.prototype.addAlgoToDom = function (algo) {
        var canvas,
            ctx,
            deep = true,
            description = algo.getDescription(),
            algoId = algo.getId(),
            title = algo.getTitle(),
            tpl;
        tpl = this._canvasContainerTplElement.cloneNode(deep);
        tpl.removeAttribute('id');
        tpl.setAttribute('class', 'tg-canvas-container');
        tpl.querySelector('.tg-canvas-title').textContent = title;
        tpl.querySelector('.tg-canvas-description').textContent = description;
        canvas = tpl.querySelector('canvas');
        canvas.dataset.algoId = algoId;
        canvas.width = this._settings.getWidth();
        canvas.height = this._settings.getHeight();
        canvas.setAttribute('title', title);
        canvas.addEventListener('click', this._onClickCanvas.bind(this));
        canvas.addEventListener('keyup', this._onKeyCanvas.bind(this));
        ctx = canvas.getContext('2d');
        this._canvasList[algoId] = canvas;
        this._ctxList[algoId] = ctx;
        this._canvasesElement.appendChild(tpl);
        algo.setup(ctx);
    };

    TileGenerator.Ui.prototype.redrawAlgo = function (algoId) {
        this._redrawAlgo(algoId);
    };

    TileGenerator.Ui.prototype._onClickCanvas = function (e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        this._map.show(e.target);
    };

    TileGenerator.Ui.prototype._onKeyCanvas = function (e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        if (e.which === 13) {
            this._map.show(e.target);
        }
    };

    TileGenerator.Ui.prototype._onDragEnterCanvases = function (e) {
        this._lastDropTarget = e.target;
        this._canvasesContainerElement.classList.add('tg-drop-effect');
        e.preventDefault();
    };

    TileGenerator.Ui.prototype._onDragOverCanvases = function (e) {
        e.preventDefault();
    };

    TileGenerator.Ui.prototype._onDragLeaveCanvases = function (e) {
        if (this._lastDropTarget === e.target) {
            this._canvasesContainerElement.classList.remove('tg-drop-effect');
        }
    };

    TileGenerator.Ui.prototype._onDropCanvases = function (e) {
        this._canvasesContainerElement.classList.remove('tg-drop-effect');
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
            this._onNewFile(e.dataTransfer.files[0]);
        }
    };

    TileGenerator.Ui.prototype._onFileChange = function (e) {
        var validated = false;
        if (!this._fileElement.value) {
            return;
        }
        validated = this._onNewFile(this._fileElement.files[0]);
        if (!validated) {
            this._fileElement.value = null;
        }
    };

    TileGenerator.Ui.prototype._onNewFile = function (file) {
        var fileReader,
            maxMbs = 1,
            userMbs,
            validateSize = false;
        if (!/^image\//.test(file.type)) {
            alert('Please upload an image file.');
            return false;
        }
        if (validateSize) {
            if (file.size > (1024 * 1024 * maxMbs)) {
                userMbs = Math.round(file.size / (1024 * 1024));
                alert('Image files should be no more than ' + maxMbs + 'MB in size.  Your file is ~' + userMbs + 'MB.');
                return false;
            }
        }
        this._showProgress();
        fileReader = new FileReader();
        fileReader.addEventListener('load', this._onFileLoad.bind(this));
        fileReader.addEventListener('error', this._onFileError.bind(this));
        fileReader.addEventListener('abort', this._onFileError.bind(this));
        fileReader.readAsDataURL(file);
        return true;
    };

    TileGenerator.Ui.prototype._onFileLoad = function (e) {
        this._filePreviewElement.setAttribute('src', e.target.result);
        this._filePreviewElement.style.display = 'block';
        this._fileRemoveElement.style.display = 'block';
        this._settings.setImageElement(this._filePreviewElement);
        setTimeout(function () {
            this._hideProgress();
            this._redraw();
        }.bind(this), 150);
    };

    TileGenerator.Ui.prototype._onFileError = function (e) {
        this._hideProgress();
        alert('There was an error loading your file.  Please try again.');
    };

    TileGenerator.Ui.prototype._onFileRemove = function (e) {
        this._fileElement.value = null;
        this._filePreviewElement.removeAttribute('src');
        this._filePreviewElement.style.display = 'none';
        this._fileRemoveElement.style.display = 'none';
        this._settings.setImageElement(null);
        this._redraw();
    };

    TileGenerator.Ui.prototype._showProgress = function () {
        var progressRect;
        this._dimElement.style.display = 'block';
        this._progressElement.style.display = 'block';
        progressRect = this._progressElement.getBoundingClientRect();
        this._progressElement.style.left = Math.max(Math.floor((window.innerWidth - progressRect.width) / 2), 0) + 'px';
        this._progressElement.style.top = Math.max(Math.floor((window.innerHeight - progressRect.height) / 2), 0) + 'px';
    };

    TileGenerator.Ui.prototype._hideProgress = function () {
        this._dimElement.style.display = 'none';
        this._progressElement.style.display = 'none';
    };

    TileGenerator.Ui.prototype._onAddColor = function (e) {
        this._cloneColor(this._colorContainerTplElement);
    };

    TileGenerator.Ui.prototype._onCloneColor = function (e) {
        var colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container');
        this._cloneColor(colorContainerElement);
    };

    TileGenerator.Ui.prototype._onRemoveColor = function (e) {
        var colorContainerElement,
            index;
        if (this._settings.getNumColors() > 1) {
            colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container');
            index = TileGenerator.Dom.getSiblingIndex(colorContainerElement);
            this._settings.removeColor(index)
                .removeColorWeight(index);
            this._colorsElement.removeChild(colorContainerElement);
            this._redraw();
        } else {
            alert('You must keep at least 1 color.');
        }
    };

    TileGenerator.Ui.prototype._onChangeColor = function (e) {
        var colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container'),
            index;
        index = TileGenerator.Dom.getSiblingIndex(colorContainerElement);
        this._settings.updateColor(index, TileGenerator.Hex.simpleToDecArray(e.target.value));
        colorContainerElement.querySelector('.tg-color-value').value = e.target.value;
        this._redraw();
    };

    TileGenerator.Ui.prototype._onInputColorValue = function (e) {
        var colorContainerElement,
            colorElement,
            eventObj;
        if (TileGenerator.Hex.isSimpleHex(e.target.value)) {
            colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container');
            colorElement = colorContainerElement.querySelector('.tg-color');
            colorElement.value = e.target.value;
            eventObj = new Event('change');
            colorElement.dispatchEvent(eventObj);
        }
    };

    TileGenerator.Ui.prototype._onChangeColorValue = function (e) {
        var colorContainerElement,
            colorElement;
        if (!TileGenerator.Hex.isSimpleHex(e.target.value)) {
            colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container');
            colorElement = colorContainerElement.querySelector('.tg-color');
            e.target.value = colorElement.value;
        }
    };

    TileGenerator.Ui.prototype._onInputColorWeight = function (e) {
        var colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container');
        colorContainerElement.querySelector('.tg-color-weight-value').textContent = e.target.value;
    };

    TileGenerator.Ui.prototype._onChangeColorWeight = function (e) {
        var colorContainerElement = TileGenerator.Dom.getParentNodeByClass(e.target, 'tg-color-container'),
            colorWeight = parseInt(e.target.value, 10),
            index;
        index = TileGenerator.Dom.getSiblingIndex(colorContainerElement);
        if (this._settings.getColorWeight(index) !== colorWeight) {
            this._settings.updateColorWeight(index, colorWeight);
            this._redraw();
        }
    };

    TileGenerator.Ui.prototype._onKeyColorWeight = function (e) {
        this._onChangeColorWeight(e);
    };

    TileGenerator.Ui.prototype._onMouseColorWeight = function (e) {
        this._onChangeColorWeight(e);
    };

    TileGenerator.Ui.prototype._onChangeSize = function (e) {
        var size,
            sizeIndex = parseInt(e.target.value, 10);
        size = this._sizes[sizeIndex];
        if (this._settings.getWidth() !== size[0]
                && this._settings.getHeight() !== size[1]) {
            this._settings.setWidth(size[0])
                .setHeight(size[1]);
            this._resizeCanvases();
            this._callAlgoResized();
            this._redraw();
        }
    };

    TileGenerator.Ui.prototype._onKeySize = function (e) {
        this._onChangeSize(e);
    };

    TileGenerator.Ui.prototype._onRedraw = function () {
        this._redraw();
    };

    TileGenerator.Ui.prototype._redraw = function () {
        var i;
        for (i in this._ctxList) {
            if (this._ctxList.hasOwnProperty(i)) {
                this._redrawAlgo(i);
            }
        }
    };

    TileGenerator.Ui.prototype._redrawAlgo = function (algoId) {
        var algo = TileGenerator.Main.getRef().getAlgo(algoId);
        this._ctxList[algoId].clearRect(0, 0, this._settings.getWidth(), this._settings.getHeight());
        algo.draw(this._ctxList[algoId]);
    };

    TileGenerator.Ui.prototype._cloneColor = function (colorContainerElement) {
        var colorWeight,
            simpleColor;
        simpleColor = colorContainerElement.querySelector('.tg-color').value;
        colorWeight = parseInt(colorContainerElement.querySelector('.tg-color-weight-range').value, 10);
        this._addColorToDom(simpleColor, colorWeight);
        this._settings.addColor(TileGenerator.Hex.simpleToDecArray(simpleColor))
            .addColorWeight(colorWeight);
        this._redraw();
    };

    TileGenerator.Ui.prototype._addColorToDom = function (simpleColor, colorWeight) {
        var colorElement,
            colorValueElement,
            colorWeightElement,
            colorWeightValueElement,
            deep = true,
            tpl;
        tpl = this._colorContainerTplElement.cloneNode(deep);
        tpl.removeAttribute('id');
        tpl.setAttribute('class', 'tg-color-container');
        colorElement = tpl.querySelector('.tg-color');
        colorValueElement = tpl.querySelector('.tg-color-value');
        colorWeightElement = tpl.querySelector('.tg-color-weight-range');
        colorWeightValueElement = tpl.querySelector('.tg-color-weight-value');
        colorElement.value = simpleColor;
        colorValueElement.value = simpleColor;
        colorWeightElement.value = colorWeight;
        colorWeightValueElement.textContent = colorWeight;
        tpl.querySelector('.tg-clone-color-btn').addEventListener('click', this._onCloneColor.bind(this));
        tpl.querySelector('.tg-remove-color-btn').addEventListener('click', this._onRemoveColor.bind(this));
        colorElement.addEventListener('change', this._onChangeColor.bind(this));
        colorValueElement.addEventListener('input', this._onInputColorValue.bind(this));
        colorValueElement.addEventListener('change', this._onChangeColorValue.bind(this));
        colorWeightElement.addEventListener('input', this._onInputColorWeight.bind(this));
        colorWeightElement.addEventListener('keyup', this._onKeyColorWeight.bind(this));
        colorWeightElement.addEventListener('mouseup', this._onMouseColorWeight.bind(this));
        this._colorsElement.appendChild(tpl);
    };

    TileGenerator.Ui.prototype._addColorsFromSettings = function () {
        var colors,
            colorWeights,
            i;
        colors = this._settings.getColors();
        colorWeights = this._settings.getColorWeights();
        for (i = 0; i < colors.length; i += 1) {
            this._addColorToDom(TileGenerator.Dec.decArrayToSimpleHex(colors[i]), colorWeights[i]);
        }
    };

    TileGenerator.Ui.prototype._parseSize = function (value) {
        if (/^[1-9][0-9]*$/.test(value)) {
            return parseInt(value, 10);
        } else {
            return null;
        }
    };

    TileGenerator.Ui.prototype._resizeCanvases = function () {
        var i;
        for (i in this._canvasList) {
            if (this._canvasList.hasOwnProperty(i)) {
                this._canvasList[i].width = this._settings.getWidth();
                this._canvasList[i].height = this._settings.getHeight();
            }
        }
        this._map.onResize();        
    };

    TileGenerator.Ui.prototype._callAlgoResized = function () {
        var algo,
            i;
        for (i in this._ctxList) {
            if (this._ctxList.hasOwnProperty(i)) {
                algo = TileGenerator.Main.getRef().getAlgo(i);
                algo.resized(this._ctxList[i]);
            }
        }
    };

    TileGenerator.Ui.prototype._populateSizes = function () {
        var i,
            matchedOption,
            option,
            settingsHeight = this._settings.getHeight(),
            settingsWidth = this._settings.getWidth();
        for (i = 0; i < this._sizes.length; i += 1) {
            option = document.createElement('option');
            option.setAttribute('value', i);
            option.textContent = this._sizes[i][0] + 'x' + this._sizes[i][1];
            this._sizeElement.appendChild(option);
            if ((i === 0) || (this._sizes[i][0] == settingsWidth && this._sizes[i][1] == settingsHeight)) {
                matchedOption = option;
            }
        }
        matchedOption.setAttribute('selected', '');
    };
}());
(function () {
    'use strict';

    TileGenerator.Map = function (ui) {
        this._ui = ui;
        this._settings = null;
        this._dimElement = null;
        this._mapElement = null;
        this._mapCanvas = null;
        this._mapCtx = null;
        this._sourceCanvas = null;
        this._pattern = null;
        this._patterns = null;
        this._previousElement = null;
        this._nextElement = null;
        this._closeElement = null;
        this._redrawElement = null;
        this._patternsElement = null;
        this._closeHandler = this._onClickDim.bind(this);
        this._keyHandler = this._onKeyDocument.bind(this);
        this._previousHandler = this._onClickPrevious.bind(this);
        this._nextHandler = this._onClickNext.bind(this);
        this._redrawHandler = this._onClickRedraw.bind(this);
        this._patternHandler = this._onClickPattern.bind(this);
    };

    TileGenerator.Map.prototype.onLoad = function () {
        this._settings = TileGenerator.Main.getRef().getSettings();
        this._dimElement = document.getElementById('tg-dim');
        this._mapElement = document.getElementById('tg-map');
        this._previousElement = this._mapElement.querySelector('.tg-map-link-previous');
        this._nextElement = this._mapElement.querySelector('.tg-map-link-next');
        this._closeElement = this._mapElement.querySelector('.tg-map-link-close');
        this._redrawElement = this._mapElement.querySelector('.tg-map-link-redraw');
        this._patternsElement = this._mapElement.querySelector('.tg-map-patterns');
        this._patterns = TileGenerator.MapPatternFactory.getPatternInstances();
        this._pattern = this._patterns[0];
        this._createCanvas();
        this._resize();
        this._rearrangeDom();
        this._populateDomPatterns();
    };

    TileGenerator.Map.prototype.onResize = function () {
        this._resize();
    };

    TileGenerator.Map.prototype.show = function (canvas) {
        this._sourceCanvas = canvas;
        this._dimElement.style.display = 'block';
        this._mapElement.style.display = 'block';
        this._populate();
        this._draw();
        this._position();
        this._nextElement.focus();
        document.addEventListener('keyup', this._keyHandler);
        this._dimElement.addEventListener('click', this._closeHandler);
        this._previousElement.addEventListener('click', this._previousHandler);
        this._nextElement.addEventListener('click', this._nextHandler);
        this._closeElement.addEventListener('click', this._closeHandler);
        this._redrawElement.addEventListener('click', this._redrawHandler);
        this._addPatternListeners();
    };

    TileGenerator.Map.prototype._hide = function () {
        var dimElement = document.getElementById('tg-dim');
        dimElement.style.display = 'none';
        this._mapElement.style.display = 'none';
        document.removeEventListener('keyup', this._keyHandler);
        this._dimElement.removeEventListener('click', this._closeHandler);
        this._previousElement.removeEventListener('click', this._previousHandler);
        this._nextElement.removeEventListener('click', this._nextHandler);
        this._closeElement.removeEventListener('click', this._closeHandler);
        this._redrawElement.removeEventListener('click', this._redrawHandler);
        this._removePatternListeners();
    };

    TileGenerator.Map.prototype._populate = function () {
        var canvasContainerElement = TileGenerator.Dom.getParentNodeByClass(this._sourceCanvas, 'tg-canvas-container');
        this._mapElement.querySelector('.tg-map-title').textContent = canvasContainerElement.querySelector('.tg-canvas-title').textContent;
        this._mapElement.querySelector('.tg-map-description').textContent = canvasContainerElement.querySelector('.tg-canvas-description').textContent;
    };

    TileGenerator.Map.prototype._draw = function () {
        this._pattern.draw(this._sourceCanvas, this._mapCtx);
    };

    TileGenerator.Map.prototype._position = function () {
        var mapRect = this._mapElement.getBoundingClientRect();
        this._mapElement.style.left = Math.max(Math.floor((window.innerWidth - mapRect.width) / 2) + window.pageXOffset, 0) + 'px';
        this._mapElement.style.top = Math.max(Math.floor((window.innerHeight - mapRect.height) / 2) + window.pageYOffset, 0) + 'px';
    };

    TileGenerator.Map.prototype._onKeyDocument = function (e) {
        switch (e.which) {
        case 27:
            this._hide();
            break;

        case 37:
            this._previous();
            break;

        case 39:
            this._next();
            break;
        }
    };

    TileGenerator.Map.prototype._onClickDim = function (e) {
        this._hide();
        e.preventDefault();
    };

    TileGenerator.Map.prototype._onClickPrevious = function (e) {
        this._previous();
        e.preventDefault();
    };

    TileGenerator.Map.prototype._onClickNext = function (e) {
        this._next();
        e.preventDefault();
    };

    TileGenerator.Map.prototype._onClickRedraw = function (e) {
        this._ui.redrawAlgo(this._sourceCanvas.dataset.algoId);
        this._draw();
        e.preventDefault();
    };

    TileGenerator.Map.prototype._onClickPattern = function (e) {
        var index;
        if (e.target.classList.contains('tg-map-pattern-active')) {
            return;
        }
        this._patternsElement.querySelector('.tg-map-pattern-active').classList.remove('tg-map-pattern-active');
        index = TileGenerator.Dom.getSiblingIndex(e.target);
        e.target.classList.add('tg-map-pattern-active');
        this._pattern = this._patterns[index];
        this._resize();
        this._draw();
        this._position();
    };

    TileGenerator.Map.prototype._changeCanvas = function (canvas) {
        this._sourceCanvas = canvas;
        this._populate();
        this._draw();
    };

    TileGenerator.Map.prototype._previous = function () {
        var canvasesParent,
            prevContainer,
            sourceContainer = TileGenerator.Dom.getParentNodeByClass(this._sourceCanvas, 'tg-canvas-container');
        prevContainer = sourceContainer.previousSibling;
        if (!prevContainer) {
            canvasesParent = TileGenerator.Dom.getParentNodeByClass(sourceContainer, 'tg-canvases-dynamic');
            prevContainer = canvasesParent.lastChild;
        }
        this._changeCanvas(prevContainer.querySelector('canvas'));
    };

    TileGenerator.Map.prototype._next = function () {
        var canvasesParent,
            nextContainer,
            sourceContainer = TileGenerator.Dom.getParentNodeByClass(this._sourceCanvas, 'tg-canvas-container');
        nextContainer = sourceContainer.nextSibling;
        if (!nextContainer) {
            canvasesParent = TileGenerator.Dom.getParentNodeByClass(sourceContainer, 'tg-canvases-dynamic');
            nextContainer = canvasesParent.firstChild;
        }
        this._changeCanvas(nextContainer.querySelector('canvas'));
    };

    TileGenerator.Map.prototype._createCanvas = function () {
        this._mapCanvas = document.getElementById('tg-map-canvas');
        this._mapCtx = this._mapCanvas.getContext('2d');
    };

    TileGenerator.Map.prototype._resize = function () {
        this._mapCanvas.width = this._settings.getWidth() * this._pattern.getNumXTiles();
        this._mapCanvas.height = this._settings.getHeight() * this._pattern.getNumYTiles();
    }

    TileGenerator.Map.prototype._rearrangeDom = function () {
        if (this._mapElement.parentNode === document.body) {
            return;
        }
        this._mapElement.parentNode.removeChild(this._mapElement);
        this._dimElement.parentNode.removeChild(this._dimElement);
        document.body.appendChild(this._mapElement);
        document.body.appendChild(this._dimElement);
    };

    TileGenerator.Map.prototype._populateDomPatterns = function () {
        var i,
            li,
            ul = this._patternsElement.querySelector('ul');
        for (i = 0; i < this._patterns.length; i += 1) {
            li = document.createElement('li');
            if (i === 0) {
                li.classList.add('tg-map-pattern-active');
            }
            li.setAttribute('tabindex', '0');
            li.setAttribute('title', this._patterns[i].getDescription());
            li.textContent = this._patterns[i].getTitle();
            ul.appendChild(li);
        }
    };

    TileGenerator.Map.prototype._addPatternListeners = function () {
        var i,
            lis = this._patternsElement.querySelectorAll('li');
        for (i = 0; i < lis.length; i += 1) {
            lis[i].addEventListener('click', this._patternHandler);
        }
    };

    TileGenerator.Map.prototype._removePatternListeners = function () {
        var i,
            lis = this._patternsElement.querySelectorAll('li');
        for (i = 0; i < lis.length; i += 1) {
            lis[i].removeEventListener('click', this._patternHandler);
        }
    };
}());
(function () {
    'use strict';

    TileGenerator.MapPattern = function () {
        this._title = null;
        this._description = null;
        this._numXTiles = 0;
        this._numYTiles = 0;
    };

    TileGenerator.MapPattern.prototype.draw = function (sourceCanvas, ctx) {
        // Virtual function
    };

    TileGenerator.MapPattern.prototype.getTitle = function () {
        return this._title;
    };

    TileGenerator.MapPattern.prototype.getDescription = function () {
        return this._description;
    };

    TileGenerator.MapPattern.prototype.getNumXTiles = function () {
        return this._numXTiles;
    };

    TileGenerator.MapPattern.prototype.getNumYTiles = function () {
        return this._numYTiles;
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.MapPattern;

    TileGenerator.MapPatternRepeat = function () {
        var sizeStr;
        parent.call(this);
        this._numXTiles = 3;
        this._numYTiles = 3;
        sizeStr = this._numXTiles + 'x' + this._numYTiles;
        this._title = sizeStr + ' Repeat';
        this._description = 'Tiles are repeated in a ' + sizeStr + ' pattern.';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.MapPatternRepeat);

    TileGenerator.MapPatternRepeat.prototype.draw = function (sourceCanvas, ctx) {
        var tileX,
            tileY,
            x,
            y;
        for (tileY = 0; tileY < this._numYTiles; tileY += 1) {
            for (tileX = 0; tileX < this._numXTiles; tileX += 1) {
                x = tileX * sourceCanvas.width;
                y = tileY * sourceCanvas.height;
                ctx.drawImage(
                    sourceCanvas,
                    x,
                    y,
                    sourceCanvas.width,
                    sourceCanvas.height
                );
            }
        }
    };
}());

(function () {
    'use strict';

    var parent = TileGenerator.MapPattern;

    TileGenerator.MapPatternSeamless = function () {
        var sizeStr;
        parent.call(this);
        this._numXTiles = 2;
        this._numYTiles = 2;
        sizeStr = this._numXTiles + 'x' + this._numYTiles;
        this._title = sizeStr + ' Seamless';
        this._description = 'Tiles are flipped to create a seamless pattern.';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.MapPatternSeamless);

    TileGenerator.MapPatternSeamless.prototype.draw = function (sourceCanvas, ctx) {
        var scaleX,
            scaleY,
            tileX,
            tileY,
            x,
            y;
        for (tileY = 0; tileY < this._numYTiles; tileY += 1) {
            for (tileX = 0; tileX < this._numXTiles; tileX += 1) {
                scaleX = 1;
                scaleY = 1;
                x = tileX * sourceCanvas.width;
                y = tileY * sourceCanvas.height;
                if (tileX % 2 !== 0) {
                    x = -(x + sourceCanvas.width);
                    scaleX = -1;
                }
                if (tileY % 2 !== 0) {
                    y = -(y + sourceCanvas.height);
                    scaleY = -1;
                }
                ctx.scale(scaleX, scaleY);
                ctx.drawImage(
                    sourceCanvas,
                    x,
                    y,
                    sourceCanvas.width,
                    sourceCanvas.height
                );
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        }
    };
}());

(function () {
    'use strict';

    TileGenerator.MapPatternFactory = {};

    TileGenerator.MapPatternFactory.getPatternInstances = function () {
        return [
            new TileGenerator.MapPatternRepeat(),
            new TileGenerator.MapPatternSeamless()
        ];
    };
}());
(function () {
    'use strict';

    TileGenerator.Algo = function (settings) {
        this._settings = settings;
        this._id = null;
        this._title = null;
        this._description = null;
        this._imageData = null;
        this._imageDataArray = null;
        this._imageDataModified = false;
    };

    TileGenerator.Algo.prototype.setup = function (ctx) {
        this._createImageData(ctx);
    };

    TileGenerator.Algo.prototype.resized = function (ctx) {
        this._createImageData(ctx);
    };

    TileGenerator.Algo.prototype.draw = function (ctx) {
        this._setPixels(ctx);
        this._drawPixels(ctx);
    };

    TileGenerator.Algo.prototype.getId = function () {
        return this._id;
    };

    TileGenerator.Algo.prototype.getTitle = function () {
        return this._title;
    };

    TileGenerator.Algo.prototype.getDescription = function () {
        return this._description;
    };

    TileGenerator.Algo.prototype._setPixel = function (ctx, position, color) {
        var index = this._getPixelIndex(ctx, position.x, position.y);
        this._imageDataArray[index++] = color[0];
        this._imageDataArray[index++] = color[1];
        this._imageDataArray[index++] = color[2];
        this._imageDataArray[index++] = (color[3] === undefined ? 255 : color[3]);
        this._imageDataModified = true;
    };

    TileGenerator.Algo.prototype._setBlockPixels = function (ctx, positions, color) {
        var i;
        for (i = 0; i < positions.length; i += 1) {
            this._setPixel(ctx, positions[i], color);
        }
    };

    TileGenerator.Algo.prototype._getPixelIndex = function (ctx, x, y) {
        return (y * ctx.canvas.width + x) * 4;
    };

    TileGenerator.Algo.prototype._drawPixels = function (ctx) {
        ctx.putImageData(this._imageData, 0, 0);
    };

    TileGenerator.Algo.prototype._createImageData = function (ctx) {
        this._imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
        this._imageDataArray = this._imageData.data;
        this._imageDataModified = false;
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.Algo;

    TileGenerator.AlgoRandom = function (settings) {
        parent.call(this, settings);
        this._id = 'random';
        this._title = 'Random';
        this._description = 'Pixels are assigned a random color.';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoRandom);

    TileGenerator.AlgoRandom.prototype._setPixels = function (ctx) {
        var colorIndex,
            colors = this._settings.getColors(),
            colorWeights = this._settings.getColorWeights(),
            position = {},
            x,
            y;
        for (y = 0; y < this._settings.getHeight(); y += 1) {
            for (x = 0; x < this._settings.getWidth(); x += 1) {
                position.x = x;
                position.y = y;
                colorIndex = TileGenerator.Array.getRandomWeightedIndex(colorWeights);
                this._setPixel(ctx, position, colors[colorIndex]);
            }
        }
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.Algo;

    TileGenerator.AlgoSmearing = function (settings) {
        parent.call(this, settings);
        this._id = 'smearing';
        this._title = 'Smearing';
        this._description = 'Pixels are assigned a continuous set of colors in random amounts.';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoSmearing);

    TileGenerator.AlgoSmearing.prototype._setPixels = function (ctx) {
        var colorIndex,
            colors = this._settings.getColors(),
            colorWeights = this._settings.getColorWeights(),
            colorContinueBaseAmount = 5,
            colorContinueCount = 0,
            colorContinueRandAmount = 20,
            needColorChange = true,
            position = {},
            x,
            y;
        for (y = 0; y < this._settings.getHeight(); y += 1) {
            for (x = 0; x < this._settings.getWidth(); x += 1) {
                if (needColorChange) {
                    colorIndex = TileGenerator.Array.getRandomWeightedIndex(colorWeights);
                    colorContinueCount = 0;
                    needColorChange = false;
                }
                colorContinueCount += 1;
                if (colorContinueCount > (colorContinueBaseAmount + Math.random() * colorContinueRandAmount)) {
                    needColorChange = true;
                }
                position.x = x;
                position.y = y;
                this._setPixel(ctx, position, colors[colorIndex]);
            }
        }
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.Algo;

    TileGenerator.AlgoBrick = function (settings) {
        parent.call(this, settings);
        this._id = 'brick';
        this._title = 'Brick';
        this._description = 'Rows of bricks.';
        this._brickHexColors = null;
        this._outlineHexColor = null;
        this._brickWidth = 0;
        this._brickHeight = 0;
        this._halfBrickWidth = 0;
        this._numBricksX = 0;
        this._numBricksY = 0;
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoBrick);

    TileGenerator.AlgoBrick.prototype.draw = function (ctx) {
        this._defineVariables(ctx);
        this._drawBricks(ctx);
    };

    TileGenerator.AlgoBrick.prototype._defineVariables = function (ctx) {
        var colors = this._settings.getColors(),
            colorWeights = this._settings.getColorWeights(),
            i;
        this._brickHexColors = [];
        this._outlineHexColor = null;
        for (i = 0; i < colors.length; i += 1) {
            if (colorWeights[i] > 0) {
                if (!this._outlineHexColor) {
                    this._outlineHexColor = TileGenerator.Dec.decArrayToSimpleHex(colors[i]);
                } else {
                    this._brickHexColors.push(TileGenerator.Dec.decArrayToSimpleHex(colors[i]));
                }
            }
        }
        if (this._brickHexColors.length === 0) {
            this._brickHexColors.push(this._outlineHexColor);
        }
        this._brickWidth = Math.floor(this._settings.getWidth() / 4);
        this._halfBrickWidth = Math.floor(this._brickWidth / 2);
        this._brickHeight = Math.floor(this._settings.getHeight() / 8);
        this._numBricksX = Math.floor(this._settings.getWidth() / this._brickWidth);
        this._numBricksY = Math.floor(this._settings.getHeight() / this._brickHeight);
    };

    TileGenerator.AlgoBrick.prototype._drawBricks = function (ctx) {
        var brickX,
            brickY,
            loopBrickWidth,
            loopNumBricksX,
            x = 0,
            y = 0;
        for (brickY = 0; brickY < this._numBricksY; brickY += 1) {
            x = 0;
            ctx.fillStyle = this._brickHexColors[brickY % this._brickHexColors.length];
            loopNumBricksX = (brickY % 2 === 0 ? this._numBricksX : this._numBricksX + 1);
            for (brickX = 0; brickX < loopNumBricksX; brickX += 1) {
                if (loopNumBricksX !== this._numBricksX
                        && (brickX === 0 || brickX === loopNumBricksX - 1)) {
                    loopBrickWidth = this._halfBrickWidth;
                } else {
                    loopBrickWidth = this._brickWidth;
                }
                ctx.strokeStyle = this._outlineHexColor;
                ctx.fillRect(x, y, loopBrickWidth, this._brickHeight);
                ctx.strokeRect(x + 0.5, y + 0.5, loopBrickWidth - ctx.lineWidth, this._brickHeight - ctx.lineWidth);
                if (loopBrickWidth === this._halfBrickWidth) {
                    if (brickX === 0) {
                        this._unlineHalfBrick(ctx, x, y + ctx.lineWidth);
                    } else {
                        this._unlineHalfBrick(ctx, x + loopBrickWidth - ctx.lineWidth, y + ctx.lineWidth);
                    }
                }
                x += loopBrickWidth;
            }
            y += this._brickHeight;
        }
    };

    TileGenerator.AlgoBrick.prototype._unlineHalfBrick = function (ctx, x, y) {
        x += 0.5;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + this._brickHeight - (ctx.lineWidth * 2));
        ctx.stroke();
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.Algo;

    TileGenerator.AlgoNeighbor = function (settings) {
        parent.call(this, settings);
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoNeighbor);

    TileGenerator.AlgoNeighbor.prototype._setPixels = function (ctx) {
        var color,
            colorIndex,
            colors = this._settings.getColors(),
            colorWeights = this._settings.getColorWeights(),
            lastColor,
            maxSameColorCount,
            position = {},
            rows = [],
            sameColorCount = 0,
            x,
            y;
        for (y = 0; y < this._settings.getHeight(); y += 1) {
            rows.push(y);
        }
        maxSameColorCount = Math.floor(this._settings.getWidth() / 10);
        TileGenerator.Array.randomize(rows);
        if (this._imageDataModified) {
            this._createImageData(ctx);
        }
        for (y = 0; y < rows.length; y += 1) {
            for (x = 0; x < this._settings.getWidth(); x += 1) {
                color = this._getRandomNeighborColor(ctx, x, y);
                if (color === null) {
                    colorIndex = TileGenerator.Array.getRandomWeightedIndex(colorWeights);
                    color = colors[colorIndex];
                }
                if (this._colorMatch(color, lastColor)) {
                    ++sameColorCount;
                }
                if (sameColorCount > maxSameColorCount) {
                    sameColorCount = 0;
                    colorIndex = TileGenerator.Array.getRandomWeightedIndex(colorWeights);
                    color = colors[colorIndex];
                }
                lastColor = color;
                position.x = x;
                position.y = y;
                this._setPixel(ctx, position, color);
            }
        }
    };

    TileGenerator.AlgoNeighbor.prototype._getRandomNeighborColor = function (ctx, x, y) {
        var i,
            neighbors = [],
            pixelIndex;
        neighbors = this._getNeighbors(x, y);
        if (neighbors.length === 0) {
            return null;
        }
        TileGenerator.Array.randomize(neighbors);
        for (i = 0; i < neighbors.length; i += 1) {
            pixelIndex = this._getPixelIndex(ctx, neighbors[i].x, neighbors[i].y);
            if (this._imageDataArray[pixelIndex + 3] !== 0) {
                return [
                    this._imageDataArray[pixelIndex++],
                    this._imageDataArray[pixelIndex++],
                    this._imageDataArray[pixelIndex++]
                ];
            }
        }
        return null;
    };

    TileGenerator.AlgoNeighbor.prototype._colorMatch = function (color1, color2) {
        if (color1
                && color2
                && color1[0] === color2[0]
                && color1[1] === color2[1]
                && color1[2] === color2[2]) {
            return true;
        }
        return false;
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.AlgoNeighbor;

    TileGenerator.AlgoNeighbor4 = function (settings) {
        parent.call(this, settings);
        this._id = 'neighbor4';
        this._title = 'Neighbor 4';
        this._description = 'Pixel colors are based off 4 neighboring pixels (north, south, east, and west).';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoNeighbor4);

    TileGenerator.AlgoNeighbor4.prototype._getNeighbors = function (x, y) {
        var neighbors = [];
        if (y > 0) {
            neighbors.push({
                x: x,
                y: y - 1
            });
        }
        if (y < this._settings.getHeight() - 1) {
            neighbors.push({
                x: x,
                y: y + 1
            });
        }
        if (x > 0) {
            neighbors.push({
                x: x - 1,
                y: y
            });
        }
        if (x < this._settings.getWidth() - 1) {
            neighbors.push({
                x: x + 1,
                y: y
            });
        }
        return neighbors;
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.AlgoNeighbor4;

    TileGenerator.AlgoNeighbor8 = function (settings) {
        parent.call(this, settings);
        this._id = 'neighbor8';
        this._title = 'Neighbor 8';
        this._description = 'Pixel colors are based off 8 neighboring pixels.';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoNeighbor8);

    TileGenerator.AlgoNeighbor8.prototype._getNeighbors = function (x, y) {
        var neighbors = parent.prototype._getNeighbors.call(this, x, y);
        if (x > 0 && y > 0) {
            neighbors.push({
                x: x - 1,
                y: y - 1
            });
        }
        if ((x < this._settings.getWidth() - 1) && y > 0) {
            neighbors.push({
                x: x + 1,
                y: y - 1
            });
        }
        if (x > 0 && (y < this._settings.getHeight() - 1)) {
            neighbors.push({
                x: x - 1,
                y: y + 1
            });
        }
        if ((x < this._settings.getWidth() - 1) && (y < this._settings.getHeight() - 1)) {
            neighbors.push({
                x: x + 1,
                y: y + 1
            });
        }
        return neighbors;
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.Algo;

    TileGenerator.AlgoPixellation = function (settings) {
        parent.call(this, settings);
        this._id = 'pixellation';
        this._title = 'Pixellation';
        this._description = 'Blocks of pixels are assigned the same color based on random color values.';
        this._blockWidth = 0;
        this._blockHeight = 0;
        this._numBlocksX = 0;
        this._numBlocksY = 0;
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoPixellation);

    TileGenerator.AlgoPixellation.prototype._setPixels = function (ctx) {
        var blockY,
            blockX,
            colorIndex,
            colors = this._settings.getColors(),
            colorWeights = this._settings.getColorWeights(),
            positions;
        this._blockWidth = Math.floor(this._settings.getWidth() / 8);
        this._blockHeight = Math.floor(this._settings.getHeight() / 8);
        this._numBlocksX = Math.ceil(this._settings.getWidth() / this._blockWidth);
        this._numBlocksY = Math.ceil(this._settings.getHeight() / this._blockHeight);
        for (blockY = 0; blockY < this._numBlocksY; blockY += 1) {
            for (blockX = 0; blockX < this._numBlocksX; blockX += 1) {
                positions = this._getBlockPositions(blockX, blockY);
                colorIndex = TileGenerator.Array.getRandomWeightedIndex(colorWeights);
                this._setBlockPixels(ctx, positions, colors[colorIndex]);
            }
        }
    };

    TileGenerator.AlgoPixellation.prototype._getBlockPositions = function (blockX, blockY) {
        var positions = [],
            x,
            xEnd,
            xStart,
            y,
            yEnd,
            yStart;
        xStart = blockX * this._blockWidth;
        xEnd = Math.min(xStart + this._blockWidth, this._settings.getWidth());
        yStart = blockY * this._blockHeight;
        yEnd = Math.min(yStart + this._blockHeight, this._settings.getHeight());
        for (y = yStart; y < yEnd; y += 1) {
            for (x = xStart; x < xEnd; x += 1) {
                positions.push({
                    x: x,
                    y: y
                });
            }
        }
        return positions;
    };
}());
(function () {
    'use strict';

    var parent = TileGenerator.AlgoPixellation;

    TileGenerator.AlgoFilePixellation = function (settings) {
        parent.call(this, settings);
        this._id = 'file_pixellation';
        this._title = 'File Pixellation';
        this._description = 'Blocks of pixels are assigned the same color based on the selected image file.';
    };

    TileGenerator.Oop.extend(parent, TileGenerator.AlgoFilePixellation);

    TileGenerator.AlgoFilePixellation.prototype.draw = function (ctx) {
        var imageElement = this._settings.getImageElement();
        if (!imageElement) {
            this._drawMissingImage(ctx);
        } else {
            this._drawImage(ctx);
            this._pixellateImage(ctx);
            this._drawPixels(ctx);
        }
    };

    TileGenerator.AlgoFilePixellation.prototype._drawMissingImage = function (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this._settings.getWidth(), this._settings.getHeight());
        if (!this._drawTextConditional(ctx, 'Need File')) {
            this._drawTextConditional(ctx, 'File');
        }
    };

    TileGenerator.AlgoFilePixellation.prototype._drawImage = function (ctx) {
        var imageElement = this._settings.getImageElement();
        ctx.drawImage(
            imageElement,
            0,
            0,
            imageElement.width,
            imageElement.height,
            0,
            0,
            this._settings.getWidth(),
            this._settings.getHeight()
        );
    };

    TileGenerator.AlgoFilePixellation.prototype._pixellateImage = function (ctx) {
        var blockY,
            blockX,
            color,
            imageData = ctx.getImageData(0, 0, this._settings.getWidth(), this._settings.getHeight()).data,
            positions;
        this._blockWidth = 4;
        this._blockHeight = 4;
        this._numBlocksX = Math.ceil(this._settings.getWidth() / this._blockWidth);
        this._numBlocksY = Math.ceil(this._settings.getHeight() / this._blockHeight);
        for (blockY = 0; blockY < this._numBlocksY; blockY += 1) {
            for (blockX = 0; blockX < this._numBlocksX; blockX += 1) {
                positions = this._getBlockPositions(blockX, blockY);
                color = this._getBlockColor(ctx, imageData, positions);
                this._setBlockPixels(ctx, positions, color);
            }
        }
    };

    TileGenerator.AlgoFilePixellation.prototype._drawTextConditional = function (ctx, text) {
        var height = 16,
            measurement,
            x,
            y;
        ctx.font = 'bold ' + height + 'px serif';
        ctx.textBaseline = 'top';
        measurement = ctx.measureText(text);
        if (measurement.width >= this._settings.getWidth()) {
            return false;
        }
        x = Math.round((this._settings.getWidth() - measurement.width) / 2);
        y = Math.round((this._settings.getHeight() - height) / 2);
        ctx.fillStyle = 'white';
        ctx.fillText(text, x, y);
        return true;
    };

    TileGenerator.AlgoFilePixellation.prototype._getBlockColor = function (ctx, imageData, positions) {
        var a = 0,
            b = 0,
            color,
            g = 0,
            i,
            pixelIndex,
            r = 0;
        for (i = 0; i < positions.length; i += 1) {
            pixelIndex = this._getPixelIndex(ctx, positions[i].x, positions[i].y);
            r += imageData[pixelIndex++];
            g += imageData[pixelIndex++];
            b += imageData[pixelIndex++];
            a += imageData[pixelIndex++];
        }
        color = [
            Math.round(r / positions.length),
            Math.round(g / positions.length),
            Math.round(b / positions.length),
            Math.round(a / positions.length)
        ];
        return color;
    };
}());
(function () {
    'use strict';

    TileGenerator.AlgoFactory = {};

    TileGenerator.AlgoFactory.getAlgoInstances = function () {
        var settings = TileGenerator.Main.getRef().getSettings();
        return [
            new TileGenerator.AlgoBrick(settings),
            new TileGenerator.AlgoNeighbor4(settings),
            new TileGenerator.AlgoNeighbor8(settings),
            new TileGenerator.AlgoPixellation(settings),
            new TileGenerator.AlgoFilePixellation(settings)
        ];
    };
}());