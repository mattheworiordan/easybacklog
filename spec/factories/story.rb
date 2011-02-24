Factory.sequence :story_position do |n|
  n
end

Factory.define :story do |a|
  a.position { Factory.next(:story_position) }
  a.as_a 'User'
  a.i_want_to 'Search'
  a.so_i_can 'Find stuff'
  a.comments 'Whatever'
  a.score_50 5
  a.score_90 13
  a.association :theme, :factory => :theme
end