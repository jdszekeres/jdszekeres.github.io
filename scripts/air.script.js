var airports;
var total;
var guessed=[];
var code=document.getElementById("code");
async function start() {
  airports = await get_airport()
  total = airports.length;
  document.getElementById("guess").innerHTML=`you have guessed ${guessed.length}/${total} airports`
  await show()
}
start()
function add_table(guess) {
  td=document.createElement("div")
  td.innerHTML=`${guess.name} (${guess.iata})<img src="https://countryflagsapi.com/png/${guess.iso}" width="32px" height="16px">`
  document.getElementById("found").appendChild(td)
}
function find(event) {
    if (event.key === 'Enter') {
      var airport=search(airports,code.value)
      if (airport !== null) {
        if (!guessed.includes(airport)) {
          guessed.push(airport)
          document.getElementById("guess").innerHTML=`you have guessed ${guessed.length}/${total} airports`
          add_table(airport)
          code.value=""
        } 
      } else {
        try {
        alert(`you already guessed ${airport.iata}`)
        } catch (e) {
          alert("bad airport code")
        }
      }
  }
}

function add_lb() {
  setData(prompt("what is your name", "anonymous"), guessed.length)
  setTimeout(()=>{location.reload()},1000)
  
}
