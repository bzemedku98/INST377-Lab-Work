/* eslint-disable max-len */

/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/

/*
  ## Utility Functions
    Under this comment place any utility functions you need - like an inclusive random number selector
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
*/
function getRandomIntInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + newMin); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#restaurant_list');
  target.innerHTML = '';

  const listElement = document.createElement('ol');
  target.appendChild(listElement);
  list.forEach((item) => {
    const newElement = document.createElement('li');
    newElement.innerText = item.name;
    listElement.appendChild(newElement);
  });
  /*
        ## JS and HTML Injection
          There are a bunch of methods to inject text or HTML into a document using JS
          Mainly, they're considered "unsafe" because they can spoof a page pretty easily
          But they're useful for starting to understand how websites work
          the usual ones are element.innerText and element.innerHTML
          Here's an article on the differences if you want to know more:
          https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext

        ## What to do in this function
          - Accept a list of restaurant objects
          - using a .forEach method, inject a list element into your index.html for every element in the list
          - Display the name of that restaurant and what category of food it is
      */
}

function processRestaurants(list) {
  console.log('fired restaurants list');
  const range = [...Array(15).keys()];
  // eslint-disable-next-line no-unused-vars
  const newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length);
    return list[index];
  });

  return newArray;
  /*
          ## Process Data Separately From Injecting It
            This function should accept your 1,000 records
            then select 15 random records
            and return an object containing only the restaurant's name, category, and geocoded location
            So we can inject them using the HTML injection function

            You can find the column names by carefully looking at your single returned record
            https://data.princegeorgescountymd.gov/Health/Food-Inspection/umjn-t2iz

          ## What to do in this function:

          - Create an array of 15 empty elements (there are a lot of fun ways to do this, and also very basic ways)
          - using a .map function on that range,
          - Make a list of 15 random restaurants from your list of 100 from your data request
          - Return only their name, category, and location
          - Return the new list of 15 restaurants so we can work on it separately in the HTML injector
        */
}

function filterList(list, filterInputValue) {
  const newArray = list.filter((item) => {
    if (!item.name) { return; }
    const lowerCaseName = item.name.toLowerCase();
    const lowerCaseQuery = filterInputValue.toLowerCase();
    // eslint-disable-next-line consistent-return
    return lowerCaseName.includes(lowerCaseQuery);
  });
  return newArray;
}

function initMap() {
  const map = L.map('map').setView([38.7849, -76.8721], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

function markerPlace(array, map) {
  // const marker = L.marker([51.5, -0.09]).addTo(map);
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
  array.forEach((item, index) => {
    const {coordinates} = item.geocoded_column_1;
    L.marker([coordinates[1], coordinates[0]]).addTo(map);
    if (index === 0) {
      map.setView([coordinates[1], coordinates[0]], 10);
    }
  });
}

function initChart(chart) {
  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June'
  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [0, 10, 5, 2, 20, 30, 45]
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {}
  };

  return new Chart(
    chart,
    config
  );
}

async function mainEvent() {
  /*
          ## Main Event
            Separating your main programming from your side functions will help you organize your thoughts
            When you're not working in a heavily-commented "learning" file, this also is more legible
            If you separate your work, when one piece is complete, you can save it and trust it
        */
  // const pageMap = initMap();

  // the async keyword means we can make API requests
  const form = document.querySelector('.main_form'); // get your main form so you can do JS with it
  const submit = document.querySelector('#get-resto'); // get a reference to your submit button
  const loadAnimation = document.querySelector('.lds-ellipsis'); // get a reference to our loading animation
  const chartTarget = document.querySelector('myChart');
  submit.style.display = 'none'; // let your submit button disappear

  /*
          Let's get some data from the API - it will take a second or two to load
          This next line goes to the request for 'GET' in the file at /server/routes/foodServiceRoutes.js
          It's at about line 27 - go have a look and see what we're retrieving and sending back.
         */
  const results = await fetch('/api/foodServicePG');
  const arrayFromJson = await results.json(); // here is where we get the data from our request as JSON

  initChart(chartTarget);

  // This IF statement ensures we can't do anything if we don't have information yet
  // the question mark in this means "if this is set at all"
  if (arrayFromJson.data?.length > 0) { // Return if we have no data
    submit.style.display = 'block'; // let's turn the submit button back on by setting it to display as a block when we have data available

    // Let's hide our load button not that we have some data to manipulate
    loadAnimation.classList.remove('lds-ellipsis');
    loadAnimation.classList.add('lds-ellipsis_hidden'); // Let's turn the submit button back on by setting to display as a block when we have data available

    let currentList = [];

    form.addEventListener('input', (event) => {
      console.log('input', event.target.value);
      const filteredList = filterList(currentList, event.target.value);
      injectHTML(filteredList);
      // markerPlace(filteredList, pageMap);
    });

    // And here's an eventListener! It's listening for a "submit" button specifically being clicked
    // this is a synchronous event event, because we already did our async request above, and waited for it to resolve
    form.addEventListener('submit', (submitEvent) => {
      // This is needed to stop our page from changing to a new URL even though it heard a GET request
      submitEvent.preventDefault();

      // This constant will have the value of your 15-restaurant collection when it processes
      currentList = processRestaurants(arrayFromJson.data);

      // And this function call will perform the "side effect" of injecting the HTML list for you
      injectHTML(currentList);
      // markerPlace(currentList, pageMap);
    });
  }
}
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
