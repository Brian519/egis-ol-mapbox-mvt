import ImageLayer from "ol/layer/Image";


function extend(dest) {
    var i, j, len, src;

    for (j = 1, len = arguments.length; j < len; j++) {
        src = arguments[j];
        for (i in src) {
            dest[i] = src[i];
        }
    }
    return dest;
}


function addClass(el, name) {
    if (el.classList !== undefined) {
        var classes = splitWords(name);
        for (var i = 0, len = classes.length; i < len; i++) {
            el.classList.add(classes[i]);
        }
    } else if (!hasClass(el, name)) {
        var className = getClass(el);
        setClass(el, (className ? className + ' ' : '') + name);
    }

    function trim(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    function splitWords(str) {
        return trim(str).split(/\s+/);
    }

    function hasClass(el, name) {
        if (el.classList !== undefined) {
            return el.classList.contains(name);
        }
        var className = getClass(el);
        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
    }

    function setClass(el, name) {
        if (el.className.baseVal === undefined) {
            el.className = name;
        } else {
            // in case of SVG element
            el.className.baseVal = name;
        }
    }


    function getClass(el) {
        // Check if the element is an SVGElementInstance and use the correspondingElement instead
        // (Required for linked SVG elements in IE11.)
        if (el.correspondingElement) {
            el = el.correspondingElement;
        }
        return el.className.baseVal === undefined ? el.className : el.className.baseVal;
    }

}

function LPoint(x, y, round) {
    // @property x: Number; The `x` coordinate of the point
    this.x = (round ? Math.round(x) : x);
    // @property y: Number; The `y` coordinate of the point
    this.y = (round ? Math.round(y) : y);
}

LPoint.prototype.clone = function(){
    return new LPoint(this.x, this.y);
};


LPoint.prototype.multiplyBy = function (num) {
    return this.clone()._multiplyBy(num);
};

LPoint.prototype._multiplyBy = function (num) {
    this.x *= num;
    this.y *= num;
    return this;
},



    LPoint.prototype.subtract = function (point) {
        return this.clone()._subtract(point);
    };

LPoint.prototype._subtract = function (point) {
    this.x -= point.x;
    this.y -= point.y;
    return this;
};




~function (ImageLayer) {
    var mapCanvas = document.createElement("canvas");

    var padding = 0.0;
    function MVTLayer(opt_options) {

        this.options = opt_options;
        var options = opt_options ? opt_options : {};
        // options.source = new ol.source.ImageCanvas({
        //     canvasFunction: function () {
        //         return mapCanvas;
        //     },
        //     projection: "EPSG:3857"
        // });
        //options.opacity = 0.5;
        ImageLayer.call(/** @type {import("./Vector.js").Options} */ this, (options));


    }

    //if (ImageLayer) MVTLayer.__proto__ = ImageLayer;
    MVTLayer.prototype = Object.create(ImageLayer.prototype);
    MVTLayer.prototype.constructor = MVTLayer;

    MVTLayer.prototype.init = function init(map) {
        this._map = map;

        if (!this._glContainer) {
            this._initContainer();
        }

        var target = map.getTarget();
        var targetEle = map.getTargetElement();



        var view = this._map.getView();
        var center = view.getCenter();
        //const ccc = ol.proj.transform(center, "EPSG:3857", "EPSG:4326");
        var cc = {
            lng: center[0],
            lat: center[1]
        };


        var options = extend({}, this.options, {
            container: this._glContainer,
            epsg: "EPSG:4490",
           // canvas: mapCanvas,
            interactive: false,
            center: cc, // [center.lng, center.lat],
            zoom: view.getZoom(),
            style: this.options.glStyle,
            attributionControl: false,
            attribution: null,
            bubblingMouseEvents: true,
            //padding: padding,
            hash: true,
            updateInterval: 32
        });

        this._glMap = new mapboxgl.Map(options);

        // allow GL base map to pan beyond min/max latitudes
        this._glMap.transform.latRange = null;
        this._glMap._actualCanvas = this._glMap._canvas;

        addClass(this._glMap._actualCanvas, 'leaflet-image-layer');
        addClass(this._glMap._actualCanvas, 'leaflet-zoom-animated');


        map.getView().on("propertychange",this.render)
       // map.on("postrender", this.render);
       /* map.on("movestart", this.render);
        map.on("moveend", this.render);*/
        map["owner"] = this;
        map.getView().map = map;
    }

    MVTLayer.prototype._initContainer = function _initContainer() {
        var map = this._map;
        var view = map.getView();

        var targetEle = map.getTargetElement();
        var parentEle = targetEle.getElementsByClassName("ol-viewport")[0];
        var divCanvas = parentEle.children[0];

        var container = this._glContainer = parentEle; //= L.DomUtil.create('div', 'leaflet-gl-layer');

        var size = this._getSize();

        var viewSize = map.getSize();
        var p = new LPoint(viewSize[0], viewSize[1]);
        var offset = p.multiplyBy(0.15);

        container.style.width = size.x + 'px';
        container.style.height = size.y + 'px';

     /*   var cp = new LPoint(0, 0);
        var cp2 = cp.subtract(offset);
        var topLeft = cp2;

        L.DomUtil.setPosition(container, topLeft);*/
    }


    MVTLayer.prototype._getSize = function _getSize() {
        var size = this._map.getSize();
        var p = new LPoint(size[0], size[1]);
        // return p.multiplyBy(1 + padding * 2);
        return p

    }

    MVTLayer.prototype.render = function render(e) {
        var e = e.target;
        var owner = e.map['owner'];

        var map = e.map;
        var view = map.getView();



        if (this._zooming) {
            return;
        }

        var mapContainer = map.getTargetElement();
        var size = owner._getSize();
        var container = owner._glContainer;
        var gl = owner._glMap;

        var viewSize = map.getSize();
  /*      var p = new L.Point(viewSize[0], viewSize[1]);
        var offset = p.multiplyBy(padding); // this._map.getSize().multiplyBy(this.options.padding);

        var cp = new L.Point(0, 0);
        var cp2 = cp.subtract(offset);
        var topLeft = cp2; // this._map.containerPointToLayerPoint([0, 0]).subtract(offset);

        L.DomUtil.setPosition(container, topLeft);*/

        var mapCenter = view.getCenter();
       /* const ccc = ol.proj.transform(mapCenter, "EPSG:3857", "EPSG:4326");
        var center = {
            lng: ccc[0],
            lat: ccc[1]
        }*/

        // gl.setView([center.lat, center.lng], this._map.getZoom() - 1, 0);
        // calling setView directly causes sync issues because it uses requestAnimFrame

        var tr = gl.transform;
        tr.center = mapboxgl.LngLat.convert([mapCenter[0], mapCenter[1]]);
        tr.zoom = view.getZoom();

        if (gl.transform.width !== size.x || gl.transform.height !== size.y) {
            container.style.width = size.x + 'px';
            container.style.height = size.y + 'px';
            if (gl._resize !== null && gl._resize !== undefined) {
                gl._resize();
            } else {
                gl.resize();
            }
        } else {
            // older versions of mapbox-gl surfaced update publicly
            if (gl._update !== null && gl._update !== undefined) {
                gl._update();
            } else {
                gl.update();
            }
        }
    }

    MVTLayer.prototype.movestart = function movestart(e) {

    }

    MVTLayer.prototype.moveend = function moveend(e) {

    }

    MVTLayer.prototype.setOpacity = function moveend(opacity) {
        var ctx = mapCanvas.getContext("2d");
        ctx.globalAlpha = opacity;

        const eles = document.getElementsByClassName("mapboxgl-canvas");
        const ele = eles[0];
        ele.style.opacity = 0.6;

        //  const ctx2 = ele.getContext("2d");
    }

    window.MVTLayer = MVTLayer;

}(ImageLayer)
export default MVTLayer



//# sourceMappingURL=VectorTile.js.map
