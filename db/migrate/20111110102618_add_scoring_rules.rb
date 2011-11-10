class AddScoringRules < ActiveRecord::Migration
  def self.up
    create_table :scoring_rules, :force => true do |t|
      t.string :code
      t.string :title
      t.string :description
      t.integer :position
    end
    add_index :scoring_rules, :code
    add_column :backlogs, :scoring_rule_id, :integer
    add_column :accounts, :scoring_rule_id, :integer
  end

  def self.down
    remove_column :accounts, :scoring_rule_id
    remove_column :backlogs, :scoring_rule_id
    remove_index :scoring_rules, :code
    mcol
    drop_table :scoring_rules
  end
end
