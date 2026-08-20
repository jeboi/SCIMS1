<?php
$token = "19|i2pCqKvHnYAPBneoOhmKAmuTSnceh5uZKimf8wH209da3c5a";
$data = json_encode(["general" => ["language" => "es"]]);
$ch = curl_init("http://localhost:8000/api/user/preferences");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer " . $token,
    "Content-Type: application/json"
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);
