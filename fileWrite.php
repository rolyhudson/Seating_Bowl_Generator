<?php
$dxfname = $_REQUEST['filename'];
$txt = $_REQUEST['dxfdata'];
$mode = $_REQUEST['mode'];


$myfile = fopen($dxfname, $mode) or die("Unable to open file!");

foreach ($lines as $line) {
  fwrite($myfile,  $line . "\n");
}
fclose($myfile);
/*
http://stackoverflow.com/questions/4798025/what-is-the-best-way-to-write-a-large-file-to-disk-in-php
<?php
// Example 1
$pizza  = "piece1 piece2 piece3 piece4 piece5 piece6";
$pieces = explode(" ", $pizza);
echo $pieces[0]; // piece1
echo $pieces[1]; // piece2



$myfile = fopen(filename, mode);
$lines = explode("\n", $txt);

foreach ($lines as $line) {
  fwrite($myfile,  $line . "\n");
}

while (!feof($sp)) {
   $buffer = fread($sp, 512);  // use a buffer of 512 bytes
   fwrite($op, $buffer);
}

// append new data
fwrite($op, $new_data);    

// close handles
fclose($op);
fclose($sp);

// make temporary file the new source
rename('tempfile', 'source');
*/
?>

