import * as THREE from 'three';
import * as _3d from './3d.js';
import * as _properties from './properties.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

var object = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var selected = null;

var object;

// Mouse position offset for smoother dragging
function register_handler(ele, data) {

    function onMaterialMouseDown(event) {
        function until(conditionFunction) {

          const poll = resolve => {
            if(conditionFunction()) resolve();
            else setTimeout(_ => poll(resolve), 400);
          }

          return new Promise(poll);
        }
        event.preventDefault();

        // Create a new mesh based on the material clicked in the sidebar
        if (data.type === 'raw_material') {
            var size = new THREE.BoxGeometry(data.properties.size.default_width, data.properties.size.default_height, data.properties.size.default_depth)
            if (data.properties.colors !== "all") {
                var color = new THREE.Color("#"+data.properties.colors[0])
                
            } else {
                var color = new THREE.Color("red")
            }
            var material = new THREE.MeshBasicMaterial({ color: color, transparent: data.properties.opacity !== 1, opacity:data.properties.opacity});
            object = new THREE.Mesh(size, material);
            setTimeout(()=>{object.material.color = color},1000)
            object.userData.data = data;
            // Calculate the offset between the mouse click position and the center of the dragged object
            object.position.set(0, 0, data.properties.size.default_depth / 2);
            
        } else if (data.type === 'obj') {
            

            let mtlLoader = new MTLLoader();
            mtlLoader.setPath("models/");
            mtlLoader.load(data.properties.mtl_file, function(materials)
            {
                materials.preload();
                var objLoader = new OBJLoader();
                objLoader.setPath("models/")
                var mats = {};
                Object.keys(materials.materials).forEach(function (key) {
                    let mat = materials.materials[key];
                    mat.color = new THREE.Color(mat.color.r * 255, mat.color.g * 255, mat.color.b * 255);
                    mats[key] = mat;
                });
                materials.materials = mats;
                objLoader.setMaterials(materials);
                objLoader.load(data.properties.obj_file, function(obj)
                {    
                    var geom = [];
                    obj.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            
                            var mesh = new THREE.Mesh( child.geometry, child.material);
                            mesh.scale.set(data.properties.scale.width,data.properties.scale.height,data.properties.scale.depth);
                            mesh.geometry.scale = mesh.scale;
                            mesh.geometry.computeBoundingBox();
                            mesh.geometry.boundingBox.max.x *= data.properties.scale.width
                            mesh.geometry.boundingBox.max.y *= data.properties.scale.height
                            mesh.geometry.boundingBox.max.z *= data.properties.scale.depth
                            mesh.geometry.boundingBox.min.x *= data.properties.scale.width
                            mesh.geometry.boundingBox.min.y *= data.properties.scale.height
                            mesh.geometry.boundingBox.min.z *= data.properties.scale.depth
                            _3d.datas[mesh.uuid] = data;//You select the mesh of the group not the actual group
                            geom.push(mesh.geometry);
                        }
                        
                    });
                    
                    geom = BufferGeometryUtils.mergeGeometries(geom);
                    geom.computeBoundingBox();
                    
                    obj.userData.data = data;
                    obj.position.set(0,0,(geom.boundingBox.max.z-geom.boundingBox.min.z)/2);
                    obj.rotation.set(THREE.MathUtils.degToRad(data.properties.rotation.x),THREE.MathUtils.degToRad(data.properties.rotation.y),THREE.MathUtils.degToRad(data.properties.rotation.z));
                    obj.scale.set(data.properties.scale.width,data.properties.scale.height,data.properties.scale.depth);
                    obj.scale.needsUpdate = true;
                    obj.geometry = geom;
                    obj.geometry.computeBoundingBox();
                    obj.geometry.boundingBox.max.x *= data.properties.scale.width
                    obj.geometry.boundingBox.max.y *= data.properties.scale.height
                    obj.geometry.boundingBox.max.z *= data.properties.scale.depth
                    obj.geometry.boundingBox.min.x *= data.properties.scale.width
                    obj.geometry.boundingBox.min.y *= data.properties.scale.height
                    obj.geometry.boundingBox.min.z *= data.properties.scale.depth

                    object = obj;
                    console.log(obj)
                });
            });
        }
        until(_ => object !== null).then(()=>{
            console.log(object)
            _3d.controls.center = object.position;
            _3d.blocks.push(object);

            _3d.scene.add( object );
            _properties.set_materials_manager(data,object);
            _3d.datas[object.uuid] = data;
            console.log(_3d.datas)
        })
        

    }
    // Add event listeners
    ele.addEventListener('mousedown', onMaterialMouseDown, false);

}

