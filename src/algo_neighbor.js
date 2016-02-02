(function () {
    'use strict';

    var parent = TileGenerator.Algo;

    TileGenerator.AlgoNeighbor = function (settings) {
        parent.call(this, settings);
    };

    TileGenerator.Util.extend(parent, TileGenerator.AlgoNeighbor);

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
        TileGenerator.Util.randomizeArray(rows);
        if (this._imageDataModified) {
            this._createImageData(ctx);
        }
        for (y = 0; y < rows.length; y += 1) {
            for (x = 0; x < this._settings.getWidth(); x += 1) {
                color = this._getRandomNeighborColor(ctx, x, y);
                if (color === null) {
                    colorIndex = TileGenerator.Util.getRandomWeightedIndex(colorWeights);
                    color = colors[colorIndex];
                }
                if (this._colorMatch(color, lastColor)) {
                    ++sameColorCount;
                }
                if (sameColorCount > maxSameColorCount) {
                    sameColorCount = 0;
                    colorIndex = TileGenerator.Util.getRandomWeightedIndex(colorWeights);
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
        if (neighbors.length === 0) {
            return null;
        }
        TileGenerator.Util.randomizeArray(neighbors);
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