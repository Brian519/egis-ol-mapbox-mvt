/**
 * Created by liufeng on 2019/8/19.
 */
import Feature from 'ol/Feature';
import {Polygon} from 'ol/geom';
import {Style,Fill,Stroke,Circle} from 'ol/style';
import VectorSource from 'ol/source/vector';
import VectorLayer from 'ol/layer/Vector';

function addPlotLayer(map) {
    //创建一个多变形
    var polygon = new Feature({
        geometry: new Polygon([[[116.339811227417, 39.87178623809814], [116.33509053955079, 39.86809674072265], [116.34280235443116,39.86818257141113],[116.339811227417, 39.87178623809814]]])
    });
//设置区样式信息
    polygon.setStyle(new Style({
        //填充色
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)'
        }),
        //边线颜色
        stroke: new Stroke({
            color: '#ffcc33',
            width: 2
        }),
        //形状
        image: new Circle({
            radius: 7,
            fill: new Fill({
                color: '#ffcc33'
            })
        })
    }));

//实例化一个矢量图层Vector作为绘制层
    var source = new VectorSource({
        features: [polygon]
    });
//创建一个图层
    var vector = new VectorLayer({
        source: source
    });
//将绘制层添加到地图容器中
    map.addLayer(vector);
}
export default addPlotLayer;
