import TelegramSettings from '@/components/TelegramSettings'
import { readTelegramSettings } from './actions'

export default async function TelegramPage() {
  const settings = await readTelegramSettings()
  return <TelegramSettings available={settings.available} initiallyConnected={settings.connected} />
}
