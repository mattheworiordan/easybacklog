class HealthController < ActionController::Base
  def status
    begin
      raise 'No users in the database' if User.count == 0
      render :text => "easyBacklog appears to be healthy", :status => 500, :content_type => "text/plain"
    rescue Exception => e
      render :text => "There's a big problem, help. #{e.message}", :status => 500, :content_type => "text/plain"
    end
  end
end