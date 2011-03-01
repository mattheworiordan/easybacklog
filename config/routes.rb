Ibacklog::Application.routes.draw do
  devise_for :users

  resources :companies, :only => [:index, :show, :new, :create] do
    resources :backlogs, :only => [:show, :new, :create, :update, :destroy] do
      member do
        match 'duplicate' => 'backlogs#duplicate', :via => [:get, :post], :as => 'duplicate'
      end
    end
  end

  resources :backlogs, :only => [:show] do
    resources :themes
  end

  resources :themes, :only => [:show] do
    resources :stories
  end

  match '/contact' => 'pages#contact', :as => 'contact'
  root :to => "pages#home"
end