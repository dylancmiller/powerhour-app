require([
  '$api/models',
  '$api/library#Library',
  '$views/image#Image',
  '$views/list#List'
], function (models, Library, Image, List) {
    'use strict';

    var tempPlaylist;
    var totalTime = 0;
    //var curTime = 10; //Test
    //var timeLimit = 30; //Test (3 songs)
    var curTime = 60; //Production
    var timeLimit = 3600; //Production (60 songs)

    var doPlay = function (args) {
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
                                    var playlistContainer = document.getElementById('playlist');
                                    playlistContainer.appendChild(list.node);
                                    list.init();
                                    list.selectItem(0);

                                    var image = Image.forPlaylist(origPlaylist, { width: 300, height: 300 });
                                    var albumContainer = document.getElementById('albumContainer');
                                    albumContainer.innerHTML = '';
                                    albumContainer.appendChild(image.node);

                                    models.player.addEventListener('change', genericChange);
                                    models.player.addEventListener('change:track', trackChanged);
                                    models.player.addEventListener('change:playing', playingChanged);
                                    models.player.addEventListener('change:context', contextChanged);
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

        models.player.load('context').done(function (player) {
            if (player.context.uri == tempPlaylist.uri) {
                //curTime = 10;
                curTime = 60;
                document.getElementById('curCounter').innerText = curTime;

                document.getElementById('curCounter-title').innerText = 'Seconds until next song:';

                var image = Image.forTrack(player.track, { width: 300, height: 300 });
                var coverContainer = document.getElementById('albumContainer');
                coverContainer.innerHTML = '';
                coverContainer.appendChild(image.node);
            }
        });
    }

    function playingChanged() {
        models.player.load('context', 'playing').done(function (player) {
            if (player.context.uri == tempPlaylist.uri) {
                if (player.playing) {
                    if (timerId != null) {
                        //Player was previously paused. Restart timer.
                        manageTimers(true);
                    }
                }
                else {
                    //Player is paused. Stop timer.
                    manageTimers(false);
                }
            }
        });
    }

    /**
    *  change:context is fired incorrectly. faking a context change by setting
    *  last_context_uri.
    */
    var lastContextUri = null;
    function contextChanged(e) {
        if (lastContextUri != e.target.context.uri || lastContextUri == null) {
            lastContextUri = e.target.context.uri;

            models.player.load('context').done(function (player) {
                if (player.context.uri == tempPlaylist.uri) {
                    //User started playing this context. Start timer.
                    manageTimers(true);
                }
                else {
                    //User is playing a different context. Delete temp playlist and timer.
                    models.Playlist.removeTemporary(tempPlaylist);
                    manageTimers(false);
                }
            });
        }
    }

    /**
    * Ensures there is only one timer added to the window at a time.
    */
    var timerId = null;
    var timers = [];
    function manageTimers(isSetInterval) {
        timers.forEach(function (timer) {
            clearInterval(timer);
        });
        timers.forEach(function () {
            timers.pop();
        });

        if (isSetInterval) {
            timerId = setInterval(updateTimerView, 1000);
            timers.push(timerId);
        }
    }

    function updateTimerView() {
        models.player.load('context').done(function (player) {
            models.player.load('context', 'playing').done(function (player) {
                if (player.context.uri == tempPlaylist.uri) {
                    if (totalTime >= timeLimit) {
                        models.player.stop();

                        //
                        //PowerHour is over!
                        //Ready for the next round?
                        //
                    }
                    else if (curTime <= 0) {
                        if (models.player.repeat) {
                            playNextTrack(player);
                        }
                        else {
                            //The player MUST be set to repeat.
                            models.player.setRepeat(true).done(function () {
                                playNextTrack(player);
                            });
                        }
                    }
                    else {
                        curTime--;
                        totalTime++;
                    }
                    document.getElementById('curCounter').innerText = curTime;

                    if (totalTime >= 60) {
                        document.getElementById('totalCounter').innerText = createHoursAndMinutesString(totalTime) + ' left';
                    }
                }
            });
        });
    }

    function playNextTrack(player) {
        player.skipToNextTrack().done(function () {
            var duration = player.track.duration;
            var start = 0;
            if (duration > 60000) {
                start = (duration - 60000) / 2;
            }
            player.seek(start).done(function () {
                curTime = 60;
                //curTime = 10;
            });
        });
    }

    function createHoursAndMinutesString(seconds) {
        seconds = 3600 - seconds;
        var sec_num = parseInt(seconds, 10); // don't forget the second parm
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        var time = '';

        if (hours == 1 && minutes == 0)
            time = hours + ' hour';
        if (hours > 1 && minutes == 0)
            time = hours + ' hours';
        else if (hours > 1)
            time = hours + ' hours and ';

        if (minutes == 1)
            time += minutes + ' minute';
        else if (minutes > 1)
            time += minutes + ' minutes';

        return time;
    }
});