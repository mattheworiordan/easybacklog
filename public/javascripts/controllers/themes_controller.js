App.Controllers.Themes = Backbone.Controller.extend({
    routes: {
        "backlogs/1/theme/:id":       "edit",
        "companies/2/backlogs/1":          "index",
        "backlogs/1/themes/new":      "newObject"
    },

    edit: function(id) {
        alert ('not implemented');
        // var doc = new Document({ id: id });
        // doc.fetch({
        //     success: function(model, resp) {
        //         new App.Views.Edit({ model: doc });
        //     },
        //     error: function() {
        //         new Error({ message: 'Could not find that document.' });
        //         window.location.hash = '#';
        //     }
        // });
    },

    index: function() {
        $.getJSON('/backlogs/1/themes', function(data) {
            if(data) {
                var themes = _(data).map(function(i) { return new Theme(i); });
                new App.Views.Index({ documents: documents });
            } else {
              alert ('error loading themes')
                // new Error({ message: "Error loading documents." });
            }
        });
    },

    newObject: function() {
      alert ('not implemented');
      // new App.Views.Edit({ model: new Document() });
    }
});