App.Views.BaseView = Backbone.View.extend({
  initialize: function() {
    console.log('BaseView initialize');
    this.model = this.options.model;
    this.beforeChangeValue = {};
    _.bindAll(this, 'beforeChange', 'contentUpdated');
  },

  // keep track if field has changed as no need for server round trip if nothing has changed
  beforeChange: function(value, settings, target)
  {
    var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
    this.beforeChangeValue[fieldId] = value; // store value in elem
    return (value);
  },

  // if a value has been updated, update the model and save to the server
  contentUpdated: function(value, settings, target)
  {
    var fieldId = $(target).parent().attr('class').replace(/\-/g, '_');
    var fieldWithValue = $(target);
    var beforeChangeValue = this.beforeChangeValue[fieldId];
    console.log(fieldWithValue);

    console.log('changed id: ' + fieldId);
    if (value != beforeChangeValue) {
      console.log('value for ' + fieldId + ' has changed from ' + this.beforeChangeValue[fieldId] + ' to ' + value);
      var attributes = {};
      attributes[fieldId] = value;
      this.model.set(attributes);
      this.model.save({}, { 
        error: function(model, response) {
          var errorMessage = 'Unable to save changes...'
          try {
            errorMessage = eval('responseText = ' + response.responseText).message;
          } catch (e) { console.log(e); }
          new App.Views.Error({ message: errorMessage});
          fieldWithValue.text(beforeChangeValue);
        }
      });
    }
    return (value);
  }
});