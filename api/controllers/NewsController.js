var moment = require('moment');
moment.lang('fr');
/**
 * newsController
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

    var newsObj = {
      name: req.param('name'),
      title: req.param('title'),
      text: req.param('text'),
	  img: req.param('img'),
    }

    // Create a news with the params sent from 
    // the sign-up form --> new.ejs
    News.create(newsObj, function newsCreated(err, news) {

      // // If there's an error
      // if (err) return next(err);

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        }

        // If error redirect back to sign-up page
        return res.redirect('/news/new');
      }

      // Log news in

      // Change status to online
      
      news.save(function(err, news) {
        if (err) return next(err);

      // add the action attribute to the news object for the flash message.
      news.action = " news ok"

      // Let other subscribed sockets know that the news was created.
      News.publishCreate(news);

        // After successfully creating the news
        // redirect to the show action
        // From ep1-6: //res.json(news); 

        res.redirect('/news/show/' + news.id);
      });
    });
  },

  // render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    News.findOne(req.param('id'), function foundNews(err, news) {
      if (err) return next(err);
      if (!news) return next();
      res.view({
        news: news
      });
    });
  },

  index: function(req, res, next) {

    // Get an array of all newss in the news collection(e.g. table)
    News.find(function foundNewss(err, newss) {
      if (err) return next(err);
      // pass the array down to the /views/index.ejs page
      res.view({
        newss: newss
      });
    });
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the news from the id passed in via params
    News.findOne(req.param('id'), function foundNews(err, news) {
      if (err) return next(err);
      if (!news) return next('news doesn\'t exist.');

      res.view({
        news: news
      });
    });
  },

  // process the info from edit view
  update: function(req, res, next) {

      var newsObj = {
        name: req.param('name'),
        title: req.param('title'),
        text: req.param('text'),
		img: req.param('img')
      }
    

    News.update(req.param('id'), newsObj, function newsUpdated(err) {
      if (err) {
        return res.redirect('/news/edit/' + req.param('id'));
      }

      res.redirect('/news/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next) {

    News.findOne(req.param('id'), function foundNews(err, news) {
      if (err) return next(err);

      if (!news) return next('news doesn\'t exist.');

      News.destroy(req.param('id'), function newsDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this news is now logged in
        News.publishUpdate(news.id, {
          name: news.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the news instance was destroyed.
        News.publishDestroy(news.id);

      });        

      res.redirect('/news');

    });
  },

  // This action works with app.js socket.get('/news/subscribe') to
  // subscribe to the news model classroom and instances of the news
  // model
  subscribe: function(req, res) {
 
    // Find all current newss in the news model
    News.find(function foundnewss(err, newss) {
      if (err) return next(err);
 
      // subscribe this socket to the news model classroom
      News.subscribe(req.socket);
 
      // subscribe this socket to the news instance rooms
      News.subscribe(req.socket, newss);
 
      // This will avoid a warning from the socket for trying to render
      // html over the socket.
      res.send(200); 
    });
  }

};