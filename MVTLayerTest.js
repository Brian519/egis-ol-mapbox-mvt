import Map from 'ol/Map.js';
import View from 'ol/View.js';
import MVT from 'ol/format/MVT.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import {get as getProjection,addProjection} from 'ol/proj.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';

import TileLayer from 'ol/layer/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';

import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import Projection from 'ol/proj/Projection';
import addPlotLayer from './addPlotLayer';

import MVTLayer from "./MVTLayer";


var key = 'pk.eyJ1IjoibGVla29uZyIsImEiOiJjaWVvcmg4NzAwaTAyc2trbWtiaHVkd2hoIn0.5TFcOE0k_U_bVEmSnMaHVQ';

// Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
var resolutions = [];
for (var i = 0; i <= 8; ++i) {
    resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}

// Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
function tileUrlFunction(tileCoord) {
    return ('https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
        '{z}/{x}/{y}.vector.pbf?access_token=' + key)
        .replace('{z}', String(tileCoord[0] * 2 - 1))
        .replace('{x}', String(tileCoord[1]))
        .replace('{y}', String(-tileCoord[2] - 1))
        .replace('{a-d}', 'abcd'.substr(
            ((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1));
}


var layer = new MVTLayer({
    accessToken: 'pk.eyJ1IjoibGVla29uZyIsImEiOiJjanpmbnJkcWkwOG9jM2hvb2pwb2Fydmx1In0.KLZQvGAcjo5D88f43E4xhA',
    // style: "http://yjqz.geo-compass.com/api/v1/styles/1"
    glStyle: 'http://10.18.1.185/api/v1/styles/1',
    //glStyle: './1.json',
    // source: new VectorTileSource({
    //     attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
    //         '© <a href="https://www.openstreetmap.org/copyright">' +
    //         'OpenStreetMap contributors</a>',
    //     format: new MVT(),
    //     tileGrid: new TileGrid({
    //         extent: getProjection('EPSG:3857').getExtent(),
    //         resolutions: resolutions,
    //         tileSize: 512
    //     }),
    //     tileUrlFunction: tileUrlFunction
    // }),
    // style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text)
});

var tileLayer = new TileLayer({
    source: new OSM()
});


var tileSize = 512;

var urlTemplate = 'https://services.arcgisonline.com/arcgis/rest/services/' +
    'ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}';

var layer3 = new TileLayer({
    source: new XYZ({
        attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
        maxZoom: 16,
        projection: 'EPSG:4326',
        tileSize: tileSize,
        tileUrlFunction: function(tileCoord) {
            return urlTemplate.replace('{z}', (tileCoord[0] - 1).toString())
                .replace('{x}', tileCoord[1].toString())
                .replace('{y}', (-tileCoord[2] - 1).toString());
        },
        wrapX: true
    })
});

var proj = new Projection({
    axisOrientation: 'neu',
    code: 'EPSG:4490',
    units: 'degress',
    extent: [-180, -90, 180, 90],
    worldExtent: [-180, -90, 180, 90],
    global: true
});
addProjection(proj);

var tdtServer = "http://10.18.17.17:81";
tdtServer = "http://t4.tianditu.gov.cn";

//创建图层(xyz方式)
function crtLayerXYZ(type, proj, opacity){
    var layer = new TileLayer({
        source: new XYZ({
            url: tdtServer+'/DataServer?T='+type+'&x={x}&y={y}&l={z}&tk=4f62e1d82bd46e2ff470b291c2260156',
            projection: proj
        }),
        opacity: opacity
    });
    layer.id = type;
    return layer;
}



// 创建 天地图矢量 瓦片图层
var tiandituvec = crtLayerXYZ('vec_c',proj,1);

//创建地图分辨率相关参数参数，天地图默认从1级别开始切片，同步1级别
var topResolution = 360.0 / 512;
var res1 = [];
for (var zoom = 1; zoom < 22; zoom++) {
    res1[zoom] = topResolution / Math.pow(2, zoom);
}

var map = new Map({
    layers: [
        //tiandituvec,
        layer,
    ],
    target: 'map',
    view: new View({
        projection: 'EPSG:4490',
        center: [116, 40],
        minZoom: 1,
        resolutions:res1,
        zoom: 11
    })
});

setTimeout(function () {
    layer.setOpacity(0.6);
}, 3000);

layer.init(map);
addPlotLayer(map)

function setZoomLevel() {
    var zoomLevel = document.getElementById("zoomLevel");
    zoomLevel.innerHTML="级别:"+map.getView().getZoom();
}
setZoomLevel();
//查看zoom层级
map.getView().on("change:resolution", function (e) {
    setZoomLevel();
})

