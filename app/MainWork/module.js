"use strict";

angular.module('app.mainwork', ['ui.router']);

angular.module('app.mainwork').config(function ($stateProvider){

    $stateProvider
    // .state('app.mainwork', {
    //     abstract: true,
    //     data: {
    //         title: 'Mainwork'
    //     }
    // })

    .state('app.mainwork', {
        url: '/mainwork',
        data: {
            title: 'MainWork'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/MainWork/views/main.html',
                controller: 'MainWorkCtrl',
                controllerAs: '$vm',
                resolve: {
                    
                }
            }
        }
    })
})