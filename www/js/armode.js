// LOCATION ////////////////////////////////////////

var currentLatitude = null;
var currentLongitude = null;
var currentDirection = 0;
var currentAlpha = 0;
var currentTiltLR = 0;
var currentTiltFB = 0;
var currentAltitude = null;
var currentAccuracy = null;
var currentAltitudeAccuracy = null;
var currentHeading = null;
var currentSpeed = null;
var currentTimestamp = null;

// GOOGLE LOCATION
var currentLocation;
var map;
var routeId;
var currentMarker;
var service;
var directionsDisplay;
var directionsService;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMPASS CONFIG /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var compassOptFrequency = 1;
var compassID = null;

var compassOptions = {
  frequency: compassOptFrequency
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBSQL CONFIG //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var databaseSize = 5;

var webdb = openDatabase(
  "harpbeta",
  "1.1",
  "beta database by Mark Alueta",
  databaseSize * 1024 * 1024
);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OVERALL SETTINGS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// REMAPS
var rateToPercent = createRemap(0, 5, 0, 100);
var normalizeDegree = createRemap(0, -360, 360, 0);
var hoteltoRight = createRemap(1, 179, 9, -171);
var hoteltoLeft = createRemap(360, 180, 10, 190);
// var hoteltoUp = createRemap(,,,);
// var hoteltoDown = createRemap(,,,);

// -75 15 105 (180) old
// -345 15 375 (360) old
var hotelUpDown = createRemap(180, 0, 375, -345);
// var hotelbetaNeg = createRemap(-180,0,105,75);

/////////////////////////////////////////////////////////////////////
// GPS CONFIG ///////////////////////////////////////////////////////

var geoId = null;
var geoMonitorTimeout = null;
var geoTimeout = null;

//////////////////////////////////////////////////////////////////
// Load Scripts
var script_googlemaps = false;

/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CAMERA CONFIG ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const cameraOptions = {
  cameraPosition: "back"
};

// SETUP

var connection = null;

var checkhotelID = null;
var trackID = null;

document.addEventListener("deviceready", onDeviceReady, false);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// SENSORS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startDeviceOrientation() {
  window.addEventListener(
    "deviceorientation",
    function(eventData) {
      deviceOrientationHandler(
        eventData.gamma,
        eventData.beta,
        eventData.alpha
      );
    },
    false
  );
}

function startCamera() {
  let element = document.getElementById("Camera");
  CanvasCamera.initialize(element);
  CanvasCamera.start(cameraOptions);
}
function deviceOrientationHandler(tiltLR, tiltFB, dir) {
  currentAlpha = dir;
  currentTiltLR = tiltLR;
  currentTiltFB = tiltFB;

  setInnerHTML("NS-Beta", isitNull(currentTiltFB));
  setInnerHTML("NS-Gamma", isitNull(currentTiltLR));
  setInnerHTML("NS-Alpha", isitNull(currentAlpha));
}

function startCompass() {
  let element = document.getElementById("CompassCircle");
  let elemHeading = document.getElementById("CompassHeading");

  if (compassID != null) {
    navigator.compass.clearWatch(compassID);
  }
  compassID = navigator.compass.watchHeading(
    function(heading) {
      if (currentDirection.toFixed(0) != heading.magneticHeading.toFixed(0)) {
        currentDirection = heading.magneticHeading;
      }
      let val = currentDirection - 360;
      element.style.transform =
        "scale(1.3) rotate(" + Math.abs(val.toFixed(0)) + "deg)";
      elemHeading.innerHTML = Math.abs(currentDirection.toFixed(0)) + "&#176;";
      showHotels();
    },
    function(error) {
      console.log("Compass Error: " + error.code);
      alert("Compass Sensor Not Available");
      window.location = "mainmenu.html";
    },
    compassOptions
  );
}

function startgeolocation() {
  setBGColor("GPSsymbol", "orange");

  checkLSV("setting_gpsOptHighAccuracy");

  let gps_highaccuracy;

  if (localStorage.getItem("setting_gpsOptHighAccuracy") == "true") {
    gps_highaccuracy = true;
  } else {
    gps_highaccuracy = false;
  }

  let gps_options = {
    maximumAge: 0,
    enableHighAccuracy: gps_highaccuracy,
    timeout: 10000
  };

  if (geoId != null) {
    setBGColor("GPSsymbol", "orange");

    console.log("Restarting Geolocation... (" + Date() + ")");

    if (geoTimeout != null) {
      clearTimeout(geoTimeout);
    }
    geoTimeout = null;

    navigator.geolocation.clearWatch(geoId);

    geoId = navigator.geolocation.watchPosition(
      geoSuccess,
      geoFailed,
      gps_options
    );
  } else {
    setBGColor("GPSsymbol", "orange");
    console.log("Starting Geolocation... (" + Date() + ")");

    if (geoTimeout != null) {
      clearTimeout(geoTimeout);
    }
    geoTimeout = null;

    geoId = navigator.geolocation.watchPosition(
      geoSuccess,
      geoFailed,
      gps_options
    );
  }
}

