xml.instruct!
xml.backlog do
  xml.backlog :name => @backlog.name, :account => @backlog.account.name, :company => @company.blank? ? 'none' : @company.name,
    :created_at => @backlog.created_at, :updated_at => @backlog.updated_at, :velocity => @backlog.velocity, :rate => @backlog.rate,
    :points => @backlog.points, :days => @backlog.days_formatted, :cost => @backlog.cost_formatted do
    render :partial => 'backlog_data', :locals => { :builder => xml, :backlog => @backlog }
  end
  xml.snapshots do
    @backlog.snapshots.each do |snapshot|
      xml.snapshot :name => snapshot.name, :created_at => @backlog.created_at, :velocity => snapshot.velocity, :rate => snapshot.rate,
        :points => snapshot.points, :days => snapshot.days_formatted, :cost => snapshot.cost_formatted do
        render :partial => 'backlog_data', :locals => { :builder => xml, :backlog => snapshot }
      end
    end
  end
  xml.sprints do
    @backlog.sprints.each do |sprint|
      xml.sprint :iteration => sprint.iteration, :start_on => sprint.start_on, :duration_days => sprint.duration_days,
        :number_team_members => sprint.number_team_members, :completed => sprint.completed?,
        :total_completed_points => sprint.total_completed_points, :total_allocated_points => sprint.total_allocated_points,
        :total_expected_points_for_this_sprint => sprint.total_expected_points do
        xml.stories do
          sprint.sprint_stories.each do |sprint_story|
            story = sprint_story.story
            xml.story :code => "#{story.theme.code}#{story.unique_id}", :status => sprint_story.sprint_story_status.status,
              :status_code => sprint_story.sprint_story_status.code, :done => story.done?,
              :score_50_when_assigned => sprint_story.sprint_score_50_when_assigned, :score_90_when_assigned => sprint_story.sprint_score_90_when_assigned
          end
        end
        if sprint.snapshot.present?
          xml.snapshot :name => sprint.snapshot.name, :velocity => sprint.snapshot.velocity, :rate => sprint.snapshot.rate,
            :points => sprint.snapshot.points, :days => sprint.snapshot.days_formatted, :cost => sprint.snapshot.cost_formatted do
            render :partial => 'backlog_data', :locals => { :builder => xml, :backlog => sprint.snapshot }
          end
        end
      end
    end
  end
end
