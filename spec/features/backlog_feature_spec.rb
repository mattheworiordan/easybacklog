require 'spec_helper'

feature 'Backlog', :js => true do
  let(:account) { create(:account_with_user) }
  let(:user) { account.account_users.first.user }

  scenario 'Backlog being viewed is not ready due to queue job not being complete' do
    backlog = create(:backlog, account: account, not_ready_since: Time.now)

    login user
    visit account_backlog_path(backlog, account)
    puts account_backlog_path(backlog, account)

    page.should have_content('This backlog is still being prepared, however it should be ready within a few seconds. Please wait...')

    backlog.update_attribute not_ready_since: nil
    sleep 5

    page.should_not have_content('This backlog is still being prepared, however it should be ready within a few seconds. Please wait...')
  end

  scenario 'Snapshot being viewed is not ready due to queue job not being complete' do
    backlog = create(:backlog, account: account)
    snapshot = create(:backlog, snapshot_master: backlog, not_ready_since: Time.now)

    login user
    visit account_backlog_path(snapshot, account)

    page.should have_content('This snapshot is still being prepared, however it should be ready within a few seconds. Please wait...')

    snapshot.update_attribute not_ready_since: nil
    sleep 5

    page.should_not have_content('This snapshot is still being prepared, however it should be ready within a few seconds. Please wait...')
  end
end