function geoSuccess(position) {
  setBGColor("GPSsymbol", "lightgreen");

  console.log("-------------- GPS SUCCESS INFO ---------------------");

  console.log("Geolocation Success");

  let previousLongitude = currentLongitude;
  let previousLatitude = currentLatitude;
  let previousTimestamp = currentTimestamp;

  console.log(
    "PREVIOUS LON & LAT: " + previousLongitude + ", " + previousLatitude
  );
  console.log("PREVIOUS TIMESTAMP: " + previousTimestamp);

  console.log("-----------------");

  currentLongitude = position.coords.longitude;
  currentLatitude = position.coords.latitude;
  currentAltitude = position.coords.altitude;
  currentAccuracy = position.coords.accuracy;
  currentAltitudeAccuracy = position.coords.altitudeAccuracy;
  currentHeading = position.coords.heading;
  currentSpeed = position.coords.speed;
  currentTimestamp = position.timestamp;

  console.log("CURRENT TIMESTAMP: " + currentTimestamp);
  console.log(
    "CURRENT LON & LAT: " + currentLongitude + ", " + currentLatitude
  );
  console.log("CURRENT ACCURACY: " + currentAccuracy);
  console.log("CURRENT ALTITUDE: " + currentAltitude);
  console.log("CURRENT ALTITUDE ACCURACY: " + currentAltitudeAccuracy);
  console.log("CURRENT HEADING: " + currentHeading);
  console.log("CURRENT SPEED: " + currentSpeed);

  console.log("-------------------------------------------");

  setLS("setting_lastlocationLONG", currentLongitude);
  setLS("setting_lastlocationLAT", currentLatitude);

  setInnerHTML("NS-Longitude", isitNull(currentLongitude));
  setInnerHTML("NS-Latitude", isitNull(currentLatitude));
  setInnerHTML("NS-Accuracy", isitNull(currentAccuracy));
  setInnerHTML("NS-AltitudeAccuracy", isitNull(currentAltitudeAccuracy));
  setInnerHTML("NS-Altitude", isitNull(currentAltitude));
  setInnerHTML("NS-Heading", isitNull(currentHeading));
  setInnerHTML("NS-Timestamp", isitNull(currentTimestamp));

  if (
    previousLongitude != currentLongitude ||
    previousLatitude != currentLatitude
  ) {
    clearTimeout(geoMonitorTimeout);
    console.log("TIMER RESTARTED > Coordinates Changed");

    setMapCurrentLocation();
    findHotels();
  } else {
    if (geoMonitorTimeout != null) {
      clearTimeout(geoMonitorTimeout);

      if (previousTimestamp != currentTimestamp) {
        console.log(
          "TIMER RESTARTED > New Timestamp (" + currentTimestamp + ")"
        );
      } else {
        console.log("TIMER RESTARTED");
      }
    }
    geoMonitorTimeout = setTimeout(function() {
      console.log("TIMER EXPIRED > Restarting GPS");
      startgeolocation();
    }, 20000);
  }
}

function geoFailed(error) {
  setBGColor("GPSsymbol", "tomato");

  console.error("Geolocation Error (" + Date() + ")");

  console.error(error);

  if (geoTimeout != null) {
    clearTimeout(geoTimeout);
    geoTimeout = setTimeout(function() {
      setBGColor("GPSsymbol", "orange");
      startgeolocation();
    }, 5000);
  } else {
    geoTimeout = setTimeout(function() {
      setBGColor("GPSsymbol", "orange");
      startgeolocation();
    }, 5000);
  }
}

/////////////////////////////////////////////////////////////////
// CORDOVA FUNCTIONS ////////////////////////////////////////

function onDeviceReady() {
  document.addEventListener("pause", onPause, false);
  document.addEventListener("resume", onResume, false);
  document.addEventListener("menubutton", onMenuKeyDown, false);
  document.addEventListener("backbutton", onBackKeyDown, false);

  // setInterval(function(){ connectionSpeed(); }, 10000);

  // SET WEBSQL

  webdb.transaction(function(tx) {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)"
    );
  });

  connectionSpeed();

  proceed = false;

  // setVisibility("MainContent", "hidden");
  // setVisibility("SettingsForm", "hidden");
  // setVisibility("MainForm", "hidden")
  // setVisibility("RSErrorContainer", "hidden");
  // setVisibility("ConnectionContainer", "visible");

  if (typeof Storage !== "undefined") {
    console.log("LOCAL STORAGE SUPPORTED");
    initLS();
    resourcecheck();
  } else {
    console.error("LOCAL STORAGE NOT SUPPORTED");
    setVisibility("ConnectionContainer", "hidden");
    alert("LOCAL STORAGE NOT SUPPORTED");
    window.location = "mainmenu.html";
  }

  console.log("ONDEVICEREADY > FINISHED!");
}

function connectionSpeed() {
  // setBGColor("WIFIsymbol", "orange");
  // let imageAddr = "http://www.tranquilmusic.ca/images/cats/Cat2.JPG" + "?n=" + Math.random();

  let imageAddr =
    "https://sample-videos.com/img/Sample-jpg-image-50kb.jpg" +
    "?n=" +
    Math.random();
  let startTime, endTime;
  let downloadSize = 5616998;

  let download = new Image();
  download.onload = function() {
    onConnectionOnline();
    console.log("ONLINE");
    setTimeout(function() {
      connectionSpeed();
    }, 10000);
  };
  download.onerror = function() {
    onConnectionOffline();
    console.log("OFFLINE");
    setTimeout(function() {
      connectionSpeed();
    }, 10000);
  };
  download.src = imageAddr;
}

function startup() {
  // SET DEFAULT GOOGLE SETTINGS

  routeId = null;
  let last_long = parseFloat(localStorage.getItem("setting_lastlocationLONG"));
  let last_lat = parseFloat(localStorage.getItem("setting_lastlocationLAT"));

  currentLongitude = last_long;
  currentLatitude = last_lat;

  currentLocation = new google.maps.LatLng(currentLatitude, currentLongitude);

  map = new google.maps.Map(document.getElementById("GoogleMaps"), {
    center: currentLocation,
    zoom: 15
  });

  currentMarker = new google.maps.Marker({
    position: currentLocation,
    map: map,
    draggable: false,
    title: "You are here!"
  });

  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);

  initSettings();

  startCamera();
  startCompass();
  startDeviceOrientation();
  startgeolocation();

  console.log("STARTUP FINISHED!");
}

function onPause() {}

function onResume() {
  initLS();

  webdb.transaction(function(tx) {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)"
    );
  });

  startCamera();
}

function onBackKeyDown(e) {
  e.preventDefault();

  let settings = document.getElementById("SettingsForm");
  let hotel = document.getElementById("ShowHotel");

  if (settings.style.visibility == "visible") {
    setVisibility("SettingsForm", "hidden");
  } else if (hotel.style.visibility == "visible") {
    setVisibility("ShowHotel", "hidden");
  } else {
    if (confirm("Are you sure you want to exit this mode?")) {
      window.location = "mainmenu.html";
    }
  }
}

