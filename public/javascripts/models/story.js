var Story = Backbone.Model.extend({
  Theme: function() {
    return this.collection.theme;
  },

  // access to acceptance criteria child collection
  AcceptanceCriteria: function() {
    if (this._acceptance_criteria == null) {
      this._acceptance_criteria = new AcceptanceCriteriaCollection(this.get('acceptance_criteria'), { story: this });
      this.unset('acceptance_criteria'); // clear from object as it will be sent back to the server adding to the payload
    }
    return (this._acceptance_criteria);
  }
});