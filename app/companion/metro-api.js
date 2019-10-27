export function MetroApi() {

}

MetroApi.prototype.getDeparturesAtStop = function(platformNumbers) {
    console.log('MetroApi.getDeparturesAtStop');
    return new Promise(function(resolve, reject) {
        let url = `http://localhost:7071/api/GetTripsForPlatform?platforms=${platformNumbers.join(',')}`;

        console.log(`fetching: ${url}`);
        fetch(url).then(function(response) {
            response.json()
                .then(function(json) {
                    resolve(JSON.parse(json));
                });
        });
    });
};