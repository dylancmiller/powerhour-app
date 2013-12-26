require([
  '$api/models',
  '$api/library#Library',
  '$views/image#Image',
  '$views/list#List'
], function (models, Library, Image, List) {
    'use strict';

    var counter;
    var tempPlaylist;
    var curTime = 10;

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
                    tempPlaylist = playlist;
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

                                    var image = Image.forPlaylist(origPlaylist, { width: 300, height: 300 });
                                    var coverContainer = document.createElement('div');
                                    coverContainer.id = 'albumCover';
                                    coverContainer.appendChild(image.node);
                                    document.getElementById('playControls').appendChild(coverContainer);

                                    var counterContainer = document.createElement('div');
                                    counterContainer.id = 'counterContainer';
                                    counterContainer.innerHTML = '<span class="counter-title">Seconds till next song:</span>';
                                    counter = document.createElement('div');
                                    counter.id = 'counter';
                                    counter.innerText = curTime;

                                    models.player.addEventListener('change', genericChange);
                                    models.player.addEventListener('change:track', trackChanged);
                                    models.player.addEventListener('change:playing', playingChanged);
                                    models.player.addEventListener('change:context', contextChanged);

                                    counterContainer.appendChild(counter);
                                    document.getElementById('playControls').appendChild(counterContainer);

                                    //models.player.playContext(tempPlaylist);
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    exports.doPlay = doPlay;
    
    function genericChange() {
        var val = 0;
    }

    function trackChanged() {
        curTime = 10;
        counter.innerText = curTime;
    }

    var timerId = null;
    function playingChanged() {
        models.player.load('context', 'playing').done(function (player) {
            if (player.context.uri == tempPlaylist.uri) {
                if (player.playing) {
                    //Player was previously paused. Restart timer.
                    timerId = setInterval(updateTimerView, 1000);
                }
                else {
                    //Player is paused
                    clearInterval(timerId);
                }
            }
        });
    }

    function contextChanged() {
        models.player.load('context').done(function (player) {
            if (player.context.uri != tempPlaylist.uri) {
                //User is playing a different context. Delete temp playlist.
                models.Playlist.removeTemporary(tempPlaylist);
                clearInterval(timerId);
            }
        });
    }

    //
    //This block of code SHOULD work if change:context is fired correctly
    //
    //var timerId = null;
    //function playingChanged() {
    //    models.player.load('context', 'playing').done(function (player) {
    //        if (player.context.uri == tempPlaylist.uri) {
    //            if (player.playing) {
    //                if (timerId != null) {
    //                    //Player was previously paused. Restart timer.
    //                    timerId = setInterval(updateTimerView, 1000);
    //                }
    //            }
    //            else {
    //                //Player is paused
    //                clearInterval(timerId);
    //            }
    //        }
    //    });
    //}

    //function contextChanged() {
    //    models.player.load('context').done(function (player) {
    //        if (player.context.uri == tempPlaylist.uri) {
    //            //User started playing this context. Start timer.
    //            //timerId = setInterval(updateTimerView, 1000);
    //        }
    //        else {
    //            //User is playing a different context. Delete temp playlist.
    //            models.Playlist.removeTemporary(tempPlaylist);
    //            clearInterval(timerId);
    //        }
    //    });
    //}

    function updateTimerView() {
        models.player.load('context').done(function (player) {
            models.player.load('context', 'playing').done(function (player) {
                if (player.context.uri == tempPlaylist.uri) {
                    if (curTime <= 0) {
                        player.skipToNextTrack();
                        var duration = models.player.track.duration;
                        var start = 0;
                        if (duration > 60000) {
                            start = (duration - 60000) / 2;
                        }
                        player.seek(start).done(function () {
                            //curTime = 60;
                            curTime = 10;
                        });
                    }
                    else {
                        curTime--;
                    }
                    counter.innerText = curTime;
                }
            });
        });
    }
});