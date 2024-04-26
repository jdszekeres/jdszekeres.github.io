import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import {OpenStreetMapProvider,GeoSearchControl} from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import haversine from 'haversine-distance'

window.type = true; //bugfix

async function stitchTiles(apikey, bounds) {
    // Calculate the width and height of the resulting image
    let minLat = bounds[0];
    let minLng = bounds[1];
    let maxLat = bounds[2];
    let maxLng = bounds[3];

    let a = Math.min(minLat, maxLat);
    let b = Math.max(minLat, maxLat);
    let c = Math.min(minLng, maxLng);
    let d = Math.max(minLng, maxLng);
    minLat = a;
    maxLat = b;
    minLng = c;
    maxLng = d;
    console.log(minLat,minLng)
    console.log(maxLat,maxLng)
    
    const smartClamp = (num) => {
        return Math.max(Math.min(Math.ceil(num), 1280), 1);

    }
    var dimensions = [
        haversine([minLat, minLng], [maxLat, minLng]),
        haversine([minLat, minLng], [minLat, maxLng])

    ]
    dimensions.reverse();
    
    // let di = Array.from(dimensions)
    // if (di[0] > 128 || di[1]>128) {
    //     if (di[0] > di[1]) {
    //         let aspect_ratio = di[1] / di[0]
    //         di[0] = 128;
    //         di[1] = 128 * aspect_ratio;
    //     } else {
    //         let aspect_ratio = di[0] / di[1]
    //         di[1] = 128;
    //         di[0] = 128 * aspect_ratio;
    //     }
    // }
    return { url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/[${minLng},${minLat},${maxLng},${maxLat}]/${smartClamp(dimensions[0] * 5)}x${smartClamp(dimensions[1] * 5)}@2x?padding=10,10,10,10&access_token=${apikey}`, dimensions: dimensions };
}

function openMapPopup(THREE) {
    let dialog = document.createElement('dialog');
    dialog.style = "position:absolute;width:60%;height:75%;top:50%;left:50%;transform: translate(-50%, -50%);"
    let map_div = document.createElement("div");
    dialog.appendChild(map_div);
    map_div.style = "height:calc(100% - 50px);width:100%"
    const map = new L.Map(map_div, {
        center: [34.118222, -118.300389],
        zoom: 20,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,

        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const provider = new OpenStreetMapProvider();
    const search = new GeoSearchControl({
      provider: provider,
      style: "bar"
    }).addTo(map);
    
    var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    var options = {
        draw: {
            polygon: false,
            polyline: false,
            circle: false,
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            },
            marker: false,
            circlemarker: false
        },

        edit: {
            featureGroup: editableLayers, //REQUIRED!!
            remove: true
        }
    }
    var drawControlEditOnly = new L.Control.Draw({
        edit: {
            featureGroup: editableLayers
        },
        draw: false
    });
    var drawControl = new L.Control.Draw(options);

    var bbox = null;
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, function(e) {
        var layer = e.layer;
        if (L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) < 20000) {
            bbox = layer.getBounds();
            layer.addTo(editableLayers);
            drawControl.remove(map);
            drawControlEditOnly.addTo(map)
        } else {
            alert("object cannot be larger that 20,000m²(2ha)")
        }
    });
    map.on("draw:deleted", function(e) {
        drawControlEditOnly.remove(map);
        drawControl.addTo(map);
        bbox = null;
    });
    document.body.appendChild(dialog);
    let cancel_button = document.createElement("button")
    cancel_button.innerText = "cancel";
    cancel_button.addEventListener("click", () => { map.off(); map.remove(); dialog.remove(); })
    let submit_button = document.createElement("button")
    submit_button.innerText = "submit";
    submit_button.addEventListener("click", () => {
        if (bbox === null) { return; }
        let bbox_ne = bbox.getNorthEast();
        let bbox_sw = bbox.getSouthWest();
        let bbox_arr = [bbox_ne.lat, bbox_ne.lng, bbox_sw.lat, bbox_sw.lng];
        stitchTiles("pk.eyJ1IjoieW9wbyIsImEiOiJjbDA0bzhoM2EwMWhiM2NxajV2Zm1lYmpyIn0.kL4KlQH8tl89C6dJtL31gw", bbox_arr).then((response) => { THREE.modify_plane(response) });
        map.off();
        map.remove();
        dialog.remove();


    }
    )
    dialog.appendChild(cancel_button);
    dialog.append(submit_button);
    dialog.show();
    dialog.focus();
    map.invalidateSize();

}
export { stitchTiles, openMapPopup };