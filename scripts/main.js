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

        console.log(args);

        // If there are multiple arguments, handle them accordingly
        if (args[1]) {
            switch (args[0]) {
                case "play":
                    play.doPlay(args[1]);
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