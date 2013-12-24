require([
  '$api/models',
  '$api/library#Library',
  '$views/image#Image',
  '$views/list#List'
], function (models, Library, Image, List) {
    'use strict';

    var counter;
    var tempPlaylistURI;

    var doPlay = function (args) {
        //Setup playlist and play controls
        document.getElementById('playControls').innerHTML = '';
        document.getElementById('playlist').innerHTML = '';

        var playlistURI = args.join(':');

        //Get original playlist
        models.Playlist.fromURI(playlistURI).load('tracks', 'name').done(function (origPlaylist) {
            //Create temp playlist
            models.Playlist.createTemporary(origPlaylist.name).done(function (_playlist) {
                _playlist.load('tracks').done(function (playlist) {
                    tempPlaylistURI = playlist.uri;
                    //Get original tracks
                    origPlaylist.tracks.snapshot().done(function (origTracksSS) {
                        origTracksSS.loadAll('name', 'artists', 'album', 'duration').done(function (origTracks) {
                            playlist.tracks.clear().done(function (clearedPreviousTracks) {
                                playlist.tracks.add(origTracks).done(function (addedManyTracks) {
                                    var list = List.forPlaylist(playlist
                                        //, {'fields': ['track', 'artist', 'album', 'duration']}
                                    );
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
                                    counter = document.createElement('div');
                                    counter.id = 'counter';
                                    //counter.innerText = '60';
                                    counter.innerText = '10';

                                    models.player.addEventListener('change', stopStartTimer);

                                    counterContainer.appendChild(counter);
                                    document.getElementById('playControls').appendChild(counterContainer);
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    exports.doPlay = doPlay;

    var timerId = -1;
    function stopStartTimer() {
        models.player.load('context', 'playing').done(function (player) {
            if (player.playing && player.context.uri == tempPlaylistURI) {
                if (timerId = -1) {
                    timerId = setInterval(updateTimerView, 1000);
                }
            }
            else {
                clearInterval(timerId);
                timerId = -1;
            }
        });
    };

    function updateTimerView() {
        models.player.load('context', 'playing').done(function (player) {
            if (player.playing && player.context.uri == tempPlaylistURI) {
                var curTime = parseInt(counter.innerText);
                if (curTime == 0) {
                    player.skipToNextTrack();
                    var duration = models.player.track.duration;
                    var start = 0;
                    if (duration > 60000) {
                        start = (duration - 60000) / 2;
                    }
                    player.seek(start).done(function () {
                        //curTime = 61;
                        curTime = 11;
                        counter.innerText = curTime - 1;
                    });
                }
                else {
                    counter.innerText = curTime - 1;
                }
            }
        });
    }
});