import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export function initDayjs() {
    dayjs.extend(relativeTime);
}
