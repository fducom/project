/**
 * wikiController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  
  // This lowiki the sign-up page --> new.ejs
  'new': function(req, res) {
    res.view();
  },
  
      
  create: function(req, res, next) {

    var wikiObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img'),
	  category: req.param('category')
    }

    // Create a wiki with the params sent from 
    // the sign-up form --> new.ejs
    Wiki.create(wikiObj, function wikiCreated(err, wiki) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/wiki/new');
      }

      // Log wiki in

      // Change status to online
      
      wiki.save(function(err, wiki) {
        if (err) return next(err);

      // add the action attribute to the wiki object for the flash message.
      wiki.action = " wiki ok"

      // Let other subscribed sockets know that the wiki was created.
      Wiki.publishCreate(wiki);

        // After successfully creating the wiki
        // redirect to the show action
        // From ep1-6: //res.json(wiki); 

        res.redirect('/wiki/show/' + wiki.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Wiki.findOne(req.param('id'), function foundWiki(err, wiki) {
      if (err) return next(err);
      if (!wiki) return next();
      res.view({
        wiki: wiki
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find().where({category: { '>' : '' }})
	.exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },
  gdvokzal: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find({ category: 'gd-vokzal' }).exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },
    autovokzal: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find({ category: 'autovokzal' }).exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },
    citytransport: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find({ category: 'citytransport' }).exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },
    taxi: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find({ category: 'taxi' }).exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },
  pages: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find({ category: '' }).exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },
    category: function(req, res, next) {

    // Get an array of all wikis in the wiki collection(e.g. table)
	Wiki.find({ category: req.param('id') }).exec(function foundWikis(err, wikis) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        wikis: wikis
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the wiki from the id passed in via params
    Wiki.findOne(req.param('id'), function foundWiki(err, wiki) {
      if (err) return next(err);
      if (!wiki) return next('wiki doesn\'t exist.');

      res.view({
        wiki: wiki
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var wikiObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img'),
		category: req.param('category')
      }
    

    Wiki.update(req.param('id'), wikiObj, function wikiUpdated(err) {
      if (err) {
        return res.redirect('/wiki/edit/' + req.param('id'));
      }

      res.redirect('/wiki/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Wiki.findOne(req.param('id'), function foundwiki(err, wiki) {
      if (err) return next(err);

      if (!wiki) return next('wiki doesn\'t exist.');

      Wiki.destroy(req.param('id'), function wikiDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this wiki is now logged in
        Wiki.publishUpdate(wiki.id, {
          name: wiki.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the wiki instance was destroyed.
        Wiki.publishDestroy(wiki.id);

      });        

      res.redirect('/wiki');

    });
  },

  // This action works with app.js socket.get('/wiki/subscribe') to
  // subscribe to the wiki model classroom and instances of the wiki
  // model
  subscribe: function(req, res) {
 
    // Find all current wikis in the wiki model
    Wiki.find(function foundwikis(err, wikis) {
      if (err) return next(err);
 
      // subscribe this socket to the wiki model classroom
      Wiki.subscribe(req.socket);
 
      // subscribe this socket to the wiki instance rooms
      Wiki.subscribe(req.socket, wikis);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

};