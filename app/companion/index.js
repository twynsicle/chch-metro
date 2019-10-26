import { me } from "companion";
import * as messaging from "messaging";
import { settingsStorage } from "settings";

import { MetroApi } from "./metro-api";
//import { MetroApiMock } from "./metro-api-mock";
import {POLL_FREQUENCY} from "../common/globals";

console.log('starting');

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
	messaging.peerSocket.send("hi from companion");
}
if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
	console.log('companion closed');
}

if (me.launchReasons.peerAppLaunched) {
	// The Device application caused the Companion to start
	console.log("Device application was launched!")
}

settingsStorage.onchange = function(evt) {
	sendSchedule();
};

messaging.peerSocket.onopen = function() {
	console.log('companion open');
	poll();
};

messaging.peerSocket.onmessage = function(evt) {
};

messaging.peerSocket.onerror = function(err) {
};

function poll() {
	//sendSchedule();
	setTimeout(function() {
		if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
			//TODO This is a promise, do we want to run every 30 seconds or wait 30 seconds between polls.
			sendSchedule()
				.then(() => {
					poll();
				});
		}
		if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
			console.log('companion closed');
		}
	}, POLL_FREQUENCY);
}

function sendSchedule() {
	let metroApi = new MetroApi();
	return metroApi.getDeparturesAtStop()
		.then(function(response) {
		messaging.peerSocket.send(response);
	});
}