require 'spec_helper'

feature 'Backlog', :js => true do
  let(:account) { create(:account_with_user) }
  let(:user) { account.account_users.first.user }

  scenario 'Backlog being viewed is not ready due to queue job not being complete' do
    backlog = create(:backlog, account: account, not_ready_since: Time.now)

    login user
    page.visit account_backlog_path(account, backlog)

    page.should have_content('This backlog is still being prepared')

    backlog.update_attribute :not_ready_since, nil
    sleep 7

    page.should_not have_content('This backlog is still being prepared')
  end

  scenario 'Snapshot being viewed is not ready due to queue job not being complete' do
    backlog = create(:backlog, account: account)
    snapshot = create(:backlog, snapshot_master: backlog, not_ready_since: Time.now)

    login user
    page.visit snapshot_account_backlog_path(account, backlog, snapshot)

    page.should have_content('This snapshot is still being prepared')

    snapshot.update_attribute :not_ready_since, nil
    sleep 7

    page.should_not have_content('This snapshot is still being prepared')
  end
end