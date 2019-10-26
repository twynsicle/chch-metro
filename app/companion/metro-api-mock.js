export function MetroApiMock() {

}

MetroApiMock.prototype.getDeparturesAtStop = function () {
	return new Promise(function(resolve, reject) {
		resolve({
			platforms: [
				{
					platformTag: 1175,
					name: "Kilmarnock St near Deans Ave",
					trips: [
						{
							number: "000",
							name: "Hei Hei/Avonhead",
							destination: "Avonhead",
							eta: getRandomInt(0, 60)
						},
						{
							number: "71",
							name: "Hei Hei/Avonhead",
							destination: "Avonhead",
							eta: getRandomInt(0, 60)
						},
						{
							number: "131",
							name: "Hei Hei/Avonhead",
							destination: "Avonhead",
							eta: getRandomInt(0, 60)
						}
					]
				},
				{
					platformTag: 1175,
					name: "Hyde Park",
					trips: [
						{
							number: "130",
							name: "Hei Hei/Avonhead",
							destination: "Hei Hei & Hornby",
							eta: getRandomInt(0, 60)
						},
						{
							number: "130",
							name: "Hei Hei/Avonhead",
							destination: "Hei Hei & Hornby",
							eta: getRandomInt(0, 60)
						},
						{
							number: "130",
							name: "Hei Hei/Avonhead",
							destination: "Hei Hei & Hornby",
							eta: getRandomInt(0, 60)
						}
					]
				}
			]
		});
	})
};

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}