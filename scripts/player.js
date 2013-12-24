require([
  '$api/models',
  '$api/library#Library',
  '$views/image#Image',
  '$views/list#List'
], function (models, Library, Image, List) {
    'use strict';

    var doPlayer = function () {
        models.player.addEventListener('change', function () {
            
        });
    };

    exports.doPlayer = doPlayer;
});