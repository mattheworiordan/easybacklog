Ibacklog::Application.routes.draw do
  devise_for :users

  resources :companies, :only => [:index, :show, :new, :create, :edit, :update] do
    resources :backlogs, :only => [:show, :new, :create, :update, :destroy] do
      member do
        match 'duplicate' => 'backlogs#duplicate', :via => [:get, :post], :as => 'duplicate'
      end
      member do
        # simply allow a URL such as /backlogs/1/arbitrary-file-name.xls or .pdf so that IE uses a helpful filename
        match ':file_name' => 'backlogs#show', :via => [:get], :as => 'download'
      end
      collection do
        get 'name_available' => 'backlogs#name_available'
      end
    end
    resources :users
    resources :invites, :only => [:destroy] do
      member do
        match ':security_code' => 'invites#show', :via => :get, :as => 'show'
      end
    end
    collection do
      get 'name_available' => 'companies#name_available'
    end
  end

  get '/users/email_available' => 'devise/users#email_available'

  resources :backlogs, :only => [:show] do
    resources :themes do
      member do
        match 're-number-stories' => 'themes#re_number_stories', :via => [:post]
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

  match '/contact' => 'pages#contact', :as => 'contact'
  root :to => "pages#home"
end