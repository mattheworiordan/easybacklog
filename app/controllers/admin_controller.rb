# encoding: utf-8

class AdminController < ApplicationController
  before_filter :authenticate_user!, :ensure_admin

  DATA = {
    :user => {
      :model => User,
      :name => 'Users',
      :columns => [:name, :email, { :accounts => :name }, :created_at, { :action => [:emulate] }],

    },
    :backlog => {
      :model => Backlog.masters,
      :name => 'Backlogs',
      :columns => [:name, { :account => :name }, :created_at]
    },
    :account => {
      :model => Account,
      :name => 'Accounts',
      :columns => [:name, { :users => :name }, 'backlogs.count', :created_at]
    },
    :story => {
      :model => Story,
      :name => 'Stories',
      :columns => [:as_a, :i_want_to, :so_i_can, { :theme => :name }, 'theme.backlog.name', 'theme.backlog.account.name', :created_at]
    },
    :invited_user => {
      :model => InvitedUser,
      :name => 'Invited Users',
      :columns => [:email, 'account.name', :created_at]
    },
    :beta_signup => {
      :model => BetaSignup,
      :name => 'Beta Signups',
      :columns => [:email, :company, :clicks, :unique_code, :created_at]
    }
  }

  def home
    @stats = {
      :user_count => User.all.count,
      :user_count_within_14_days => User.where("created_at >= ?", 14.days.ago).count,
      :account_count => Account.all.count,
      :backlog_count => Backlog.masters.count,
      :story_count => Story.all.count,
      :pending_invites => InvitedUser.all.count,
      :beta_signups => BetaSignup.all.count
    }

    @recent_cron_logs = CronLog.order('created_at DESC').limit(10)
  end

  def data
    table = params[:table]
    if DATA.has_key? table.to_sym
      data = DATA[table.to_sym]
      @title = data[:name]
      @data = data[:model].order('created_at DESC').paginate(:page => params[:page], :per_page => 25)
      @processed_data = @data.map do |row_data|
        row = {}
        data[:columns].map do |col|
          if col.kind_of? Symbol
            row[col] = row_data.send col
          elsif col.kind_of? String
            row[col] = send_command_from_string row_data, col
          elsif col.kind_of? Hash
            if col.has_key?(:action) && col[:action].include?(:emulate)
              row[:action] = "emulate:#{row_data.id}"
            else
              col.each do |relation_name, relation_field|
                relation = row_data.send relation_name
                if relation.nil?
                  ''
                elsif relation.respond_to? :count
                  # relation is a has_many, get a list
                  row[col] = relation.map { |relation_row| relation_row.send relation_field }.join(', ')
                else
                  # relation is a single record
                  row[col] = relation.send relation_field
                end
              end
            end
          end
        end
        row
      end
    else
      flash[:error] = 'Invalid URL, table could not be found'
      redirect_to admin_path
    end
  end

  def emulate_user
    user = User.find(params[:user_id])
    sign_in user
    flash[:warning] = "You are now logged in as #{user.name}"
    redirect_to dashboard_path
  end

  def export
    data = case params[:data]
    when 'all_users'
      [['full name','first name','email']].concat(User.all.map { |d| [d.name, d.name.split(' ').first.titleize, d.email] }).map{ |d| d.join(',') }.join("\n")
    when 'beta_signup'
      [['name','email']].concat(BetaSignup.all.map { |d| ['beta tester', d.email] }).map{ |d| d.join(',') }.join("\n")
    when 'not_signed_up_7_days'
      [['email','company','applied days ago']].concat(BetaSignup.where('LOWER(email) not in (select LOWER(email) from users)').map { |d| [d.email, "#{d.company}".gsub(/,/, ' '), (Date.today - d.created_at.to_date).to_i] }.select { |d| d[2] >= 7 }).map{ |d| d.join(',') }.join("\n")
    when 'not_used_7_days'
      [['email','sign ins', 'days since signed in','days since created','full name','first name']].concat(User.where('created_at >= ?', '7 Nov 2011').order('sign_in_count desc').map { |m| [m.email, m.sign_in_count, (Date.today - m.current_sign_in_at.to_date).to_i, (Date.today - m.created_at.to_date).to_i, m.name, m.name.split(' ').first.titleize] }.select { |d| d[2] >= 7 }).map { |d| d.join(',') }.join("\n")
    end
    headers["Content-Type"] = 'text/plain'
    render :text => data
  end

    private
      # send commands to an object using a string such as theme.backlog.account.name
      def send_command_from_string(object, commands)
        commands = commands.split('.')
        new_object = object.send commands.first
        if (commands.length > 1)
          send_command_from_string(new_object, commands[1..-1].join('.'))
        else
          new_object
        end
      end
end