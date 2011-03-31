module CompanyResource
  def self.included(base)
    base.send :before_filter, :authenticate_user!, :set_company_and_protect
  end

  private
    # set the @current_company instance variable from nested route
    # ensure user has access to this company
    def set_company_and_protect
      @current_company = Company.find(params[:company_id] || params[:id])
      if @current_company.users.find(current_user.id).blank?
        flash[:error] = 'You do not have permission to view this backlog'
        redirect_to companies_path
      end
    end
end