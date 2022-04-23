//Get Countries From Json File
char_typed = 0
triggers_found = [];
simmilar_found = [];
rythmes_found = [];
const searchcountry = async searchBox => {
  char_typed++;
  const res = await fetch('https://api.datamuse.com/sug?max=7&s='+searchBox);
  const words = await res.json();
  fits = []
  if (searchBox === "") {
    setHtml(fits);
  } else {
  //Get Entered Data
  wordle = await get_word();
  words.forEach(word => {
    word = word["word"]
    var kind = ""
    if (wordle[0] === word) {
      kind = " match";
      
      setTimeout(() => alert("the answer was " + word), 500)
      document.getElementById("search").disabled = "true";
    } else if (in_rel(word, wordle[1][0])) {
      kind = " trigger";
      if (triggers_found.includes(word) !== true) {
        triggers_found.push(word);
      }
    } else if (in_rel(word, wordle[1][1])) {
      kind = " simmilar";
      if (simmilar_found.includes(word) !== true) {
        simmilar_found.push(word);
      }
    } else if (in_rel(word, wordle[1][2])) {
      kind = " rythme";
      if (rythmes_found.includes(word) !== true) {
        rythmes_found.push(word);
      }
    }
    
    
    fits.push({"word":word, "kind":kind});
  })
  setHtml(fits);
}
};

// show results in HTML
const setHtml = async fits => {

    const html = fits
      .map(
        fit => `
     <div class="row${fit.kind}" onclick="hover(this.innerText).then(alert)">
        ${fit.word}
   </div>
     `
      )
      .join('');

    document.getElementById('wordlist').innerHTML = html;
    document.getElementById("simmilar").innerHTML = simmilar_found.join(", ");
    document.getElementById("trigger").innerHTML = triggers_found.join(", ");
    document.getElementById("rhyming").innerHTML = rythmes_found.join(", ");
    document.getElementById("letter").innerHTML = char_typed;
  
};

document
  .getElementById('search')
  .addEventListener('input', () => searchcountry(search.value));

async function hover(word) {
  res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+word);
  def = await res.json()
  words = def[0].meanings[0].definitions[0].definition
  return words;
}

function in_rel (word, rel) {
  in_it = false;
  rel.forEach(function (dep){
    if (dep.word.toLowerCase() === word.toLowerCase()) {
      in_it = true;
    }
  })
  return in_it;
}

var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
modal.style.display = "block";
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
