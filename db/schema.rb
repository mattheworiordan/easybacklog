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

ActiveRecord::Schema.define(:version => 20110331104615) do

  create_table "acceptance_criteria", :force => true do |t|
    t.integer "story_id",  :null => false
    t.string  "criterion", :null => false
    t.integer "position"
  end

  add_index "acceptance_criteria", ["story_id"], :name => "index_acceptance_criteria_on_story_id"

  create_table "backlogs", :force => true do |t|
    t.string   "name",                                     :null => false
    t.integer  "company_id",                               :null => false
    t.integer  "author_id",                                :null => false
    t.integer  "last_modified_user_id",                    :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal  "velocity"
    t.integer  "rate"
    t.integer  "snapshot_master_id"
    t.boolean  "deleted",               :default => false, :null => false
    t.boolean  "archived",              :default => false, :null => false
  end

  add_index "backlogs", ["archived"], :name => "index_backlogs_on_archived"
  add_index "backlogs", ["company_id"], :name => "index_backlogs_on_company_id"
  add_index "backlogs", ["deleted"], :name => "index_backlogs_on_deleted"
  add_index "backlogs", ["snapshot_master_id"], :name => "index_backlogs_on_snapshot_master_id"

  create_table "companies", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal  "default_velocity"
    t.integer  "default_rate"
    t.integer  "locale_id"
  end

  create_table "company_users", :force => true do |t|
    t.integer  "company_id", :null => false
    t.integer  "user_id",    :null => false
    t.boolean  "admin",      :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "company_users", ["company_id", "user_id"], :name => "index_company_users_on_company_id_and_user_id", :unique => true

  create_table "invited_users", :force => true do |t|
    t.string   "email",           :null => false
    t.integer  "company_id",      :null => false
    t.integer  "invitee_user_id", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "security_code",   :null => false
  end

  create_table "invites", :force => true do |t|
    t.string   "email"
    t.integer  "company_id"
    t.integer  "invitee_user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "locales", :force => true do |t|
    t.string   "name"
    t.string   "code"
    t.integer  "position"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "stories", :force => true do |t|
    t.integer  "theme_id",   :null => false
    t.integer  "unique_id",  :null => false
    t.string   "as_a"
    t.string   "i_want_to"
    t.string   "so_i_can"
    t.string   "comments"
    t.integer  "score_50"
    t.integer  "score_90"
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
  end

end
