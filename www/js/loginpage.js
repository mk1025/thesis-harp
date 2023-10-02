document.addEventListener("deviceready", onDeviceReady, false);

var firebaseconfig = {
	apiKey: "###",
	authDomain: "###.firebaseapp.com",
	databaseURL: "https://###.firebaseio.com",
	projectId: "###",
	storageBucket: "###.appspot.com",
	messagingSenderId: "###",
};

function onDeviceReady() {
	console.log("Device Detected!");
	firebase.initializeApp(firebaseconfig);
}

function securepass() {
	let passwordfield = document.getElementById("passwordfield");
	let securepass = document.getElementById("securepass");

	if (passwordfield.type == "text") {
		passwordfield.type = "password";
		passwordfield.placeholder = "***********";

		securepass.innerHTML = "Show";
	} else if (passwordfield.type == "password") {
		passwordfield.type = "text";
		passwordfield.placeholder = "password123";

		securepass.innerHTML = "Hide";
	}
}
function registeraccount() {
	let emailfield = document.getElementById("regEmail");
	let usernamefield = document.getElementById("regUsername");
	let passwordfield = document.getElementById("regPassword");
	let rpasswordfield = document.getElementById("regRPassword");

	// if(emailfield.value.length == 0 || usernamefield.value.length == 0 || passwordfield. )
}

function triggermenu(data) {
	let blackbg = document.getElementById("blackbg");
	let activatebox = document.getElementById("activatebox");
	let errorbox = document.getElementById("errorbox");
	let registerbox = document.getElementById("registerbox");

	switch (data) {
		case "closeactivation":
			blackbg.style.visibility = "hidden";
			activatebox.style.visibility = "hidden";
			break;
		case "activation":
			blackbg.style.zIndex = "97";
			blackbg.style.visibility = "visible";
			activatebox.style.visibility = "visible";
			break;
		case "register":
			blackbg.style.zIndex = "97";
			blackbg.style.visibility = "visible";
			registerbox.style.visibility = "visible";
			break;
		case "closeregister":
			blackbg.style.visibility = "hidden";
			registerbox.style.visibility = "hidden";
			break;
		case "closeerror":
			// blackbg.style.visibility = "hidden";
			errorbox.style.visibility = "hidden";
			blackbg.style.zIndex = "97";
			break;
		default:
			document.write("Error");
			break;
	}
}

function activateaccount() {
	let emailfield = document.getElementById("actEmailfield");
	let codefield = document.getElementById("actCodefield");
	let blackbg = document.getElementById("blackbg");

	let errorbox = document.getElementById("errorbox");
	let errormsg = document.getElementById("errormsg");
	let errortitle = document.getElementById("errortitle");

	if (emailfield.value.length == 0 || codefield.value.length == 0) {
		blackbg.style.zIndex = "99";
		blackbg.style.visibility = "visible";

		errorbox.style.visibility = "visible";
		errormsg.innerHTML = "Complete all the fields";
		errortitle.innerHTML = "ERROR:";
	} else {
	}
}
