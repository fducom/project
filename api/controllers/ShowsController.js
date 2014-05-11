/**
 * showsController
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

    var showsObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img')
    }

    // Create a shows with the params sent from 
    // the sign-up form --> new.ejs
    Shows.create(showsObj, function showsCreated(err, shows) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/shows/new');
      }

      // Log shows in

      // Change status to online
      
      shows.save(function(err, shows) {
        if (err) return next(err);

      // add the action attribute to the shows object for the flash message.
      shows.action = " shows ok"

      // Let other subscribed sockets know that the shows was created.
      Shows.publishCreate(shows);

        // After successfully creating the shows
        // redirect to the show action
        // From ep1-6: //res.json(shows); 

        res.redirect('/shows/show/' + shows.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Shows.findOne(req.param('id'))
//.limit(4)
//.sort('createdAT DESC')
.exec(function foundShows(err, shows) {
      if (err) return next(err);
      if (!shows) return next();
      res.view({
        shows: shows
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all showss in the shows collection(e.g. table)
	Shows.find(function foundShowss(err, showss) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        showss: showss,
		
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the shows from the id passed in via params
    Shows.findOne(req.param('id'), function foundShows(err, shows) {
      if (err) return next(err);
      if (!shows) return next('shows doesn\'t exist.');

      res.view({
        shows: shows
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var showsObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img')
      }
    

    Shows.update(req.param('id'), showsObj, function showsUpdated(err) {
      if (err) {
        return res.redirect('/shows/edit/' + req.param('id'));
      }

      res.redirect('/shows/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Shows.findOne(req.param('id'), function foundshows(err, shows) {
      if (err) return next(err);

      if (!shows) return next('shows doesn\'t exist.');

      Shows.destroy(req.param('id'), function showsDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this shows is now logged in
        Shows.publishUpdate(shows.id, {
          name: shows.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the shows instance was destroyed.
        Shows.publishDestroy(shows.id);

      });        

      res.redirect('/shows');

    });
  },

  // This action works with app.js socket.get('/shows/subscribe') to
  // subscribe to the shows model classroom and instances of the shows
  // model
  subscribe: function(req, res) {
 
    // Find all current showss in the shows model
    Shows.find(function foundshowss(err, showss) {
      if (err) return next(err);
 
      // subscribe this socket to the shows model classroom
      Shows.subscribe(req.socket);
 
      // subscribe this socket to the shows instance rooms
      Shows.subscribe(req.socket, showss);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

  
};