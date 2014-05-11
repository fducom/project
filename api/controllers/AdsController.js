/**
 * adsController
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

    var adsObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img')
    }

    // Create a ads with the params sent from 
    // the sign-up form --> new.ejs
    Ads.create(adsObj, function adsCreated(err, ads) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/ads/new');
      }

      // Log ads in

      // Change status to online
      
      ads.save(function(err, ads) {
        if (err) return next(err);

      // add the action attribute to the ads object for the flash message.
      ads.action = " ads ok"

      // Let other subscribed sockets know that the ads was created.
      Ads.publishCreate(ads);

        // After successfully creating the ads
        // redirect to the show action
        // From ep1-6: //res.json(ads); 

        res.redirect('/ads/show/' + ads.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    Ads.findOne(req.param('id'), function foundAds(err, ads) {
      if (err) return next(err);
      if (!ads) return next();
      res.view({
        ads: ads
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all adss in the ads collection(e.g. table)
	Ads.find(function foundAdss(err, adss) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        adss: adss
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the ads from the id passed in via params
    Ads.findOne(req.param('id'), function foundAds(err, ads) {
      if (err) return next(err);
      if (!ads) return next('ads doesn\'t exist.');

      res.view({
        ads: ads
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var adsObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img')
      }
    

    Ads.update(req.param('id'), adsObj, function adsUpdated(err) {
      if (err) {
        return res.redirect('/ads/edit/' + req.param('id'));
      }

      res.redirect('/ads/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    Ads.findOne(req.param('id'), function foundads(err, ads) {
      if (err) return next(err);

      if (!ads) return next('ads doesn\'t exist.');

      Ads.destroy(req.param('id'), function adsDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this ads is now logged in
        Ads.publishUpdate(ads.id, {
          name: ads.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the ads instance was destroyed.
        Ads.publishDestroy(ads.id);

      });        

      res.redirect('/ads');

    });
  },

  // This action works with app.js socket.get('/ads/subscribe') to
  // subscribe to the ads model classroom and instances of the ads
  // model
  subscribe: function(req, res) {
 
    // Find all current adss in the ads model
    Ads.find(function foundadss(err, adss) {
      if (err) return next(err);
 
      // subscribe this socket to the ads model classroom
      Ads.subscribe(req.socket);
 
      // subscribe this socket to the ads instance rooms
      Ads.subscribe(req.socket, adss);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

};