class PagesController < ApplicationController
  basic_allowed :contact, :browser_support

  def home
    if user_signed_in?
      if current_user.accounts.length == 0
        # let the accounts index page deal with a user without an account
        redirect_to accounts_path
      elsif current_user.accounts.length == 1
        # show only the backlogs for this users only account
        redirect_to account_path(current_user.accounts.first)
      else
        # show activity across all accounts
        @recent_backlogs = current_user.accounts.map { |accounts| accounts.backlogs.active.where_user_has_access(current_user) }
        # show most recent first
        @recent_backlogs = @recent_backlogs.flatten.sort_by(&:updated_at).reverse[0..15]
        # group by company/account
        @recent_backlogs = @recent_backlogs.group_by { |backlog| backlog.company.present? ? backlog.company : backlog.account }
      end
    end
  end

  # /raise-error for testing error capture
  def raise_error
    raise "Intentional error thrown"
  end

  def status
    @users = User.count
  end
end