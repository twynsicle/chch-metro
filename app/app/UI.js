import document from 'document';
import { AppState } from '../common/constants';

export function UI() {
    let spinner = document.getElementById('spinner');
    spinner.state = 'enabled';

    let loadingBar = document.getElementById('loading-bar');
    loadingBar.style.display = 'none';
}

UI.prototype.updateUI = function(state, data) {
    let spinner = document.getElementById('spinner');
    let platforms = document.getElementById('platforms');
    let statusMessage = document.getElementById('status');
    let statusMessageText = document.getElementById('status-text');

    if (state === AppState.update) {
        platforms.style.display = 'inline';
        updateList(data);
        statusMessage.style.display = 'none';
        spinner.style.display = 'none';
        spinner.state = 'disabled';
    } else if (state === AppState.companionTimeout) {
        statusMessage.style.display = 'inline';
        statusMessageText.text = 'Connection with phone lost.';
        platforms.style.display = 'none';
        spinner.style.display = 'none';
        spinner.state = 'disabled';
    }

    //TODO we might want our own timer here to detect whether we have lost communication.
    // Would the loading bar get stuck and would that be enough.

    // Animate loading bar while we wait for the next poll.

    // As soon as we have received our first update, hide the initial spinner.

    //TODO make sure the first load looks ok, it might take some time to load the first set of data.
    /*} else {
		if (state === "loading") {
			this.statusText.text = "Loading departures ...";
		}
		else if (state === "disconnected") {
			this.statusText.text = "Please check connection to phone and Fitbit App"
		}
		else if (state === "error") {
			this.statusText.text = "Something terrible happened.";
		}
	}*/
};

function updateList(platforms) {
    animateLoadingBar();

    if (!platforms) {
        console.log('error: ' + platforms);
        return;
    }

    let listElements = document.getElementsByClassName('item');

    for (let i = 0; i < listElements.length; i += 1) {
        let listElement = listElements[i];
        if (!listElement) {
            continue;
        }

        let platform = platforms[i];
        if (!platform) {
            listElement.style.display = 'none';
            continue;
        }

        listElement.style.display = 'inline';
        listElement.getElementsByClassName('title')[0].text = platform.name;
        listElement.getElementsByClassName('icon')[0].image = platform.image;

        updateTrip(listElement, platform.trips);
    }
}

function updateTrip(item, trips) {
    let tripElements = item.getElementsByClassName('trip');

    for (let i = 0; i < tripElements.length; i += 1) {
        let tripElement = tripElements[i];
        if (!tripElement) {
            continue;
        }

        let trip = trips[i];
        if (!trip) {
            tripElement.style.display = 'none';
            continue;
        }

        tripElement.style.display = 'inline';
        tripElement.getElementsByClassName('stop-number')[0].text = trip.number;
        tripElement.getElementsByClassName('eta')[0].text = `${trip.eta} mins`;
    }
}

function animateLoadingBar() {
    let loadingBar = document.getElementById('loading-bar');
    loadingBar.animate('enable');
    loadingBar.style.display = 'inline';
}

//<div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/"             title="Flaticon">www.flaticon.com</a></div>
//<a target="_blank" href="https://icons8.com/icons/set/bus2">Shuttle</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
