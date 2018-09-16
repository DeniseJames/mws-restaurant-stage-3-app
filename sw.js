
var staticCacheName = 'restaurant-cache-v1';

(function() {
  'use strict';

  // cache the application shell
  var filesToCache = [
     '.',
    'js/idb.js',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'css/styles.css',
    'index.html',
    'restaurant.html'
  ];
    
  self.addEventListener('install', function(event) {
   // console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
      caches.open(staticCacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      })
    );
  });

  // The fetch event listener intercepts all requests. We use 
  //event.respondWith to create a custom response to the request. 
  //Here we are using the Cache falling back to network strategy: 
  //we first check the cache for the requested resource (with caches.match)
  // and then, if that fails, we send the request to the network.
  self.addEventListener('fetch', function(event) {
    //console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          //console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        //console.log('Network request for ', event.request.url);
        return fetch(event.request).then(function(response) {
          //  Respond with custom 404 page
          if (response.status === 404) {
            return caches.match('pages/404.html');
          }

        return caches.open(staticCacheName).then(function(cache) {
          if (event.request.url.indexOf('test') < 0) {
             cache.put(event.request.url, response.clone());
            }
            return response;
          });
        });
  
      }).catch(function(error) {
     })
    );
  });

 /*
    console.log('Activating new service worker...');
  
    var cacheWhitelist = [staticCacheName];
  
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });*/



})();