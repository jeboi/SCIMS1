<?php
$token = "19|i2pCqKvHnYAPBneoOhmKAmuTSnceh5uZKimf8wH209da3c5a";
$ch = curl_init("http://localhost:8000/api/user/profile");
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer " . $token,
    "Accept: application/json"
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);
