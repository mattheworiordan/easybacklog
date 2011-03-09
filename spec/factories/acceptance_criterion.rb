Factory.sequence :acceptance_criterion_position do |n|
  n
end

Factory.define :acceptance_criterion do |a|
  a.criterion 'Must do something'
  a.position { Factory.next (:acceptance_criterion_position) }
  a.association :story, :factory => :story
  a.after_create { |ac| ac.story.acceptance_criteria.reload } # parent model needs refreshing as it will not know a new model has been created
end