class CronLog < ActiveRecord::Base
  def self.cleanup
    CronLog.where('created_at < ?', Time.now - 21.days).delete_all
  end
end