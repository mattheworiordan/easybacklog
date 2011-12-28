class BacklogStats
  def initialize(backlog)
    @backlog = backlog
  end

  def burn_down_data
    trend = []
    actual = []
    projected = []

    trend_points = @backlog.points
    actual_points = trend_points
    trend_finished = false

    sprints = @backlog.sprints.order('iteration asc')

    # start with sprint zero as nothing burnt down yet
    sprint = sprints.first.clone
    sprint.iteration = 0
    trend << burn_down_json(sprint, trend_points, 0, sprint.start_on, sprint.duration_days)
    actual << burn_down_json(sprint, actual_points, 0, sprint.start_on, sprint.duration_days) if (sprints.first.completed?)
    projected << burn_down_json(sprint, actual_points, 0, sprint.start_on, sprint.duration_days) unless (sprints.first.completed?)
    last_projected = sprint

    # iterate through each sprint and build up data based on configured sprints
    sprints.each do |sprint|
      if (trend_points > 0)
        expected_points = sprint.total_expected_points
        trend_points -= expected_points

        trend << burn_down_json(sprint, trend_points, expected_points, sprint.completed_on, sprint.duration_days) unless trend_finished
        trend_finished = true if trend_points < 0

        if sprint.completed?
          # log actual sprint data
          actual_points -= sprint.total_completed_points
          actual << burn_down_json(sprint, actual_points, sprint.total_completed_points, sprint.completed_on, sprint.duration_days)
        else
          # sprint is not complete, need to start working on projected data
          if projected.empty?
            # add first point as last completed sprint
            lastCompleted = sprints.completed.last
            projected << burn_down_json(lastCompleted, actual_points, lastCompleted.total_completed_points, lastCompleted.completed_on, lastCompleted.duration_days)
          end
          actual_points -= sprint.total_expected_based_on_average_points
          projected << burn_down_json(sprint, actual_points, sprint.total_expected_based_on_average_points, sprint.completed_on, sprint.duration_days)
        end
        last_projected = sprint
      end
    end

    # first sprint was completed, and there were no further sprints, so projected would be empty
    if projected.empty?
      lastCompleted = sprints.completed.last
      projected << burn_down_json(lastCompleted, actual_points, lastCompleted.total_completed_points, lastCompleted.completed_on, lastCompleted.duration_days)
    end

    if trend_points > 0
      # we need to estimate the rest of this backlog, spread out over working days
      # and create pseudo sprints until the trend points are down to zero
      trend.concat complete_trend(trend_points, sprints.last)
    end

    unless actual_points <= 0
      projected.concat complete_trend(actual_points, last_projected, true) unless last_projected.total_expected_based_on_average_points == 0
    end

    { :trend => trend, :actual => actual, :projected => projected }
  end

  def complete_trend(trend_points, lastSprint, useActualAverage=false)
    trend_data = []
    sprint = lastSprint.clone
    while trend_points > 0
      points_this_sprint = if useActualAverage
        sprint.total_expected_based_on_average_points
      else
        sprint.total_expected_points
      end
      trend_points -= points_this_sprint

      sprint.start_on = sprint.assumed_completed_on + 1.day
      sprint.iteration += 1

      trend_data << burn_down_json(sprint, trend_points, points_this_sprint, sprint.assumed_completed_on, sprint.duration_days)
    end
    trend_data
  end

  # return JSON representing this sprint
  # total_remaining_points represents total remaining points at the end of this sprint
  # points_this_sprint represents points completed this sprint
  # if total_remaining_points < 0 (when projection for sprint means total completed points goes past zero) then we need to adjust back to zero
  def burn_down_json(sprint, total_remaining_points, points_this_sprint, completed_date, days)
    if (total_remaining_points < 0)
      # if we've gone past 0 points, adjust back proportionally
      move_back_days = (1 + (sprint.assumed_completed_on - sprint.start_on).to_f) * (-total_remaining_points.to_f / points_this_sprint.to_f)
      points_this_sprint = points_this_sprint + total_remaining_points
      completed_date = completed_date - move_back_days.to_i.days
      days = days - move_back_days
      total_remaining_points = 0
    end

    {
      :starts_on => sprint.start_on,
      :completed_on => completed_date,
      :points => total_remaining_points,
      :iteration => sprint.iteration,
      :team => sprint.number_team_members,
      :duration => days.ceil,
      :completed => points_this_sprint,
      :actual => sprint.actual_velocity
    }
  end

  def velocity_stats
    {
      :expected_day => @backlog.velocity,
      :expected_sprint => @backlog.sprints.last.total_expected_points,
      :actual_day => @backlog.average_velocity,
      :actual_sprint => @backlog.sprints.last.total_expected_based_on_average_points
    }
  end

  def velocity_completed
    @backlog.sprints.completed.order('iteration asc').map do |sprint|
      {
        :starts_on => sprint.start_on,
        :completed_on => sprint.assumed_completed_on,
        :iteration => sprint.iteration,
        :team => sprint.number_team_members,
        :duration => sprint.duration_days,
        :completed => sprint.total_completed_points,
        :actual => sprint.actual_velocity
      }
    end
  end

  def burn_up_data
    total = []
    actual = []
    points_completed = 0
    last_sprint = nil

    sprints = @backlog.sprints.completed.order('iteration asc')

    @backlog.sprints.completed.order('iteration asc').map do |sprint|
      total << burn_up_json(sprint, sprint.snapshot.points)
      actual << burn_up_json(sprint, points_completed)
      points_completed += sprint.total_completed_points
      last_sprint = sprint
    end

    sprint = last_sprint.clone
    sprint.iteration = 0
    sprint.start_on = last_sprint.assumed_completed_on + 1.day
    total << burn_up_json(sprint, @backlog.points)
    actual << burn_up_json(sprint, points_completed)

    {
      :total => total,
      :actual => actual
    }
  end

  def burn_up_json(sprint, total_points)
    {
      :starts_on => sprint.start_on,
      :completed_on => sprint.assumed_completed_on,
      :iteration => sprint.iteration,
      :team => sprint.number_team_members,
      :duration => sprint.duration_days,
      :completed => sprint.total_completed_points,
      :actual => sprint.actual_velocity,
      :total_points => total_points
    }
  end
end