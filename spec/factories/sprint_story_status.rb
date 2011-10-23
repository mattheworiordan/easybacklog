Factory.sequence :sprint_story_status_status do |n|
  "Done#{n}"
end

Factory.sequence :sprint_story_status_code do |n|
  "D#{n}"
end

Factory.define :sprint_story_status do |a|
  a.status { Factory.next(:sprint_story_status_status) }
  a.code { Factory.next(:sprint_story_status_code) }
end