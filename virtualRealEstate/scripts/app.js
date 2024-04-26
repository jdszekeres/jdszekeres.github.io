import * as _THREE from "./3d.js";
import * as _Materials from "./materials.js";
import * as _drag_handler from "./drag_handler.js";
import * as _properties from './properties.js';
import * as _tilemap from './tilemap.js';
import * as _context from './contextmenu.js';
_Materials.loadMaterials(_drag_handler.register_handler, _THREE);
// _tilemap.stitchTiles(
//     "https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=JPWduKmbflkklrVwwG14",
//     21,
//     [
//         32.957254, -117.190118,
//         32.955730, -117.188847
//     ]
// )

document.querySelector("#rmenu ul li a:first-of-type").addEventListener("click",()=>{_tilemap.openMapPopup(_THREE)})

