module SnapshotsHelper
  COLORS = { :new => '#AAFFAA', :new_fg => '#00FF00', :deleted => '#FFAAAA', :deleted_fg => '#FF0000', :changed => '#FFBC4F', :changed_fg => '#FF0000', :none => '#FFFFFF' }

  def color_row(comparator)
    if comparator.new?
      COLORS[:new]
    elsif comparator.deleted?
      COLORS[:deleted]
    else
      COLORS[:none]
    end
  end

  def color_text(comparator, field, text)
    changed = comparator.send("#{field}_changed?")
    if changed && !comparator.new? && !comparator.deleted?
      raw "<span class='changed' style='color: #{COLORS[:changed_fg]}; background-color: #{COLORS[:changed]}'>#{CGI.escapeHTML(text || '')}</span>"
    else
      text
    end
  end

  # criterion needs special treatment as it can never be changed, only added or deleted
  def color_criterion(comparator, field, text)
    if comparator.new?
      raw "<span class='changed' style='color: #{COLORS[:new_fg]}; background-color: #{COLORS[:new]}'>#{CGI.escapeHTML(text || '')}</span>"
    elsif comparator.deleted?
      raw "<span class='changed' style='color: #{COLORS[:deleted_fg]}; background-color: #{COLORS[:deleted]}'>#{CGI.escapeHTML(text || '')}</span>"
    else
      text
    end
  end

  def color_number(comparator, field, base_or_target, number_string)
    is_base = (base_or_target == :base)
    changed = comparator.send("#{field}_changed?")
    increased = changed = comparator.send("#{field}_increased?")
    decreased = changed = comparator.send("#{field}_decreased?")
    text = if (decreased && is_base) || (increased && !is_base)
      "#{number_string}\u25B3" #up arrow
    elsif (decreased && !is_base) || (increased && is_base)
      "#{number_string}\u25BD" #down arrow
    else
      number_string
    end
    color_text(comparator, field, text.to_s)
  end
end