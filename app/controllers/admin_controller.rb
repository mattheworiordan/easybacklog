# encoding: utf-8

class AdminController < ApplicationController
  before_filter :authenticate_user!, :ensure_admin

  DATA = {
    :user => {
      :model => User.order('created_at DESC'),
      :columns => [:name, :email, { :accounts => :name }, :created_at, { :action => [:emulate] }],

    },
    :backlog => {
      :model => Backlog.order('created_at DESC'),
      :columns => [:name, { :account => :name }, :created_at]
    },
    :account => {
      :model => Account.order('created_at DESC'),
      :columns => [:name, { :users => :name }, 'backlogs.count', :created_at]
    },
    :story => {
      :model => Story.order('created_at DESC'),
      :columns => [:as_a, :i_want_to, :so_i_can, { :theme => :name }, 'theme.backlog.name', 'theme.backlog.account.name', :created_at]
    },
    :invited_user => {
      :model => InvitedUser.order('created_at DESC'),
      :columns => [:email, 'account.name', :created_at]
    },
    :beta_signup => {
      :model => BetaSignup.order('created_at DESC'),
      :columns => [:email, :company, :created_at]
    }
  }

  def home
    @stats = {
      :user_count => User.all.count,
      :user_count_within_14_days => User.where("created_at >= ?", 14.days.ago).count,
      :account_count => Account.all.count,
      :backlog_count => Backlog.all.count,
      :story_count => Story.all.count,
      :pending_invites => InvitedUser.all.count,
      :beta_signups => BetaSignup.all.count
    }
  end

  def data
    table = params[:table]
    if DATA.has_key? table.to_sym
      data = DATA[table.to_sym]
      @title = data[:model].class_name.titleize.pluralize
      @data = data[:model].paginate(:page => params[:page], :per_page => 25)
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
                if relation.respond_to? :count
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

      def ensure_admin
        unless is_admin?
          flash[:error] = 'You do not have permission to access the bunker'
          redirect_to root_path
        end
      end
end