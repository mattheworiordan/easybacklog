Factory.sequence :acceptance_criterion_position do |n|
  n
end

Factory.define :acceptance_criterion do |a|
  a.criterion 'Must do something'
  a.position { Factory.next (:acceptance_criterion_position) }
  a.association :story, :factory => :story
end