function onMenuKeyDown() {}

/////////////////////////////////////////////////////////////
// GOOGLE MAPS /////////////////////////////////////////////

function findHotels() {
  setMapCurrentLocation();

  let radius = parseInt(localStorage.getItem("setting_searchRadius"));

  let searchrequest = {
    location: currentLocation,
    radius: radius,
    type: ["lodging"]
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(searchrequest, searchcallback);
}

function getHotelDetails(place, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    place = JSON.stringify(place, null, 4);
    place = JSON.parse(place);

    console.log(place);

    webdb.transaction(function(tx) {
      let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";

      tx.executeSql(sqlstr, [place.place_id], function(tx, txresults) {
        console.log("WEBSQL SUCCESS > " + sqlstr);

        if (txresults.rows.length <= 0) {
          let sqlstr =
            "INSERT INTO hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);";

          tx.executeSql(
            sqlstr,
            [
              place.name,
              place.place_id,
              place.geometry.location.lat,
              place.geometry.location.lng,
              place.rating,
              place.user_ratings_total,
              place.formatted_address,
              place.formatted_phone_number,
              place.international_phone_number,
              place.plus_code.global_code,
              place.url,
              place.website,
              Date.now()
            ],
            function(tx, txresults) {
              console.log("WEBSQL SUCCESS > " + sqlstr);
            },
            function(tx, txerror) {
              console.error("WEBSQL ERROR > " + txerror.message);
            }
          );
        } else {
          let sqlstr =
            "UPDATE hotelcollection SET hotelname=?, latitude=?, longitude=?, rating=?, totalusers=?, address=?, phonenumber=?, intphonenumber=?, globalcode=?, url=?, website=?, last_update=? WHERE placeid=?;";

          tx.executeSql(
            sqlstr,

            [
              place.name,
              place.geometry.location.lat,
              place.geometry.location.lng,
              place.rating,
              place.user_ratings_total,
              place.formatted_address,
              place.formatted_phone_number,
              place.international_phone_number,
              place.plus_code.global_code,
              place.url,
              place.website,
              Date.now(),
              place.place_id
            ],

            function(tx, txresults) {
              console.log("WEBSQL SUCCESS > " + sqlstr);
            },
            function(tx, txerror) {
              console.error("WEBSQL ERROR > " + txerror.message);
            }
          );
        }
        if (place.reviews) {
          for (let i = 0; i < place.reviews.length; i++) {
            let sqlstr =
              "SELECT * FROM reviewcollection WHERE author_name=? AND placeid=?;";

            tx.executeSql(
              sqlstr,

              [place.reviews[i].author_name, place.place_id],

              function(tx, txresults) {
                if (txresults.rows.length <= 0) {
                  let sqlstr =
                    "INSERT INTO reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time) VALUES (?,?,?,?,?,?,?);";

                  tx.executeSql(
                    sqlstr,

                    [
                      place.place_id,
                      place.reviews[i].author_name,
                      place.reviews[i].author_url,
                      place.reviews[i].rating,
                      place.reviews[i].relative_time_description,
                      place.reviews[i].text,
                      place.reviews[i].time
                    ],
                    function(tx, txresults) {
                      console.log("WEBSQL SUCCESS > " + sqlstr);
                    },
                    function(tx, txerror) {
                      console.error("WEBSQL ERROR > " + txerror.message);
                    }
                  );
                } else {
                  let sqlstr =
                    "UPDATE reviewcollection SET author_url=?, rating=?, relative_time=?, comment=?, time=? WHERE placeid=? AND author_name=?;";

                  tx.executeSql(
                    sqlstr,

                    [
                      place.reviews[i].author_url,
                      place.reviews[i].rating,
                      place.reviews[i].relative_time_description,
                      place.reviews[i].text,
                      place.reviews[i].time,
                      place.place_id,
                      place.reviews[i].author_name
                    ],

                    function(tx, txresults) {
                      console.log("WEBSQL SUCCESS > " + sqlstr);
                    },
                    function(tx, txerror) {
                      console.error("WEBSQL ERROR > " + txerror.message);
                    }
                  );
                }
              },
              function(tx, txerror) {
                console.error("WEBSQL ERROR > " + txerror.message);
              }
            );
          }
        }
      });
    });
  } else {
    console.error("GET HOTEL DETAILS ERROR > " + status);
  }
}

function searchcallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      let place = service.getDetails(
        { placeId: results[i].place_id },
        getHotelDetails
      );

      console.log(place);
    }
  } else {
    console.error("SEARCH CALLBACK > " + status);
  }
}

function setMapCurrentLocation() {
  currentLocation = new google.maps.LatLng(currentLatitude, currentLongitude);

  map.setCenter(currentLocation);

  currentMarker.setPosition(currentLocation);
}

function setRoute() {
  webdb.transaction(function(tx) {
    let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";

    if (trackID != null) {
      tx.executeSql(
        sqlstr,
        [trackID],
        function(tx, txresults) {
          console.log("WEBSQL SUCCESS > " + sqlstr);

          if (txresults.rows.length > 0) {
            let row = txresults.rows.item(0);

            currentLocation = new google.maps.LatLng(
              currentLatitude,
              currentLongitude
            );

            checkLSV("setting_travelmode");

            directionsService.route(
              {
                origin: currentLocation,
                destination: new google.maps.LatLng(
                  row.latitude,
                  row.longitude
                ),
                travelMode: localStorage.getItem("setting_travelmode")
              },
              function(response, status) {
                if (status == "OK") {
                  directionsDisplay.setMap(map);
                  directionsDisplay.setDirections(response);
                } else {
                  console.error("ROUTE ERROR > " + status.message);
                }
              }
            );
          }
        },
        function(tx, txerror) {
          console.error("WEBSQL ERROR > " + txerror.message);
        }
      );
    } else {
      directionsDisplay.setMap(null);
    }
  });
}

////////////////////////////////////////////////////////////
// LOCAL STORAGE FUNCTIONS /////////////////////////////////

