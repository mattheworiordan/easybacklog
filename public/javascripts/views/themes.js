App.Views.Themes = {
  Index: Backbone.View.extend({
    tagName: "div",
    className: "themes-list",

    initialize: function() {
      this.themes = this.options.themes;
      this.render();
    },

    render: function() {
      var out = JST['themes/index']({ collection: this.themes.models });
      $('#themes-container').html(out);
      this.themes.each(function(theme) {
        // build out story list
        new App.Views.Stories.List({ collection: theme.Stories() });
      })
    }
  }) //,
  // 
  // Show: Backbone.View.extend({
  //   tagName: 'li',
  //   className: 'theme',
  //   
  //   initialize: function() {
  //     this.themes = this.options.themes;
  //     this.render();
  //   },
  //   
  //   render: function() {
  //     if(this.documents.length > 0) {
  //         var out = JST['themes/index']({ collection: this.themes.models });
  //     } else {
  //         out = "<h3>No themes! <a href='#new'>Create one</a></h3>";
  //     }
  //     $(this.el).html(out);
  //     alert ('rendered');
  //   }
  // })
};