

// COMPASS CONFIG /////////////////////////////////////////////////////////////////////////////////////

var compassOptFrequency = 1;
var compassID = null;

var compassValid = false;
var orientationValid = false;

var compassOptions = {
	frequency: compassOptFrequency
}


// WEBSQL CONFIG //////////////////////////////////////////////////////////////////////////////////////

var databaseSize = 5;

var webdb = openDatabase(
	'harpbeta',
	'1.1',
	'beta database by Mark Alueta',
	databaseSize * 1024 * 1024);


// LISTENERS //////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("deviceready", onDeviceReady, false);

// CORDOVA FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////////

function onDeviceReady(){
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);
    document.addEventListener("backbutton", onBackKeyDown, false);


    if(typeof(Storage) !== "undefined"){
    	console.log("LOCAL STORAGE SUPPORTED");
    	initLS();
    	webdb.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)");
		});
    }
    else{
    	alert("LOCAL STORAGE NOT SUPPORTED");

    }

    startCompass();
    startDeviceOrientation();
}

function onPause(){

}
function onResume(){

	initLS();

	webdb.transaction(function(tx){
		tx.executeSql("CREATE TABLE IF NOT EXISTS hotelcollection (hotelname, placeid, latitude, longitude, rating, totalusers, address, phonenumber, intphonenumber, globalcode, url, website, last_update)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS reviewcollection (placeid, author_name, author_url, rating, relative_time, comment, time)");
	});

	startCompass();
	startDeviceOrientation();

}
function onMenuKeyDown(){

}
function onBackKeyDown(e){
	e.preventDefault();

	let settings = document.getElementById("SettingsContainer").style.visibility;
	let arWarning = document.getElementById("ARWarningCont").style.visibility;
	let dfWarning = document.getElementById("DFWarningCont").style.visibility;
	let ofWarning = document.getElementById("OFWarningCont").style.visibility;


	if(settings == "visible"){
		setVisibility("SettingsContainer","hidden")
	}
	else if(arWarning == "visible"){
		setVisibility("ARWarningCont","hidden");
		setVisibility("blackbg","hidden");
	}
	else if(dfWarning == "visible"){
		setVisibility("DFWarningCont","hidden");
		setVisibility("blackbg","hidden");
	}
	else if(ofWarning == "visible"){
		setVisibility("OFWarningCont","hidden");
		setVisibility("blackbg","hidden");
	}
	else{
		if(confirm("Are you sure you want to exit?")){
			if(navigator.app){
				navigator.app.exitApp();
			}
			else if(navigator.device){
				navigator.device.exitApp();
			}
			else{
				window.close();
			}
		}
	}
}
// LOCAL STORAGE FUNCTION ////////////////////////////////////////////////////////////////////

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
function setLS(settingLS, value){
	if(typeof(Storage) !== "undefined"){
		localStorage.setItem(settingLS, value);
		checkLSV(settingLS, value);
	}
	else{
		console.error("CAN'T SET LOCAL STORAGE ITEM " + settingLS + " BECAUSE LOCAL STORAGE IS NOT SUPPORTED");
	}
}

function navigateTo(input){

	if(compassValid == false){
		alert("Compass Sensor Not Detected.");
	}
	else if(orientationValid == false){
		alert("Device Orientation Not Detected.");
	}
	else{
		if(input == "ARMODE"){
			window.location = "armode.html";
		}
		else if(input == "NORMALMODE"){
			window.location = "normalmode.html";
		}
		else if(input == "OFFLINEMODE"){
			window.location = "offlinemode.html";
		}
	}
}




// DESIGN FUNCTIONS ///////////////////////////////////////////////////////////////////////////

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
}


function msgboxState(input){

	switch(true){
		case input == "OPENAR":
			setVisibility("ARWarningCont","visible");
			setVisibility("blackbg","visible");
			break;
			break;
		case input == "CLOSEAR":
			setVisibility("ARWarningCont","hidden");
			setVisibility("blackbg","hidden");
			break;
		case input == "OPENDF":
			setVisibility("DFWarningCont","visible");
			setVisibility("blackbg","visible");
			break;
			break;
		case input == "CLOSEDF":
			setVisibility("DFWarningCont","hidden");
			setVisibility("blackbg","hidden");
			break;
		case input == "OPENOF":
			setVisibility("OFWarningCont","visible");
			setVisibility("blackbg","visible");
			break;
			break;
		case input == "CLOSEOF":
			setVisibility("OFWarningCont","hidden");
			setVisibility("blackbg","hidden");
			break;
		case input == "OPENSETTINGS":
			initSettings();
			setVisibility("SettingsContainer","visible")
			break;
		case input == "EXITSETTINGS":
			setVisibility("SettingsContainer","hidden")
			break;
		default:
			console.error("MESSAGE BOX STATE > ERROR");
			break;
	}
}


function setVisibility(element, status){
	document.getElementById(element).style.visibility = status;
}

function setBGColor(element,color){
	document.getElementById(element).style.backgroundColor = color;
}

function setInnerHTML(element,message){
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

// JAVASCRIPT ONLY FUNCTIONS /////////////////////////////////////////////////////////////////////////

function isitNull(input){
	return (input == null) ? "NULL" : input;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SENSORS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startCompass(){

	if(compassID != null){
		navigator.compass.clearWatch(compassID);
	}
	compassID = navigator.compass.watchHeading(
		function(heading){
			compassValid = true;
		},
		function(error){
			compassValid = false;
		}, compassOptions);

}

function startDeviceOrientation(){

	if(window.DeviceOrientationEvent){
		orientationValid = true;
	}
	else{
		orientationValid = false;
	}
}
