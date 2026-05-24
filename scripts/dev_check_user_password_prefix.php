<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = $argv[1] ?? 'ayazeriate@gmail.com';
$user = App\Models\User::query()->where('email', $email)->first();

if (! $user) {
    fwrite(STDERR, "User not found: {$email}\n");
    exit(1);
}

echo $user->email . PHP_EOL;
echo substr((string) $user->password, 0, 4) . PHP_EOL;

