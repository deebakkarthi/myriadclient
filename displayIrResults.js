function updateTitle() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("q");
  document.title = searchTerm + " - IR Search";
}

function updateSearchBar() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("q");
  let searchBar = document.getElementById("searchBar");
  searchBar.setAttribute("value", searchTerm);
}

function buildSearchResultElement(res) {
  let div = document.createElement("div");
  div.classList.add("search-result");
  let p = document.createElement("p");
  p.classList.add("result-text");
  p.innerHTML = res;
  div.appendChild(p);
  return div;
}

async function updateResultStats(numResults, timeElapsed) {
  let resultStatEl = document.getElementById("results-stats");
  resultStatEl.innerHTML = `About ${numResults} results (${timeElapsed.toFixed(2)} seconds)`;
}

async function getResults() {
  const baseURL = window.location.protocol + "//" + window.location.hostname;
  const port = "5000";
  const path = "/irRetrieve";
  const targetURL = baseURL + ":" + port + path + "?";

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("q");

  const start = performance.now();
  let response = await fetch(
    targetURL + new URLSearchParams({ q: searchTerm }),
  );
  const end = performance.now();
  let responseJSON = await response.json();
  const timeElapsed = (end - start) * 10e-3;
  const numResults = Object.keys(responseJSON).length;
  updateResultStats(numResults, timeElapsed);
  const searchResultsArea = document.getElementById("searchResultsBlock");
  for (res in responseJSON) {
    console.log(responseJSON[res]);
    let div = buildSearchResultElement(responseJSON[res]);
    searchResultsArea.appendChild(div);
  }
}

updateTitle();
updateSearchBar();
getResults();