function onpointermove(event) {
    const rect = _3d.renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    pointer.x = (x / rect.width) * 2 - 1;
    pointer.y = (y / rect.height) * - 2 + 1

}
var startX;
var startY;
function onmousedown(event) {
    event.preventDefault();
    onpointermove(event);
      startX = event.pageX;
      startY = event.pageY;
    
}
function selected_func(event) {
    
    onpointermove(event);
    raycaster.setFromCamera(pointer, _3d.camera);
    let intersects = raycaster.intersectObjects(_3d.blocks);
    intersects = intersects.filter((arr, index, self) =>
        index === self.findIndex((t) => (t.object.uuid === arr.object.uuid)))

    _properties.unregister_materials(selected);//don't actually delete it, just remove it from materials manager
    if (intersects.length > 0) {
    //     do {
    //         if (!(intersects[0].object instanceof THREE.LineSegments)) {
    //             if (intersects[0].object.parent instanceof THREE.Group) {
    //                 intersects[0] = {object:intersects[0].object.parent,distance:intersects[0].distance}
    //             }
    //             break;
    //         }
        
    //         intersects.pop()
    //     } while (true)
        if (selected) { if (selected.object.uuid === intersects[0].object.uuid) { return; } } //dont't call it if it's already selected
        selected = intersects[0];

        var data = _3d.datas[selected.object.uuid];
        if (!(data)&&(selected.object.hasOwnProperty("parent"))) {
            if(_3d.datas[selected.object.parent.uuid]) {
                selected = {object:selected.object.parent}
                data = _3d.datas[selected.object.uuid]
            }
        }
        selected.object.userData.data = _3d.datas[selected.object.uuid];
        _properties.set_materials_manager(data, selected.object);

        _3d.camera.rotation.needsUpdate = true;
        _3d.controls.update();
        _3d.renderer.render(_3d.scene, _3d.camera);
    } else {
        
        const diffX = Math.abs(event.pageX - startX);
        const diffY = Math.abs(event.pageY - startY);
        console.log(diffX,diffY)
        if (diffX + diffY < 5) {
            _properties.unregister_materials(selected);
            selected = null;
        }
     }
}
function handle_keyboard(event) {//move object


    if (selected) {
        if (event.keyCode === 38) {
            event.preventDefault();
            selected.object.position.y += 0.05;
        } else if (event.keyCode === 40) {
            event.preventDefault();
            selected.object.position.y -= 0.05;
        } else if (event.keyCode === 39) {
            event.preventDefault();
            selected.object.position.x += 0.05;
        } else if (event.keyCode === 37) {
            event.preventDefault();
            selected.object.position.x -= 0.05;
        } else if (event.keyCode === 8) {
            console.log(selected);
            if (selected !== null && event.srcElement === document.body) {
                event.preventDefault();
                let UUID = selected.object.uuid;
                let id=-1;
                for (let i=0;i<_3d.blocks.length;i++) {
                    if (_3d.blocks[i].uuid === UUID) {
                        id = 1
                    }
                }
                _properties.unregister_materials(selected);
                _3d.scene.remove(selected.object);
                console.log(id)
                _3d.blocks.pop(id);
                selected = null;
            }
        } 
        _3d.renderer.render(_3d.scene, _3d.camera);
    }
}
function save(blob, filename) {
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    document.body.removeChild(link);
    for (let i =0; i < _3d.scene.children.length;i++){
        let child = _3d.scene.children[i];
        if(child instanceof _3d.Sky) {
            child.visible = true;
        }
    }
  
    // URL.revokeObjectURL( url ); breaks Firefox...
  }
function ondownload() {
    const exporter = new GLTFExporter();
    for (let i =0; i < _3d.scene.children.length;i++){
        let child = _3d.scene.children[i];
        if(child instanceof _3d.Sky) {console.log(child)
            child.visible = false;
        }
    }
    
    exporter.parse(
        _3d.scene,
        // called when the gltf has been generated
        function ( gltf ) {
    
            console.log( gltf );
            save(new Blob([gltf], { type: 'application/octet-stream' }), "world.glb");
            
    
        },
        // called when there is an error in the generation
        function ( error ) {
    
            console.log( 'An error happened' );
    
        },
        { binary: true}
    );
    
}
_3d.renderer.domElement.addEventListener("mousemove", onpointermove, false);
document.addEventListener("keydown", handle_keyboard);
document.getElementById("download").addEventListener("click", ondownload);
_3d.renderer.domElement.addEventListener("mousedown",onmousedown);
_3d.renderer.domElement.addEventListener("mouseup", selected_func)
export { register_handler, pointer, selected };