function initSettings() {
  if (typeof Storage !== "undefined") {
    switch (localStorage.getItem("setting_unitConversion")) {
      case "Metric":
        setInnerHTML("setting_unitConversion", "Metric (km)");
        break;
      case "Imperial":
        setInnerHTML("setting_unitConversion", "Imperial (yd)");
        break;
      default:
        checkLSV("setting_unitConversion", "Metric");
        initSettings();
        break;
    }

    switch (localStorage.getItem("setting_searchRadius")) {
      case "500":
        if (localStorage.getItem("setting_unitConversion") == "Imperial") {
          setInnerHTML("setting_searchRadius", "546 yards");
        } else {
          setInnerHTML("setting_searchRadius", "500 meters");
        }
        break;
      case "1000":
        if (localStorage.getItem("setting_unitConversion") == "Imperial") {
          setInnerHTML("setting_searchRadius", "1094 yards");
        } else {
          setInnerHTML("setting_searchRadius", "1 kilometer");
        }
        break;
      case "2000":
        if (localStorage.getItem("setting_unitConversion") == "Imperial") {
          setInnerHTML("setting_searchRadius", "1.24 miles");
        } else {
          setInnerHTML("setting_searchRadius", "2 kilometers");
        }
        break;
      default:
        checkLSV("setting_searchRadius", 1000);
        initSettings();
        break;
    }

    switch (localStorage.getItem("setting_switchRating")) {
      case "RATING":
        setInnerHTML("setting_switchRating", "Likert");
        break;
      case "PERCENT":
        setInnerHTML("setting_switchRating", "Percent");
        break;
      case "SWITCH TOUCH":
        setInnerHTML("setting_switchRating", "Switch");
        break;
      default:
        checkLSV("setting_switchRating", "RATING");
        initSettings();
        break;
    }

    switch (localStorage.getItem("setting_nerdStats")) {
      case "true":
        setInnerHTML("setting_nerdStats", "ON");
        setBGColor("setting_nerdStats", "mediumseagreen");
        setVisibility("NerdStats", "visible");
        break;
      case "false":
        setInnerHTML("setting_nerdStats", "OFF");
        setBGColor("setting_nerdStats", "tomato");
        setVisibility("NerdStats", "hidden");
        break;
      default:
        checkLSV("setting_nerdStats", false);
        initSettings();
        break;
    }

    switch (localStorage.getItem("setting_gpsOptHighAccuracy")) {
      case "true":
        setInnerHTML("setting_gpsOptHighAccuracy", "ON");
        setBGColor("setting_gpsOptHighAccuracy", "mediumseagreen");
        break;
      case "false":
        setInnerHTML("setting_gpsOptHighAccuracy", "OFF");
        setBGColor("setting_gpsOptHighAccuracy", "tomato");
        break;
      default:
        checkLSV("setting_gpsOptHighAccuracy", true);
        initSettings();
        break;
    }

    switch (localStorage.getItem("setting_fixedDistance")) {
      case "true":
        setInnerHTML("setting_fixedDistance", "ON");
        setBGColor("setting_fixedDistance", "mediumseagreen");
        break;
      case "false":
        setInnerHTML("setting_fixedDistance", "OFF");
        setBGColor("setting_fixedDistance", "tomato");
        break;
      default:
        checkLSV("setting_fixedDistance", false);
        initSettings();
        break;
    }

    switch (localStorage.getItem("setting_travelmode")) {
      case "WALKING":
        setInnerHTML("setting_travelmode", "WALKING");
        break;
      case "DRIVING":
        setInnerHTML("setting_travelmode", "DRIVING");
        break;
      case "BICYCLING":
        setInnerHTML("setting_travelmode", "BICYCLING");
        break;
      case "TRANSIT":
        setInnerHTML("setting_travelmode", "TRANSIT");
        break;
      default:
        checkLSV("setting_travelmode", "WALKING");
        initSettings();
        break;
    }
  } else {
    console.error("LOCAL STORAGE NOT SUPPORTED");
  }
}

function setSettings(input) {
  if (typeof Storage !== "undefined") {
    if (input == "setting_unitConversion") {
      switch (localStorage.getItem("setting_unitConversion")) {
        case "Metric":
          setLS("setting_unitConversion", "Imperial");
          initSettings();
          break;
        case "Imperial":
          setLS("setting_unitConversion", "Metric");
          initSettings();
          break;
        default:
          setLS("setting_unitConversion", "Metric");
          initSettings();
          break;
      }
    } else if (input == "setting_searchRadius") {
      switch (localStorage.getItem("setting_searchRadius")) {
        case "500":
          setLS("setting_searchRadius", 1000);
          initSettings();
          break;
        case "1000":
          setLS("setting_searchRadius", 2000);
          initSettings();
          break;
        case "2000":
          setLS("setting_searchRadius", 500);
          initSettings();
          break;
        default:
          setLS("setting_searchRadius", 1000);
          initSettings();
          break;
      }
    } else if (input == "setting_switchRating") {
      switch (localStorage.getItem("setting_switchRating")) {
        case "RATING":
          setLS("setting_switchRating", "PERCENT");
          initSettings();
          break;
        case "PERCENT":
          setLS("setting_switchRating", "RATING");
          initSettings();
          break;
        default:
          setLS("setting_switchRating", "RATING");
          initSettings();
          break;
      }
    } else if (input == "setting_nerdStats") {
      switch (localStorage.getItem("setting_nerdStats")) {
        case "true":
          setLS("setting_nerdStats", false);
          initSettings();
          break;
        case "false":
          setLS("setting_nerdStats", true);
          initSettings();
          break;
        default:
          setLS("setting_nerdStats", false);
          initSettings();
          break;
      }
    } else if (input == "setting_gpsOptHighAccuracy") {
      switch (localStorage.getItem("setting_gpsOptHighAccuracy")) {
        case "true":
          setLS("setting_gpsOptHighAccuracy", false);
          initSettings();
          break;
        case "false":
          setLS("setting_gpsOptHighAccuracy", true);
          initSettings();
          break;
        default:
          setLS("setting_gpsOptHighAccuracy", true);
          initSettings();
          break;
      }
    } else if (input == "setting_fixedDistance") {
      switch (localStorage.getItem("setting_fixedDistance")) {
        case "true":
          setLS("setting_fixedDistance", false);
          initSettings();
          break;
        case "false":
          setLS("setting_fixedDistance", true);
          initSettings();
          break;
        default:
          setLS("setting_fixedDistance", false);
          initSettings();
          break;
      }
    } else if (input == "setting_travelmode") {
      switch (localStorage.getItem("setting_travelmode")) {
        case "WALKING":
          setLS("setting_travelmode", "DRIVING");
          initSettings();
          break;
        case "DRIVING":
          setLS("setting_travelmode", "BICYCLING");
          initSettings();
          break;
        case "BICYCLING":
          setLS("setting_travelmode", "TRANSIT");
          initSettings();
          break;
        case "TRANSIT":
          setLS("setting_travelmode", "WALKING");
          initSettings();
          break;
        default:
          setLS("setting_travelmode", "WALKING");
          initSettings();
          break;
      }
    }
  } else {
    console.error("LOCAL STORAGE NOT SUPPORTED");
  }
  setRoute();
}
function setLS(settingLS, value) {
  if (typeof Storage !== "undefined") {
    localStorage.setItem(settingLS, value);
    checkLSV(settingLS, value);
  } else {
    console.error(
      "CAN'T SET LOCAL STORAGE ITEM " +
        settingLS +
        " BECAUSE LOCAL STORAGE IS NOT SUPPORTED"
    );
  }
}
function checkLSV(settingLS, defaultvalue) {
  if (
    localStorage.getItem(settingLS) === null ||
    localStorage.getItem(settingLS) == "undefined"
  ) {
    localStorage.setItem(settingLS, defaultvalue);
    // console.log("NO SETTING FOUND, CREATING SETTING > " + settingLS);
    checkLSV(settingLS, defaultvalue);
  } else {
    // console.log(settingLS + " : " + localStorage.getItem(settingLS));
  }
}

