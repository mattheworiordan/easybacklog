class BacklogUserSettingsController < ApplicationController
  include AccountResource
  before_filter :set_backlog

  def show
    settings = @backlog.backlog_user_settings.where(:user_id => current_user.id)
    if (settings)
      render :json => settings.first
    else
      render :json => {}
    end
  end

  # Support JSON updates only
  def update
    begin
      settings = @backlog.backlog_user_settings.find_or_create_by_user_id(current_user.id)
      settings.update_attributes! :filter => params[:filter], :collapsed_themes => params[:collapsed_themes]
      render :json => settings
    rescue ActiveRecord::RecordNotFound
      send_json_error "Invalid parameters sent"
    end
  end

  private
    def set_backlog
      # match on all backlogs, even snapshots or archived as user can set preferences on any backlog
      @backlog = Backlog.where(:id => params[:id], :account_id => current_account.id).first
    end
end