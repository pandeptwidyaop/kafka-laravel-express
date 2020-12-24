<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/ini', function () {
    phpinfo();
});

Route::get('/test/{message}', function ($message) {
    $conf = new \RdKafka\Conf();
    $conf->set('metadata.broker.list', 'kafka:9092');

    //If you need to produce exactly once and want to keep the original produce order, uncomment the line below
    //$conf->set('enable.idempotence', 'true');

    $producer = new \RdKafka\Producer($conf);

    $topic = $producer->newTopic("test");

    $topic->produce(RD_KAFKA_PARTITION_UA, 0, $message);
    $producer->poll(0);
    $result = $producer->flush(10000);

    if (RD_KAFKA_RESP_ERR_NO_ERROR !== $result) {
        throw new \RuntimeException('Was unable to flush, messages might be lost!');
    }
});
