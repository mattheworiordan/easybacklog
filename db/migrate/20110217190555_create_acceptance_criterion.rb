class CreateAcceptanceCriterion < ActiveRecord::Migration
  def self.up
    create_table :acceptance_criteria, :force => true do |t|
      t.integer :story_id, :null => false
      t.string :criterion, :null => false
      t.integer :position, :null => false
    end
    add_index :acceptance_criteria, :story_id
  end

  def self.down
    remove_index :acceptance_criteria, :story_id
    drop_table :acceptance_criteria
  end
end
