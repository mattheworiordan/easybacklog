Ibacklog::Application.routes.draw do
  constraints(PrimaryDomain) do
    devise_for :users

    resources :accounts, :only => [:index, :show, :new, :create, :edit, :update] do
      resources :backlogs, :only => [:index, :show, :new, :create, :update, :destroy] do
        resources :users, :controller => 'backlog_users', :only => [:index, :update]
        collection do
          get 'compare/:base/:target' => 'snapshots#compare_snapshots', :as => 'compare_snapshots'
          get 'append-targets' => 'backlogs#append_targets', :as => 'append_targets'
        end
        member do
          match 'duplicate' => 'backlogs#duplicate', :via => [:get, :post], :as => 'duplicate'
          get 'edit' => 'backlogs#edit', :as => 'edit'
          put 'archive' => 'backlogs#archive', :as => 'archive'
          put 'recover-from-archive' => 'backlogs#recover_from_archive', :as => 'recover_from_archive'

          # back settings
          get 'user-settings' => 'backlog_user_settings#show'
          match 'user-settings' => 'backlog_user_settings#update', :via => [:put, :post]

          # REST for snapshots that use Backlogs controller
          get 'snapshots' => 'backlogs#index_snapshot'
          get 'snapshots/:snapshot_id' => 'backlogs#show_snapshot', :as => 'snapshot'
          post 'snapshots' => 'backlogs#create_snapshot', :as => 'create_snapshot'
          delete 'snapshots/:snapshot_id' => 'backlogs#destroy_snapshot', :as => 'delete_snapshot'
          # download for backlogs
          get 'snapshots/:snapshot_id/:file_name' => 'backlogs#show_snapshot', :as => 'download_snapshot'

          get 'stats' => 'backlog_stats#show'

          # simply allow a URL such as /backlogs/1/arbitrary-file-name.xls or .pdf so that IE uses a helpful filename
          get ':file_name' => 'backlogs#show', :as => 'download'
        end
      end
      resources :users, :controller => 'account_users', :only => [:index, :create, :new, :update, :destroy]
      resources :companies, :only => [:show, :edit, :update] do
        collection do
          get 'name_available' => 'companies#name_available'
        end
        resources :users, :controller => 'company_users', :only => [:index, :update]
      end
      resources :invites, :only => [:destroy] do
        member do
          get ':security_code' => 'invites#show', :as => 'show'
        end
      end
      member do
        get 'archives' => 'accounts#archives', :as => 'archives'
      end
      collection do
        get 'name_available' => 'accounts#name_available'
      end
    end

    resources :backlogs, :only => [] do
      resources :themes, :except => [:new, :edit] do
        member do
          match 're-number-stories' => 'themes#re_number_stories', :via => [:post]
          match 'add-existing-story/:story_id' => 'themes#add_existing_story', :via => [:post]
          match 'move-to-backlog/:target_backlog_id' => 'themes#move_to_backlog', :via => [:post]
        end
      end
      resources :sprints
    end

    resources :sprints, :only => [] do
      resources :sprint_stories, :path => 'sprint-stories', :except => [:new, :edit] do
        collection do
          put 'update-order' => 'sprint_stories#update_order'
        end
      end
    end
    resources :themes, :only => [] do
      resources :stories, :except => [:new, :edit] do
        member do
          match 'move-to-theme/:new_theme_id' => 'stories#move_to_theme', :via => [:post]
        end
      end
    end
    resources :stories, :only => [] do
      resources :acceptance_criteria, :except => [:new, :edit]
    end

    resources :user_tokens, :path => 'user-tokens', :only => [:index, :create, :destroy]

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
    get '/bunker/export/:data' => 'admin#export', :as => 'admin_export'
    get '/bunker/emulate/:user_id' => 'admin#emulate_user', :as => 'admin_emulate_user'
    match '/vanity(/:action(/:id(.:format)))', :controller=>:vanity, :as => 'vanity'

    root :to => 'beta_signups#index'
  end

  constraints(ApiDomain) do
    resources :accounts, :only => [:index, :show, :update] do
      resources :backlogs, :except => [:new, :edit] do
        member do
          get 'snapshots' => 'backlogs#index_snapshot'
          get 'snapshots/:snapshot_id' => 'backlogs#show_snapshot'
          delete 'snapshots/:snapshot_id' => 'backlogs#destroy_snapshot'
          post 'snapshots' => 'backlogs#create_snapshot', :as => 'create_snapshot'
          post 'duplicate' => 'backlogs#duplicate'
          get 'stats' => 'backlog_stats#show'
        end
      end
      resources :companies, :only => [:index, :show, :create, :update]
    end
    resources :backlogs, :only => [] do
      resources :themes, :except => [:new, :edit] do
        member do
          match 'grab-story' => 'themes#add_existing_story', :via => [:post]
          match 'move-to-backlog' => 'themes#move_to_backlog', :via => [:post]
        end
      end
      resources :sprints, :except => [:new, :edit]
    end
    resources :sprints, :only => [] do
      resources :sprint_stories, :path => 'sprint-stories', :except => [:new, :edit]
    end
    resources :themes, :only => [] do
      resources :stories, :except => [:new, :edit] do
        match 'move-to-theme' => 'stories#move_to_theme', :via => [:post]
      end
    end
    get 'stories/:id' => 'stories#show_without_theme_id'
    resources :stories, :only => [] do
      resources :acceptance_criteria, :path => 'acceptance-criteria', :except => [:new, :edit]
    end

    # routes to static controllers
    resources :locales, :only => [:index, :show]
    resources :scoring_rules, :path => 'scoring-rules', :only => [:index, :show]
    resources :sprint_story_statuses, :path => 'sprint-story-statuses', :only => [:index, :show]

    root :to => 'api#index'
  end

  get '/status' => 'health#status'
end