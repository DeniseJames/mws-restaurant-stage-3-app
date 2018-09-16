let restaurants,
    neighborhoods,
    cuisines;
    var newMap
var markers = [];
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // added 
    fetchNeighborhoods();
    fetchCuisines();
    DBHelper.postPendingFavoriteToServer();
    setFavorite();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
    try{
        DBHelper.fetchNeighborhoods(self.restaurants, function( ) {
            return neighborhoods;
        })
        .then(function(neighborhoods){
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        })
    }    

    catch (err){
            console.log('fetch neighborhoods failed', err);
    }       
}


function fetchCuisines() {
    try{
     
        DBHelper.fetchCuisines(self.restaurants, function (cuisines){
            return cuisines;
        })
        .then(function (cuisines) {
            self.cuisines = cuisines;
                fillCuisinesHTML();
        })    
                        
        }
    catch (err){
        console.log('fetch cuisines failed', err);
    }  
}
/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Set cuisines HTML.
 */
// CUISINES ARE ALREADY DEFINED IN MAIN
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}
/**
 * Initialize  called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
          center: [40.722216, -73.987501],
          zoom: 12,
          scrollWheelZoom: false
        });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1IjoiZGphbWVzMiIsImEiOiJjam01ZWEzaTMzdGpvM3BwNGNmeWU5NW5hIn0.N8-BR5fXwwhP_4DwfNlx7Q',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(newMap);
     updateRestaurants();
  }
/*window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    /*var images = document.querySelectorAll(self.map, 'img');
    images.forEach(function(image) {
      image.alt = "Google Maps Image";
    });
    updateRestaurants();   
}*/
const updateRestaurants = () => {
    const cSelect = document.getElementById("cuisines-select");
    const nSelect = document.getElementById("neighborhoods-select");
  
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;
  
    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) 
    .then(function(restaurants){
        resetRestaurants(restaurants);
        return restaurants;
    })
   .then(function(){
        fillRestaurantsHTML();
    })   
  
  }

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Delete all map markers
    deleteMarkers();

    // Remove all map markers
    /*if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }*/
    self.markers = [];
    self.restaurants = restaurants;
}
      // Deletes all markers in the array by removing references to them.
    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

     // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setMapOnAll(null);
    }

      // Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
    }  
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    try{
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
        });
    fetchNeighborhoods(self.restaurants);
    fetchCuisines(self.restaurants);
    addMarkersToMap();
   }
    catch (err){
        console.log('fetch cuisines failed', err);
  }  
}  
/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = DBHelper.urlForRestaurant(restaurant);
    li.append(image);

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more)

    return li
}

addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
      marker.on("click", onClick);
      function onClick() {
        window.location.href = marker.options.url;
      }
    });
  } 

/*addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}*/
