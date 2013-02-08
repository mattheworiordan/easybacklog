class AddLocaleToCompanyAndBacklog < ActiveRecord::Migration
  def change
    add_column :companies, :locale_id, :integer
    add_column :backlogs, :locale_id, :integer
  end
end
