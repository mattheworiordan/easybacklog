# Based on https://github.com/retr0h/ssl_requirement/blob/master/lib/ssl_requirement.rb
# Different in that SSL is always on unless basic allowed

module SslRequired
  def self.included(controller)
    controller.extend(ClassMethods)
    controller.before_filter(:ensure_proper_protocol)
  end

  module ClassMethods
    ##
    # Specifies that the named actions requires an SSL connection
    # to be performed (which is enforced by ensure_proper_protocol).

    def basic_allowed(*actions)
      write_inheritable_array(:basic_allowed_actions, actions)
    end
  end

protected
  ##
  # Returns true if the current action supports basic authentication

  def basic_allowed?
    (self.class.read_inheritable_attribute(:basic_allowed_actions) || []).include?(action_name.to_sym)
  end

private
  def ensure_proper_protocol
    return true if basic_allowed?

    if !request.ssl?
      if %w(development test cucumber).include?(Rails.env)
        puts ">> SSL would have been required" if Rails.env.development?
      else
        redirect_to "https://" + request.host + (request.respond_to?(:fullpath) ? request.fullpath : request.request_uri)
        flash.keep
      end
      return false
    end
  end
end