/*Update the search bar and window title with the queryString in the URL*/
function updatePage() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("q");
  document.title = searchTerm + " - ER Search";
  let searchBar = document.getElementById("searchBar");
  searchBar.setAttribute("value", searchTerm);
  document.getElementById("relatedSearchTitle").innerHTML = searchTerm;
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

function sortByValue(obj) {
  let sortable = [];
  for (var o in obj) {
    sortable.push([o, obj[o]]);
  }
  sortable.sort(function (a, b) {
    return -(a[1] - b[1]);
  });
  return sortable;
}

async function getThumbnailURL(ent) {
  const targetURL =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      titles: ent,
      prop: "pageimages",
      format: "json",
      pithumbsize: 150,
      origin: "*",
    });

  const imageURL = fetch(targetURL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      response = data["query"]["pages"];
      let imageURL = [];
      for (page in response) {
        if ("thumbnail" in response[page]) {
          imageURL.push(response[page]["thumbnail"]["source"]);
        }
      }
      if (imageURL.length == 0) {
        return "./assets/images/no_image.png";
      }
      return imageURL[0];
    });
  return imageURL;
}

async function buildEntityElement(ent) {
  //let div = document.createElement("div");
  //div.classList.add("items-links");

  let itemEl = document.createElement("div");
  itemEl.classList.add("item");

  let a = document.createElement("a");
  a.title = ent;
  a.href = "https://en.wikipedia.org/wiki/" + ent;

  return getThumbnailURL(ent).then((imageURL) => {
    let imgEl = document.createElement("img");
    imgEl.src = imageURL;
    imgEl.alt = ent;
    imgEl.classList.add("item-logo");

    a.appendChild(imgEl);

    let p = document.createElement("p");
    p.classList.add("item-name");
    p.innerHTML = ent;

    a.appendChild(p);

    itemEl.appendChild(a);

    return itemEl;
  });
}

function buildEmptyEntityElement() {
  let itemEl = document.createElement("div");
  itemEl.classList.add("item");
  let loaderEl = document.createElement("div");
  loaderEl.classList.add("loader");
  itemEl.appendChild(loaderEl);
  return itemEl;
}

async function updateResultStats(numResults, timeElapsed) {
  let resultStatEl = document.getElementById("results-stats");
  resultStatEl.innerHTML = `About ${numResults} results (${timeElapsed.toFixed(2)} seconds)`;
}

async function getEntities() {
  const baseURL = window.location.protocol + "//" + window.location.hostname;
  const port = "5000";
  const path = "/erRetrieve";
  const targetURL = baseURL + ":" + port + path + "?";

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("q");

  //let response = await fetch(
  //  targetURL + new URLSearchParams({ q: searchTerm }),
  //);
  //let responseJSON = await response.json();

  //let responseJSON = {
  //    "Ancient_Egypt": 0.7213649749755859,
  //    "Antigonus_I_Monophthalmus": 0.6569240689277649,
  //    "Babylon": 1,
  //    "Cyrus_the_Great": 0.729214608669281,
  //    "Eumenes": 0.5769044756889343,
  //}
  let itemsLinks = document.getElementById("itemsLinks");
  let loaders = [
    buildEmptyEntityElement(),
    buildEmptyEntityElement(),
    buildEmptyEntityElement(),
    buildEmptyEntityElement(),
    buildEmptyEntityElement(),
  ];
  for (let i = 0; i < loaders.length; i++) {
    itemsLinks.appendChild(loaders[i]);
  }

  fetch(targetURL + new URLSearchParams({ q: searchTerm }))
    .then((response) => {
      return response.json();
    })
    .then(async (data) => {
      data = sortByValue(data);
      data = data.slice(0, 5);
      let i = 0;
      for (res in data) {
        // Make it await so that sort order is preserved
        let el = await buildEntityElement(data[res][0]);
        itemsLinks.replaceChild(el, loaders[i]);
        i++;
      }
    });
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
    let div = buildSearchResultElement(responseJSON[res]);
    searchResultsArea.appendChild(div);
  }
}

updatePage();
getResults();
getEntities();
