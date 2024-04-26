import * as _3d from './3d.js';
const name = document.getElementById("mat-name");
const width_slider = document.getElementById("material-width-slider")
const height_slider = document.getElementById("material-height-slider")
const depth_slider = document.getElementById("material-depth-slider")

const width_input = document.getElementById("material-width")
const height_input = document.getElementById("material-height")
const depth_input = document.getElementById("material-depth")

const pos_x = document.getElementById("px")
const pos_y = document.getElementById("py")
const pos_z = document.getElementById("pz")

const rot_x = document.getElementById("rx")
const rot_y = document.getElementById("ry")
const rot_z = document.getElementById("rz")

function set_materials_manager(data,object) {//call this when we select an object
    const edges = new _3d.THREE.EdgesGeometry( object.geometry );
    if (data.type !== "obj") {//we can't use it on 3d files since they have a diffrent structure
        const line = new _3d.THREE.LineSegments(edges, new _3d.THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
        object.add( line );
    }
    name.innerHTML = data["name"]
    let size = data.properties.size
    function setup_sliders() {
    width_slider.max = size.max_width
    width_slider.min = size.min_width
    height_slider.max = size.max_height
    height_slider.min = size.min_height
    depth_slider.max = size.max_depth
    depth_slider.min = size.min_depth
    if (object.scale === new _3d.THREE.Vector3(1,1,1)) {
        width_slider.value = size.default_width
        height_slider.value = size.default_height
        depth_slider.value = size.default_depth
    } 
    else {
        width_slider.value = object.scale.x * size.default_width
        height_slider.value = object.scale.y * size.default_height
        depth_slider.value = object.scale.z * size.default_depth
    }
    if (size.max_width - size.min_width < 10) {
        width_slider.step = 0.0025
    }
    if (size.max_height - size.min_height < 10) {
        height_slider.step = 0.0025
    }
    if (size.max_depth - size.min_depth < 10) {
        depth_slider.step = 0.0025
    }
    change_length_based_on_slider(width_slider,width_input)
    change_length_based_on_slider(height_slider,height_input)
    change_length_based_on_slider(depth_slider,depth_input)
    }
    if (data.type === 'raw_material') {
        setup_sliders();
    }
    function change_all() {
        change_length_based_on_slider(width_slider,width_input)
        change_length_based_on_slider(height_slider,height_input)
        change_length_based_on_slider(depth_slider,depth_input)
        change_object_size(object,data.properties.size,width_input.innerText,height_input.innerText,depth_input.innerText)

    }
    width_slider.onchange = change_all
    height_slider.onchange = change_all
    depth_slider.onchange = change_all
    if (data.type === 'raw_material') {
        document.getElementById("color-selector").innerHTML=""
        if (data.properties.colors !== "all") {
            let select = document.createElement("select")
            select.id="option-color-selector"
            data.properties.colors.forEach((hex)=>{
                let option = document.createElement("option")
                option.value = hex
                option.innerHTML = "#"+hex
                option.style.color="#"+hex
                select.appendChild(option)
                
            })
            select.addEventListener("change",function () {
                object.material.color.setHex( "#" + data.properties.colors[0] );
            })
            document.getElementById("color-selector").appendChild(select);
        
        } 
        else {
            let color_picker = document.createElement("input")
            color_picker.type = "color"
            color_picker.value = "#ff0000"
            color_picker.oninput=function () {
                object.material = new _3d.THREE.MeshBasicMaterial({ color: color_picker.value });
            
            }
            document.getElementById("color-selector").appendChild(color_picker);
        }
    }
    pos_x.value = object.position.x
    pos_y.value = object.position.y
    pos_z.value = object.position.z

    rot_x.value = _3d.THREE.MathUtils.radToDeg(object.rotation.x)
    rot_y.value = _3d.THREE.MathUtils.radToDeg(object.rotation.y)
    rot_z.value = _3d.THREE.MathUtils.radToDeg(object.rotation.z)

    
    
    pos_x.oninput= ()=>{object.position.x = parseFloat(pos_x.value);object.position.needsUpdate=true}
    pos_y.oninput= ()=>{object.position.y = parseFloat(pos_y.value)}
    pos_z.oninput= ()=>{object.position.z = parseFloat(pos_z.value)}

    rot_x.oninput= ()=>{object.rotation.x = parseFloat(_3d.THREE.MathUtils.degToRad(rot_x.value));object.rotation.needsUpdate=true;console.log(object)}
    rot_y.oninput= ()=>{object.rotation.y = parseFloat(_3d.THREE.MathUtils.degToRad(rot_y.value))}
    rot_z.oninput= ()=>{object.rotation.z = parseFloat(_3d.THREE.MathUtils.degToRad(rot_z.value))}
}
function unregister_materials(object) {
    document.getElementById("color-selector").innerHTML=""
    if (object) {
        object=object.object
        if (object.children) {
            for (let i = 0; i < object.children.length; i++) {
                if (object.children[i] instanceof _3d.THREE.LineSegments) {
                    object.remove(object.children[i]);
                }
            }
            _3d.renderer.render(_3d.scene,_3d.camera)
        }
        name.innerHTML = "None Selected"

        width_slider.onchange = () => {}
        height_slider.onchange = () => {}
        depth_slider.onchange = () => {}
        
        pos_x.oninput = ()=>{}
        pos_y.oninput = ()=>{}
        pos_z.oninput = ()=>{}

        rot_x.oninput = ()=>{}
        rot_y.oninput = ()=>{}
        rot_z.oninput = ()=>{}
        
    }
}
function change_length_based_on_slider(slider,input) {
    input.innerText = slider.value + "m";
}
function change_object_size(object,size,width,height,depth) {
    width = parseFloat(width)
    height = parseFloat(height)
    depth = parseFloat(depth)
    console.log(width,height,depth)
    let default_width = size.default_width
    let default_height = size.default_height
    let default_depth = size.default_depth
    object.scale.set(
        width / default_width,
        height / default_height,
        depth / default_depth
    
    ); //set the size proportional to the default size
}

export {set_materials_manager,unregister_materials}