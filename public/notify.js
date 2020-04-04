var firebaseConfig = {
    apiKey: "AIzaSyDyWGLcaXFPVfQajNX05Su6xW3AJV2vHsg",
    authDomain: "friendship-fa3bd.firebaseapp.com",
    databaseURL: "https://friendship-fa3bd.firebaseio.com",
    projectId: "friendship-fa3bd",
    storageBucket: "friendship-fa3bd.appspot.com",
    messagingSenderId: "740835687702",
    appId: "1:740835687702:web:2e6f712572bebad0d6e437"
};


function sendMessage(){
	inqContacts('TEST', function(profileData){
		console.log(profileData);
		$.post("/send",
		  {
			  "notification": {
				"title": "Portugal vs. Denmark",
				"body": "Testing",
				"icon": "firebase-logo.png",
				"click_action": "http://localhost:8081"
			  },
			  "to": profileData.registrationToken
			},
		  function(data, status){
			alert("Data: " + data + "\nStatus: " + status);
		  });
	});
	
	
	
	/*$.post("/send",
	  {
		  "notification": {
			"title": "Portugal vs. Denmark",
			"body": "Testing",
			"icon": "firebase-logo.png",
			"click_action": "http://localhost:8081"
		  },
		  "to": "fu80tBFFbF0:APA91bFV5ZpmxAvf-XK_HTzc4SbwofkJ__DBWngNbNDcR5namqpphU9sGUwyh5L9M50Ytm8uH2BICRHFieat9_QWojwUcvp5Gx0aJyprfDWN7NcOMQl7giNI1QBrie6xeLkIdysbAIF8"
		},
	  function(data, status){
		alert("Data: " + data + "\nStatus: " + status);
	  });*/
}
	function inqContacts(id, callback){
		var strUrl = 'chat_contacts';
		if(id){
			strUrl += "/"+id;
		}
		database.ref(strUrl).once('value', function(snapshot){
			var profileData = snapshot.val();
			callback(profileData);
		});
	}
function initFirebaseMessagingRegistration() {
	messaging
		.requestPermission()
		.then(function () {
			
			console.log("Got notification permission");
			return messaging.getToken();
		})
		.then(function (token) {
			// print the token on the HTML page

			console.log(token);
		})
		.catch(function (err) {
			console.log(err);
			function initFirebaseMessagingRegistration() {
            messaging
                .requestPermission()
                .then(function () {
                    console.log("Got notification permission");
                    return messaging.getToken();
                })
                .then(function (token) {
                    // print the token on the HTML page
					console.log(token);
                })
                .catch(function (err) {
                    console.log("Didn't get notification permission", err);
                });
        }
			console.log("Didn't get notification permission", err);
		});
}

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
const messaging = firebase.messaging();

messaging.onMessage(function (payload) {
	console.log("Message received. ", JSON.stringify(payload));
	notificationElement.innerHTML = notificationElement.innerHTML + " " + JSON.stringify(payload.notification);
});
messaging.onTokenRefresh(function () {
	messaging.getToken()
		.then(function (refreshedToken) {
			console.log('Token refreshed.');
			tokenElement.innerHTML = "Token is " + refreshedToken;
		}).catch(function (err) {
			errorElement.innerHTML = "Error: " + err;
			console.log('Unable to retrieve refreshed token ', err);
		});
});

initFirebaseMessagingRegistration();