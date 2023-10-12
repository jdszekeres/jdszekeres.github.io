const baseURL = 'https://us-central1-js-capstone-backend.cloudfunctions.net/api/games';
const currentGameID = 'airportgame-jdszekeres';
const add_lb = () => {
  uname = prompt("Username","anymous");
  setData(uname,total);
}
const setData = async (userName, userScore) => {
  const connect = await fetch(`${baseURL}/${currentGameID}/scores`, {
    method: 'POST',
    body: JSON.stringify({ user: userName, score: userScore }),
    headers: { 'Content-type': 'application/JSON' },
  });
  const receivedData = await connect.json();
  return receivedData;
};

const getData = async () => {
  const connect = await fetch(`${baseURL}/${currentGameID}/scores`);
  const scoreList = await connect.json();
  return scoreList;
};

const show = () => {
  const pointsTable = document.querySelector('#points');
  pointsTable.innerHTML = '';
  getData().then((dataList) => {
    if (!dataList) {
      return;
    }
    const higherFirst = dataList.result.sort((a, b) => b.score - a.score);
    higherFirst.forEach((data) => {
      const li = document.createElement('li');
      li.innerHTML = `<p>${data.user}: ${data.score}</p>`;
      pointsTable.appendChild(li);
    });
  });
};

