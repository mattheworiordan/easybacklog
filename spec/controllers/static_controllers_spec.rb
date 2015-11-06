# encoding: UTF-8

require 'spec_helper'

shared_examples "a static API" do
  before(:each) do
    accept_json
    subject
  end

  context 'only support JSON and XML' do
    it 'should return a 406 for all unsupported mime types' do
      check_unsupported_mimetypes %w(index show), :id
    end
  end

  it 'should return a list' do
    get :index, { :id => 0 }
    response.code.should == status_code_to_string(:ok)
    json = JSON.parse(response.body)
    json.length.should == 1
    json.first['id'].should == subject.id
  end

  it 'should support XML' do
    accept_xml
    get :index, { :id => 0 }
    response.code.should == status_code_to_string(:ok)
    xml = XMLObject.new(response.body)
  end

  context 'show' do
    it 'should return a single object' do
      get :show, { :id => subject.id }

      response.code.should == status_code_to_string(:ok)
      json = JSON.parse(response.body)
      json['id'].should == subject.id
    end

    it('should return a 404 error if the id does not exist') do
      get :show, { :id => 0 }
      response.code.should == status_code_to_string(:not_found)
    end
  end
end

describe LocalesController do
  subject { FactoryGirl.create(:locale) }

  describe 'API' do
    it_behaves_like 'a static API'
  end
end

describe ScoringRulesController do
  subject { FactoryGirl.create(:scoring_rule) }

  describe 'API' do
    it_behaves_like 'a static API'
  end
end

describe SprintStoryStatusesController do
  subject { FactoryGirl.create(:sprint_story_status) }

  describe 'API' do
    it_behaves_like 'a static API'
  end
end