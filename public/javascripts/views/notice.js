App.Views.Notice = Backbone.View.extend({
    className: "notice",
    displayLength: 5000,
    defaultMessage: '',
    
    initialize: function() {
        _.bindAll(this, 'render');
        this.message = this.options.message || this.defaultMessage;
        this.render();
    },
    
    render: function() {
        var view = this;
        
        $(this.el).html(this.message);
        $(this.el).hide();
        $('#alert-space').html(this.el);
        $(this.el).slideDown();
        _.delay(function() {
            $(view.el).slideUp();
            _.delay(function() {
                view.remove();
            }, 100);
        }, this.displayLength);
        
        return this;
    }
});

App.Views.Error = App.Views.Notice.extend({
    className: "alert",
    defaultMessage: 'Uh oh! Something went wrong. Please try again.'
});