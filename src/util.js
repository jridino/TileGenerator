(function () {
    'use strict';

    TileGenerator.Util = {};

    TileGenerator.Util.extend = function (parent, child) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    };

    TileGenerator.Util.randomizeArray = function (a) {
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
    TileGenerator.Util.getRandomWeightedIndex = function (a) {
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
