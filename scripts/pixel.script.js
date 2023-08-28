var games = [];
var wallpapers;
var selected_bg = localStorage.getItem('wallpaper');
wallpaperImage(selected_bg)
var temp_paper = null;
var current_color = null;
var current_name = null;
async function start() {
    game_req = await fetch("../resources/pixel.game.json")
    wallpaper_req = await fetch("../resources/pixel.wallpapers.json")
    wallpapers = await wallpaper_req.json();
    setTimeout(()=>{wallpapers.forEach((x)=>{preloadImage(x)})},100)
    games = await game_req.json()
    games = games.sort(function (a,b) {
        return a.name.localeCompare(b.name)
    })

    games.forEach(game => {
        drawing = document.createElement("div");
        drawing.className = "flex previews";
        drawing.style.width = 7 + "vw";
        drawing.style.height = 7 + "vw";
        drawing.style.position = "relative";
        
        text = document.createElement("span");
        text.style.flexBasis = "100%";
        text.style.textAlign = "center";
        text.style.backgroundColor = "lightslategray";
        text.style.color = "white";
        text.style.fontFamily = "sans-serif";
        text.style.fontSize = "12px";

        text.appendChild(document.createTextNode(game.name));
        drawing.appendChild(text)
        
        for (i = 0; i < game.drawing.length; i++) {
          
          for (j = 0; j < game.drawing[i].length; j++) {
            tile = document.createElement("div");
            tile.className = "minitile";
            tile.style.backgroundColor = game.colors[game.drawing[i][j]];
            tile.style.width = 7/game.drawing[i].length + "vw";
            tile.style.height = 7/game.drawing.length + "vw";
            drawing.appendChild(tile);
          }
        }
        
        drawing.addEventListener("click", () => {load_puzzle(game)});
        if (localStorage.getItem("done-"+game.name) === "1") {
            console.log("already completed "+game.name);
            popup = document.createElement("div")
            popup.className = "popup"
            popup.appendChild(document.createTextNode("✅"))
            drawing.appendChild(popup);

        }
        document.getElementById("game-selector").appendChild(drawing);
      });
   document.getElementById("topbar").style.display = "block";   
}
function load_puzzle(game) {
    current_name = game.name;
    load_pallet(game);
    draw_puzzle(game);
}
function load_pallet(data) {
    document.getElementById("game-selector").style.display = "none";
    document.getElementById("pallet").innerHTML = ""
    Object.keys(data.colors).forEach((color) => {
        color_element = document.createElement("div");
        color_element.id = "pick-"+color;
        color_element.className = "color-picker";
        const style = color_element.style;
        
        style.backgroundColor = data.colors[color];
        color_element.setAttribute("q",data.colors[color]);
        style.color = chooseTextColor(data.colors[color]);
        style.width = "4vw";
        style.height = "4vw";
        style.flexShrink = 0;
        style.textAlign = "center";
        style.fontSize = "2.5vw";
        style.verticalAlign = "middle";
        style.borderWidth = "1px";
        style.borderStyle = "solid";
        style.borderColor = chooseTextColor(data.colors[color]);

        color_element.appendChild(document.createTextNode(color));
        color_element.addEventListener("click", colorfunction);
        function colorfunction(obj) {
            current_color = color;
            Array.from(document.querySelectorAll(".colorable.blank")).forEach(function (tile) {
                if (tile.getAttribute("color") == color) {
                    tile.style.color = "white"
                } else {
                    tile.style.color = "black"
                }
            })
            Array.from(document.getElementsByClassName("color-picker")).forEach((x) => {
                if (x.getAttribute("q") == data.colors[color]) {x.style.width = "5vw"; x.style.height = "5vw"} else {
                    x.style.width = "4vw"; x.style.height = "4vw";
                }
            })

        }
        document.getElementById("pallet").appendChild(color_element);
        document.addEventListener("keypress",(e) => {
            Array.from(document.getElementsByClassName("color-picker")).forEach((x) => {
                if (x.getAttribute("q") == data.colors[e.key]) {
                    x.click()
                }
            })
        })
    })
    
}
function draw_puzzle(data) {
    for (i=0; i<data.drawing.length; i++) {
        tr=document.createElement("tr")
        for (j=0; j<data.drawing[i].length; j++) {
            color_tile = document.createElement("td")
            color_tile.className = "colorable blank";
            color_tile.style.width = 70/data.drawing[i].length + "vmin";
            color_tile.style.height = 70/data.drawing.length + "vmin";
            color_tile.style.fontSize = 50/data.drawing[i].length + "vmin"
            color_tile.appendChild(document.createTextNode(data.drawing[i][j]))
            color_tile.setAttribute("x" , i)
            color_tile.setAttribute("y", j)
            color_tile.setAttribute("color", data.drawing[i][j])
            color_tile.addEventListener("mouseover", (function(i,j,c,d) {return function() {
                fill_tile(i,j,c,d);
            };})(i,j,color_tile,data))
            color_tile.onselectstart = function(e) {e.preventDefault();return false;}
            tr.appendChild(color_tile)
            document.getElementById("drawing-container").onselectstart = function(e) {e.preventDefault();return false;}
        }
        document.getElementById("drawing-container").appendChild(tr)
    }
}

function fill_tile(x,y,self,d) {
    if (self.className.includes("blank")) { 
        if (current_color == d.drawing[x][y]) { 
            self.style.backgroundColor = d.colors[d.drawing[x][y]]
            self.className = "colorable done"
            self.removeChild(self.childNodes[0])
        } else {
            console.log("mix")
            bg = "#808080"
            self.style.backgroundColor = `color-mix(in srgb, ${bg}, ${d.colors[current_color]})`
        }
        if (document.getElementsByClassName("blank").length === 0) {
            finished()
        }
    }
    
}

