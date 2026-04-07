export type Lang = 'ru' | 'lv'

export const translations = {
  ru: {
    // Navigation
    home: 'Главная',
    book_now: 'Записаться',
    services: 'Услуги',
    about: 'О нас',
    contacts: 'Контакты',
    admin: 'Админ',
    language: 'Язык',

    // Booking flow
    select_service: 'Выберите услугу',
    select_barber: 'Выберите барбера',
    select_date: 'Выберите дату',
    select_time: 'Выберите время',
    your_info: 'Ваши данные',
    confirm_booking: 'Подтвердить запись',
    booking_success: 'Запись успешно создана',

    // Form fields
    name: 'Имя',
    phone: 'Телефон',
    email: 'Email',
    notes: 'Заметки',

    // Calendar
    months: [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ],
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    today: 'Сегодня',
    no_slots: 'Нет доступных слотов',
    loading: 'Загрузка...',

    // Service details
    price: 'Цена',
    duration: 'Длительность',
    minutes: 'минут',
    eur: 'EUR',

    // Booking status
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждена',
    cancelled: 'Отменена',

    // Success page
    booking_confirmed: 'Запись подтверждена',
    we_will_contact: 'Мы свяжемся с вами в ближайшее время',
    booking_details: 'Детали записи',

    // Admin
    dashboard: 'Панель управления',
    all_bookings: 'Все записи',
    manage_services: 'Управление услугами',
    manage_schedule: 'Управление расписанием',
    logout: 'Выйти',
    confirm: 'Подтвердить',
    cancel: 'Отменить',
    no_show: 'Не пришел',

    // Common
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    close: 'Закрыть',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    error: 'Ошибка'
  },
  lv: {
    // Navigation
    home: 'Sākums',
    book_now: 'Rezervēt',
    services: 'Pakalpojumi',
    about: 'Par mums',
    contacts: 'Kontakti',
    admin: 'Admins',
    language: 'Valoda',

    // Booking flow
    select_service: 'Izvēlieties pakalpojumu',
    select_barber: 'Izvēlieties frizieri',
    select_date: 'Izvēlieties datumu',
    select_time: 'Izvēlieties laiku',
    your_info: 'Jūsu informācija',
    confirm_booking: 'Apstiprināt rezervāciju',
    booking_success: 'Rezervācija veiksmīgi izveidota',

    // Form fields
    name: 'Vārds',
    phone: 'Telefons',
    email: 'E-pasts',
    notes: 'Piezīmes',

    // Calendar
    months: [
      'Janvāris',
      'Februāris',
      'Marts',
      'Aprīlis',
      'Maijs',
      'Jūnijs',
      'Jūlijs',
      'Augusts',
      'Septembris',
      'Oktobris',
      'Novembris',
      'Decembris'
    ],
    weekdays: ['Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Sa', 'Sv'],
    today: 'Šodien',
    no_slots: 'Nav pieejamu laika slogu',
    loading: 'Ielāde...',

    // Service details
    price: 'Cena',
    duration: 'Ilgums',
    minutes: 'minūtes',
    eur: 'EUR',

    // Booking status
    pending: 'Gaida apstiprinājumu',
    confirmed: 'Apstiprinātā',
    cancelled: 'Atcelta',

    // Success page
    booking_confirmed: 'Rezervācija apstiprinātā',
    we_will_contact: 'Mēs sazināsimies ar jums drīzumā',
    booking_details: 'Rezervācijas detaļas',

    // Admin
    dashboard: 'Vadības panelis',
    all_bookings: 'Visas rezervācijas',
    manage_services: 'Pārvaldīt pakalpojumus',
    manage_schedule: 'Pārvaldīt grafiku',
    logout: 'Izlogoties',
    confirm: 'Apstiprināt',
    cancel: 'Atcelt',
    no_show: 'Neparādījās',

    // Common
    back: 'Atpakaļ',
    next: 'Tālāk',
    submit: 'Iesniegt',
    close: 'Aizvērt',
    save: 'Saglabāt',
    delete: 'Izdzēst',
    edit: 'Rediģēt',
    error: 'Kļūda'
  }
}

export function t(key: string, lang: Lang): string {
  const parts = key.split('.')
  let value: any = translations[lang]

  for (const part of parts) {
    value = value?.[part]
  }

  return value || key
}

// Helper to get specific month name
export function getMonthName(month: number, lang: Lang): string {
  const months = translations[lang].months
  return Array.isArray(months) ? months[month] || '' : ''
}

// Helper to get specific weekday name
export function getWeekdayName(day: number, lang: Lang): string {
  const weekdays = translations[lang].weekdays
  return Array.isArray(weekdays) ? weekdays[day] || '' : ''
}
