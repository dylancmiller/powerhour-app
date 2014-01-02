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

        curLibrary.starred.load('name', 'owner', 'description').done(function (starred) {
            document.getElementById('playlistChooser').appendChild(createPlaylistChooserItem(models, Library, Image, starred, true));

            curLibrary.playlists.snapshot().done(function (snapshot) {
                for (var i = 0, l = snapshot.length; i < l; i++) {
                    var curPlaylist = snapshot.get(i);
                    curPlaylist.load('name', 'owner', 'description').done(function (playlist) {
                        var isAlternate = i % 2 == 1;
                        document.getElementById('playlistChooser').appendChild(createPlaylistChooserItem(models, Library, Image, playlist, isAlternate));
                    });
                }
            });
        });
    }

    exports.doPlaylistChooser = doPlaylistChooser;
});

function createPlaylistChooserItem(models, Library, Image, playlist, isAlternate) {
    var playlistContainer = document.createElement('div');
    playlistContainer.className = 'playlistChooser-item';
    if (isAlternate)
        playlistContainer.className += ' playlistChooser-item-alt';
    var val = $('playlistChooser', 'home');
    //document.getElementById('playlistChooser').appendChild(playlistContainer);

    //var curPlaylist = snapshot.get(i);
    var image = Image.forPlaylist(playlist, { width: 150, height: 150 });
                
    var coverContainer = document.createElement('div');
    coverContainer.className = 'albumCover';
    coverContainer.appendChild(image.node);

    var coverLink = document.createElement('a');
    coverLink.href = '#';
    coverLink.id = playlist.uri;
    $(coverLink).click(function (obj) {
        models.application.openURI('spotify:app:powerhour-app:play:' + this.id);
    });
    coverLink.appendChild(coverContainer);
    playlistContainer.appendChild(coverLink);

    var detailsContainer = document.createElement('div');
    detailsContainer.className = 'playlistDetails-container';
    playlistContainer.appendChild(detailsContainer);
                
    var name = document.createElement('span');
    name.className = 'playlistName';
    name.innerText = playlist.name.decodeForText();
    detailsContainer.appendChild(name);

    var br = document.createElement("br");
    detailsContainer.appendChild(br);

    var owner = document.createElement('span');
    owner.className = 'playlistOwner';
    playlist.owner.load('name').done(function (ownerObj) {
        owner.innerText = 'by ' + ownerObj.name.decodeForText();
    });
    detailsContainer.appendChild(owner);

    var br = document.createElement("br");
    detailsContainer.appendChild(br);

    var descr = document.createElement('span');
    descr.className = 'playlistDescription';
    descr.innerText = playlist.description.decodeForText();
    detailsContainer.appendChild(descr);

    var br = document.createElement("br");
    detailsContainer.appendChild(br);

    return playlistContainer;
} 