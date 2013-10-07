<?php

define('ISCLI', PHP_SAPI === 'cli');
$GLOBALS['allowedformats'] = array("json", "csv", "zip");
$errorReported = false;
// UTILS
function trace() {
	$args = func_get_args();
	foreach ($args as $key => $message) {
		if(!is_string($message))
			$args[$key] = json_encode($message);
	}

	error_log((ISCLI ? "CLI" : "SER").": ".implode(" ", $args)."\n", 3, "/tmp/labcoat-upload.log");
}

function handleShutdown() {
	global $file;
	global $errorReported;
    $error = error_get_last();
    if($error !== NULL && !$errorReported) {
        $info = "[SHUTDOWN] file:".$error['file']." | ln:".$error['line']." | msg:".$error['message'] .PHP_EOL;
        trace($info, $error);
        clierror($file, "The entry required too much memory.");
    }
}

function get_request_headers() {
    $headers = array();
    foreach($_SERVER as $key => $value) {
        if(strpos($key, 'HTTP_') === 0) {
            $headers[str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))))] = $value;
        }
    }
    return $headers;
}

function message($msg) {
    header('Content-Type: application/json');
    jsonmessage(json_encode($msg));
}

function jsonmessage($msg) {
	die($msg);
}

function error($msg) {
	trace("ERROR:", $msg);
	header('HTTP/1.1 500 Internal Server');
	message(array('error' => $msg, 'code' => 500));
}

function jsonerror($msg) {
	header('HTTP/1.1 500 Internal Server');
	jsonmessage($msg);
}

function statusfile($contentfile) {
	return $contentfile . ".status.json";
}

function writestatus($file, $content) {
	file_put_contents(statusfile($file), json_encode($content));
}

function changestatuspermissions($file) {
	chmod(statusfile($file), 0666);
}

function delete_file($file) {
//    unlink($file);
}

function removestatus($file) {
	delete_file(statusfile($file));
}

function tmpstatusfile($id) {
	$dir = sys_get_temp_dir();
	if("/" != substr($dir, -1)) $dir .= "/";
	return "$dir/$id";
}

function cliterminate($file) {
	delete_file($file);
	sleep(5);
	removestatus($file);
	die;
}

function clierror($file, $error) {
	global $errorReported;
	trace("ERROR:", $error, "\nfor:", $file);
	writestatus($file, array("error" => $error, "code" => 500 ));
	cliterminate($file);
	$errorReported = true;
}

function clistatus($file, $done, $total, $failures) {
	writestatus($file, array("done" => $done, "total" => $total , "failures" => $failures ));
	if($done == $total)
		cliterminate($file);
}

// ACTIONS
function status($id) {
	$file = statusfile(tmpstatusfile($id));
	if(is_file($file)) {
		$content = file_get_contents($file);
		$json = json_decode($content, true);
		if(isset($json["error"]))
			jsonerror($content);
		else
			jsonmessage($content);
	} else {
		error("error creating status file");
	}
}

function extractFiles($file, $destination, $formats) {
	$zip = new ZipArchive();
	if($zip->open($file) === false) {
		return null;
	}
	$entries = array();
	$results = array('records' => array(), 'failures' => 0);
	for($i = 0; $i < $zip->numFiles; $i++) {
		$entry = $zip->getNameIndex($i);
		foreach ($formats as $key => $format) {
			if(strtolower(substr($entry, -strlen($format))) === $format) {
				if(strpos($entry, '/.') || substr($entry, 0, 1) == '.')
					continue;
				$src = 'zip://'.$file.'#'.$entry;
				$dst = "$destination/$entry";
				try {
					copy($src, $dst);
				} catch(Exception $e) {
					trace("unable to extract the entry $entry", $e);
					continue;
				}
				if(!file_exists($dst)) {
					clierror($file, "unable to find the '$entry' entry");
				}
				try {
					$content = file_get_contents($dst);
				} catch(Exception $e) {
				    trace($file, "unable to open '$entry' ($dst). " . $e);
					clierror($file, "unable to open '$entry'. " . $e);
				}
				if($content === FALSE) {
					clierror($file, "unable to open '$entry', file is too big.");
				}
				if(!trim($content)) {
					trace("skipping empty file $entry");
					continue;
				}
				switch($format) {
					case "csv":
						$result = parsecsv($content);
						break;
					case "json":
						$result = parsejson($content);
						break;
				}
				if($result) {
					$results["records"] = array_merge($results["records"], $result["records"]);
					$results["failures"] += $result["failures"];
				} else {
					$results["failures"]++;
				}
			}
		}
	}
	return $results;
}

function parsezip($file) {
	try {
    	return extractFiles($file, sys_get_temp_dir(), array('json', 'csv'));
	} catch(Exception $e) {
		clierror($file, "unable to extract files from zip.", $e);
	}
}

function parsejson($content) {
	$records = array();
	$errors  = 0;
	$total   = 0;
	try {
		$json = json_decode($content, true);
		if(null == $json) {
			throw new Exception("Invalid JSON", 1);
		}
		if(isset($json[0])) // is indexed
			$records = $json;
		else
			$records[] = array($json);
		$total = count($records);
	} catch(Exception $e) {
		// try one json per line
		$lines = explode("\n", $content);
		foreach ($lines as $key => $value) {
			if(!$value) continue;
			$value = trim($value);
			$total++;
			if(!(substr($value, 0, 1) == '{' && substr($value, -1) == '}') || null == ($record = json_decode($value, true)))
				$errors++;
			else
				$records[] = $record;
		}
	}
	if($errors == $total) // all errors, invalid file format
		return null;
	else
		return array("records" => $records, "failures" => $errors);
}

