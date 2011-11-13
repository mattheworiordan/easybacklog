class VanityController < ApplicationController
  use_vanity :current_user
  include Vanity::Rails::Dashboard
  before_filter :authenticate_user!, :ensure_admin
end