class BacklogStatsController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api

  include AccountResource

  def show
    @backlog = Backlog.find(params[:id])
    if @backlog.account.users.find(current_user.id).blank?
      send_json_error 'You do not have permission to view this backlog'
    else
      if @backlog.points == 0
        respond_with :zero_points => true
      else
        backlog_stats = BacklogStats.new @backlog
        respond_with :burn_down => backlog_stats.burn_down_data,
          :velocity_stats => backlog_stats.velocity_stats,
          :velocity_completed => backlog_stats.velocity_completed,
          :burn_up => backlog_stats.burn_up_data
      end
    end
  end
end