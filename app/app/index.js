import * as messaging from "messaging";
import { UI } from "./ui.js";
import {COMPANION_CONNECTION_TIMEOUT} from "../common/globals";

let ui = new UI();

console.log('starting');

let companionLoadTimer = setTimeout(function () {
	ui.updateUI(MessageState.CompanionTimeout);
}, COMPANION_CONNECTION_TIMEOUT);

messaging.peerSocket.onopen = function() {
/*	if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
		messaging.peerSocket.send("open");
	}
	if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
		console.log('client closed');
	}
*/
	ui.updateUI(MessageState.Loading);
};

messaging.peerSocket.onmessage = function(evt) {
	// First message from companion received, cancel the companion check timeout.
	clearTimeout(companionLoadTimer);
	ui.updateUI(MessageState.Update, JSON.parse(evt.data));
};

messaging.peerSocket.onerror = function(err) {
	ui.updateUI(MessageState.Error);
};