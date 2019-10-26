import document from "document";

export function UI() {
	this.statusText = document.getElementById("status");

	let spinner = document.getElementById("spinner");
	spinner.state = "enabled";

	let loadingBar = document.getElementById('loading-bar');
	loadingBar.style.display = 'none';
}

UI.prototype.updateUI = function (state, data) {
	if (state === MessageState.Update) {

		//this.statusText.text = "";

		this.updateList(data);

		//TODO we might want our own timer here to detect whether we have lost communication.
		// Would the loading bar get stuck and would that be enough.

		// Animate loading bar while we wait for the next poll.
		this.animateLoadingBar();

		// As soon as we have received our first update, hide the initial spinner.
		let spinner = document.getElementById("spinner");
		spinner.state = "disabled";

	//TODO make sure the first load looks ok, it might take some time to load the first set of data.

	} /*else {
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

UI.prototype.animateLoadingBar = function() {
	let loadingBar = document.getElementById('loading-bar');
	loadingBar.animate('enable');
	loadingBar.style.display = 'inline';
};

UI.prototype.updateList = function(data) {
	let platforms = data.platforms;
	//TODO merge platforms with settings to get custom names
	let listElements = document.getElementsByClassName('item');

	for (let i = 0; i < listElements.length; i +=1) {
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
		listElement.getElementsByClassName("title")[0].text = platform.name;
		if (i === 1 ) {
			listElement.getElementsByClassName("icon")[0].image = `left.jpg`;
		} else {
			listElement.getElementsByClassName("icon")[0].image = `right.jpg`;
		}
		this.updateTrip(listElement, platform.trips);
	}
};


UI.prototype.updateTrip = function(item, trips) {
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
		tripElement.getElementsByClassName("stop-number")[0].text = trip.number;
		tripElement.getElementsByClassName("eta")[0].text = `${trip.eta} mins`;
	}
};


//<div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/"             title="Flaticon">www.flaticon.com</a></div>