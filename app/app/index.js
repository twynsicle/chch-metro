import * as messaging from "messaging";
import { UI } from "./ui.js";
import {AppState, COMPANION_CONNECTION_TIMEOUT} from '../common/constants';

let ui = new UI();

//TODO do the same thing for a general connection timeout
let companionLoadTimer = setTimeout(function () {
	ui.updateUI(AppState.companionTimeout);
}, COMPANION_CONNECTION_TIMEOUT);

messaging.peerSocket.onopen = function() {
/*	if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
		messaging.peerSocket.send("open");
	}
	if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
		console.log('client closed');
	}
*/
	ui.updateUI(AppState.loading);
};

messaging.peerSocket.onmessage = function(event) {
	// First message from companion received, cancel the companion check timeout.
	clearTimeout(companionLoadTimer);
	ui.updateUI(AppState.update, event.data);
};

messaging.peerSocket.onerror = function(err) {
	ui.updateUI(AppState.error);
};