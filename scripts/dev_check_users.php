<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = App\Models\User::query()->select(['id', 'name', 'email'])->limit(10)->get();

echo 'count=' . App\Models\User::count() . PHP_EOL;
foreach ($users as $user) {
    echo $user->id . ' ' . $user->email . ' ' . ($user->name ?? '') . PHP_EOL;
}
