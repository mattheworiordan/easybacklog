Factory.sequence :theme_name do |n|
  "Theme-#{n}"
end

Factory.sequence :theme_code do |n|
  n.to_s.split(//).map { |d| (d.to_i+65).chr }.join # return alphabetic characters
end

Factory.sequence :theme_position do |n|
  n
end

Factory.define :theme do |a|
  a.name { Factory.next(:theme_name) }
  a.code { Factory.next(:theme_code) }
  a.position { Factory.next(:theme_position) }
  a.association :backlog, :factory => :backlog
end