function initLS() {
  console.log(
    "----------------------------------------------------------------"
  );
  console.log("Initializing/Checking Local Storage");

  // SETTINGS //

  /* 

	[Variable Names]:



	setting_lastlocationLONG;
	setting_lastlocationLAT;

	setting_gpsOptHighAccuracy = (*true,false)
	setting_gpsOptTimeout = Number(default: 10000);

	setting_unitConversion (Metric,Imperial)
	setting_searchRadius = Number(default: 1000);
	setting_nerdStats = (true,*false);
	setting_fixedDistance = (true,*false);
	setting_travelmode = (*"WALKING","DRIVING","BICYCLING","TRANSIT")
	setting_switchRating = ("PERCENT",*"RATING");

	*/

  checkLSV("setting_lastlocationLONG", 125.02228379999998);
  checkLSV("setting_lastlocationLAT", 11.202780899999999);

  checkLSV("setting_gpsOptHighAccuracy", true);
  checkLSV("setting_gpsOptTimeout", 1000);

  checkLSV("setting_unitConversion", "Metric");
  checkLSV("setting_searchRadius", 1000);
  checkLSV("setting_nerdStats", false);
  checkLSV("setting_fixedDistance", false);
  checkLSV("setting_travelmode", "WALKING");
  checkLSV("setting_switchRating", "RATING");

  console.log(
    "----------------------------------------------------------------"
  );

  /////////////
}

////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// JAVASCRIPT FUNCTIONS //////////////////////////////////

function setTrackID(id) {
  if (trackID == null || trackID === "undefined") {
    trackID = id;
    setVisibility("HOTELsymbol", "visible");
  } else if (trackID == id) {
    trackID = null;
    setVisibility("HOTELsymbol", "hidden");
  } else {
    trackID = id;
    setVisibility("HOTELsymbol", "visible");
  }
  setRoute();
  // showHotels();
}

function resourcecheck() {
  // let btnfunc = document.getElementById("RSErrorBtnRetry")

  // setVisibility("MainForm", "hidden")
  // setVisibility("RSErrorContainer", "hidden");
  setVisibility("Checkup", "visible");
  setVisibility("ErrorDR", "hidden");

  if (script_googlemaps == false) {
    // includeScript("test.js", "Google Maps");
    includeScript(
      "https://maps.googleapis.com/maps/api/js?key=###&libraries=geometry,places",
      "Google Maps"
    );
  } else {
    setVisibility("Checkup", "hidden");
    startup();
  }
}

function includeScript(path, name) {
  setVisibility("Checkup", "visible");
  setVisibility("ErrorDR", "hidden");

  let btnfunc = document.getElementById("DRErrorBtn");

  let node = document.createElement("script"),
    okHandler,
    errHandler;

  node.src = path;

  if (name == "Google Maps") {
    okHandler = function() {
      this.removeEventListener("load", okHandler);
      this.removeEventListener("error", errHandler);
      script_googlemaps = true;
      resourcecheck();
    };
    errHandler = function(error) {
      this.removeEventListener("load", okHandler);
      this.removeEventListener("error", errHandler);
      script_googlemaps = false;
      btnfunc.onclick = function() {
        // includeScript("test.js", "Google Maps")
        includeScript(
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyDBRAJggWx0nDXOAPqJHky_8LIGg6v8cFc&libraries=geometry,places",
          "Google Maps"
        );
      };
      setVisibility("ErrorDR", "visible");
    };
  }

  node.addEventListener("load", okHandler);
  node.addEventListener("error", errHandler);

  document.body.appendChild(node);
}

function callSuccess(result) {
  console.log("CALL SUCCESS > " + result);
}
function callError(result) {
  console.error("CALL ERROR > " + result);
}

function limitString(input, limit) {
  if (input.length > limit) {
    return input.substr(0, limit) + "...";
  } else {
    return input;
  }
}

