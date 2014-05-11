
/**
 * news
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */
module.exports = {

  schema: true,

  attributes: {
  	
  	name: {
  		type: 'string',
  		required: true
  	},

  	title: {
  		type: 'string'
  	},
	
	text: {
  		type: 'string'
  	},
	
	img: {
  		type: 'string'
  	},



    toJSON: function() {
      var obj = this.toObject();
      delete obj._csrf;
      return obj;
    }
   
  }
  
 
};
