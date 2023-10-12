var airports = [];
var total = 0;
var guessed = [];
(function ()  {
    fetch("USAirports.json").then(x=>x.json()).then(x=>{airports=x;total = airports.length;document.getElementById("guessed2").innerText = total})

}) ()
document.getElementById("guesser").addEventListener("keypress", (event)=>{if (event.key === "Enter") {check_airport()}});

function check_airport() {
    value = document.getElementById("guesser").value
    info = undefined;
    airports.forEach((airport) => {
        if (airport.FAA == value.toUpperCase() && !guessed.includes(value.toUpperCase())) {
            info = airport
            guessed.push(value.toUpperCase())
            return;
        }
    })
    document.getElementById("airports").innerHTML += "<p class='airport'>"+info["name"]+" ("+info["FAA"]+")</p>"
    document.getElementById("guesser").value = ""
    document.getElementById("guessed1").innerText = guessed.length
    document.getElementById("guessed2").innerText = total
}
