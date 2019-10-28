import { me } from 'companion';
import * as messaging from 'messaging';
import { settingsStorage } from 'settings';

import { MetroApi } from './metro-api';
//import { MetroApiMock } from "./metro-api-mock";
import {
    HEARTBEAT_POLL_FREQUENCY,
    MessageType,
    PLATFORM_SETTING,
    SCHEDULE_POLL_FREQUENCY,
} from '../common/constants';

const metroApi = new MetroApi();

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send('hi from companion');
}
if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
    console.log('companion closed');
}

if (me.launchReasons.peerAppLaunched) {
    // The Device application caused the Companion to start
    console.log('Device application was launched!');
}

settingsStorage.onchange = function(evt) {
    retrieveAndSendSchedule();
};

messaging.peerSocket.onopen = function() {
    console.log('companion open');
    retrieveAndSendSchedule();
    pollForSchedule();
    pollForHeartbeat();
};

messaging.peerSocket.onmessage = function(evt) {};

messaging.peerSocket.onerror = function(err) {};

function pollForSchedule() {
    setTimeout(function() {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            retrieveAndSendSchedule().then(() => {
                pollForSchedule();
            });
        }
        if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
            console.log('companion closed');
        }
    }, SCHEDULE_POLL_FREQUENCY);
}

function retrieveAndSendSchedule() {
    return retrieveSchedule().then(schedule => {
        messaging.peerSocket.send({
            messageType: MessageType.schedule,
            data: schedule,
        });
    });
}

//TODO does this always run, or only when the app is open?

function retrieveSchedule() {
    //TODO temp until settings are added
    settingsStorage.setItem(
        PLATFORM_SETTING,
        JSON.stringify({
            platforms: [
                {
                    platformNumber: '10976',
                    image: 'left.jpg',
                },
                {
                    platformNumber: '10171',
                    image: 'right.jpg',
                },
            ],
        })
    );

    //TODO handle the no platforms configured instance.

    let platformSettings = JSON.parse(
        settingsStorage.getItem(PLATFORM_SETTING)
    );

    let platformNumbers = platformSettings.platforms.map(
        ps => ps.platformNumber
    );

    return metroApi
        .getDeparturesAtStop(platformNumbers)
        .then(function(apiResponse) {
            let merged = [];

            for (let platformSetting of platformSettings.platforms) {
                let result = {
                    platformNumber: platformSetting.platformNumber,
                };

                let platformResponse = apiResponse.platforms.find(
                    r => r.platformNumber === platformSetting.platformNumber
                );
                if (platformResponse) {
                    result.name = platformResponse.name;
                    result.trips = platformResponse.trips;
                    result.image = platformSetting.image;
                }

                merged.push(result);
            }
            return merged;
        });
}

function pollForHeartbeat() {
    setTimeout(function() {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            messaging.peerSocket.send({
                messageType: MessageType.heartbeat,
            });
        }
        pollForHeartbeat();
    }, HEARTBEAT_POLL_FREQUENCY);
}
