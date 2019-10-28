import * as messaging from 'messaging';
import { UI } from './ui.js';
import {
    AppState,
    COMPANION_CONNECTION_TIMEOUT,
    MessageType,
} from '../common/constants';

let ui = new UI();

let companionTimeout;

messaging.peerSocket.onopen = function() {
    createCompanionCheck();
    ui.updateUI(AppState.loading);
};

messaging.peerSocket.onmessage = function(event) {
    let message = event.data;

    if (messageTypeisSuccessfulCommunication(message.messageType)) {
        resetCompanionCheck();
    }

    if (message.messageType === MessageType.schedule) {
        ui.updateUI(AppState.update, message.data);
    }
};

messaging.peerSocket.onerror = function(err) {
    ui.updateUI(AppState.error);
};

function messageTypeisSuccessfulCommunication(messageType) {
    return (
        messageType === MessageType.schedule ||
        messageType === MessageType.heartbeat
    );
}

function resetCompanionCheck() {
    clearTimeout(companionTimeout);
    createCompanionCheck();
}

// Display connection failed message once we haven't received communication from
// companion for 10 seconds.
function createCompanionCheck() {
    companionTimeout = setTimeout(function() {
        console.log('communication with companion lost');
        ui.updateUI(AppState.companionTimeout);
    }, COMPANION_CONNECTION_TIMEOUT);
}
