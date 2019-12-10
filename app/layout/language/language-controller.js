"use strict";

angular.module('app').controller("LanguagesCtrl",  function LanguagesCtrl($scope, $rootScope, $log, Language, APP_CONFIG){

    $rootScope.lang = $rootScope.lang || {};
    
    Language.getLanguages(function(data){

        var languageNumber = 0;
        data.forEach(function(value, index, fullArray){
            if(value.key == APP_CONFIG.view_lang){
                languageNumber = index;
            }
        });

        $rootScope.currentLanguage = data[languageNumber];

        $rootScope.languages = data;

        Language.getLang(data[languageNumber].key, function(data){

            $rootScope.lang = data;
        });

    });

    $scope.selectLanguage = function(language){
        $rootScope.currentLanguage = language;
        
        Language.getLang(language.key,function(data){

            $rootScope.lang = data;
            
        });
    }

    $rootScope.getWord = function(key){
        if(angular.isDefined($rootScope.lang[key])){
            return $rootScope.lang[key];
        } 
        else {
            return key;
        }
    }

});