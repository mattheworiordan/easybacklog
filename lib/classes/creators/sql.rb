module Creators
  module Sql
    def insert_sql(table, options)
      # create a basic insert statement with ? for values
      columns_for_sanitize = []
      columnVals = options.values.map do |val|
        if val.kind_of? Symbol
          # this is a sequence reference
          "currval('#{val}_id_seq')"
        elsif val.nil?
          'NULL'
        else
          columns_for_sanitize << val
          '?'
        end
      end

      sql = "insert into #{table} (id, #{options.keys.join(', ')}) VALUES (nextval('#{table}_id_seq'), #{columnVals.join(',')}); \n"

      ActiveRecord::Base.__send__(:sanitize_sql, [sql].concat(columns_for_sanitize), '')
    end
  end
end