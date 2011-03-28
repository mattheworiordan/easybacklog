class Devise::UsersController < ApplicationController
  # Used by AJAX form validator
  def email_available
    email = (params[:user] || {})[:email] || ''
    if User.where('UPPER(email) like ?', email.upcase).empty?
      render :text => 'true'
    else
      render :text => 'false'
    end
  end
end
