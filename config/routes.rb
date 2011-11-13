Ibacklog::Application.routes.draw do
  devise_for :users

  resources :accounts, :only => [:index, :show, :new, :create, :edit, :update] do
    resources :backlogs, :only => [:show, :new, :create, :update, :destroy] do
      member do
        match 'duplicate' => 'backlogs#duplicate', :via => [:get, :post], :as => 'duplicate'
        get 'edit' => 'backlogs#edit', :as => 'edit'
        put 'archive' => 'backlogs#archive', :as => 'archive'
        put 'recover-from-archive' => 'backlogs#recover_from_archive', :as => 'recover_from_archive'

        # drop down partial
        get 'snapshots-list-html' => 'backlogs#snapshots_list_html'

        get 'snapshots/:snapshot_id' => 'backlogs#show_snapshot', :as => 'snapshot'
        post 'snapshots/create' => 'backlogs#create_snapshot', :as => 'create_snapshot'
        delete 'snapshots/:snapshot_id' => 'backlogs#destroy_snapshot', :as => 'delete_snapshot'
        # download for backlogs
        get 'snapshots/:snapshot_id/:file_name' => 'backlogs#show_snapshot', :as => 'download_snapshot'

        get 'sprint-snapshots/:snapshot_id' => 'backlogs#show_sprint_snapshot', :as => 'sprint_snapshot'
        get 'sprint-snapshots/:snapshot_id/:file_name' => 'backlogs#show_sprint_snapshot', :as => 'download_sprint_snapshot'

        # simply allow a URL such as /backlogs/1/arbitrary-file-name.xls or .pdf so that IE uses a helpful filename
        get ':file_name' => 'backlogs#show', :as => 'download'
      end
      collection do
        get 'compare/:base/:target' => 'snapshots#compare_snapshots', :as => 'compare_snapshots'
      end
    end
    resources :users, :controller => 'account_users'
    resources :companies, :only => [:show, :edit, :update]
    resources :invites, :only => [:destroy] do
      member do
        get ':security_code' => 'invites#show', :as => 'show'
      end
    end
    member do
      get 'archives' => 'backlogs#archives_index', :as => 'archives'
    end
    collection do
      get 'name_available' => 'accounts#name_available'
    end
  end

  resources :backlogs, :only => [:show] do
    resources :themes do
      member do
        match 're-number-stories' => 'themes#re_number_stories', :via => [:post]
      end
    end
    resources :sprints
    member do
      match 'backlog-stats' => 'backlog_stats#show'
    end
  end
  resources :sprints, :only => [:show] do
    resources :sprint_stories, :path => "sprint-stories" do
      collection do
        put 'update-order' => 'sprint_stories#update_order'
      end
    end
  end
  resources :themes, :only => [:show] do
    resources :stories do
      member do
        match 'move-to-theme/:new_theme_id' => 'stories#move_to_theme', :via => [:post]
      end
    end
  end
  resources :stories, :only => [:show] do
    resources :acceptance_criteria
  end

  get '/sprint-story-statuses' => 'sprint_story_statuses#index'

  resources :beta_signups, :only => [:index, :create, :show]

  get '/users/email_available' => 'devise/users#email_available'
  get '/contact' => 'pages#contact', :as => 'contact'
  get '/faq' => 'pages#faq', :as => 'faq'
  get '/browser-support' => 'pages#browser_support', :as => 'browser_support'
  get '/raise-error' => 'pages#raise_error'

  get '/beta/:unique_code' => 'beta_signups#index', :constraints => { :code => /[a-z0-9]{6}/i }, :as => 'beta_signup_referral'

  get '/dashboard' => 'pages#home', :as => 'dashboard'

  get '/bunker' => 'admin#home', :as => 'admin'
  get '/bunker/data/:table' => 'admin#data', :as => 'admin_data'
  get '/bunker/emulate/:user_id' => 'admin#emulate_user', :as => 'admin_emulate_user'
  match '/vanity(/:action(/:id(.:format)))', :controller=>:vanity, :as => 'vanity'

  root :to => 'beta_signups#index'
end