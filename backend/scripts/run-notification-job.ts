import 'dotenv/config'
import { runNotificationJobNow } from '../src/jobs/notificationJob'

runNotificationJobNow().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
