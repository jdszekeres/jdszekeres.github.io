const rmenu = document.getElementById("rmenu")
const div = document.getElementById("3d-viewer")

div.addEventListener(
    "contextmenu",
    function (e) {
        e.preventDefault();
        rmenu.style.display="block";
        rmenu.style.left = e.pageX + "px";
        rmenu.style.top = e.pageY + "px";
        rmenu.focus()
        document.addEventListener(
            "click",
            function () {rmenu.style.display="none";document.removeEventListener("click",this)}
        )
    }
)