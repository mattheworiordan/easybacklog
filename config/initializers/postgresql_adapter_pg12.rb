require 'active_record/connection_adapters/postgresql_adapter'

class ActiveRecord::ConnectionAdapters::PostgreSQLAdapter
  def set_standard_conforming_strings
    old, self.client_min_messages = client_min_messages, 'warning'
    execute('SET standard_conforming_strings = on', 'SCHEMA') rescue nil
  ensure
    self.client_min_messages = old
  end

  def column_definitions(table_name) #:nodoc:
    query <<-end_sql
      SELECT a.attname, format_type(a.atttypid, a.atttypmod), pg_get_expr(d.adbin, d.adrelid), a.attnotnull
        FROM pg_attribute a LEFT JOIN pg_attrdef d
          ON a.attrelid = d.adrelid AND a.attnum = d.adnum
       WHERE a.attrelid = '#{quote_table_name(table_name)}'::regclass
         AND a.attnum > 0 AND NOT a.attisdropped
       ORDER BY a.attnum
    end_sql
  end
end