require 'spec_helper'

describe Theme do
  it 'should create a unique code based on the name' do
    # take 1st of letter of each word
    Factory.create(:theme, :name => 'Use first three').code.should eql('UFT')

    # take 1st 2 letters from 1st word, 2nd letter from 2nd word
    Factory.create(:theme, :name => '12 Examples').code.should eql('12E')

    # take 1st 3 letters from 1st word
    Factory.create(:theme, :name => 'Visitors').code.should eql('VIS')

    # take 1st letter from 1st word, 2nd two letters from 2nd word
    theme = Factory.create(:theme, :name => 'T Example')
    theme.code.should eql('TEX')

    # some combination as above, so use unique 2nd letter in order 1-9, then 10-99, then 100-999
    Factory.create(:theme, :name => 'T Example2', :backlog => theme.backlog(true)).code.should eql('TE1')

    # fill up slots up to 24, next available should be T25
    (2..9).each do |index|
      Factory.create(:theme, :name => "T Example #{index}", :backlog => theme.backlog(true), :code => "TE#{index}")
    end
    (10..24).each do |index|
      Factory.create(:theme, :name => "T Example #{index}", :backlog => theme.backlog(true), :code => "T#{index}")
    end
    Factory.create(:theme, :name => 'T Example 25', :backlog => theme.backlog(true)).code.should eql('T25')
  end

  it 'should enforce a 3 letter code for the Theme code' do
    theme = Factory.create(:theme)
    theme.should validate_format_of(:code).not_with('1A').with_message(/must be 3 alphanumeric characters/)
    theme.should validate_format_of(:code).not_with('1ACD').with_message(/must be 3 alphanumeric characters/)
    theme.should allow_value('123').for(:code)
    theme.should allow_value('AbC').for(:code)
  end
end
