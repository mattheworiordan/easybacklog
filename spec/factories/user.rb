Factory.sequence :email do |n|
  "john.doe#{n}@acme.com"
end

Factory.define :user do |a|
  a.name 'John'
  a.email { Factory.next(:email) }
  a.password 'password'
  a.password_confirmation 'password'
end