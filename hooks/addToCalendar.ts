import * as Calendar from "expo-calendar";

export async function getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar = calendars.find(cal => cal.allowsModifications);
  if (!defaultCalendar) throw new Error("No modifiable calendar found.");
  return defaultCalendar;
}

export async function createCalendarEvent(title: string, location: string, startDate: Date, endDate: Date) {
  const calendar = await getDefaultCalendarSource();

  const eventId = await Calendar.createEventAsync(calendar.id, {
    title,
    location,
    startDate,
    endDate,
    timeZone: "Asia/Singapore", 
  });

  return eventId;
}

export async function requestCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Calendar permission not granted");
  }
}