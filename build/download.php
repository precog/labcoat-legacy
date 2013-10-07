<?php

$apiKey  = @$_GET['apiKey'];
$path    = @$_GET['path'];
$service = @$_GET['analyticsService'];
$version = 1;

function error($error) {
	die($error);
}

function collect($precog, $path, &$results) {
	$results[] = $cpath = substr($path, 0, strlen($path) - 1);
	$children = $precog->listChildren($path);
	if($children) {
		foreach ($children as $key => $child) {
			$spath = $cpath . $child;
			collect($precog, $spath, $results);
		}
	}
}

function path2name($path, $ext = ".json") {
	$path = trim($path, "/");
	$path = str_replace('/', '_', $path);
	if($path) {
		$path .= "_values";
	} else {
		$path = "values";
	}
	return $path . $ext;
}

if(!$apiKey) error("Invalid Api Key");
if(!$path) error("Invalid Path");
if(substr($path, -1) != '/') $path .= "/";
if(!$service) error("Invalid Analytic Service");
if(substr($service, -1) != '/') $service .= "/";
if(!$version) error("Invalid Version");

/*
echo "<pre>";
echo "Api Key: $apiKey, path: $path, service : $service\n";
*/
require("php/Precog.php");
require("php/zip.lib.php");

$precog = new PrecogAPI($apiKey, $service, $version);

$results = array();

// iterate and collect path children recursively
collect($precog, $path, $results);

$pathlen = strlen($path);

// create zip file
$zip = new zipfile();
// iterate paths
foreach ($results as $key => $sub) {
	// download all data at path
	$values = $precog->query("/$sub");
	$count = count($values);
	// continue if empty set
	if($count == 0) continue;
/*
	echo "$sub: $count\n";
*/
	// serialize object or add rawQuery
	$json = json_encode($values);

	// create entry name
	$name = path2name(substr($sub, $pathlen));
/*
	echo "$name\n$json\n\n";
*/
	// store entry
	$zip->addFile($json, $name);
}

header("Content-type: application/octet-stream");
header("Content-Disposition: attachment; filename=".path2name($path, ".zip"));
header("Content-Description: JSON Files");


// close and flush zip file

echo $zip->file();