function showHotels() {
  webdb.transaction(function(tx) {
    let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";

    tx.executeSql(
      sqlstr,
      [checkhotelID],
      function(tx, txresults) {
        // console.log("WEBSQL SUCCESS > " + sqlstr);

        if (txresults.rows.length > 0) {
          let row = txresults.rows.item(0);

          let hc_hotelname = document.getElementById("HC_hotelname");
          let hc_distance = document.getElementById("HC_distance");
          let hc_direction = document.getElementById("HC_direction");
          let hc_circle = document.getElementById("HC_circle");
          let hc_rating = document.getElementById("HC_rating");
          let hc_users = document.getElementById("HC_users");
          let hc_trackbtn = document.getElementById("HC_trackbtn");
          let hc_trackbtntext = document.getElementById("HC_trackbtntxt");
          let hc_website = document.getElementById("HC_website");
          let hc_googlemaps = document.getElementById("HC_googlemaps");
          let hc_address = document.getElementById("HC_address");
          let hc_phonenumber = document.getElementById("HC_phonenumber");

          hc_hotelname.innerHTML = row.hotelname;
          hc_distance.innerHTML = lengthConv(
            distanceCalc(
              currentLongitude,
              currentLatitude,
              row.longitude,
              row.latitude
            ),
            "long"
          );
          hc_direction.innerHTML = setBearing(
            bearingCalc(
              currentLongitude,
              currentLatitude,
              row.longitude,
              row.latitude
            ),
            "long"
          );
          hc_circle.className = setCirclePercent(row.rating, "big");
          hc_rating.innerHTML = setRating(row.rating);

          if (row.totalusers > 0) {
            hc_users.innerHTML = row.totalusers;
          } else {
            hc_users.innerHTML = "0";
          }

          if (row.website != "undefined") {
            hc_website.style.color = "slateblue";
            hc_website.onclick = function() {
              window.open(row.website, "_blank");
            };
          } else {
            hc_website.style.color = "darkgray";
            hc_website.onclick = function() {};
          }
          if (row.url != "undefined") {
            hc_googlemaps.style.color = "slateblue";
            hc_googlemaps.onclick = function() {
              window.open(row.url, "_blank");
            };
          } else {
            hc_googlemaps.style.color = "darkgray";
            hc_googlemaps.onclick = function() {};
          }

          hc_trackbtn.onclick = function() {
            setTrackID(row.placeid);
            checkHotel(row.placeid);
          };

          if (row.placeid == trackID) {
            hc_trackbtn.style.backgroundColor = "orange";
            hc_trackbtntext.innerHTML = "UNTRACK";
          } else {
            hc_trackbtn.style.backgroundColor = "mediumseagreen";
            hc_trackbtntext.innerHTML = "TRACK";
          }

          hc_address.innerHTML = row.address;

          if (row.intphonenumber != "undefined") {
            hc_phonenumber.innerHTML = row.intphonenumber;
            hc_phonenumber.onclick = function() {
              window.plugins.CallNumber.callNumber(
                callSuccess,
                callError,
                row.intphonenumber,
                false
              );
            };
          } else {
            hc_phonenumber.innerHTML = "N/A";
            hc_phonenumber.onclick = function() {};
          }
        } else {
          setVisibility("ShowHotel", "hidden");
        }
      },
      function(tx, txerror) {
        console.error("WEBSQL ERROR > " + txerror.message);
      }
    );

    sqlstr = "SELECT * FROM reviewcollection WHERE placeid=?";

    tx.executeSql(
      sqlstr,
      [checkhotelID],
      function(tx, txresults) {
        console.log("WEBSQL SUCCESS > " + sqlstr);

        let hc_reviewsarea = document.getElementById("HC_reviewsarea");

        hc_reviewsarea.innerHTML = "";

        let revA =
          "<div class='HCReviewContainer'><div class='HCReviewRating'>";
        let revB = "</div><div class='HCComment'>";
        let revC = "</div><div class='HCReviewName'>";
        let revD = "</div><div class='HCReviewDate'>";
        let revE = "</div></div>";

        let amount = 0;

        if (txresults.rows.length > 0) {
          for (let i = 0; i < txresults.rows.length; i++) {
            let row = txresults.rows.item(i);

            if (row.comment.length > 0) {
              amount = amount + 1;
              hc_reviewsarea.innerHTML +=
                revA +
                row.rating +
                "/5" +
                revB +
                row.comment +
                revC +
                row.author_name +
                revD +
                row.relative_time +
                revE;
            }
          }
          if (amount == 0) {
            hc_reviewsarea.innerHTML =
              "<div class='noreviews'>There are no reviews with comments to be shown.</div>";
          }
        } else {
          hc_reviewsarea.innerHTML =
            "<div class='noreviews'>There are no reviews for this place yet.</div>";
        }
      },
      function(tx, txerror) {
        console.error("WEBSQL ERROR > " + txerror.message);
      }
    );
  });

  webdb.transaction(function(tx) {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)"
    );

    let sqlstr = "SELECT * FROM hotelcollection;";

    tx.executeSql(
      sqlstr,
      [],
      function(tx, txresults) {
        if (txresults.rows.length > 0) {
          let hotelblock = [];
          let hotelblockD = [];

          for (let i = 0; i < txresults.rows.length; i++) {
            let row = txresults.rows.item(i);

            let getdistance = distanceCalc(
              currentLongitude,
              currentLatitude,
              row.longitude,
              row.latitude
            );

            if (
              getdistance <=
              parseInt(localStorage.getItem("setting_searchRadius"))
            ) {
              hotelblock.push(row.placeid);
              hotelblockD.push(getdistance);
            }
          }

          for (let i = 0; i < hotelblockD.length; i++) {
            for (let x = i + 1; x < hotelblockD.length; x++) {
              if (hotelblockD[i] < hotelblockD[x]) {
                let tmp = hotelblockD[i];
                hotelblockD[i] = hotelblockD[x];
                hotelblockD[x] = tmp;

                let tmp2 = hotelblock[i];
                hotelblock[i] = hotelblock[x];
                hotelblock[x] = tmp2;
                i = 0;
                // break;
              }
            }
          }

          // console.log(hotelblock);

          let cardArea = document.getElementById("CardArea");

          let cardA = "<div id='";
          let cardB = "' onclick=checkHotel('";
          let cardC = "') class='CardForm'><div class='CardTitle'>";
          let cardD = "</div><div class='CardCircle'><div class='";
          let cardE = "'><span>";
          let cardF =
            "</span><div class='bar'></div><div class='fill'></div></div></div><div class='CardDistance'>";
          let cardG = "</div><div class='CardDirection'>";
          let cardH = "</div></div>";

          for (let x = 0; x < txresults.rows.length; x++) {
            let row = txresults.rows.item(x);

            if (hotelblock.includes(row.placeid)) {
              let bearing = bearingCalc(
                currentLongitude,
                currentLatitude,
                row.longitude,
                row.latitude
              );

              let angle = getHotelAngle(bearing);

              let hotelDirection = getHotelDirection(angle);

              if (document.getElementById(row.placeid)) {
                let existingcard = document.getElementById(row.placeid);

                existingcard.children[1].children[0].className = setCirclePercent(
                  row.rating,
                  "big"
                );
                existingcard.children[1].children[0].children[0].innerHTML = setRating(
                  row.rating
                );
                existingcard.children[2].innerHTML = lengthConv(
                  distanceCalc(
                    currentLongitude,
                    currentLatitude,
                    row.longitude,
                    row.latitude
                  ),
                  "short"
                );
                existingcard.children[3].innerHTML = setBearing(
                  bearingCalc(
                    currentLongitude,
                    currentLatitude,
                    row.longitude,
                    row.latitude
                  ),
                  "short"
                );
              } else {
                cardArea.innerHTML +=
                  cardA +
                  row.placeid +
                  cardB +
                  row.placeid +
                  cardC +
                  limitString(row.hotelname, 18) +
                  cardD +
                  setCirclePercent(row.rating, "big") +
                  cardE +
                  setRating(row.rating) +
                  cardF +
                  lengthConv(
                    distanceCalc(
                      currentLongitude,
                      currentLatitude,
                      row.longitude,
                      row.latitude
                    ),
                    "short"
                  ) +
                  cardG +
                  setBearing(
                    bearingCalc(
                      currentLongitude,
                      currentLatitude,
                      row.longitude,
                      row.latitude
                    ),
                    "short"
                  ) +
                  cardH;
              }

              document.getElementById(row.placeid).style.marginLeft =
                hotelDirection + "%";
              document.getElementById(row.placeid).style.zIndex =
                hotelblock.indexOf(row.placeid) + 20;

              if (row.placeid == trackID) {
                document.getElementById(row.placeid).style.border =
                  "0.5vh solid orange";
              } else {
                document.getElementById(row.placeid).style.border =
                  "0.5vh solid slateblue";
              }

              let hotelscale = createRemap(
                0,
                parseInt(localStorage.getItem("setting_searchRadius")),
                1,
                0
              );

              if (localStorage.getItem("setting_fixedDistance") == "true") {
                document.getElementById(row.placeid).style.transform =
                  "scale(0.7)";
                document.getElementById(row.placeid).style.marginTop = "15%";
              } else {
                document.getElementById(row.placeid).style.marginTop =
                  hotelUpDown(Math.abs(currentTiltFB)).toFixed(0) + "%";
                document.getElementById(row.placeid).style.transform =
                  "scale(" +
                  hotelscale(
                    distanceCalc(
                      currentLongitude,
                      currentLatitude,
                      row.longitude,
                      row.latitude
                    )
                  ) +
                  ")";
              }
            } else {
              if (document.getElementById(row.placeid)) {
                removeElement(row.placeid);
              }
            }
          }
        }
      },
      function(tx, txerror) {
        console.error("WEBSQL ERROR > " + txerror.message);
      }
    );
  });
}

