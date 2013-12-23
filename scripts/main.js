require([
  '$api/models',
  'scripts/playlist-chooser',
  'scripts/play',
  'scripts/references/index'
], function(models, playlistChooser, play) {
  'use strict';
    
  models.application.load('arguments').done(handleArgs);
  models.application.addEventListener('arguments', handleArgs);

  function handleArgs() {
    var args = models.application.arguments;

    $(".section").hide();        // Hide all sections

    if (args == null) {
        $('home').show();
        playlistChooser.doPlaylistChooser();
    }
    else {
        $('#' + args[0]).show();        // Show current section

        // If there are multiple arguments, handle them accordingly
        if (args[1]) {
            switch (args[0]) {
                case "play":
                    play.doPlay(args.slice(1, args.length));
                    break;
                default:
                    playlistChooser.doPlaylistChooser();
                    break;
            }
        }
        else {
            playlistChooser.doPlaylistChooser();
        }
    }
      
  };
});