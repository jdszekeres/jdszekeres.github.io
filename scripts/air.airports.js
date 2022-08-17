async function get_airport() {
  var json = await fetch("resources/airport.json");
  var resp = await json.json();
  final=[]
  resp.forEach((airport)=>{
    if (airport.type==="airport" && airport.name !== null && airport.size !== "small") {
      final.push(airport)
    }
  })
  return final
}
function search(airports,code) {
  p=null;
  airports.forEach((airport)=>{
    if (airport.iata === code.toUpperCase()) {
      p=airport
    }
  })
  return p
}
