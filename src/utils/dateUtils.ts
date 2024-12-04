import { format, toZonedTime } from 'date-fns-tz'

export const formatDateToLimaTime = (date: Date): string => {
  const timeZone = 'America/Lima'
  const zonedDate = toZonedTime(date, timeZone)
  return format(zonedDate, 'dd/MM/yyyy HH:mm:ss', { timeZone })
}
