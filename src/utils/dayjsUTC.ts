import dayjs, { Dayjs } from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'

dayjs.extend(dayjsPluginUTC)

export function dayjsUTC(time?: string | number | Date | dayjs.Dayjs | null | undefined): Dayjs {
  return (dayjs(time) as any).utc()
}
