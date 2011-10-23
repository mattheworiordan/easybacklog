/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

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
        }, (this.className == 'notice' ? this.displayLength : this.displayLength * 2));

        return this;
    }
});

App.Views.Error = App.Views.Notice.extend({
    className: "error",
    defaultMessage: 'Uh oh! Something went wrong. Please try again.'
});

App.Views.Warning = App.Views.Notice.extend({
    className: "warning",
    defaultMessage: 'Unfortunately we could not perform that action.'
});