# encoding: UTF-8

require 'spec_helper'

describe CronLog do
  it 'should clean up old log entries' do
    10.times { |c| FactoryGirl.create(:cron_log, :created_at => Time.now - 365.days) }
    10.times { |c| FactoryGirl.create(:cron_log, :created_at => Time.now - 1.day) }
    CronLog.cleanup
    CronLog.all.count.should == 10
  end
end
