/**
 * staticController
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

    var staticObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img')
    }

    // Create a static with the params sent from 
    // the sign-up form --> new.ejs
    Static.create(staticObj, function staticCreated(err, static) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/static/new');
      }

      // Log static in

      // Change status to online
      
      static.save(function(err, static) {
        if (err) return next(err);

      // add the action attribute to the static object for the flash message.
      static.action = " static ok"

      // Let other subscribed sockets know that the static was created.
      Static.publishCreate(static);

        // After successfully creating the static
        // redirect to the show action
        // From ep1-6: //res.json(static); 

        res.redirect('/static/show/' + static.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Static.findOne(req.param('id'))
//.limit(4)
//.sort('createdAT DESC')
.exec(function foundStatic(err, static) {
      if (err) return next(err);
      if (!static) return next();
      res.view({
        static: static
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all statics in the static collection(e.g. table)
	Static.find(function foundStatics(err, statics) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        statics: statics,
		
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the static from the id passed in via params
    Static.findOne(req.param('id'), function foundStatic(err, static) {
      if (err) return next(err);
      if (!static) return next('static doesn\'t exist.');

      res.view({
        static: static
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var staticObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img')
      }
    

    Static.update(req.param('id'), staticObj, function staticUpdated(err) {
      if (err) {
        return res.redirect('/static/edit/' + req.param('id'));
      }

      res.redirect('/static/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Static.findOne(req.param('id'), function foundstatic(err, static) {
      if (err) return next(err);

      if (!static) return next('static doesn\'t exist.');

      Static.destroy(req.param('id'), function staticDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this static is now logged in
        Static.publishUpdate(static.id, {
          name: static.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the static instance was destroyed.
        Static.publishDestroy(static.id);

      });        

      res.redirect('/static');

    });
  },

  // This action works with app.js socket.get('/static/subscribe') to
  // subscribe to the static model classroom and instances of the static
  // model
  subscribe: function(req, res) {
 
    // Find all current statics in the static model
    Static.find(function foundstatics(err, statics) {
      if (err) return next(err);
 
      // subscribe this socket to the static model classroom
      Static.subscribe(req.socket);
 
      // subscribe this socket to the static instance rooms
      Static.subscribe(req.socket, statics);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

  
};