function checkHotel(input) {
  checkhotelID = input;

  if (isitNull(input) != "NULL") {
    setVisibility("ShowHotel", "visible");
  }
}
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// DESIGN FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////

function onConnectionOnline() {
  setBGColor("WIFIsymbol", "lightgreen");
}
function onConnectionOffline() {
  setBGColor("WIFIsymbol", "tomato");
}

function setVisibility(element, status) {
  document.getElementById(element).style.visibility = status;
}

function setBGColor(element, color) {
  document.getElementById(element).style.backgroundColor = color;
}

function setInnerHTML(element, message) {
  document.getElementById(element).innerHTML = message;
}
function setTextColor(element, input) {
  document.getElementById(element).style.color = input;
}
function removeElement(elementId) {
  let element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}

function msgboxState(input) {
  switch (true) {
    case input == "EXITSETTINGS":
      setVisibility("SettingsForm", "hidden");
      break;
    case input == "OPENSETTINGS":
      initSettings();
      setVisibility("SettingsForm", "visible");
      break;
    case input == "EXITMODE":
      window.location = "mainmenu.html";
      break;
    case input == "EXITHOTEL":
      checkhotelID = null;
      setVisibility("ShowHotel", "hidden");
      break;
    default:
      console.error("MESSAGE BOX STATE > ERROR");
      break;
  }
}

function setRating(input) {
  checkLSV("setting_switchRating");

  if (input === "undefined") {
    return "?";
  }

  if (localStorage.getItem("setting_switchRating") == "PERCENT") {
    return rateToPercent(input).toFixed(0) + "%";
  } else if (localStorage.getItem("setting_switchRating") == "RATING") {
    return input;
  }
}

function setRatingColor(input) {
  if (input === "undefined") {
    return "slateblue";
  }

  input = rateToPercent(input);

  let low = 100 / 3;
  let medium = (100 / 3) * 2;

  switch (true) {
    case input >= 0 && input <= low:
      return "tomato";
      break;
    case input > low && input <= medium:
      return "orange";
      break;
    case input > medium && input <= 100:
      return "mediumseagreen";
      break;
    default:
      console.error("SET RATING COLOR ERROR");
      break;
  }
}

