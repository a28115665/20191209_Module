'use strict';

$.sound_path = appConfig.sound_path;
$.sound_on = appConfig.sound_on;


$(function () {

    // moment.js default language
    moment.locale('us')

    angular.bootstrap(document, ['app']);
 
});
