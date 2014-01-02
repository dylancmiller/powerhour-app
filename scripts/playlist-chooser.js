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
    playlistContainer.appendChild(coverContainer);

    var detailsContainer = document.createElement('div');
    detailsContainer.className = 'playlistDetails-container';
    playlistContainer.appendChild(detailsContainer);

    //Add playlist name
    var nameLink = document.createElement('a');
    nameLink.href = 'javascript:void(0);';
    nameLink.id = playlist.uri;
    nameLink.innerText = handleLongString(playlist.name.decodeForText());
    nameLink.className = 'playlistName';
    nameLink.onclick = function () {
        models.application.openURI(this.id);
    };
    detailsContainer.appendChild(nameLink);
    detailsContainer.innerHTML += '<br/>';

    playlist.owner.load('name').done(function (owner) {
        //Add owner
        var ownerLink = document.createElement('a');
        ownerLink.href = 'javascript:void(0);';
        ownerLink.id = playlist.owner.uri;
        ownerLink.className = 'playlistOwner';
        ownerLink.innerText = owner.name.decodeForText();
        ownerLink.onclick = function (obj) {
            models.application.openURI(this.id);
        };
        detailsContainer.appendChild(ownerLink);
        detailsContainer.innerHTML += '<br/><br/>';

        //Add description
        var descr = document.createElement('span');
        descr.className = 'playlistDescription';
        descr.innerText = playlist.description.decodeForText();
        detailsContainer.appendChild(descr);

        var goPlayButton = document.createElement('button');
        goPlayButton.id = playlist.uri;
        goPlayButton.className = 'goPlayButton';
        goPlayButton.innerText = 'Let\'s get started!';
        goPlayButton.onclick = function (obj) {
            models.application.openURI('spotify:app:powerhour-app:play:' + this.id);
        };
        detailsContainer.appendChild(goPlayButton);
    });

    return playlistContainer;
}

function handleLongString(str) {
    if (str.length > 55) {
        str = str.substring(0, 51)
        str += '...';
    }
    return str;
}