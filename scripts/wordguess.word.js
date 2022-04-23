Date.prototype.addDays=function(d) {
    return new Date(this.getTime() + d*86400000); // milliseconds
 };
async function word_for_today() {
    var start = new Date("04/21/22");
    var today = new Date();
    var Difference_In_Time = today.getTime() - start.getTime();
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    var list = await get_list();
    console.log("words until "+start.addDays(list.length));
    return list[Math.floor(Difference_In_Days)]
}
x = "";

async function get_list() {
    var res = await fetch("https://raw.githubusercontent.com/jdszekeres/jdszekeres.github.io/main/resources/wordguess.words.json");
    var json = await res.json();
    return json;
}

async function related(solution_word) {
    trigger_req = await fetch("https://api.datamuse.com/words?rel_trg="+solution_word);
    trigger = await trigger_req.json();
    sim_req = await fetch("https://api.datamuse.com/words?ml="+solution_word);
    sim = await sim_req.json();
    rythme_req = await fetch("https://api.datamuse.com/words?rel_rhy="+solution_word);
    rythme = await rythme_req.json();
    return [trigger, sim, rythme];
}


async function get_word() {
    p = await word_for_today();
    x = await related(p);
    return [p, x]; 
}
