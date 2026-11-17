/// forui's calendars count days as UTC midnights; the app, as local ones.
library;

DateTime toCalendarDate(DateTime day) => DateTime.utc(day.year, day.month, day.day);

DateTime fromCalendarDate(DateTime date) => DateTime(date.year, date.month, date.day);
