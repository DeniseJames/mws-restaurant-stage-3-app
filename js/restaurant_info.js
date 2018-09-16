let restaurant;

'use strict'
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
   // Get is_favorite attribute from server and set the
   // favorites button to either true or false
   DBHelper.postPendingFavoriteToServer();
   
   setFavorite();
  
});

document.addEventListener('DOMContentLoaded', (event) => {  
    initMap();
  });
   /**
   * Initialize leaflet map
   */
  initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
      if (error) { // Got an error!
        console.error(error);
      } else {      
        self.newMap = L.map('map', {
          center: [restaurant.latlng.lat, restaurant.latlng.lng],
          zoom: 16,
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
        fillBreadcrumb();
        DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
      }
    });
  }  

/*window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
        
    });
            
}*/

function attemptPostReview(){
    try{
        
            // Get the data points for the review
            const name = document
              .getElementById("reviewName")
              .value;
            const rating = document
              .getElementById("reviewRating")
              .value - 0;
            const comment = document
              .getElementById("reviewComment")
              .value;
            const id = getParameterByName('id');
            //convert server string id to integer id
            const restaurant_id = parseInt(id,10);
            DBHelper.tryPostReview(restaurant_id, name, rating, comment);
            console.log("tryPostReview executed");
            window.location.reload();
        }
    catch(err){
            console.log('attemptPostReview() failed ', err)
    }
}

function toggleSwitch() {
  try{  

    var checkbox = document.getElementById('checked');
    // access properties using this keyword
    if ( checkbox.checked ) {
        // if checked ...
        console.log('checkbox should be true', checkbox.checked);
    } else {
        // if not checked ...
        console.log('checkbox should be false', checkbox.checked);
    }
    
    const id = getParameterByName('id');
    //convert server string id to integer id
    const restaurant_id = parseInt(id,10);
    DBHelper.favoriteUpdate(restaurant_id, checkbox.checked);
    }  
  catch(err){
      console.log('toggle switch failed',err);
  }
 }

function setFavorite(){ 
    const id = getParameterByName('id');
    //convert server string id to integer id
    const int_id = parseInt(id,10);
    DBHelper.fetchRestaurantById(int_id).then(function
    (restaurant){
        if (restaurant.is_favorite === false) {
            document.getElementById('checked').checked = "false"
            console.log('document.getElementById(checked) = false?', document.getElementById('checked').checked);
        } else if (restaurant.is_favorite === true) {
            document.getElementById('checked').checked = "true";
  
            console.log('document.getElementById(checked) = true?', document.getElementById('checked').checked);
        }
          /*console.log('now restaurant.is_favorite', restaurant.is_favorite);*/
       })
}

 function fetchRestaurantFromURL() {
    try{
        const id = getParameterByName('id');
        const int_id = parseInt(id,10);
        return DBHelper.fetchRestaurantById(int_id).then(function(restaurant){
            return restaurant
        }).then(function(restaurant){
            fillRestaurantHTML(restaurant);
            return restaurant
        }).then(function(restaurant){
            fillRestaurantHoursHTML(restaurant)
            return restaurant
        }).then(function(restaurant){
            fillReviewsHTML(restaurant);
            return restaurant;
        })
    }
    catch(err) {
        console.log('failed to fetch the restaurant object');
    }
}  

function fetchReviews()  {
    try{
    const id = getParameterByName('id');
    //convert server string id to integer id
    const restaurant_id = parseInt(id,10);
    reviews = DBHelper.fetchReviews(restaurant_id);
    return reviews;
    }
    catch(err){
        console.log(' fetchReviews failed ', err);
    }
}
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant ) => {
    self.restaurant = restaurant;
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = DBHelper.urlForRestaurant(restaurant);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (restaurant) => {
    operatingHours = restaurant.operating_hours
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Fetch revies 
 */
fillReviewsHTML = () => {
    //const string_id = getParameterByName('id');
    //const id = parseInt(string_id);
    fetchReviews()
    .then(function(reviews){
        const container = document.getElementById('reviews-container');
        const title = document.createElement('h3');
        title.innerHTML = 'Reviews';
        container.appendChild(title);
    
        if (!reviews) {
            const noReviews = document.createElement('p');
            noReviews.innerHTML = 'No reviews yet!';
            container.appendChild(noReviews);
            return;
        }
        const ul = document.getElementById('reviews-list');
        reviews.forEach(review => {
            ul.appendChild(createReviewHTML(review));
           
        });

        container.appendChild(ul);
    });

}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    // convert unix epoch date to readable time
    date.innerHTML = Date(review.date);
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