function finished() {
    modal = document.createElement("dialog")
    modal.style.position = "absolute"
    modal.style.left = "25% !Important"
    modal.style.top = "25% !Important"
    modal.style.width =  "50% !Important"
    modal.style.height = "50% !Important"
    modal.appendChild(document.createTextNode("Done"))
    form = document.createElement("form")
    form.method = "dialog"
    button = document.createElement("button")
    button.appendChild(document.createTextNode("OK"))
    reload = document.createElement("button")
    reload.appendChild(document.createTextNode("New"))
    reload.onclick = () => {location.reload()}
    form.appendChild(button)
    form.appendChild(reload)
    modal.appendChild(form)

    document.body.appendChild(modal)
    localStorage.setItem("done-"+current_name, "1")
    modal.show()
    
}

function settings_modal() {
    // Create <dialog> element
const dialog = document.createElement('dialog');
dialog.id = 'settings_menu';

dialog.appendChild(document.createElement('br'))
wallpaper_scroll = document.createElement('div')
wallpaper_scroll.id  = "side-scrollbar"
temp_paper = selected_bg
wallpapers.forEach((wallpaper) => {
    const button = document.createElement('button');
    button.onclick = () => {
        temp_paper = wallpaper
        Array.from(document.getElementsByClassName('wallpaper')).forEach((paper) => {
            if (paper.childNodes[0].src !== wallpaper) 
            {paper.style.backgroundColor = "transparent";}
            else {paper.style.backgroundColor = "yellow"}
        })
    }
    button.className = 'wallpaper';

    const img = document.createElement('img');
    img.src = wallpaper;
    img.width = "128";
    

    button.appendChild(img);
    wallpaper_scroll.appendChild(button);
})
setTimeout(()=>Array.from(document.getElementsByClassName('wallpaper')).forEach((paper) => {
    if (paper.childNodes[0].src !== temp_paper) 
    {paper.style.backgroundColor = "transparent";}
    else {paper.style.backgroundColor = "yellow"}
}),100)

// Create <form> element
dialog.appendChild(wallpaper_scroll)
stats = document.createElement('div');
title = document.createElement("h1");
title.appendChild(document.createTextNode("Statistics: "));
stats.appendChild(title);
completed_percent = document.createElement('span');
completed_percent.style.fontSize = "24px";
x=0;
Object.keys(localStorage).forEach(key => {if(key.includes("done-")){x++;}})
completed_percent.appendChild(document.createTextNode("Completed: " + x + "/"+games.length + "("+Math.round(x/games.length*100)+"%)"));
stats.appendChild(completed_percent)
dialog.appendChild(stats)
const form = document.createElement('form');
form.method = 'modal';

// Create <input> elements for the form
const cancelButton = document.createElement('button');
cancelButton.type = 'submit';
cancelButton.innerText = 'cancel';
cancelButton.style.cssText = 'box-shadow:inset 0px 39px 0px -24px #e67a73;background-color:#e4685d;border-radius:7px;border:1px solid #000000;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:15px;padding:16px 40px;text-decoration:none;text-shadow:0px 1px 0px #b23e35;';
cancelButton.onclick = () => {
    dialog.close()
    return false;
};

const saveButton = document.createElement('button');
saveButton.type = 'submit';
saveButton.innerText = 'Save';
saveButton.style.cssText = 'box-shadow: 0px 10px 14px -7px #3e7327; background: linear-gradient(to bottom, #77b55a 5%, #72b352 100%); background-color: #77b55a; border-radius: 7px; border: 1px solid #4b8f29; display: inline-block; cursor: pointer; color: #ffffff; font-family: Arial; font-size: 13px; font-weight: bold; padding: 16px 40px; text-decoration: none; text-shadow: 0px 1px 0px #6bad3e; } .saveButton:hover { background: linear-gradient(to bottom, #72b352 5%, #77b55a 100%); background-color: #72b352; } .saveButton:active { position: relative; top: 1px; }';

saveButton.onclick = () => {
    selected_bg = temp_paper
    localStorage.setItem("wallpaper",selected_bg);
    wallpaperImage(temp_paper)
    dialog.close();
    return false;
}

form.appendChild(cancelButton);
form.appendChild(saveButton);

dialog.appendChild(form);

// Append the dialog to the document body
document.body.appendChild(dialog);
dialog.show()

}
function showhidepreviews(e) {
    Array.from(document.querySelectorAll('.previews')).forEach(function (preview) {
        console.log(preview)
        if (preview.firstChild.innerText.toLowerCase().includes(e.value.toLowerCase())) {
            preview.style.display = "flex"
        } else {
            preview.style.display = "none"
        }
    })
}
// code returns black or white based on what is more readable
function chooseTextColor(t){let e=t.replace("#",""),r=parseInt(e.substring(0,2),16),s=parseInt(e.substring(2,4),16),n=parseInt(e.substring(4,6),16);return(.299*r+.587*s+.114*n)/255>.5?"black":"white"}
//loads a img to make sure it is cached
function preloadImage (url) {try {var _img = new Image();_img.src = url;} catch (e) { }}
function wallpaperImage (img) {document.body.style.backgroundImage = 'url(' + img + ')';document.body.style.backgroundSize = 'cover'}
// to start an async function without then chaining we call it 
start()
