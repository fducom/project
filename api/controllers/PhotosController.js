/**
 * photosController
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

    var photosObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img')
    }

    // Create a photos with the params sent from 
    // the sign-up form --> new.ejs
    Photos.create(photosObj, function photosCreated(err, photos) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/photos/new');
      }

      // Log photos in

      // Change status to online
      
      photos.save(function(err, photos) {
        if (err) return next(err);

      // add the action attribute to the photos object for the flash message.
      photos.action = " photos ok"

      // Let other subscribed sockets know that the photos was created.
      Photos.publishCreate(photos);

        // After successfully creating the photos
        // redirect to the show action
        // From ep1-6: //res.json(photos); 

        res.redirect('/photos/show/' + photos.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Photos.findOne(req.param('id'), function foundPhotos(err, photos) {
      if (err) return next(err);
      if (!photos) return next();
      res.view({
        photos: photos
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all photoss in the photos collection(e.g. table)
	Photos.find(function foundPhotoss(err, photoss) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        photoss: photoss
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the photos from the id passed in via params
    Photos.findOne(req.param('id'), function foundPhotos(err, photos) {
      if (err) return next(err);
      if (!photos) return next('photos doesn\'t exist.');

      res.view({
        photos: photos
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var photosObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img')
      }
    

    Photos.update(req.param('id'), photosObj, function photosUpdated(err) {
      if (err) {
        return res.redirect('/photos/edit/' + req.param('id'));
      }

      res.redirect('/photos/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Photos.findOne(req.param('id'), function foundphotos(err, photos) {
      if (err) return next(err);

      if (!photos) return next('photos doesn\'t exist.');

      Photos.destroy(req.param('id'), function photosDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this photos is now logged in
        Photos.publishUpdate(photos.id, {
          name: photos.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the photos instance was destroyed.
        Photos.publishDestroy(photos.id);

      });        

      res.redirect('/photos');

    });
  },

  // This action works with app.js socket.get('/photos/subscribe') to
  // subscribe to the photos model classroom and instances of the photos
  // model
  subscribe: function(req, res) {
 
    // Find all current photoss in the photos model
    Photos.find(function foundphotoss(err, photoss) {
      if (err) return next(err);
 
      // subscribe this socket to the photos model classroom
      Photos.subscribe(req.socket);
 
      // subscribe this socket to the photos instance rooms
      Photos.subscribe(req.socket, photoss);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

};