module AccountsHelper
  def company_or_account_header(company_or_account, truncate_length)
    if company_or_account.can?(:full, current_user)
      link_to company_or_account_path(company_or_account), :class => company_or_account_class(company_or_account) do
        content_tag(:span, truncate(company_or_account.name, :length => truncate_length), :class => 'name')
      end
    else
      truncate(company_or_account.name, :length => truncate_length)
    end
  end

  def company_or_account_path(company_or_account)
    if (company_or_account.kind_of?(Account))
      edit_account_path(company_or_account)
    else
      edit_account_company_path(company_or_account.account, company_or_account)
    end
  end

  def company_or_account_class(company_or_account)
    if (company_or_account.kind_of?(Account))
      'account'
    else
      'company'
    end
  end
end