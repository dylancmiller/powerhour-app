//function playInput(args) {
//    // args[0] = page,  args[1] = command, args[2] = value 
//    // e.g. spotify:app:kitchensink:search:play:the+cure+close+to+me
//    var query = unescape(args[2].replace(/\+/g, " ")); //clean up the search query
//    console.log(query);
//    $("#search-term").val(query);
//    $("#search-" + args[1]).trigger('click');
//}

require([
  '$api/models',
  '$api/library#Library',
  '$views/image#Image'
], function (models, Library, Image) {
    'use strict';

    var doPlay = function (args) {
    };

    exports.doPlay = doPlay;
});