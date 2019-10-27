const debugUrlBase = 'http://localhost:7071/api/GetTripsForPlatform?platforms=';
const productionUrlBase = 'https://christchurchmetro.azurewebsites.net/api/GetTripsForPlatform?platforms=';

export function MetroApi() {

}

MetroApi.prototype.getDeparturesAtStop = function(platformNumbers) {
    if (platformNumbers == null || platformNumbers.length === 0) {
        return new Promise(function(resolve, reject) {
            resolve([]);
        })
    }

    return new Promise(function(resolve, reject) {
        let url = productionUrlBase + platformNumbers.join(',');

        console.log(`fetching: ${url}`);
        fetch(url).then(function(response) {
            response.json()
                .then(function(json) {
                    resolve(JSON.parse(json));
                });
        });
    });
};