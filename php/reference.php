<?php

define("URL_REFERENCE", "http://quirrel-lang.org/reference.html");
define("MONGO_DB", "service_labcoat");
define("MONGO_COLLECTION", "quirrel_reference");

function body($pb) {
	$buf = array();
	foreach($pb as $p) {
		$buf[] = $p->html();
	}
	return join($buf, '\n');
}

function parse($dom) {
	$results = array();
	foreach ($dom("li") as $element) {
		$ph = $element->select("p:nth-child(0)");
		if(!count($ph))
			continue;
		$pb = $element->select("p:gt(0)");
		$results[] = array(
			'time'   => time(),
			'header' => $ph[0]->getInnerText(),
			'body'   => body($pb)
		);
	}
	return $results;
}

function getMongoCollection() {
	$m = new MongoClient();
	$db = $m->selectDB(MONGO_DB);
	return $db->selectCollection(MONGO_COLLECTION);
}

function getCache() {
	$coll = getMongoCollection();
	$time = time() - 2 * 60 * 60;
	$results = $coll->find(array('time' => array('$gt' => $time)));
	if($results->hasNext())
		return $results->getNext();
	else
		return false;
}

function setCache($value) {
	$coll = getMongoCollection();
	$coll->save($value);
}

function loadReference() {
	if(class_exists("MongoClient")) {
		if($cached = getCache()) {
			return json_encode($cached);
		}
		require_once("ganon.php");
		$dom = file_get_dom(URL_REFERENCE);
		$data = parse($dom);
		setCache($data);
		return json_encode($data);
	} else {
		require_once("ganon.php");
		$dom = file_get_dom(URL_REFERENCE);
		$data = parse($dom);
		return json_encode($data);
	}
}

echo loadReference();