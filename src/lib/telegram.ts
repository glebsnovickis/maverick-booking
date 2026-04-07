const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramMessage(text: string, chatId?: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Telegram not configured, message:', text)
    return
  }
  const targetChat = chatId || TELEGRAM_CHAT_ID
  if (!targetChat) return

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text,
          parse_mode: 'HTML'
        })
      }
    )
    return res.json()
  } catch (err) {
    console.error('Telegram send error:', err)
  }
}

export function formatBookingNotification(booking: {
  client_name: string
  client_phone: string
  service_name: string
  barber_name: string
  date: string
  start_time: string
  status?: string
}) {
  // Format a nice message with emoji for the barber
  return `✂️ <b>Новая запись!</b>\n\n👤 ${booking.client_name}\n📱 ${booking.client_phone}\n💇 ${booking.service_name}\n🧑‍💼 ${booking.barber_name}\n📅 ${booking.date}\n🕐 ${booking.start_time}\n\nСтатус: ${booking.status || 'Ожидает подтверждения'}`
}
