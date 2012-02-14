class SnapshotsController < ApplicationController
  layout false
  before_filter :authenticate_user!

  def compare_snapshots
    includes = [:themes, { :themes => { :stories => :acceptance_criteria } } ]
    @account = Account.find(params[:account_id])
    @base = Backlog.includes(includes).where(:id => params[:base]).where(:account_id => @account.id).first
    @target = Backlog.includes(includes).where(:id => params[:target]).where(:account_id => @account.id).first
    if !@base.account.users.include?(current_user) || !@target.account.users.include?(current_user)
      flash[:error] = 'You don\'t have permission to view the snapshots you were accessing'
      redirect_to accounts_path
    end
    @comparison = @base.compare_with(@target)

    respond_to do |respond_format|
      respond_format.html { }

      # download an Excel file
      respond_format.xls do
        filename = "#{@base.name.parameterize}-#{@target.name.parameterize}.xls"
        set_download_headers filename
        self.formats = [:html]
        render
      end
    end
  end
end