<?php
/*
Plugin Name: GeoJson Tester
Plugin URI: http://interactivegeomaps.com
Description: Tools to check and help create geojson files to use in Interactive Geo Maps.
Author: Carlos Moreira
Version: 1.0.0
Requires PHP: 5.6
Author URI: https://cmoreira.net
Text Domain: igm-geojson-tester
Domain Path: /lang
*/

// add shortcode.
add_shortcode( 'geojson-tester', 'geojson_tester_ui' );

/**
 * Output the ui for the tester
 *
 * @return $html string
 */
function geojson_tester_ui() {

	enqueue_geojson_tester_files('1.0.0');

	$html = '';
	$html = '<div class="geojson-tester-wrapper">
				<div class="gjtree-form-wrapper">
					<form class="gjt-form" id="gjt-form">

						<div class="gjt-input-container">
						<div class="gjt-title">Input</div>
						<div class="gjt-description">Add your geoJSON here.</div>
						<textarea id="geojson-input" name="geojson-input"></textarea>
						</div>

						<div class="gjt-title">Options</div>
						<div class="gjt-input-container">
						<label for="geojson-rewind">Rewind Coordinates</label> <input type="checkbox" id="geojson-rewind" value="1" name="geojson-rewind">
						</div>
						<div class="gjt-input-container">
						<label for="geojson-name">Use as Name property:
							<div class="gjt-description">The map entries should have a lowercase "name" property.</div>
							</label><input type="text" id="geojson-name" name="geojson-name">
						</div>
						<div class="gjt-input-container">
						<label for="geojson-id">Use as ID property:<div class="gjt-description">The map entries should have an "id" property.</div></label><input type="text" id="geojson-id" name="geojson-id">
						</div>

						<div class="gjt-input-container">
						<label for="geojson-simplify">Simplify tolerance:<div class="gjt-description">Use numbers between 0.001 and 1. For better simplification use <a href="https://mapshaper.org/">Mapshaper</a></div> </label><input type="text" id="geojson-simplify" name="geojson-simplify">
							</div>

						<div class="gjt-input-container">
						<label for="geojson-truncate">Truncate Coordinates:<div class="gjt-description">Use a number between 2 and 20. Limit the number of decimals in the coordinates values. Recomended value: 6.</div></label><input type="text" id="geojson-truncate" name="geojson-trunca">
						</div>

						<div class="gjt-title">Output</div>
						<div class="gjt-input-container">
						<textarea id="geojson-output" name="geojson-output"></textarea>
						</div>
						<button id="gjt-copy">Copy</button>
					</form>
				</div>
				<div class="gjt-info gjt-loading">
					<div class="gjt-title">Warnings</div>
					<div id="gjt-warnings-container"></div>
					<div class="gjt-title">JSON Tree</div>
					<div id="gjt-json-tree-container"></div>

					<div class="gjt-title">Preview</div>
					<div class="map_wrapper">
						<div class="map_aspect_ratio">
							<div class="map_container">
								<div id="gjt-preview"></div>
							</div>
						</div>
					</div>
				</div>
			</div>';
	return $html;
}

/**
 * Enqueue js and css files for the geojson tester
 *
 * @return void
 */
function enqueue_geojson_tester_files( $version = '1.0.0' ) {

	wp_register_style( 'gjt-styles', plugins_url( 'assets/css/styles.css', __FILE__ ), array(), $version, 'all' );
	wp_enqueue_style( 'gjt-styles' );

	wp_register_style( 'gjt-jsonTree-styles', plugins_url( 'assets/js/jsonTree/jsonTree.css', __FILE__ ), array(), $version, 'all' );
	wp_enqueue_style( 'gjt-jsonTree-styles' );

	wp_register_script( 'gjt-jsonTree', plugins_url( '/assets/js/jsonTree/jsonTree.js', __FILE__ ), array(), $version, true );
	wp_enqueue_script( 'gjt-jsonTree' );

	wp_register_script( 'gjt-turf', 'https://unpkg.com/@turf/turf/turf.min.js', array(), $version, true );
	wp_enqueue_script( 'gjt-turf' );

	wp_register_script( 'gjt-amcharts', 'https://www.amcharts.com/lib/4/core.js', array(), $version, true );
	wp_enqueue_script( 'gjt-amcharts' );

	wp_register_script( 'gjt-amcharts-maps', 'https://www.amcharts.com/lib/4/maps.js', array( 'gjt-amcharts' ), $version, true );
	wp_enqueue_script( 'gjt-amcharts-maps' );

	wp_register_script( 'gjt-scripts', plugins_url( '/assets/js/scripts.js', __FILE__ ), array( 'gjt-turf', 'gjt-jsonTree', 'gjt-amcharts-maps' ), $version, true );
	wp_enqueue_script( 'gjt-scripts' );

}