function setCirclePercent(input, size) {
  let low = 100 / 3;
  let medium = (100 / 3) * 2;

  let str;

  if (input === "undefined") {
    if (size == "big") {
      str = "c100 p100 big center";
    } else {
      str = "c100 p100 center";
    }
    return str;
  }

  let percent = rateToPercent(input);

  switch (true) {
    case percent >= 0 && percent <= low:
      if (size == "big") {
        str = "c100 p" + percent.toFixed(0) + " big center";
      } else {
        str = "c100 p" + percent.toFixed(0) + " center";
      }
      return str;
      break;
    case percent > low && percent <= medium:
      if (size == "big") {
        str = "c100 p" + percent.toFixed(0) + " big center orange";
      } else {
        str = "c100 p" + percent.toFixed(0) + " center orange";
      }
      return str;
      break;
    case percent > medium && percent <= 100:
      if (size == "big") {
        str = "c100 p" + percent.toFixed(0) + " big center green";
      } else {
        str = "c100 p" + percent.toFixed(0) + " center green";
      }
      return str;
      break;
    default:
      console.error("SET CIRCLE PERCENT ERROR");
      break;
  }
}

function isitNull(input) {
  if (input === "undefined" || input == null) {
    return "NULL";
  } else {
    return input;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CALCULATORS /////////////////////////////////////////////////////////////////////////////////////////////

function createRemap(inMin, inMax, outMin, outMax) {
  return function remaper(x) {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };
}

function bearingCalc(lon1, lat1, lon2, lat2) {
  let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  let x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  return toDegrees(Math.atan2(y, x));
}

function setBearing(input, setting) {
  input = input.toFixed(0);

  if (input < 0) {
    input = normalizeDegree(input);
  }

  // input = input + "&#176; ";

  // 0 - North
  // 45 - NorthEast
  // 90 - East
  // 135 - SouthEast
  // 180 - South
  // 225 - SouthWest
  // 270 - West
  // 315 - NorthWest
  // 360 - North

  switch (true) {
    case input >= 0 && input <= 22.5:
      if (setting == "short") {
        return input + "&#176; N";
      } else {
        return input + "&#176; North";
      }
      break;
    case input >= 22.6 && input <= 67.5:
      if (setting == "short") {
        return input + "&#176; NE";
      } else {
        return input + "&#176; Northeast";
      }
      break;
    case input >= 67.6 && input <= 112.5:
      if (setting == "short") {
        return input + "&#176; E";
      } else {
        return input + "&#176; East";
      }
      break;
    case input >= 112.6 && input <= 157.5:
      if (setting == "short") {
        return input + "&#176; SE";
      } else {
        return input + "&#176; Southeast";
      }
      break;
    case input >= 157.6 && input <= 202.5:
      if (setting == "short") {
        return input + "&#176; S";
      } else {
        return input + "&#176; South";
      }
      break;
    case input >= 202.6 && input <= 247.5:
      if (setting == "short") {
        return input + "&#176; SW";
      } else {
        return input + "&#176; Southwest";
      }
      break;
    case input >= 247.6 && input <= 292.5:
      if (setting == "short") {
        return input + "&#176; W";
      } else {
        return input + "&#176; West";
      }
      break;
    case input >= 292.6 && input <= 337.5:
      if (setting == "short") {
        return input + "&#176; NW";
      } else {
        return input + "&#176; Northwest";
      }
      break;
    case input >= 337.6 && input <= 360:
      if (setting == "short") {
        return input + "&#176; N";
      } else {
        return input + "&#176; North";
      }
      break;
    default:
      console.error("SET BEARING ERROR");
      break;
  }
}

function distanceCalc(lon1, lat1, lon2, lat2) {
  let R = 6371;
  let dLat = toRadians(lat2 - lat1);
  let dLon = toRadians(lon2 - lon1);

  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km
  d = d * 1000; // Distance in meters
  return d;
}

function lengthConv(input, setting) {
  let str;

  checkLSV("setting_unitConversion");

  if (localStorage.getItem("setting_unitConversion") == "Metric") {
    if (input >= 1000) {
      // meter to kilometer
      if (setting == "short") {
        str = (input / 1000).toFixed(2) + " km";
        return str;
      } else {
        str = (input / 1000).toFixed(2) + " kilometers";
        return str;
      }
    } else {
      if (setting == "short") {
        str = input.toFixed(0) + " m";
        return str;
      } else {
        str = input.toFixed(0) + " meters";
        return str;
      }
    }
  } else if (localStorage.getItem("setting_unitConversion") == "Imperial") {
    let foot = input * 3.2808399; // meter convert to foot

    if (foot >= 3) {
      // foot to yard
      if (setting == "short") {
        str = (input * 0.33333333).toFixed(2) + " yd";
        return str;
      } else {
        str = (input * 0.33333333).toFixed(2) + " yards";
        return str;
      }
    } else if (foot >= 5280) {
      // foot to miles
      if (setting == "short") {
        str = (input * 0.00018939).toFixed(2) + " mi";
        return str;
      } else {
        str = (input * 0.00018939).toFixed(2) + " miles";
        return str;
      }
    } else {
      if (setting == "short") {
        str = input.toFixed(0) + " ft";
        return str;
      } else {
        str = input.toFixed(0) + " feet";
        return str;
      }
    }
  }
}

function toDegrees(input) {
  return input * (180 / Math.PI);
}

function toRadians(input) {
  return input * (Math.PI / 180);
}

//////////////////////////////////////////////////////////////
// MATRIX CALCULATIONS //////////////////////////////////////

function getHotelDirection(angle) {
  if (angle >= 0 && angle <= 179) {
    return hoteltoRight(angle).toFixed(0);
  } else if (angle >= 180 && angle <= 360) {
    return hoteltoLeft(angle).toFixed(0);
  }
}

function getHotelAngle(bearing) {
  let angle;

  if (bearing > 0) {
    angle = currentDirection - Math.abs(bearing);
  } else if (bearing < 0) {
    angle = currentDirection + Math.abs(bearing);
  }

  if (angle > 360) {
    angle = angle - 360;
  } else if (angle < 0) {
    angle = angle + 360;
  }

  return angle;
}
