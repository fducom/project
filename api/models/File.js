/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  schema: true,

  attributes: {
  	
  	userPhoto: {
  		type: 'string',
  		required: true
  	},
	


    toJSON: function() {
      var obj = this.toObject();

      delete obj._csrf;
      return obj;
    }

  }

};
