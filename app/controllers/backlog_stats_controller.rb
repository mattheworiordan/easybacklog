class BacklogStatsController < ApplicationController
  respond_to *API_FORMATS
  before_filter :enforce_mime_type_for_api

  include AccountResource

  def show
    # preload backlog, sprints, and all sprint backlogs to reduce loading of data from the database
    @backlog = Backlog.includes(:stories,
        :sprints =>
        {
          :sprint_stories => [:story, :sprint_story_status],
          :snapshot =>
            [
              :stories,
              { :sprints =>
                { :sprint_stories => [:story, :sprint_story_status] }
              }
            ]
        }
      ).find(params[:id])

    if @backlog.account.users.find(current_user.id).blank?
      send_json_error 'You do not have permission to view this backlog'
    else
      if @backlog.points == 0
        respond_with :zero_points => true
      else
        backlog_stats = BacklogStats.new(@backlog)
        render_options = request.format.to_sym == :xml ? { :root => 'statistics'} : {}
        data = {
          :burn_down => backlog_stats.burn_down_data,
          :velocity_stats => backlog_stats.velocity_stats,
          :velocity_completed => backlog_stats.velocity_completed,
          :burn_up => backlog_stats.burn_up_data
        }
        render request.format.to_sym => data.send("to_#{request.format.to_sym}", render_options)
      end
    end
  end
end