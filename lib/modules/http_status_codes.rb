module HttpStatusCodes
  STATUS_CODE = {
    :ok => 200,
    :created => 201,
    :accepted => 202,
    :no_content => 204, # typically for updates, no content is returned
    :bad_request => 400, # general error
    :unauthorized => 401, # needs authentication
    :forbidden => 403, # authenticated but you don't have permission
    :not_found => 404,
    :not_acceptable => 406, # unsupported accepts header such as application/json
    :unprocessable_entity => 422, # invalid parameters passed in
    :invalid_params => 422, # shortcut for above
    :upgrade_required => 426, # needs SSL for example,
    :internal_server_error => 500
  }

  def status_code_to_string(code)
    STATUS_CODE[code].to_s
  end
end
