/**
 * kolomiyaController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  
  // This lokolomiya the sign-up page --> new.ejs
  'new': function(req, res) {
    res.view();
  },
  
      
  create: function(req, res, next) {

    var kolomiyaObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img'),
	  category: req.param('category')
    }

    // Create a kolomiya with the params sent from 
    // the sign-up form --> new.ejs
    Kolomiya.create(kolomiyaObj, function kolomiyaCreated(err, kolomiya) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/kolomiya/new');
      }

      // Log kolomiya in

      // Change status to online
      
      kolomiya.save(function(err, kolomiya) {
        if (err) return next(err);

      // add the action attribute to the kolomiya object for the flash message.
      kolomiya.action = " kolomiya ok"

      // Let other subscribed sockets know that the kolomiya was created.
      Kolomiya.publishCreate(kolomiya);

        // After successfully creating the kolomiya
        // redirect to the show action
        // From ep1-6: //res.json(kolomiya); 

        res.redirect('/kolomiya/show/' + kolomiya.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Kolomiya.findOne(req.param('id'), function foundKolomiya(err, kolomiya) {
      if (err) return next(err);
      if (!kolomiya) return next();
      res.view({
        kolomiya: kolomiya
      });
    });
  },

  zindex: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find().where({category: { '>' : '' }})
	.exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },
  sgdvokzal: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find({ category: 'gd-vokzal' }).exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },
    autovokzal: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find({ category: 'autovokzal' }).exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },
    citytransport: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find({ category: 'citytransport' }).exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },
    taxi: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find({ category: 'taxi' }).exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },
  pages: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find({ category: '' }).exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },
    index: function(req, res, next) {

    // Get an array of all kolomiyas in the kolomiya collection(e.g. table)
	Kolomiya.find({ category: req.param('id') }).exec(function foundKolomiyas(err, kolomiyas) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        kolomiyas: kolomiyas
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the kolomiya from the id passed in via params
    Kolomiya.findOne(req.param('id'), function foundKolomiya(err, kolomiya) {
      if (err) return next(err);
      if (!kolomiya) return next('kolomiya doesn\'t exist.');

      res.view({
        kolomiya: kolomiya
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var kolomiyaObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img'),
		category: req.param('category')
      }
    

    Kolomiya.update(req.param('id'), kolomiyaObj, function kolomiyaUpdated(err) {
      if (err) {
        return res.redirect('/kolomiya/edit/' + req.param('id'));
      }

      res.redirect('/kolomiya/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Kolomiya.findOne(req.param('id'), function foundkolomiya(err, kolomiya) {
      if (err) return next(err);

      if (!kolomiya) return next('kolomiya doesn\'t exist.');

      Kolomiya.destroy(req.param('id'), function kolomiyaDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this kolomiya is now logged in
        Kolomiya.publishUpdate(kolomiya.id, {
          name: kolomiya.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the kolomiya instance was destroyed.
        Kolomiya.publishDestroy(kolomiya.id);

      });        

      res.redirect('/kolomiya');

    });
  },

  // This action works with app.js socket.get('/kolomiya/subscribe') to
  // subscribe to the kolomiya model classroom and instances of the kolomiya
  // model
  subscribe: function(req, res) {
 
    // Find all current kolomiyas in the kolomiya model
    Kolomiya.find(function foundkolomiyas(err, kolomiyas) {
      if (err) return next(err);
 
      // subscribe this socket to the kolomiya model classroom
      Kolomiya.subscribe(req.socket);
 
      // subscribe this socket to the kolomiya instance rooms
      Kolomiya.subscribe(req.socket, kolomiyas);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

};