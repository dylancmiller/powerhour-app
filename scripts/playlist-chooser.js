require([
  '$api/models',
  '$api/library#Library',
  '$views/image#Image',
  'scripts/references/index'
], function (models, Library, Image) {
    'use strict';

    var doPlaylistChooser = function () {
        document.getElementById('playlistChooser').innerHTML = '';
        var curLibrary = Library.forCurrentUser();
        curLibrary.playlists.snapshot().done(function (snapshot) {
            for (var i = 0, l = snapshot.length; i < l; i++) {
                var playlistContainer = document.createElement('div');
                playlistContainer.className = 'playlistChooser-item';
                if (i % 2 == 1)
                    playlistContainer.className += ' playlistChooser-item-alt';
                var val = $('playlistChooser', 'home');
                document.getElementById('playlistChooser').appendChild(playlistContainer);

                var curPlaylist = snapshot.get(i);
                var image = Image.forPlaylist(curPlaylist, { width: 150, height: 150 });
                
                var coverContainer = document.createElement('div');
                coverContainer.className = 'albumCover';
                coverContainer.appendChild(image.node);

                var coverLink = document.createElement('a');
                coverLink.href = '#';
                $(coverLink).click(function () {
                    models.application.openURI('spotify:app:powerhour-app:play:' + curPlaylist.uri);
                });
                coverLink.appendChild(coverContainer);
                playlistContainer.appendChild(coverLink);

                var detailsContainer = document.createElement('div');
                detailsContainer.className = 'playlistDetails-container';
                playlistContainer.appendChild(detailsContainer);
                
                var name = document.createElement('span');
                name.className = 'playlistName';
                name.innerText = curPlaylist.name.decodeForText();
                detailsContainer.appendChild(name);

                var descr = document.createElement('span');
                descr.className = 'playlistDescription';
                descr.innerText = curPlaylist.description.decodeForText();
                detailsContainer.appendChild(descr);
                
            }
        });
    }

    exports.doPlaylistChooser = doPlaylistChooser;
});