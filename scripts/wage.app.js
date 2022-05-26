time = 0
wage = 13
$("#wage").on( "keydown",function(event) {
       if(event.which != 8 && event.which !=46 && event.which != 190 && isNaN(String.fromCharCode(event.which))){
           event.preventDefault(); 
       }
})
setInterval(function (){
  time = time + .1
  time = time
  wage = parseFloat(document.getElementById("wage").innerText) || 13
  document.getElementById("time").innerText = new Date(time * 1000).toISOString().substr(12, 9);
  money_earned = wage*(time/60/60)
  document.getElementById("total").innerHTML = money_earned.toFixed(2)
}, 100)
