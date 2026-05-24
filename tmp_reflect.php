<?php
require __DIR__ . '/vendor/autoload.php';
$r = new ReflectionClass('Illuminate\Foundation\Configuration\Middleware');
foreach ($r->getMethods(ReflectionMethod::IS_PUBLIC) as $m) {
    echo $m->getName() . PHP_EOL;
}
