"use strict";
/* jshint node: true */
/* global Promise */
/* global jsonTree */
/* global turf */
/* global am4core */
/* global am4maps */
/* jshint browser: true */
/* jshint esversion:6 */

let gjtester = {
	chart: false
};

gjtester.init = function () {

	var form = document.getElementById('gjt-form');
	form.addEventListener('change', function () {
		gjtester.formChange();
	});

	var button = document.getElementById('gjt-copy');
	button.addEventListener('click', function (event) {

		event.preventDefault();

		/* Get the text field */
		var copyText = document.getElementById("geojson-output");

		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 999999999999999999); /*For mobile devices*/

		/* Copy the text inside the text field */
		document.execCommand("copy");

		/* Alert the copied text */
		alert("Text copied");
	});

};

gjtester.isJSON = function (str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};

gjtester.formChange = function () {

	let opts;
	let info = document.querySelector('.gjt-info');
	info.classList.add('gjt-loading');

	let input = document.getElementById('geojson-input');
	let output = document.getElementById('geojson-output');
	let warningsContainer = document.getElementById('gjt-warnings-container');
	let rewind = document.getElementById('geojson-rewind').checked;
	let name = document.getElementById('geojson-name').value;
	let id = document.getElementById('geojson-id').value;
	let truncate = document.getElementById('geojson-truncate').value;
	let simplify = document.getElementById('geojson-simplify').value;
	let warnings = '';

	if (!gjtester.isJSON(input.value)) {
		alert('Invalid Json');
		info.classList.remove('gjt-loading');
		return;
	}

	let outputVal = JSON.parse(input.value);

	if (rewind) {
		outputVal = turf.rewind(outputVal, { reverse: true, mutate: true });
	}

	if (truncate) {
		opts = { precision: parseInt(truncate), coordinates: 2 };
		outputVal = turf.truncate(outputVal, opts);
	}

	if (simplify) {
		opts = { tolerance: parseFloat(simplify), highQuality: false };
		outputVal = turf.simplify(outputVal, opts);
	}

	let polygon = gjtester.getFirstPolygon(outputVal);

	if (name.length && name !== '' && polygon.properties.hasOwnProperty(name)) {
		turf.featureEach(outputVal, function (currentFeature, featureIndex) {
			console.log(currentFeature);
			if (currentFeature.properties.hasOwnProperty(name)) {
				currentFeature.properties.name = currentFeature.properties[name];
			}
		});
	}

	if (id.length && id !== '' && polygon.properties.hasOwnProperty(id)) {
		turf.featureEach(outputVal, function (currentFeature, featureIndex) {
			if (currentFeature.properties.hasOwnProperty(id)) {
				currentFeature.id = currentFeature.properties[id];
			}
		});
	}

	output.value = JSON.stringify(outputVal);

	// MultiPolygon
	if (polygon.geometry.type === 'MultiPolygon') {
		if (!gjtester.isClockwise(polygon.geometry.coordinates[0][0])) {
			warnings += '<div class="gjt-warning">Coordinates seem to be counterclockwise.<br>Enable the "Rewind" option.</div>'
		}
	}

	if (polygon.geometry.type === 'Polygon') {
		if (!gjtester.isClockwise(polygon.geometry.coordinates[0])) {
			warnings += '<div class="gjt-warning">Coordinates seem to be counterclockwise.<br>Enable the "Rewind" option.</div>';
		}
	}

	if (!gjtester.hasName(polygon)) {
		warnings += '<div class="gjt-warning">"name" property missing</div>';
	}

	if (!gjtester.hasID(polygon)) {
		warnings += '<div class="gjt-warning">"id" property missing</div>';
	}

	let size = new TextEncoder().encode(JSON.stringify(output.value)).length;
	let kiloBytes = parseInt(size / 1024);
	let megaBytes = kiloBytes / 1024;
	megaBytes = megaBytes.toFixed(2);

	if (warnings === '') {
		warnings += '<div class="gjt-warning-good">No Problems detected.</div>';
	}

	if (kiloBytes < 200) {
		warnings += '<div class="gjt-warning-good">Aproximate file size: ' + kiloBytes + 'Kb</div>';
	} else {
		warnings += '<div class="gjt-warning-yellow">Aproximate file size: ' + kiloBytes + 'Kb</div>';
	}



	warningsContainer.innerHTML = warnings;

	gjtester.jsonTree(outputVal);


	// Create map instance
	am4core.options.commercialLicense = true;
	if (gjtester.chart) {
		gjtester.chart.dispose();
	}
	gjtester.chart = am4core.create("gjt-preview", am4maps.MapChart);
	var chart = gjtester.chart;

	// Set map definition
	chart.geodata = outputVal;

	// Set projection
	chart.projection = new am4maps.projections.Miller();

	// Create map polygon series
	var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

	// Make map load polygon (like country names) data from GeoJSON
	polygonSeries.useGeodata = true;

	// Configure series
	var polygonTemplate = polygonSeries.mapPolygons.template;
	polygonTemplate.tooltipText = "{name}";
	polygonTemplate.fill = am4core.color("#74B266");

	// Create hover state and set alternative fill color
	var hs = polygonTemplate.states.create("hover");
	hs.properties.fill = am4core.color("#367B25");

	// Add zoom control
	chart.zoomControl = new am4maps.ZoomControl();

	chart.events.on("appeared", function (ev) {
		info.classList.remove('gjt-loading');
	});

};

gjtester.getFirstPolygon = function (obj) {
	return obj.features[0];
};

gjtester.jsonTree = function (dataStr) {

	// Get DOM-element for inserting json-tree
	var wrapper = document.getElementById("gjt-json-tree-container");
	wrapper.innerHTML = '';

	// Create json-tree
	var tree = jsonTree.create(dataStr, wrapper);

	// Expand all (or selected) child nodes of root (optional)
	tree.expand(function (node) {
		return node.childNodes.length < 3;
	});

};

gjtester.hasID = function (obj) {
	return obj.hasOwnProperty("id");
};

gjtester.hasName = function (obj) {
	return obj.properties.hasOwnProperty("name");
};

gjtester.isClockwise = function (poly) {
	var sum = 0;
	for (var i = 0; i < poly.length - 1; i++) {
		var cur = poly[i],
			next = poly[i + 1];
		sum += (next[0] - cur[0]) * (next[1] + cur[1]);
	}
	return sum > 0;
};

gjtester.init();