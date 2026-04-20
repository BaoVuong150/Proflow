<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$board = App\Models\Board::first();
$board->load('columns');
$resolved = (new App\Http\Resources\BoardResource($board))->resolve();

$json = json_encode(['data' => $resolved]);
echo $json;
