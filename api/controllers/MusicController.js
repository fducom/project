/**
 * musicController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  
  // This loads the sign-up page --> new.ejs
  'new': function(req, res) {
    res.view();
  },
  
      
  create: function(req, res, next) {

    var musicObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img')
    }

    // Create a music with the params sent from 
    // the sign-up form --> new.ejs
    Music.create(musicObj, function musicCreated(err, music) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/music/new');
      }

      // Log music in

      // Change status to online
      
      music.save(function(err, music) {
        if (err) return next(err);

      // add the action attribute to the music object for the flash message.
      music.action = " music ok"

      // Let other subscribed sockets know that the music was created.
      Music.publishCreate(music);

        // After successfully creating the music
        // redirect to the show action
        // From ep1-6: //res.json(music); 

        res.redirect('/music/show/' + music.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Music.findOne(req.param('id'), function foundMusic(err, music) {
      if (err) return next(err);
      if (!music) return next();
      res.view({
        music: music
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all musics in the music collection(e.g. table)
	Music.find(function foundMusics(err, musics) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        musics: musics
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the music from the id passed in via params
    Music.findOne(req.param('id'), function foundMusic(err, music) {
      if (err) return next(err);
      if (!music) return next('music doesn\'t exist.');

      res.view({
        music: music
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var musicObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img')
      }
    

    Music.update(req.param('id'), musicObj, function musicUpdated(err) {
      if (err) {
        return res.redirect('/music/edit/' + req.param('id'));
      }

      res.redirect('/music/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Music.findOne(req.param('id'), function foundmusic(err, music) {
      if (err) return next(err);

      if (!music) return next('music doesn\'t exist.');

      Music.destroy(req.param('id'), function musicDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this music is now logged in
        Music.publishUpdate(music.id, {
          name: music.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the music instance was destroyed.
        Music.publishDestroy(music.id);

      });        

      res.redirect('/music');

    });
  },

  // This action works with app.js socket.get('/music/subscribe') to
  // subscribe to the music model classroom and instances of the music
  // model
  subscribe: function(req, res) {
 
    // Find all current musics in the music model
    Music.find(function foundmusics(err, musics) {
      if (err) return next(err);
 
      // subscribe this socket to the music model classroom
      Music.subscribe(req.socket);
 
      // subscribe this socket to the music instance rooms
      Music.subscribe(req.socket, musics);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

};