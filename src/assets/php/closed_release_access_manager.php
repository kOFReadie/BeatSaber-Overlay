<?php
//This file will be edited manually and I have not made it a database check because it is only a temporary thing.

$allowedUsers = array(
    '60d1de6254a82537157312' //readie
);

if (!in_array($_COOKIE['READIE_UID']??null, $allowedUsers))
{
    http_response_code(401);
    echo "401 Unauthorized";
    exit;
}