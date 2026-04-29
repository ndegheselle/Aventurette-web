import { FilterType, type Filter } from "@chapelure/common/base/filters";

// XXX : fake filter to change
export const filters: Record<string, Filter> = {
  duration: {
    type: FilterType.Number,
    label: 'activity.fields.duration'
  },
  tags: {
    type: FilterType.Choices,
    label: 'activity.fields.tags',
    availables: [{ label: 'activities.fields.tags.tata', value: 'pouet' }]
  },
  category: {
    type: FilterType.Choice,
    label: 'activity.fields.category',
    availables: [{ label: 'activities.fields.category.one', value: 'pouet' }]
  },
};