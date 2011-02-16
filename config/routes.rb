Ibacklog::Application.routes.draw do
  devise_for :users
  resources :companies, :only => [:index, :show, :new, :create] do
    resources :backlogs, :only => [:show, :new, :create, :update]
  end

  match '/contact' => 'pages#contact', :as => 'contact'
  root :to => "pages#home"
end
