class CreateLocale < ActiveRecord::Migration
  def self.up
    create_table :locales, :force => true do |t|
      t.string :name, :required => true
      t.string :code, :required => true
      t.integer :position, :required => true
      t.timestamps
    end

    Locale.create(:name => 'American English', :code => 'en-US', :position => 10)
    Locale.create(:name => 'British English', :code => 'en-GB', :position => 20)
    Locale.create(:name => 'European English', :code => 'en-EU', :position => 30)
    Locale.create(:name => 'French', :code => 'en-EU', :position => 40)
  end

  def self.down
    drop_table :locales
  end
end
