class AddUserTokens < ActiveRecord::Migration
  def change
    create_table :user_tokens do |t|
      t.references :user
      t.string :access_token
      t.string :basic_authentication_token
      t.timestamps
    end
    add_index :user_tokens, :access_token
    add_index :user_tokens, :basic_authentication_token
  end
end
