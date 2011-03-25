module CompanyResource
  def self.included(base)
    base.send :before_filter, :authenticate_user!, :set_company_and_protect
  end
  
  private
    # set the @company instance variable from nested route
    # ensure user has access to this company
    def set_company_and_protect
      @company = Company.find(params[:company_id])
      if @company.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this backlog'
        redirect_to companies_path
      end
    end
end