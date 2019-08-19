import VectorTileLayer from "ol/layer/VectorTile";
import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";
import {transform} from "ol/proj"

import Layer from "ol/layer/Layer";

// var mapboxgl = require("./node_modules/mapbox-gl/dist/mapbox-gl-dev");
// var mapboxgl = require("./vendor/mapbox-gl-tdz");


//
// var MVTLayer = /*@__PURE__*/(function (VectorTileLayer) {
//     function MVTLayer(opt_options) {
//         var options = opt_options ? opt_options : {};
//         VectorTileLayer.call(/** @type {import("./Vector.js").Options} */ this, (options));
//     }
//
//     if ( VectorTileLayer ) MVTLayer.__proto__ = VectorTileLayer;
//     MVTLayer.prototype = Object.create( VectorTileLayer && VectorTileLayer.prototype );
//     MVTLayer.prototype.constructor = MVTLayer;
//
//     return MVTLayer;
// }(VectorTileLayer));
//
//
// MVTLayer.prototype.getSource;
// export default MVTLayer;
var mapCanvas = document.createElement("canvas");

var padding = 0.0;

var MVTLayer = function (ImageLayer) {
    function MVTLayer(opt_options) {

        this.options = opt_options;
        var options = opt_options ? opt_options : {};
        /*options.source = new ImageCanvasSource({
            canvasFunction: function () {
                return mapCanvas.getContext("2d");
            },
            projection: "EPSG:4490"
        });*/
        options.opacity = 0.5;
        ImageLayer.call(/** @type {import("./Vector.js").Options} */ this, (options));


    }

    if (ImageLayer) MVTLayer.__proto__ = ImageLayer;
    MVTLayer.prototype = Object.create(ImageLayer && ImageLayer.prototype);
    MVTLayer.prototype.constructor = MVTLayer;

    // accessToken: "pk.eyJ1IjoibGVla29uZyIsImEiOiJjanpmbnJkcWkwOG9jM2hvb2pwb2Fydmx1In0.KLZQvGAcjo5D88f43E4xhA"
    // attribution: null
    // attributionControl: false
    // bubblingMouseEvents: true
    // center: (2) [-77.032194, 38.912753]
    // container: div.leaflet-gl-layer
    // interactive: false
    // padding: 0.15
    // pane: "overlayPane"
    // style: "https://raw.githubusercontent.com/osm2vectortiles/mapbox-gl-styles/master/styles/bright-v9-cdn.json"
    // updateInterval: 32
    // zoom: 14

    // ccessToken: "pk.eyJ1IjoibGVla29uZyIsImEiOiJjanpmbnJkcWkwOG9jM2hvb2pwb2Fydmx1In0.KLZQvGAcjo5D88f43E4xhA"
    // attributionControl: false
    // center: {lng: 0, lat: 0}
    // container: div#map
    // glStyle: "https://raw.githubusercontent.com/osm2vectortiles/mapbox-gl-styles/master/styles/bright-v9-cdn.json"
    // interactive: false
    // renderMode: "hybrid"
    // style: "https://raw.githubusercontent.com/osm2vectortiles/mapbox-gl-styles/master/styles/bright-v9-cdn.json"
    // zoom: 1
    // __proto_

    MVTLayer.prototype.init = function init(map) {
        this._map = map;

        if (!this._glContainer) {
            this._initContainer();
        }

        var target = map.getTarget();
        var targetEle = map.getTargetElement();

        // var parentEle = targetEle.getElementsByClassName("ol-viewport")[0];
        // var before = parentEle.children[0];
        // parentEle.insertBefore(this._glContainer, before);
        //
        // parentEle.appendChild(this._glContainer);

        var view = this._map.getView();
        var center = view.getCenter();
        const ccc = transform(center, "EPSG:3857", "EPSG:4326");
        var cc = {
            lng: ccc[0],
            lat: ccc[1]
        };

        var ctx = mapCanvas.getContext('2d');
        // ctx.globalAlpha = 0.5;

        var options = L.extend({}, this.options, {
            container: this._glContainer,
            epsg: "EPSG:4490",
            canvas: mapCanvas,
            interactive: false,
            center: cc, // [center.lng, center.lat],
            zoom: view.getZoom()-1,
            style: this.options.glStyle,
            attributionControl: false,
            attribution: null,
            bubblingMouseEvents: true,
            padding: padding,
            hash: true,
            updateInterval: 32
        });



        // let url='http://localhost:8080/map/api/v1/styles/1';
        // var map = window.map = new mapboxgl.Map({
        //     container: 'map',
        //     epsg: 'EPSG:4490',
        //     hash: true,
        //     style: ''
        // });
        // this.map.setStyle(url)

        this._glMap = new mapboxgl.Map(options);

        // allow GL base map to pan beyond min/max latitudes
        this._glMap.transform.latRange = null;
        this._glMap._actualCanvas = this._glMap._canvas;

        L.DomUtil.addClass(this._glMap._actualCanvas, 'leaflet-image-layer');
        L.DomUtil.addClass(this._glMap._actualCanvas, 'leaflet-zoom-animated');
        // L.DomUtil.addClass(this._glContainer, 'ol-viewport');
        // L.DomUtil.addClass(this._glContainer, 'mapbox-map');

        map.on("postrender", this.render);
        map.on("movestart", this.movestart);
        map.on("moveend", this.moveend);
        map["owner"] = this;

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
        var p = new L.Point(viewSize[0], viewSize[1]);
        var offset = p.multiplyBy(0.15);

        container.style.width = size.x + 'px';
        container.style.height = size.y + 'px';

        var cp = new L.Point(0, 0);
        var cp2 = cp.subtract(offset);
        var topLeft = cp2;

        L.DomUtil.setPosition(container, topLeft);
    }


    MVTLayer.prototype._getSize = function _getSize() {
        var size = this._map.getSize();
        var p = new L.Point(size[0], size[1]);
        return p.multiplyBy(1 + padding * 2);
    }

    MVTLayer.prototype.render = function render(e) {

        var owner = e.map['owner'];

        var map = e.map;
        var view = map.getView();

        // L.DomUtil.getPosition(this._mapPane) || new L.Point(0, 0);
        //
        // this._offset = this._map.containerPointToLayerPoint([0, 0]);

      /*  if (this._zooming) {
            return;
        }*/

        var mapContainer = map.getTargetElement();
        var size = owner._getSize();
        var container = owner._glContainer;
        var gl = owner._glMap;

        var viewSize = map.getSize();
        var p = new L.Point(viewSize[0], viewSize[1]);
        var offset = p.multiplyBy(padding); // this._map.getSize().multiplyBy(this.options.padding);

        var cp = new L.Point(0, 0);
        var cp2 = cp.subtract(offset);
        var topLeft = cp2; // this._map.containerPointToLayerPoint([0, 0]).subtract(offset);

        L.DomUtil.setPosition(container, topLeft);

        var mapCenter = view.getCenter();
        const ccc = transform(mapCenter, "EPSG:4490", "EPSG:4490");
        var center = {
            lng: ccc[0],
            lat: ccc[1]
        }

        // gl.setView([center.lat, center.lng], this._map.getZoom() - 1, 0);
        // calling setView directly causes sync issues because it uses requestAnimFrame

        var tr = gl.transform;
        tr.center = mapboxgl.LngLat.convert([center.lng, center.lat]);
        tr.zoom = view.getZoom()-1;

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

    return MVTLayer;
}(ImageLayer)

export default MVTLayer;

//# sourceMappingURL=VectorTile.js.map
