import { me } from 'companion';
import * as messaging from 'messaging';
import { settingsStorage } from 'settings';

import { MetroApi } from './metro-api';
//import { MetroApiMock } from "./metro-api-mock";
import { PLATFORM_SETTING, POLL_FREQUENCY } from '../common/constants';

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
    poll();
};

messaging.peerSocket.onmessage = function(evt) {
};

messaging.peerSocket.onerror = function(err) {
};

function poll() {
    retrieveAndSendSchedule();
    setTimeout(function() {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            //TODO This is a promise, do we want to run every 30 seconds or wait 30 seconds between polls.
            retrieveAndSendSchedule()
                .then(() => {
                    poll();
                });
        }
        if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
            console.log('companion closed');
        }
    }, POLL_FREQUENCY);
}

function retrieveAndSendSchedule() {
    return retrieveSchedule()
        .then(response => {
            //console.log('sending' + JSON.stringify(response));
            messaging.peerSocket.send(response);
        });
}

function retrieveSchedule() {
    //TODO temp until settings are added
    settingsStorage.setItem(PLATFORM_SETTING, JSON.stringify({
        platforms: [{
            platformNumber: '10976',
            image: 'left.jpg',
        }, {
            platformNumber: '10171',
            image: 'right.jpg',
        },
        ],
    }));

    //TODO handle the no platforms configured instance.

    let platformSettings = JSON.parse(settingsStorage.getItem(PLATFORM_SETTING));

    let platformNumbers = platformSettings.platforms.map(ps => ps.platformNumber);

    return metroApi.getDeparturesAtStop(platformNumbers)
        .then(function(apiResponse) {
            let merged = [];

            for (let platformSetting of platformSettings.platforms) {
                let result = {
                    platformNumber: platformSetting.platformNumber,
                };

                let platformResponse = apiResponse.platforms.find(r => r.platformNumber === platformSetting.platformNumber);
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