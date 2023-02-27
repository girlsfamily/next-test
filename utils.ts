export const formatTimeToDay = (time: string | number | Date) => {
  const date = new Date(time)
  const now = new Date()
  const [year, month, day] = [date.getFullYear(), date.getMonth()+1, date.getDate()]
  const [cYear, cMonth, cDay] = [now.getFullYear(), now.getMonth()+1, now.getDate()]
  const hour = date.getHours()
  const min = date.getMinutes()
  if (year === cYear && month === cMonth) {
    if (day === cDay) {
      return `${hour}:${min}`
    } else if (day === cDay-1) {
      return '昨天'
    }
  }
  return `${year.toString().slice(-2)}/${month}/${day}`
}