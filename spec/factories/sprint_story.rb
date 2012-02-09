Factory.define :sprint_story do |a|
  a.association :sprint
  a.association :story
  a.association :sprint_story_status
end