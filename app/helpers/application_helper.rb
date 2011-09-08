module ApplicationHelper
  def title(page_title)
    content_for(:page_title) { page_title }
  end

  # used for URL helpers to set the protocol in the production & staging environments
  def link_protocol
    if %w(development test cucumber).include?(Rails.env)
      'http'
    else
      'https'
    end
  end

  def dont_use_base_css
    @dont_use_base_css = true
  end

  def use_base_css?
    @dont_use_base_css.blank? || !@dont_use_base_css
  end
end
