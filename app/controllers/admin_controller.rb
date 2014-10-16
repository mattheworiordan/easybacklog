# encoding: utf-8

class AdminController < ApplicationController
  before_filter :authenticate_user!, :ensure_admin

  DATA = {
    :user => {
      :model => User,
      :name => 'Users',
      :columns => [:name, :email, { :accounts => :name }, :created_at, { :action => [:emulate] }],
      :filter => [:name, :email]
    },
    :backlog => {
      :model => Backlog.masters,
      :name => 'Backlogs',
      :columns => [:name, { :account => :name }, :created_at],
      :filter => [:name]
    },
    :account => {
      :model => Account,
      :name => 'Accounts',
      :columns => [:name, { :users => :name }, 'backlogs.count', :created_at],
      :filter => [:name]
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
      :user_count => User.count,
      :user_count_within_14_days => User.where("created_at >= ?", 14.days.ago).count,
      :account_count => Account.count,
      :backlog_count => Backlog.masters.count,
      :story_count => Story.count,
      :pending_invites => InvitedUser.count,
      :beta_signups => BetaSignup.count
    }

    @recent_cron_logs = CronLog.order('created_at DESC').limit(10)
  end

  def data
    table = params[:table]
    if DATA.has_key? table.to_sym
      data = DATA[table.to_sym]
      @title = data[:name]
      @data = data[:model].order('created_at DESC')
      @filter = DATA[table.to_sym][:filter] ? true : false
      if @filter
        if params[:filter] && params[:filter].strip.present?
          param_safe = ActiveRecord::Base::sanitize("%#{params[:filter].strip}%")
          @data = @data.where(DATA[table.to_sym][:filter].map { |f| "#{f} ilike #{param_safe}" }.join(' or '))
        end
      end
      @data = @data.paginate(:page => params[:page], :per_page => 25)

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
                  row[col] = relation.map { |relation_row| [object_url(relation_row), relation_row.send(relation_field)] }
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
      csv_data = User.all.map { |d| [d.name, d.name.split(' ').first.titleize, d.email, d.created_at, d.last_sign_in_at, d.sign_in_count] }
      [['full name', 'first name', 'email', 'created', 'last sign in', 'sign ins']].concat(csv_data)
    when 'all_accounts'
      csv_data = Account.select('*, (select count(*) from account_users where account_users.account_id = accounts.id) as users_count').
        map { |a| [a.name, a.created_at, a.users_count] }
      [['name', 'created', 'users']].concat(csv_data)
    when 'beta_signup'
      [['name','email']].concat(BetaSignup.all.map { |d| ['beta tester', d.email] })
    when 'not_signed_up_7_days'
      [['email','company','applied days ago']].concat(BetaSignup.where('LOWER(email) not in (select LOWER(email) from users)').map { |d| [d.email, "#{d.company}".gsub(/,/, ' '), (Date.today - d.created_at.to_date).to_i] }.select { |d| d[2] >= 7 })
    when 'not_used_7_days'
      [['email','sign ins', 'days since signed in','days since created','full name','first name']].concat(User.where('created_at >= ?', '7 Nov 2011').order('sign_in_count desc').map { |m| [m.email, m.sign_in_count, (Date.today - m.current_sign_in_at.to_date).to_i, (Date.today - m.created_at.to_date).to_i, m.name, m.name.split(' ').first.titleize] }.select { |d| d[2] >= 7 })
    end
    headers["Content-Type"] = 'text/csv'
    render :text => to_csv(data)
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

      def object_url(obj)
        case
        when obj.kind_of?(User)
          admin_data_path('user', :filter => obj.name)
        when obj.kind_of?(Account)
          admin_data_path('account', :filter => obj.name)
        when obj.kind_of?(Backlog)
          admin_data_path('backlog', :filter => obj.name)
        else
          raise "Unknown object type #{obj.class}"
        end
      end

      def to_csv(data)
        data.map do |rows|
          rows.map do |cols|
            cols.to_s.gsub(',', ' ')
          end.join(',')
        end.join("\n")
      end
end