function parsecsv($content) {
	$records = array();

	try {
		$lines = preg_split("/\r\n|\n|\r/", $content);

		while(!($line = array_shift($lines))) {}
		$headers = str_getcsv($line);
		$len = count($headers);

		foreach ($lines as $key => $line) {
			if(!$line) continue;
			set_time_limit(0);
			$values = str_getcsv($line);
			$ob = array();
			for($i = 0; $i < $len; $i++) {
				$ob[$headers[$i]] = is_numeric($values[$i]) ? 0+$values[$i] : $values[$i];
			}
			$records[] = $ob;
		}
	} catch(Exception $e) {
		return null;
	}
	if(0 == count($records)) // all errors, invalid file format
		return null;
	else
		return array("records" => $records, "failures" => 0);
}

function humanizeBytes($size) {
    $unit=array('b','kb','mb','gb','tb','pb');
    return @round($size/pow(1024,($i=floor(log($size,1024)))),2).' '.$unit[$i];
}

function track($file, $format, $path, $apikey, $service) {
	require("php/Precog.php");
	// open file
	$result;
	// parse contents
	switch($format) {
		case "csv":
			$result = parsecsv(file_get_contents($file));
			break;
		case "json":
			$result = parsejson(file_get_contents($file));
			break;
		case "zip":
			$result = parsezip($file);
			break;
	}
	if(null == $result) {
		clierror($file, "invalid content for " . $format);
	}
	// calculate totals
	$total = count($result['records']) + $result['failures'];
	$current = $result['failures'];
	clistatus($file, $current, $total, $result['failures']);

	if(substr($service, -1) != '/')
		$service .= "/";
	if(substr($path, -1) != '/')
		$path .= "/";

	$precog = new PrecogAPI($apikey, $service);
	// iterate on each line
	foreach ($result['records'] as $key => $value) {
		//	track single event
		if(!$precog->store($path, $value)) {
			$result['failures']++;
			echo $precog->errorMessage ."\n";
		}
		//	write status file
		clistatus($file, ++$current, $total, $result['failures']);
	}
	// delete $filename
	delete_file($file);
	// write final status file
	clistatus($file, $total, $total, $result['failures']);
	die("stored $total events ({$result['failures']} failures)");
}

function execute($id, $upload, $path, $apikey, $service) {
	// move the file to a temp location
	$file = tmpstatusfile($id);
	move_uploaded_file($upload['tmp_name'], $file);
	chmod($file, 0666);
	// writes the initial status file
	clistatus($file, 0, -1, 0);
	changestatuspermissions($file);
	// prepare the threaded service
	$format = strtolower(array_pop(explode('.', $upload['name'])));
	if(!in_array($format, $GLOBALS['allowedformats'])) {
		$format = 'json';
	}
	$script = __FILE__;
	$run = "php -q $script";
	$cargs = array();
	foreach (array($file, $format, $path, $apikey, $service) as $key => $value) {
		$cargs[] = escapeshellarg($value);
	}
	$run .= ' ' . implode(' ', $cargs);
	// EXECUTE
	`$run > /dev/null &`;
}

// APP
if(ISCLI) {
	register_shutdown_function('handleShutdown');
	try {
		// check arguments length
		if(!isset($argv) || count($argv) != 6) {
			// no filename ... no way to send a proper message
			trace("invalid number of arguments");
			die("invalid number of arguments\n");
		}
		array_shift($argv);
		// get arguments
		list($file, $format, $path, $apikey, $service) = $argv;
		if(!is_file($file)) {
			trace("no data file");
			die("no data file");
		}
		if(!$format)  clierror($file, "invalid format argument");
		if(!$path)    clierror($file, "invalid path argument");
		if(!$apikey)   clierror($file, "invalid token argument");
		if(!$service) clierror($file, "invalid service argument");
		track($file, $format, $path, $apikey, $service);
	} catch(Exception $e) {
		trace($e);
	}
} elseif(isset($_GET['uuid'])) {
	status($_GET['uuid']);
} elseif (strtolower($_SERVER['REQUEST_METHOD']) == 'post') {
	if(@$_FILES["file"]["error"]) {
		error($_FILES["file"]["error"]);
	}
	$headers = get_request_headers();

	if(!isset($headers["X-Precog-Uuid"])) error("UUID is not in the request");
	$id = $headers["X-Precog-Uuid"];

	if(!isset($headers["X-Precog-Path"])) error("Path is not in the request");
	$path = $headers["X-Precog-Path"];

	if(!isset($headers["X-Precog-Apikey"])) error("Apikey is not in the request");
	$apikey = $headers["X-Precog-Apikey"];

	if(!isset($headers["X-Precog-Service"])) error("Service is not in the request");
	$service = $headers["X-Precog-Service"];

	if(!isset($headers["X-File-Name"])) error("File Name is not in the request");
	$filename = $headers["X-File-Name"];


	// use a fastest service
	$betas = "https://devapi.precog.com/";
	$beta  = "http://devapi.precog.com/";
	$local = "http://localhost:30060/";
	if($service === $betas)
	    $service = $beta;
//	if($service === $beta)
//        $service = $local;
    // end

	if(!isset($_FILES["file"])) {
		error("uploaded file is too big for Labcoat (max upload size is: ".ini_get('post_max_size').")");
	}
	$file = $_FILES["file"];

	try {
		execute($id, $file, $path, $apikey, $service);
		message(array("message" => "tracking service started: " . tmpstatusfile($id) . " $path $apikey $service"));
		exit();
	} catch(Exception $e) {
		error("unable to initialize the track queue:", $e);
	}
} else {
	error("Invalid Call");
}


