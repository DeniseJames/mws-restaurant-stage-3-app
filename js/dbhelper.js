if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() { // idb not defined this line
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
  const DATA_PORT = 1337; // Change this to your server port
  const RESTAURANTS_URL = `http://localhost:${DATA_PORT}/restaurants/`;
  const REVIEWS_URL = `http://localhost:${DATA_PORT}/reviews/`;
  
  var idbApp = (function() {
    'use strict';
    // check for support
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }
  
    const dbPromise = idb.open('restaurantDB', 5, function(upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          // a placeholder case so that the switch block will
          // execute when the database is first created
          // (oldVersion is 0)
        case 1:
          console.log('Creating the restaurant object store');
          upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        case 2:
        console.log('Creating the review object store');
        upgradeDb.createObjectStore('reviews', {keyPath: 'id', autoIncrement: true}); 
       case 3:
        console.log('Creating restaurant_id index');
        var store = upgradeDb.transaction.objectStore('reviews');
        store.createIndex('restaurant_id', 'restaurant_id');
       case 4:
       upgradeDb.createObjectStore('pending',  {keyPath: 'id', autoIncrement: true});  

      }
    }); 
  
    
   async function getReviewsByRestaurantId(){
    try{

        const db = await dbPromise;
        var tx = db.transaction('reviews', 'readonly');
        var store = tx.objectStore('reviews');
        const reviews = await store.getAll();
        return reviews;
       }
    catch(err) {
            console.log('Get reviews by restaurant id fetch failed', err);
          }
        } 
  
   async function getByID(id){
      try{
              const db = await dbPromise;
              const tx = db.transaction('restaurants');
              const store = tx.objectStore('restaurants');
              const restaurant = await store.get(id);
              console.log("restaurant by id", restaurant);
              return restaurant;
            }
      catch(err) {
              console.log('Get restaurant by id fetch failed', err);
            }
    } 
    async function mygetAll(){
        try {
         const db = await dbPromise;
          const tx = db.transaction('restaurants', 'readonly');
          const store = tx.objectStore('restaurants');
          const restaurants = await store.getAll();
          return restaurants;
        }
        catch(err) {
          console.log('restaurants cache fetch failed', err);
        }
    }
    async function mygetAllRestaurant(){
      try {
       const db = await dbPromise;
        const tx = db.transaction('restaurants', 'readonly');
        const store = tx.objectStore('restaurants');
        const restaurants = await store.getAll();
        return restaurants;
      }
      catch(err) {
        console.log('restaurants cache fetch failed', err);
      }
  }

    async function myGetAllReviews(){
      try {
       const db = await dbPromise;
        const tx = db.transaction('reviews', 'readonly');
        const store = tx.objectStore('reviews');
        const reviews = await store.getAll(self.restaurant.id);
        return reviews;
      }
      catch(err) {
        console.log('cache reviews fetch failed', err);
      }
    }
  
    function storeRestaurants() {
          return fetch(RESTAURANTS_URL)
          .then(function(response) {
            const rests = response.json();
            return rests;
            })
         // console.log(await 'fetched json restaurants', response.json())
          .then (function(restaurants){
              // put the JSON data in restaurants database
                return dbPromise.then(db => {
                const tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                restaurants.forEach(function (restaurants) {
                  store.put(restaurants);
          
               });
               console.log('fetched and stored in database restaurant', restaurants);  
               return restaurants;
              });
          })
          .catch(function(e) {return console.log('storeRestaurants failed ',e);
          })
    }  


  function storeReviews(id) {
     try {
      return fetch(REVIEWS_URL  + "?restaurant_id=" + id)
      .then(function (response) {
        reviews = response.json();
        return reviews
        })
      .then (function(reviews){
          // put the JSON data in reviews database
            return dbPromise.then(db => {
            const tx = db.transaction('reviews', 'readwrite');
            var store = tx.objectStore('reviews');
            reviews.forEach(function (review) {
              store.put(review);
           });
           console.log('fetched and stored in database restaurant', reviews);  
           return reviews;
        });
    });
  
} 
  catch(err) {
      console.log('database store reviews failed', err);
    }   
  }

  async function updateFavorite(restaurant_id, isFavorite) {
  try{
    // update the restaurant store with the new isFavorite status
    const db = await dbPromise;
    const tx = db.transaction('restaurants', 'readwrite');
    const store = tx.objectStore('restaurants');
    const id = restaurant_id;
    const restaurant = await store.get(id);
    restaurant.is_favorite = isFavorite;
    await store.put(restaurant);
    console.log('fetched and stored in database restaurants', restaurant);
  
    const config = {
      method: 'PUT',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
      //body: JSON.stringify(data)
    }
    var value = `http://localhost:1337/restaurants/${restaurant_id}/?is_favorite=${isFavorite}`

    response = await fetch(          
    `http://localhost:1337/restaurants/${restaurant_id}/?is_favorite=${isFavorite}`,
     config);
     
  }  
  catch(err){
    localStorage.setItem(restaurant_id, JSON.stringify(value));
    var test = JSON.parse(localStorage.getItem(restaurant_id));
    console.log('will retry to put favorite the server', test)
  }
}
  return {
      dbPromise: (dbPromise),
      mygetAll: (mygetAll),
      getByID: (getByID),
      storeRestaurants: (storeRestaurants),
      storeReviews: (storeReviews),
      myGetAllReviews: (myGetAllReviews),
      getReviewsByRestaurantId: (getReviewsByRestaurantId),
      updateFavorite: (updateFavorite),
      mygetAllRestaurant: (mygetAllRestaurant)
    };
  })();
  
  class DBHelper {

    static async postPendingFavoriteToServer(){
      try{
      const id = getParameterByName('id');
      const int_id = parseInt(id,10);
      const test = JSON.parse(localStorage.getItem(int_id));
      const config = {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }
          }
      const res = await fetch(test,config);  
      if (await res.ok){
        console.log('Success: posted new review on 1337', JSON.stringify(res.json));
        localStorage.clear()
        }
      // remove item from localStorage
      } 
      catch(err){
        console.log('postPendingFavoriteToServer()', err);
      }
    }
     
     // Attempt to post new review on the server
     static async tryPostReview(restaurant_id, name, rating, comment){
        try{
            // Attempt to post new review on the server
          var url = REVIEWS_URL;
          var data = { 
                "restaurant_id": restaurant_id,
                "name": name,
                "rating": rating,
                "comments": comment
              };

          let res = await fetch(url, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers:{
               'Content-Type': 'application/json'
                }
          });
          // the review was posted on 1337
          if (res.ok){
            console.log('Success: posted new review on 1337', JSON.stringify(res.json));
            return;
          }
        }
        catch(err){
          console.log( DBHelper.putReviewInPendingDb(restaurant_id, name, rating, comment));
        } 
      }

     static async putReviewInPendingDb(restaurant_id, name, rating, comment){
        try{
          const db = await idbApp.dbPromise;
          const tx = db.transaction('pending', 'readwrite');
          const store = tx.objectStore('pending');
          await store.put({
            "restaurant_id": restaurant_id,
            "name": name,
            "rating": rating,
            "comments": comment
          });

        }
        catch(err){
          console.log('putReviewInPendingDb function failed', err);
        }
     }      
  
     static async postPendingReviewsToServer(){
       try{
        // get all pending reviews in pending store
        const db = await idbApp.dbPromise;
        const tx = db.transaction('pending', 'readwrite');
        const store = tx.objectStore('pending');
        let pendingReviews = await store.getAll();
        // post each pending review on the server
        await DBHelper.forEachPendingReviews(pendingReviews);
       }
        catch(err){
        console.log("postPendingReviewsToServer() failed  ", err);
       }
    }

    static async postReviewToServer(pendingReview){
      try{
        console.log('pending review is ', pendingReview);
        const data = { 
          "restaurant_id": pendingReview.restaurant_id,
          "name": pendingReview.name,
          "rating": pendingReview.rating,
          "comments": pendingReview.comment
        };
        let res = await fetch(REVIEWS_URL, {
          method: 'POST', // or 'PUT'
          body: JSON.stringify(data), // data can be `string` or {object}!
          headers:{
           'Content-Type': 'application/json'
            }
        });  
        if (await res.ok){
          console.log('Success: posted new review on 1337', JSON.stringify(res.json));
          }
      }
      catch(err){
        console.log('postReviewToServer(pendingReview) failed ', err);
      }
    }

    static async forEachPendingReviews(pendingReviews){
     try{
          // 
          const promises = pendingReviews.map(DBHelper.postReviewToServer);
          //wait until all promises are resolved
          await Promise.all(promises);
          // clear the database
          const db = await idbApp.dbPromise;
          const tx = db.transaction('pending', 'readwrite');
          tx.objectStore('pending').clear();
              return tx.complete;
        }
     catch(err){
      console.log('forEachPendingReviews(pendingReviews ',err);
     }
    
}
    static fetchRestaurants() {
              return idbApp
                .mygetAll()
                .then(function (restaurants) {
                 // get data from database
                if (restaurants.length > 0) {
                       console.log('restaurants from cache', restaurants)
                   return restaurants;
                 }else{
                      // get data from network and store in database
                     return idbApp.storeRestaurants()
                     .then(function(fetched_restaurants){
                      console.log('restaurants from network', fetched_restaurants)
                       return fetched_restaurants;
                     })
                 }  // end of else
              })
              .catch(function(e) {return console.log('fetchRestaurants failed ' ,e);
              })         
        }
  /**
   * Fetch  reviews.
   */
    static async fetchReviews(id) {
      try {
        var reviews = await idbApp.myGetAllReviews();
        if (reviews.length > 0) {
            console.log('reviews from cache', reviews)
            return reviews;
        }else{
                   // get data from network and store in database
            reviews =  await idbApp.storeReviews(id);
            return reviews
            }  // end of else          
      }  
    catch (err) {
        console.log('reviews fetch failed', err);
        }
    }
  /**
   * Fetch a restaurant by its ID.
   */
  
  static async fetchReviewsByRestaurantId(id) {
   // fetch all restaurants with proper error handling.
   try{
  
    // first check reviews database for restaurant_id reviews
      let reviews = await idbApp.getReviewsByRestaurantId(id);
       console.log('fetchReviewsByRestaurantId are ', reviews);
      return reviews;
     
   }
   catch(err){
    console.log('fetch reviews by restaurant ID failed', err);
   }
  }
  
  static fetchRestaurantById(int_id) {
  // fetch all restaurants with proper error handling.
  try{
    return idbApp.getByID(int_id).then(function(restaurant){
     return restaurant
     });
  }
  catch(err){
   console.log('fetch restaurant by ID failed', err);
  }
  
  }
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }
  
  /**
   * Fetch restaurants by a neighborhood with proper error handling.   */
  static fetchRestaurantByNeighborhood() {
    // Fetch all restaurants
    try{
        return results = fetchRestaurants().then(function(results) {
          const results = restaurants.filter(r => r.neighborhood == neighborhood);
          return results;
        })    
    }
    catch (err){
        console.log('restaurant fetch failed', err);
    }
  }  
 
  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    try{
      // Fetch all restaurants
          restaurants = await DBHelper.fetchRestaurants();
          let results = restaurants;
          if (cuisine != "all") {
          // filter by cuisine
          results = await results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != "all") {
            // filter by neighborhood
            results = await results.filter(r => r.neighborhood == neighborhood);
          }
         return results;
        
    }
    catch(err)  {
      console.log('fetchRestaurantByCuisineAndNeighborhood failed ', err);
    }
  }

  /**
   * Fetch all neighboroods with proper error handling.
   */
  static async fetchNeighborhoods(restaurants) {
    // Fetch all restaurants
    try{
        // Get all neighborhoods from all restaurants
        const neighborhoods = await restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        let uniqueNeighborhoods = await neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        return uniqueNeighborhoods;
     }
    catch (err) {'fetch neighborhoods failed', err   }    
  }
  
  /**
   * Fetch all cuisines with proper error handling.
   */
  /**/
  static async fetchCuisines(restaurants) {
    try{  
         // Get all cuisines from all restaurants
       const cuisines = await restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        let uniqueCuisines = await cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        return uniqueCuisines;
     }
      catch (err) {
          console.log('fetch unique cuisines failed', err)  
    }
  }   
  
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
  
  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
  
    if(restaurant.photograph==undefined){
      return '../img/10.jpg'
  }else{
    return (`/img/${restaurant.photograph}` + '.jpg');
    }
  }
  
  
  static favoriteUpdate(restaurant_id, is_favorite){
    idbApp.updateFavorite(restaurant_id, is_favorite);
  }
  /**
   * Map marker for a restaurant.
   */
  
  static mapMarkerForRestaurant(restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
 /*   static mapMarkerForRestaurant(restaurant, map) {
      const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
   }
   static getStaticAllRestaurantsMapImage(restaurants) {
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    // Create static map image for initial display
    let mapURL = `http://maps.googleapis.com/maps/api/staticmap?center=${
    loc.lat},${loc.lng}&zoom=12&size=${
    document.documentElement.clientWidth}x400&markers=color:red`;
    restaurants.forEach(r => {
      mapURL += `|${r.latlng.lat},${r.latlng.lng}`;
    });
    mapURL += "&key=AIzaSyBKlmBk4YXWs3FDOGxCmOdwFEVcVPQdfkg";

    return mapURL;
  }

  */
  }
  