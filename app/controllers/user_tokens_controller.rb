class UserTokensController < ApplicationController
  before_filter :authenticate_user!

  def index
    @user_tokens = current_user.user_tokens
  end

  def create
    @user_token = current_user.user_tokens.create!
    render :json => @user_token
  end

  def destroy
    current_user.user_tokens.find(params[:id]).destroy
    render :json => { :success => true }
  end
end