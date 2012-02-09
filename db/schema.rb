# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120208173333) do

  create_table "acceptance_criteria", :force => true do |t|
    t.integer "story_id",  :null => false
    t.text    "criterion", :null => false
    t.integer "position"
  end

  add_index "acceptance_criteria", ["story_id"], :name => "index_acceptance_criteria_on_story_id"

  create_table "account_users", :force => true do |t|
    t.integer  "account_id", :null => false
    t.integer  "user_id",    :null => false
    t.boolean  "admin",      :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "privilege"
  end

  add_index "account_users", ["account_id", "user_id"], :name => "index_account_users_on_account_id_and_user_id"

  create_table "accounts", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal  "default_velocity"
    t.integer  "default_rate"
    t.integer  "locale_id"
    t.boolean  "default_use_50_90"
    t.integer  "scoring_rule_id"
    t.boolean  "defaults_set"
  end

  create_table "backlogs", :force => true do |t|
    t.string   "name",                                      :null => false
    t.integer  "account_id",                                :null => false
    t.integer  "author_id",                                 :null => false
    t.integer  "last_modified_user_id",                     :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal  "velocity"
    t.integer  "rate"
    t.integer  "snapshot_master_id"
    t.boolean  "deleted",                :default => false, :null => false
    t.boolean  "archived",               :default => false, :null => false
    t.boolean  "use_50_90"
    t.integer  "company_id"
    t.integer  "snapshot_for_sprint_id"
    t.integer  "scoring_rule_id"
  end

  add_index "backlogs", ["account_id"], :name => "index_backlogs_on_account_id"
  add_index "backlogs", ["archived"], :name => "index_backlogs_on_archived"
  add_index "backlogs", ["company_id"], :name => "index_backlogs_on_company_id"
  add_index "backlogs", ["deleted"], :name => "index_backlogs_on_deleted"
  add_index "backlogs", ["snapshot_for_sprint_id"], :name => "index_backlogs_on_snapshot_for_sprint_id"
  add_index "backlogs", ["snapshot_master_id"], :name => "index_backlogs_on_snapshot_master_id"

  create_table "beta_signups", :force => true do |t|
    t.string   "email"
    t.string   "company"
    t.string   "unique_code"
    t.integer  "clicks"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "beta_signups", ["email"], :name => "index_beta_signups_on_email"
  add_index "beta_signups", ["unique_code"], :name => "index_beta_signups_on_unique_code"

  create_table "companies", :force => true do |t|
    t.integer  "account_id"
    t.string   "name"
    t.decimal  "default_velocity"
    t.integer  "default_rate"
    t.boolean  "default_use_50_90"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "companies", ["account_id"], :name => "index_companies_on_account_id"

  create_table "cron_logs", :force => true do |t|
    t.string   "message"
    t.text     "info"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "cron_logs", ["created_at"], :name => "index_cron_logs_on_created_at"

  create_table "invited_users", :force => true do |t|
    t.string   "email",           :null => false
    t.integer  "account_id",      :null => false
    t.integer  "invitee_user_id", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "security_code",   :null => false
    t.string   "privilege"
  end

  create_table "locales", :force => true do |t|
    t.string   "name"
    t.string   "code"
    t.integer  "position"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "scoring_rules", :force => true do |t|
    t.string  "code"
    t.string  "title"
    t.string  "description"
    t.integer "position"
  end

  add_index "scoring_rules", ["code"], :name => "index_scoring_rules_on_code"

  create_table "sprint_stories", :force => true do |t|
    t.integer  "sprint_id",                                                   :null => false
    t.integer  "story_id",                                                    :null => false
    t.integer  "position"
    t.decimal  "sprint_score_50_when_assigned", :precision => 5, :scale => 1
    t.decimal  "sprint_score_90_when_assigned", :precision => 5, :scale => 1
    t.integer  "sprint_story_status_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sprint_stories", ["sprint_id", "story_id"], :name => "index_sprint_stories_on_sprint_id_and_story_id"
  add_index "sprint_stories", ["sprint_id"], :name => "index_sprint_stories_on_sprint_id"
  add_index "sprint_stories", ["story_id"], :name => "index_sprint_stories_on_story_id"

  create_table "sprint_story_statuses", :force => true do |t|
    t.string  "status"
    t.string  "code"
    t.integer "position"
  end

  add_index "sprint_story_statuses", ["code"], :name => "index_sprint_statuses_on_code"

  create_table "sprints", :force => true do |t|
    t.integer  "backlog_id",                                        :null => false
    t.integer  "iteration",                                         :null => false
    t.date     "start_on",                                          :null => false
    t.decimal  "number_team_members", :precision => 6, :scale => 2
    t.integer  "duration_days",                                     :null => false
    t.datetime "completed_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal  "explicit_velocity",   :precision => 5, :scale => 1
  end

  add_index "sprints", ["backlog_id"], :name => "index_sprints_on_backlog_id"

  create_table "stories", :force => true do |t|
    t.integer  "theme_id",                                 :null => false
    t.integer  "unique_id",                                :null => false
    t.string   "as_a"
    t.string   "i_want_to"
    t.string   "so_i_can"
    t.text     "comments"
    t.decimal  "score_50",   :precision => 5, :scale => 1
    t.decimal  "score_90",   :precision => 5, :scale => 1
    t.integer  "position"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color"
  end

  add_index "stories", ["as_a"], :name => "index_stories_on_as_a"
  add_index "stories", ["theme_id", "unique_id"], :name => "index_stories_on_theme_id_and_unique_id", :unique => true
  add_index "stories", ["theme_id"], :name => "index_stories_on_theme_id"

  create_table "themes", :force => true do |t|
    t.integer  "backlog_id"
    t.string   "name"
    t.string   "code"
    t.integer  "position"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "themes", ["backlog_id"], :name => "index_themes_on_backlog_id"

  create_table "users", :force => true do |t|
    t.string   "name",                                                :null => false
    t.string   "email",                               :default => "", :null => false
    t.string   "encrypted_password",   :limit => 128, :default => "", :null => false
    t.string   "password_salt",                       :default => "", :null => false
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "reset_password_token"
    t.string   "remember_token"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                       :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "admin_rights"
  end

  create_table "vanity_conversions", :force => true do |t|
    t.integer "vanity_experiment_id"
    t.integer "alternative"
    t.integer "conversions"
  end

  add_index "vanity_conversions", ["vanity_experiment_id", "alternative"], :name => "by_experiment_id_and_alternative"

  create_table "vanity_experiments", :force => true do |t|
    t.string   "experiment_id"
    t.integer  "outcome"
    t.datetime "created_at"
    t.datetime "completed_at"
  end

  add_index "vanity_experiments", ["experiment_id"], :name => "index_vanity_experiments_on_experiment_id"

  create_table "vanity_metric_values", :force => true do |t|
    t.integer "vanity_metric_id"
    t.integer "index"
    t.integer "value"
    t.string  "date"
  end

  add_index "vanity_metric_values", ["vanity_metric_id"], :name => "index_vanity_metric_values_on_vanity_metric_id"

  create_table "vanity_metrics", :force => true do |t|
    t.string   "metric_id"
    t.datetime "updated_at"
  end

  add_index "vanity_metrics", ["metric_id"], :name => "index_vanity_metrics_on_metric_id"

  create_table "vanity_participants", :force => true do |t|
    t.string  "experiment_id"
    t.string  "identity"
    t.integer "shown"
    t.integer "seen"
    t.integer "converted"
  end

  add_index "vanity_participants", ["experiment_id", "converted"], :name => "by_experiment_id_and_converted"
  add_index "vanity_participants", ["experiment_id", "identity"], :name => "by_experiment_id_and_identity"
  add_index "vanity_participants", ["experiment_id", "seen"], :name => "by_experiment_id_and_seen"
  add_index "vanity_participants", ["experiment_id", "shown"], :name => "by_experiment_id_and_shown"
  add_index "vanity_participants", ["experiment_id"], :name => "index_vanity_participants_on_experiment_id"

end
