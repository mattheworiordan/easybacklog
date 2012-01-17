class AddDefaultSetToAccount < ActiveRecord::Migration
  def self.up
    add_column :accounts, :defaults_set, :boolean
    Account.all.each { |a| a.update_attribute :defaults_set, true unless a.default_velocity.blank? }
  end

  def self.down
    remove_column :accounts, :defaults_set
  end
end
