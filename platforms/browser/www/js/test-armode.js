



// LOCATION //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
// GPS CONFIG ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var gpsOptHighAccuracy = false;
var gpsOptTimeout = 10000;

var gpsOptions = {
	maximumAge: 0,
	enableHighAccuracy: gpsOptHighAccuracy,
	timeout: gpsOptTimeout
}


	var geoId = null;
	var geoMonitorTimeout = null;
	var geoTimeout = null;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CAMERA CONFIG ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const cameraOptions = {
	cameraPosition: 'back'
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMPASS CONFIG /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var compassOptFrequency = 1;
var compassID = null;

var compassOptions = {
	frequency: compassOptFrequency
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBSQL CONFIG //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var databaseSize = 5;

var webdb = openDatabase(
	'harpbeta', 
	'1.1', 
	'beta database by Mark Alueta',
	databaseSize * 1024 * 1024);




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OVERALL SETTINGS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// REMAPS
	var rateToPercent = createRemap(0,5,0,100);
	var hoteltoRight = createRemap(1,179,6,-174);
	var hoteltoLeft = createRemap(360,180,7,187);
	// var hoteltoUp = createRemap(,,,);
	// var hoteltoDown = createRemap(,,,);

	// -75 15 105 (180)
	// -345 15 375 (360)
	var hotelUpDown = createRemap(180,0,375,-345);
	// var hotelbetaNeg = createRemap(-180,0,105,75);





var setting_unitConversion = "Metric";
var setting_searchRadius = 1000;
var setting_nerdStats = true;
var setting_fixedDistance = false;
var setting_travelmode = "WALKING";
var setting_switchRating = "PERCENT";
var setting_trackingID = null;

var checkhotelID = null;
var trackID = null;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LISTENERS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("deviceready", onDeviceReady, false);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CORDOVA FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startup(){

	

    // SET DEFAULT GOOGLE SETTINGS

    routeId = null;
    currentLocation = new google.maps.LatLng(11.202780899999999,125.02228379999998);

    map = new google.maps.Map(
    	document.getElementById("googlemap"),
    	{
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


    // START SENSORS

    startCamera();
    startCompass();
    startDeviceOrientation();
    startgeolocation();

}


function onDeviceReady(){
	document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);
    document.addEventListener("backbutton", onBackKeyDown, false);


    webdb.transaction(function(tx){
    	tx.executeSql("CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)");
    	tx.executeSql("CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)");

    });

    connectionSpeed();

    proceed = false;

    if(typeof(Storage) !== "undefined"){

    }
    else{
    	console.error("LOCAL STORAGE NOT SUPPORTED");

    	alert("LOCAL STORAGE NOT SUPPORTED");
    	window.location = "mainmenu.html";
    }
    

    console.log("ONDEVICEREADY > FINSIHED!");
}

function onPause(){

}
function onResume(){
	initLS();

	webdb.transaction(function(tx){
		tx.executeSql("CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)");
	});

	startgeolocation();
	startCamera();
	startCompass();

}
function onMenuKeyDown(){

}

function onBackKeyDown(){

}

///////////////////////////////////
// GOOGLE ///////////////

function getHotelDetails(place,status){

	if(status == google.maps.places.PlacesServiceStatus.OK){

		place = JSON.stringify(place, null, 4);
		place = JSON.parse(place);

		console.log(place);

		webdb.transaction(function(tx){
			let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";

			tx.executeSql(sqlstr, [place.place_id],

				function(tx,txresults){
					console.log("WEBSQL SUCCESS > " + sqlstr);

					if(txresults.rows.length <= 0){
						let sqlstr = "INSERT INTO hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);";
						let currentDate = Date.now()

						tx.executeSql(sqlstr,

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

							function(tx,txresults){
								console.log("WEBSQL SUCCESS > " + sqlstr);
							},
							function(tx, txerror){
								console.error("WEBSQL ERROR > " + txerror.message);
							});


					}
					else{
						let sqlstr = "UPDATE hotelcollection SET hotelname=?, latitude=?, longitude=?, rating=?, totalusers=?, address=?, phonenumber=?, intphonenumber=?, globalcode=?, url=?, website=? WHERE placeid=?;";

						tx.executeSql(sqlstr,

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
							place.place_id
							],

							function(tx,txresults){
								console.log("WEBSQL SUCCESS > " + sqlstr);
							},
							function(tx,txerror){
								console.error("WEBSQL ERROR > " + txerror.message);
							});
					}
					if(place.reviews){

						for(let i = 0; i < place.reviews.length; i++){
						let sqlstr = "SELECT * FROM reviewcollection WHERE author_name=? AND placeid=?;";

						tx.executeSql(sqlstr,

							[place.reviews[i].author_name,place.place_id],

							function(tx,txresults){

								if(txresults.rows.length <= 0){
									let sqlstr = "INSERT INTO reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time) VALUES (?,?,?,?,?,?,?);";

									tx.executeSql(sqlstr,

										[
										place.place_id,
										place.reviews[i].author_name,
										place.reviews[i].author_url,
										place.reviews[i].rating,
										place.reviews[i].relative_time_description,
										place.reviews[i].text,
										place.reviews[i].time
										],
										function(tx,txresults){
											console.log("WEBSQL SUCCESS > " + sqlstr);
										},
										function(tx,txerror){ console.error("WEBSQL ERROR > " + txerror.message); });

								}
								else{
									let sqlstr = "UPDATE reviewcollection SET author_url=?, rating=?, relative_time=?, comment=?, time=? WHERE placeid=? AND author_name=?;";

									tx.executeSql(sqlstr,

										[
										place.reviews[i].author_url,
										place.reviews[i].rating,
										place.reviews[i].relative_time_description,
										place.reviews[i].text,
										place.reviews[i].time,
										place.place_id,
										place.reviews[i].author_name
										],

										function(tx,txresults){
											console.log("WEBSQL SUCCESS > " + sqlstr);
										}, function(tx,txerror){ console.error("WEBSQL ERROR > " + txerror.message); });

								}
							},
							function(tx,txerror){ console.error("WEBSQL ERROR > " + txerror.message); });

						}
					}
					


				}, function(tx,txerror){ console.error("WEBSQL ERROR > " + txerror.message); });
		});
	}
	else{
		console.error("HOTEL DETAILS ERROR > " + status);
	}
}

function searchcallback(results, status){

	if(status == google.maps.places.PlacesServiceStatus.OK){

		for(let i = 0; i < results.length; i++){

			webdb.transaction(function(tx){

				let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";

				tx.executeSql(sqlstr, [results[i].place_id], 
					function(tx, txresults){
						console.log("WEBSQL SUCCESS > " + sqlstr);

						if(txresults.rows.length <= 0){
							let place = service.getDetails(
								{placeId:results[i].place_id},
								getHotelDetails);
						}

					}, function(tx,txerror){ console.error("WEBSQL ERROR > " + txerror.message); });
			});
		}
	}
	else{
		console.error("SEARCH CALLBACK > " + status);
	}
}

function findHotels(){

	currentLocation = new google.maps.LatLng(currentLatitude,currentLongitude);

	map.setCenter(currentLocation);

	currentMarker.setPosition(currentLocation);

	let searchrequest = {
		location: currentLocation,
		radius: setting_searchRadius,
		type: ['lodging']
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(searchrequest,searchcallback);

}

function setRoute(){
	webdb.transaction(function(tx){
		let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";
		if(trackID != null){
			tx.executeSql(sqlstr,[trackID],
				function(tx,txresults){
					console.log("WEBSQL SUCCESS > " + sqlstr);

					if(txresults.rows.length > 0){
						let row = txresults.rows.item(0);

						directionsService.route({
							origin: currentLocation,
							destination: new google.maps.LatLng(row.latitude,row.longitude),
							travelMode: setting_travelmode
						}
						,function(response, status){
							if(status == "OK"){
								directionsDisplay.setMap(map);
								directionsDisplay.setDirections(response);
							}
							else{
								console.error("ROUTE ERROR > " + status.message);
							}
						});
					}
				},
				function(tx,txerror){
					console.error("WEBSQL ERROR > " + txerror.message);
				});
		}
		else{
			directionsDisplay.setMap(null);
		}
	});
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// SENSORS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function showHotels(){
	if(trackID != null){
		if(setting_trackingID != trackID){
			setting_trackingID = trackID;
			setRoute();
		}
	}
	else{
		setting_trackingID = null;
		directionsDisplay.setMap(null);
	}

	webdb.transaction(function(tx){
    	tx.executeSql("CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website)");
    	tx.executeSql("CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)");

    });


 	webdb.transaction(function(tx){
 		if(checkhotelID != null){

 			let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?;";

 			tx.executeSql(sqlstr,[checkhotelID],
 				function(tx,txresults){
 					if(txresults.rows.length > 0){
 						let row = txresults.rows.item(0);

 						let element = document.getElementById("checkhotelDistance");

 						element.innerHTML = lengthConv(distanceCalc(currentLongitude,currentLatitude,row.longitude,row.latitude));

 					}
 				},
 				function(tx,txerror){
 					console.error("WEBSQL ERROR > " + txerror.message);
 				});
 		}
 	});

 	webdb.transaction(function(tx){
		let sqlstr = "SELECT * FROM hotelcollection WHERE placeid=?";

		tx.executeSql(sqlstr,[checkhotelID],
			function(tx,txresults){
				// console.log("WEBSQL SUCCESS > " + sqlstr);

				if(txresults.rows.length > 0){
    				let row = txresults.rows.item(0);

    				let hotel_name = document.getElementById("checkhotelTitle");
					let hotel_address = document.getElementById("checkhotelAddress");
					let hotel_track_btn = document.getElementById("checkhoteltrack");
					let percent_score = document.getElementById("percentscore");
					let hotel_users = document.getElementById("checkhotelUsers");
					let card_circle = document.getElementById("checkhotelcardCircle");

    				hotel_name.innerHTML = row.hotelname;
    				hotel_address.innerHTML = row.address;


    				let rate = row.rating + "/5";

    				let percent = rateToPercent(row.rating).toFixed(0) + "%";


    				if(setting_switchRating == "RATING"){
    					percent_score.innerHTML = rate;

    				}
    				else{
    					percent_score.innerHTML = percent;
    				}

    				card_circle.className = setCirclePercent(rateToPercent(row.rating,""));


    				// percent_score.onclick = function() { setInnerHTMLDual(this.id, rate, percent)};
    				percent_score.onclick = function() { viewRating(); };


    				hotel_users.innerHTML = row.totalusers;

    				

				}
				// else{
				// 	console.error("ERROR IN SHOWING HOTEL");
				// }


			},
			function(tx,txerror){
				console.error("WEBSQL ERROR > " + txerror.message);
			});

		sqlstr = "SELECT * FROM reviewcollection WHERE placeid=?";

		tx.executeSql(sqlstr,[checkhotelID],
			function(tx,txresults){
				// console.log("WEBSQL SUCCESS > " + sqlstr);

				let reviews_Area = document.getElementById("reviewArea");

				reviews_Area.innerHTML = "";

				if(txresults.rows.length > 0){
					for(let i = 0; i < txresults.rows.length; i++){

						let row = txresults.rows.item(i);

						let revA = "<div class='reviewCard'><center><span class='reviewrating'>";
						let revB = "</span></center><i><p>&ldquo;<span>";
						let revC = "</span>&rdquo;</p></i>-&nbsp;<b><span>"
						let revD = "</span></b>,&nbsp;<span>";
						let revE = "</span></div>";

						if((row.comment).length > 0){

							reviews_Area.innerHTML +=
								revA + row.rating + "/5" +
								revB + String(row.comment) +
								revC + row.author_name +
								revD + row.relative_time +
								revE;
						}
					}

				}
				else{
					reviews_Area.innerHTML = "We can't get reviews at the moment.";
				}
			},
			function(tx,txerror){
				console.error("WEBSQL ERROR > " + txerror.message);
			});
	});
 	

    let divAA = "<div class='cardTitle'><p>";
    let divHA = "</div>";

    let divA = "<div id='";
    let divB = "' class='cardContainer' onclick='checkhotel(this.id)'><div id='cardTitle' class='cardTitle'>";
    // let divBa = "";
    let divC = "</div><div class='cardAddress'><marquee id='cardAddress'>";
    let divD = "</marquee></div><div id='cardCircleContainer' class='cardCircleContainer'><div id='cardCircle' class='";
    let divE = "' ><span id='cardPercentScore'>";
    let divF = "%</span><div class='bar'></div><div class='fill'></div></div></div><div id='cardUserTotal' class='cardUserTotal'>";
    let divG = "</div><div id='cardDistance' class='cardDistance'>";
    let divH = "</div></div>";

    webdb.transaction(function(tx){
    	let sqlstr = "SELECT * FROM hotelcollection;";

    	tx.executeSql(sqlstr,[],
    		function(tx,txresults){

    			if(txresults.rows.length > 0){

    				let hotelblock = [];
    				let hotelblockD = [];

    				for(let i = 0; i < txresults.rows.length; i++){
    					let row = txresults.rows.item(i);

    					let getdistance = distanceCalc(currentLongitude,currentLatitude,row.longitude,row.latitude);

    					// console.log(getdistance);
    					// console.log(row.placeid);

    					if(getdistance <= setting_searchRadius){
    						hotelblock.push(row.placeid);
    						hotelblockD.push(getdistance);
    					}
    					else{
    						if(document.getElementById(row.placeid)){
    							removeElement(row.placeid);
    						}

    					}
    				}

    				for(let i = 0; i < hotelblockD.length; i++){
    					for(let x = i+1; x < hotelblockD.length; x++){

    						if(hotelblockD[i] < hotelblockD[x]){
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

    				if(hotelblock.length <= 0){
    					findHotels();
    					console.log("NO HOTELS NEARBY...");
    				}

    				// console.log(hotelblockD);
    				// console.log(hotelblock);

    				for(let i = 0; i < txresults.rows.length; i++){
    					let row = txresults.rows.item(i);

    					let getdistance = distanceCalc(currentLongitude,currentLatitude,row.longitude,row.latitude);


    					if(hotelblock.includes(row.placeid)){

    						let bearing = bearingCalc(currentLongitude, currentLatitude, row.longitude, row.latitude);

    						let angle = getHotelAngle(bearing);

    						let hoteldirection = getHotelDirection(angle);

    						if(document.getElementById(row.placeid)){

    							let existingcard = document.getElementById(row.placeid);

    							let cardTitle = existingcard.children[0];
    							let cardAddress = existingcard.children[1].children[0];
    							let cardCircle = existingcard.children[2].children[0];
    							let cardPercentScore = existingcard.children[2].children[0].children[0];
    							let cardUserTotal = existingcard.children[3];
    							let cardDistance = existingcard.children[4];

    							cardTitle.innerHTML = row.hotelname;
    							cardAddress.innerHTML = row.address;
    							cardCircle.className = setCirclePercent(rateToPercent(row.rating),"big");
    							cardPercentScore.innerHTML = rateToPercent(row.rating).toFixed(0) + "%";
    							cardUserTotal.innerHTML = "out of <b>" + row.totalusers + "</b> people liked this place";
    							cardDistance.innerHTML = lengthConv(getdistance);

    							// existingcard.innerHTML = "";

    							// existingcard.innerHTML += 

    							// 	divAA + row.hotelname +
    							// 	divC + row.address +
    							// 	divD + setCirclePercent(rateToPercent(row.rating)) +
    							// 	divE + rateToPercent(row.rating).toFixed(0) +
    							// 	divF + row.totalusers +
    							// 	divG + lengthConv(getdistance) +
    							// 	divHA;
    							

    							existingcard.style.marginLeft = hoteldirection + "%";
    							existingcard.style.marginTop = hotelUpDown(Math.abs(currentTiltFB)).toFixed(0) + "%";
    							existingcard.style.zIndex = hotelblock.indexOf(row.placeid) + 1;

    						}
    						else{

    							let cardsArea = document.getElementById("cardsArea");

    							cardsArea.innerHTML += 

    								divA + row.placeid +
    								// divB + row.placeid +
    								divB + row.hotelname +
    								divC + row.address +
    								divD + setCirclePercent(rateToPercent(row.rating),"big") +
    								divE + rateToPercent(row.rating).toFixed(0) +
    								divF + "out of <b>" + row.totalusers + "</b> liked this place" +
    								divG + lengthConv(getdistance) +
    								divH;


    						}

    						let hotelscale = createRemap(0, setting_searchRadius, 1, 0);

    						if(setting_fixedDistance == true){
    							document.getElementById(row.placeid).style.transform = "scale(0.7)";
    						}
    						else{
    							document.getElementById(row.placeid).style.transform = "scale(" + hotelscale(getdistance) +")";
    						}




    					}
    					else{
    						if(document.getElementById(row.placeid)){
    							removeElement(row.placeid);
    						}
    					}
    				}
    			}
    			else{
    				document.getElementById("cardsArea").innerHTML = "";
    			}

    		}
    		,function(tx,txerror){ console.error("WEBSQL ERROR > " + txerror.message); })
    });


}

function startCamera(){

	let objCanvas = document.getElementById("cameradisplay");
	CanvasCamera.initialize(objCanvas);
	CanvasCamera.start(cameraOptions);
}

function startDeviceOrientation(){
	window.addEventListener(
		"deviceorientation",
		function(eventData){
			deviceOrientationHandler(
				eventData.gamma,
				eventData.beta,
				eventData.alpha);
		}, false);
}

	function deviceOrientationHandler(tiltLR,tiltFB,dir){

		let elementTrueNorth = document.getElementById("trueNorth");


		// if(currentAlpha.toFixed(0) != dir.toFixed(0) || currentTiltLR.toFixed(0) != tiltLR.toFixed(0) || currentTiltFB.toFixed(0) != tiltFB.toFixed(0)){
		// 	showHotels();
		// }
		currentAlpha = dir;
		currentTiltLR = tiltLR;
		currentTiltFB = tiltFB;

		document.getElementById("tiltLR").innerHTML = tiltLR;
		document.getElementById("tiltFB").innerHTML = tiltFB;

		

	}


function startCompass(){
	let element = document.getElementById("statusDirection");
	if(compassID != null){
		navigator.compass.clearWatch(compassID);
	}
	compassID = navigator.compass.watchHeading(
		function(heading){

			if(currentDirection.toFixed(0) != (heading.magneticHeading).toFixed(0)){
				currentDirection = heading.magneticHeading;
				showHotels();
			}
			element.innerHTML = currentDirection;
			followNorth();
		},
		function(error){
			console.log("Compass Error: " + error.code);
			element.innerHTML = "Compass Error";
		}, compassOptions);
}

function startgeolocation(){

	if(geoId != null){

		errorObl("GEORESTART");

		console.log("Restarting Geolocation... (" + Date() + ")");

		if(geoTimeout != null){
			clearTimeout(geoTimeout);
		}
		geoTimeout = null;

		navigator.geolocation.clearWatch(geoId);
		geoId = navigator.geolocation.watchPosition(geoSuccess, geoFailed, gpsOptions);

	}
	else{
		errorObl("GEOSTART");

		console.log("Starting Geolocation... (" + Date() + ")");

		if(geoTimeout != null){
			clearTimeout(geoTimeout);
		}
		geoTimeout = null;

		geoId = navigator.geolocation.watchPosition(geoSuccess, geoFailed, gpsOptions);

	}
}

function geoSuccess(position){

	errorObl("GEOSUCCESS");

	console.log("-------------- GPS SUCCESS INFO ---------------------");


	console.log("Geolocation Success");

	let previousLongitude = currentLongitude;
	let previousLatitude = currentLatitude;
	let previousTimestamp = currentTimestamp;

	console.log("PREVIOUS LON & LAT: " + previousLongitude + ", " + previousLatitude);
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
	console.log("CURRENT LON & LAT: " + currentLongitude + ", " + currentLatitude);
	console.log("CURRENT ACCURACY: " + currentAccuracy);
	console.log("CURRENT ALTITUDE: " + currentAltitude);
	console.log("CURRENT ALTITUDE ACCURACY: " + currentAltitudeAccuracy);
	console.log("CURRENT HEADING: " + currentHeading);
	console.log("CURRENT SPEED: " + currentSpeed);

	console.log("-------------------------------------------");

	displayNerdStatus("New Geolocation Updated");

	if(previousLongitude != currentLongitude || previousLatitude != currentLatitude){
		clearTimeout(geoMonitorTimeout);
		console.log("TIMER RESTARTED > Coordinates Changed");
		setRoute();
		findHotels();
	}
	else{
		if(geoMonitorTimeout != null){
			clearTimeout(geoMonitorTimeout);

			if(previousTimestamp != currentTimestamp){
				console.log("TIMER RESTARTED > New Timestamp (" + currentTimestamp + ")");
			}
			else{
				console.log("TIMER RESTARTED");
			}
		}
		geoMonitorTimeout = setTimeout(
			function(){ 
				startgeolocation();
				console.log("TIMER EXPIRED > Restarting GPS");
			}, 20000);
	}
}

function geoFailed(error){

	errorObl("GEOFAILED");

	displayNerdStatus("Geolocation Error");

	console.error("Geolocation Error (" + Date() + ")");
	console.error(error);

	if(geoTimeout != null){
		clearTimeout(geoTimeout);
        geoTimeout = setTimeout(function(){ startgeolocation(); }, 5000);
	}
	else{
		geoTimeout = setTimeout(function(){ startgeolocation(); }, 5000);
	}
}

function connectionSpeed(){

	let imageAddr = "https://sample-videos.com/img/Sample-jpg-image-50kb.jpg" + "?n=" + Math.random();
	let startTime, endTime;
	let downloadSize = 5616998;

	let download = new Image();
	download.onload = function(){
		// onConnectionOnline();
		console.log("ONLINE");
		setTimeout(function(){ connectionSpeed(); }, 10000);

	}
	download.onerror = function(){
		// onConnectionOffline();
		console.log("OFFLINE");
		setTimeout(function(){ connectionSpeed(); }, 10000);
	}
	download.src = imageAddr;
}


//////////////////////////////////////////////////////////////
// LOCAL STORAGE /////////////////////////////////////////////

function initSettings(){
	if(typeof(Storage) !== "undefined"){

		switch(localStorage.getItem("setting_unitConversion")){
			case "Metric":
				setInnerHTML("setting_unitConversion", "Metric (km)")
				break;
			case "Imperial":
				setInnerHTML("setting_unitConversion", "Imperial (yd)")
				break;
			default:
				checkLSV("setting_unitConversion", "Metric");
				initSettings();
				break;
		}

		switch(localStorage.getItem("setting_searchRadius")){
			case "500":
				if(localStorage.getItem("setting_unitConversion") == "Imperial"){
					setInnerHTML("setting_searchRadius", "546 yards");
				}
				else{
					setInnerHTML("setting_searchRadius", "500 meters");
				}
				break;
			case "1000":
				if(localStorage.getItem("setting_unitConversion") == "Imperial"){
					setInnerHTML("setting_searchRadius", "1094 yards");
				}
				else{
					setInnerHTML("setting_searchRadius", "1 kilometer");
				}
				break;
			case "2000":
				if(localStorage.getItem("setting_unitConversion") == "Imperial"){
					setInnerHTML("setting_searchRadius", "1.24 miles");
				}
				else{
					setInnerHTML("setting_searchRadius", "2 kilometers");
				}
				break;
			default:
				checkLSV("setting_searchRadius", 1000);
				initSettings();
				break;
		}

		switch(localStorage.getItem("setting_switchRating")){
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

		switch(localStorage.getItem("setting_nerdStats")){
			case "true":
				setInnerHTML("setting_nerdStats", "ON");
				setBGColor("setting_nerdStats", "mediumseagreen");
				break;
			case "false":
				setInnerHTML("setting_nerdStats", "OFF");
				setBGColor("setting_nerdStats", "tomato");
				break;
			default:
				checkLSV("setting_nerdStats", false);
				initSettings();
				break;
		}

		switch(localStorage.getItem("setting_gpsOptHighAccuracy")){
			case "true":
				setInnerHTML("setting_gpsOptHighAccuracy", "ON");
				setBGColor("setting_gpsOptHighAccuracy", "mediumseagreen")
				break;
			case "false":
				setInnerHTML("setting_gpsOptHighAccuracy", "OFF");
				setBGColor("setting_gpsOptHighAccuracy", "tomato")
				break;
			default:
				checkLSV("setting_gpsOptHighAccuracy", true);
				initSettings();
				break;
		}

		switch(localStorage.getItem("setting_fixedDistance")){
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

		switch(localStorage.getItem("setting_travelmode")){
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

	}
	else{
		console.error("LOCAL STORAGE NOT SUPPORTED");
	}
}

function setSettings(input){

	if(typeof(Storage) !== "undefined"){

		if(input == "setting_unitConversion"){
			
			switch(localStorage.getItem("setting_unitConversion")){
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
		}
		else if(input == "setting_searchRadius"){

			switch(localStorage.getItem("setting_searchRadius")){
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
		}
		else if(input == "setting_switchRating"){

			switch(localStorage.getItem("setting_switchRating")){

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
		}
		else if(input == "setting_nerdStats"){
			switch(localStorage.getItem("setting_nerdStats")){
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
		}
		else if(input == "setting_gpsOptHighAccuracy"){
			switch(localStorage.getItem("setting_gpsOptHighAccuracy")){
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
		}
		else if(input == "setting_fixedDistance"){
			switch(localStorage.getItem("setting_fixedDistance")){
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
		}
		else if(input == "setting_travelmode"){
			switch(localStorage.getItem("setting_travelmode")){
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

	}
	else{
		console.error("LOCAL STORAGE NOT SUPPORTED");
	}
	setRoute();
	// showHotels();
}

function setLS(settingLS, value){
	if(typeof(Storage) !== "undefined"){
		localStorage.setItem(settingLS, value);
		checkLSV(settingLS, value);
	}
	else{
		console.error("CAN'T SET LOCAL STORAGE ITEM " + settingLS + " BECAUSE LOCAL STORAGE IS NOT SUPPORTED");
	}
}

function checkLSV(settingLS, defaultvalue){
	if(localStorage.getItem(settingLS) === null || localStorage.getItem(settingLS) == "undefined"){
		localStorage.setItem(settingLS, defaultvalue);
		console.log("NO SETTING FOUND, CREATING SETTING > " + settingLS);
		checkLSV(settingLS, defaultvalue);
	}
	else{
		console.log(settingLS + " : " + localStorage.getItem(settingLS));
	}
}

function initLS(){

	console.log("----------------------------------------------------------------");
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

	console.log("----------------------------------------------------------------");

	/////////////
}






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CALCULATION FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createRemap(inMin, inMax, outMin, outMax){
	return function remaper(x){
		return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	};
}

function bearingCalc(lon1, lat1, lon2, lat2){
	let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    return toDegrees(Math.atan2(y,x));

}

function distanceCalc(lon1, lat1, lon2, lat2){
	let R = 6371;
    let dLat = toRadians(lat2-lat1);
    let dLon = toRadians(lon2-lon1);

    let a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = (R * c); // Distance in km
    d = d * 1000; // Distance in meters
    return d;
}

function lengthConv(input){

	let str;

	if(setting_unitConversion == "Metric"){

		if(input >= 1000){ // meter to kilometer
			str = (input / 1000).toFixed(2) + " km"
			return str;
		}
		else{ 
			str = input.toFixed(0) + " m"
			return str;
		}

	}
	else if(setting_unitConversion == "Imperial"){
		let foot = input * 3.2808399; // meter convert to foot

		if(foot >= 3){ // foot to yard
			str = (input * 0.33333333).toFixed(2) + " yd";
			return str;
		}
		else if(foot >= 5280){ // foot to miles
			str = (input * 0.00018939).toFixed(2) + " mi";
			return str;
		}
		else{
			str = input.toFixed(0) + " ft";
			return str;
		}
	}

}

function toDegrees(input){
	return input * (180/Math.PI);
}

function toRadians(input){
	return input * (Math.PI/180);
}

function getHotelAngle(bearing){

	let angle;

	if(bearing > 0){
		angle = currentDirection - Math.abs(bearing);
	}
	else if(bearing < 0){
		angle = currentDirection + Math.abs(bearing);
	}

	if(angle > 360){
		angle = angle - 360;
	}
	else if(angle < 0){
		angle = angle + 360;
	}

	return angle;
}

function getHotelDirection(angle){
	if(angle >= 0 && angle <= 179){
		return hoteltoRight(angle).toFixed(0);
	}
	else if(angle >= 180 && angle <= 360){
		return hoteltoLeft(angle).toFixed(0);
	}
}


// function getHotelBeta(element, beta){

// 	if(beta >= 90 && <= 180){
// 		document.getElementById(element).style.marginTop = 
// 	}
// 	else if(){
// 		document.getElementById(element).style.marginTop = 
// 	}
// }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DESIGN FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function viewRating(){
	if(setting_switchRating == "PERCENT"){
		setting_switchRating = "RATING";
	}
	else{
		setting_switchRating = "PERCENT";
	}
}


function setTrackID(id){
	if(trackID == null || trackID == undefined){
		trackID = id;
	}
	else if(trackID == id){
		trackID = null;
	}
	else{
		trackID = id;
	}
	setRoute();
	document.getElementById("statusTrackID").innerHTML = trackID;
}

function checkhotel(hotelid){

	checkhotelID = hotelid;

	setVisibility("checkhotelCont", "visible");
	scrollFunc('checkhotelContentContent','checkhotelArrowUp','checkhotelArrowDown');

	let trackbtn = document.getElementById("checkhotelTrack");

	if(trackID == hotelid){
		trackbtn.style.backgroundColor = "orange";
		trackbtn.innerHTML = "UNTRACK";
		trackbtn.onclick = function(){
			setVisibility("trackicon", "hidden");
			setTrackID(null);
			checkhotel(checkhotelID);
		};
	}
	else{
		trackbtn.style.backgroundColor = "mediumseagreen";
		trackbtn.innerHTML = "TRACK";
		trackbtn.onclick = function(){
			setTrackID(hotelid);
			document.getElementById("trackicon").onclick = function(){ checkhotel(hotelid); };
			setVisibility("trackicon","visible");
			checkhotel(checkhotelID);
		};
	}



	
}


function setCirclePercent(percent,size){

	let low = (100 / 3);
	let medium = (100 / 3) * 2;
	let high = (100 / 3) * 3;

	let str;


	switch(true){
		case percent >= 0 && percent <= low:
			if(size == "big"){
				str = "c100 p" + percent.toFixed(0) + " big center";
			}
			else{
				str = "c100 p" + percent.toFixed(0) + " center";
			}
			return str;
		case percent >= 0 && percent <= medium:
			if(size == "big"){
				str = "c100 p" + percent.toFixed(0) + " big center orange";
			}
			else{
				str = "c100 p" + percent.toFixed(0) + " center orange";
			}
			return str;
		case percent >= 0 && percent <= high:
			if(size == "big"){
				str = "c100 p" + percent.toFixed(0) + " big center green";
			}
			else{
				str = "c100 p" + percent.toFixed(0) + " center green";
			} 
			return str;
	}

}

function setBGColor(element, color){
	document.getElementById(element).style.backgroundColor = color;
}
function setVisibility(element, status){
	document.getElementById(element).style.visibility = status;
}
function setInnerHTML(element, message){
	document.getElementById(element).innerHTML = message;
}

function setInnerHTMLDual(elementname, option1, option2){
	let element = document.getElementById(elementname);
	if(element.innerHTML == option2){
		element.innerHTML = option1;
	}
	else{
		element.innerHTML = option2;
	}
}

function scrollFunc(elementname, up, down){
	let element = document.getElementById(elementname);
	let upArrow = document.getElementById(up);
	let downArrow = document.getElementById(down);

	let maxHeight = element.scrollHeight - element.clientHeight; // the scroll value total
	let currentScrollTop = element.scrollTop; // The value of the Top

	// console.log("Scroll Height: " + element.scrollHeight);
	// console.log("Client Height: " + element.clientHeight);
	// console.log("Max Height: " + maxHeight);
	// console.log("Current Scroll: " + currentScrollTop);

	// console.log(element.scrollHeight - element.clientHeight);
	// console.log(currentScrollTop);

	// switch(true){
	// 	case currentScrollTop == 0:
	// 	case currentScrollTop == MaxHeight:
	// 	case currentScrollTop > 0 && currentScrollTop < maxHeight:
	// }

	switch(true){
		case maxHeight == 0:
			upArrow.style.visibility = "hidden";
			downArrow.style.visibility = "hidden";
			break;
		case currentScrollTop == 0:
			upArrow.style.visibility = "hidden";
			downArrow.style.visibility = "visible";
			break;
		case currentScrollTop >= maxHeight:
			upArrow.style.visibility = "visible";
			downArrow.style.visibility = "hidden";
			break;
		case currentScrollTop > 0 && currentScrollTop < maxHeight:
			upArrow.style.visibility = "visible";
			downArrow.style.visibility = "visible";
			break;
		default:
			upArrow.style.visibility = "hidden";
			downArrow.style.visibility = "hidden";
			break;
	}

}
function openState(status){
	let settings = document.getElementById("settingsCont");

	switch(status){
		case "OPENSETTINGS":
			settings.style.visibility = "visible";
			scrollFunc("settingsContent","settingsUp","settingsDown");
			settingsTrigger("OPENSETTINGS");
			break;
		default:
			console.error("OPENSTATE > ERROR"); break;
	}

}
function exitState(status){
	let settings = document.getElementById("settingsCont");

	switch(status){
		case "EXITSETTINGS":
			settings.style.visibility = "hidden";
			setVisibility("settingsUp", "hidden");
			setVisibility("settingsDown", "hidden");
			break;
		case "EXITHOTEL":
			setVisibility("checkhotelArrowUp","hidden");
			setVisibility("checkhotelArrowDown","hidden");
			setVisibility("checkhotelCont", "hidden");
			checkhotelID = null;
			break;
		default:
			console.error("EXITSTATE > ERROR"); break;
	}

}


function settingsTrigger(setting){

	switch(setting){
		case "OPENSETTINGS":
			if(gpsOptHighAccuracy == true){
				setBGColor("OptHighAccuracy", "mediumseagreen");
				setInnerHTML("OptHighAccuracy","ON");
			}
			else{
				setBGColor("OptHighAccuracy", "tomato");
				setInnerHTML("OptHighAccuracy","OFF");
			}
			if(setting_nerdStats == true){
				setBGColor("OptNerdStats","mediumseagreen");
				setInnerHTML("OptNerdStats","ON");
				setVisibility("nerdStats", "visible");
			}
			else{
				setBGColor("OptNerdStats","tomato");
				setInnerHTML("OptNerdStats","OFF");
				setVisibility("nerdStats", "hidden");
			}
			if(setting_fixedDistance == true){
				setBGColor("OptFixedDistance","mediumseagreen");
				setInnerHTML("OptFixedDistance","YES");
			}
			else{
				setBGColor("OptFixedDistance","tomato");
				setInnerHTML("OptFixedDistance","NO");
			}
			if(setting_unitConversion == "Metric"){
				setInnerHTML("OptDistanceUnit", "Metric (km)");
			}
			else if(setting_unitConversion == "Imperial"){
				setInnerHTML("OptDistanceUnit", "Imperial (yd)");
			}
			break;
		case "HIGHACCURACY":
			if(gpsOptHighAccuracy == true){
				gpsOptHighAccuracy = false;
				setBGColor("OptHighAccuracy", "tomato");
				setInnerHTML("OptHighAccuracy","OFF");
				startgeolocation();
			}
			else{
				gpsOptHighAccuracy = true;
				setBGColor("OptHighAccuracy", "mediumseagreen");
				setInnerHTML("OptHighAccuracy","ON");
				startgeolocation();
			}
			break;
		case "NERDSTATS":
			if(setting_nerdStats == true){
				setting_nerdStats = false;
				setBGColor("OptNerdStats","tomato");
				setInnerHTML("OptNerdStats","OFF");
				setVisibility("nerdStats", "hidden");
			}
			else{
				setting_nerdStats = true;
				setBGColor("OptNerdStats","mediumseagreen");
				setInnerHTML("OptNerdStats","ON");
				setVisibility("nerdStats", "visible");
			}
			break;
		case "FIXEDDISTANCE":
			if(setting_fixedDistance == true){
				setting_fixedDistance = false;
				setBGColor("OptFixedDistance","tomato");
				setInnerHTML("OptFixedDistance","NO");
			}
			else{
				setting_fixedDistance = true;
				setBGColor("OptFixedDistance","mediumseagreen");
				setInnerHTML("OptFixedDistance","YES");
			}
			break;
		case "DISTANCEUNIT":
			if(setting_unitConversion == "Metric"){
				setting_unitConversion = "Imperial";
				setInnerHTML("OptDistanceUnit", "Imperial (yd)");
			}
			else{
				setting_unitConversion = "Metric";
				setInnerHTML("OptDistanceUnit", "Metric (km)");
			}
			break;
		default:
			console.error("SETTINGS TRIGGER > ERROR");
			break;
	}
}

function removeElement(elementId){
	let element = document.getElementById(elementId);
	element.parentNode.removeChild(element);
}

function followNorth(){
	let val = currentDirection - 360;

	document.getElementById("compassCont").style.transform = "rotate(" + Math.abs(val.toFixed(0)) + "deg)";

}

function errorObl(status){
	let message = document.getElementById("errOblMsg");
	let box = document.getElementById("errOblCont");
	let loadIcon = document.getElementById("errOblLoadIcon");

	switch(status){
		case "GEOSTART":
			loadIcon.style.visibility = "visible";
			box.style.visibility = "visible";
			box.style.backgroundColor = "orange";
			message.innerHTML = "Starting GPS";
			break;
		case "GEOSUCCESS":
			loadIcon.style.visibility = "hidden";
			box.style.backgroundColor = "mediumseagreen";
			message.innerHTML = "Geolocation found";
			box.style.visibility = "visible";
			break;
		case "GEOFAILED":
			loadIcon.style.visibility = "hidden";
			box.style.visibility = "visible";
			box.style.backgroundColor = "tomato";
			message.innerHTML = "Geolocation failed";
			break;
		case "GEORESTART":
			loadIcon.style.visibility = "visible";
			box.style.visibility = "visible";
			box.style.backgroundColor = "orange";
			message.innerHTML = "Finding your location";
			break;
		default:
			loadIcon.style.visibility = "hidden";
			box.style.visibility = "visible";
			message.innerHTML = "Error"; 
			break;
	}

}

function displayNerdStatus(status){
	document.getElementById("statusdisplay").innerHTML = status;


	document.getElementById("statusLongitude").innerHTML = isitNull(currentLongitude);
	document.getElementById("statusLatitude").innerHTML = isitNull(currentLatitude);
	document.getElementById("statusAltitude").innerHTML = isitNull(currentAltitude);
	document.getElementById("statusAccuracy").innerHTML = isitNull(currentAccuracy);
	document.getElementById("statusAltitudeAccuracy").innerHTML = isitNull(currentAltitudeAccuracy);
	document.getElementById("statusHeading").innerHTML = isitNull(currentHeading);
	document.getElementById("statusSpeed").innerHTML = isitNull(currentSpeed);
	document.getElementById("statusTimestamp").innerHTML = isitNull(currentTimestamp);

	document.getElementById("tiltFB").innerHTML = isitNull(currentTiltFB);
	document.getElementById("tiltLR").innerHTML = isitNull(currentTiltLR);
	document.getElementById("statusAlphaValue").innerHTML = isitNull(currentAlpha);

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JAVASCRIPT ONLY FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function isitNull(input){
	return (input == null) ? "NULL" : input;
}

