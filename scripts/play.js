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
  '$views/image#Image',
  '$views/list#List'
], function (models, Library, Image, List) {
    'use strict';

    var doPlay = function (args) {
        document.getElementById('playControls').innerHTML = '';
        document.getElementById('playlist').innerHTML = '';

        var playlistURI = args.join(':');
        var playlist = models.Playlist.fromURI(playlistURI);

        var list = List.forPlaylist(playlist);
        document.getElementById('playlist').appendChild(list.node);
        list.init();
        list.selectItem(0);

        var image = Image.forPlaylist(playlist, { width: 300, height: 300 });
        var coverContainer = document.createElement('div');
        coverContainer.id = 'albumCover';
        coverContainer.appendChild(image.node);
        document.getElementById('playControls').appendChild(coverContainer);

        var counterContainer = document.createElement('div');
        counterContainer.id = 'counterContainer';
        counterContainer.innerHTML = '<span class="counter-title">Seconds till next song:</span>';
        var counter = document.createElement('div');
        counter.id = 'counter';
        counter.innerText = '60';
        
        setInterval(function () {
            var curTime = parseInt(counter.innerText);
            if (curTime == 0) {
                //SWITCH SONG
                //When that's done...
                curTime = 61;
            }
            counter.innerText = curTime - 1;
        }, 1000);

        counterContainer.appendChild(counter);
        document.getElementById('playControls').appendChild(counterContainer);
    };

    exports.doPlay = doPlay;
});