choose_language = Выбери язык 👇

need_subscription = Чтобы продолжить, сначала подпишитесь на [наш канал {$botname}](https://t.me/sovnad)

    После подписки нажмите кнопку *Готово*, чтобы продолжить.

ready = Готово

subsribe = 🔗 Подписаться

not_subscribed = Вы не подписались на канал

thanks_for_subscription = Спасибо за подписку!

lets_start = Уже миллионы людей знакомятся в Совпадём 😍

    Я помогу найти тебе пару или просто друзей 👫

no_such_answer = Нет такого варианта ответа

ok_lets_start = 👌 давай начнём

privacy_message = ❗️Помните, что в интернете люди могут выдавать себя за других. 

    Бот не запрашивает личные данные и не идентифицирует пользователей по каким-либо документам.

    Продолжая, вам будет необходимо ответить на несколько вопросов для заполнения анкеты

ok = 👌 Ок
 
years_question = Сколько тебе лет?

type_years = Введите целое число

type_smaller_year = Возраст не может превышать 100 лет

type_bigger_year = Возраст не может быть меньше 8 лет

gender_question = Теперь определимся с полом

i_woman = Я девушка

i_man = Я парень

interested_in_question = Кто тебе интересен?

women = Девушки

men = Парни

not_matter = Всё равно

city_question = Из какого ты города?

send_location = 📍 Отправить мои координаты

name_question = Как мне тебя называть?

no_such_city = Пожалуйста напиши правильное название твоего города

type_name = Напиши своё имя

long_name = Имя не должно быть длиннее 100 символов

skip = Пропустить

leave_current = Оставить текущий

leave_current_m = Оставить текущее

text_question = Расскажи о себе и кого хочешь найти, чем предлагаешь заняться. Это поможет лучше подобрать тебе компанию.

long_text =  Рассказ не должен быть длиннее 1000 символов

file_question = Теперь пришли фото или запиши видео 👍 (до 15 сек), его будут видеть другие пользователи

short_file_question = Пришли фото или запиши видео 👍 (до 15 сек)

second_file_question = Прикрепи к сообщению фото или видео до 15 секунд

photo_added = Фото добавлено – {$uploaded} из 3. Еще одно?

video_added = Видео добавлено – {$uploaded} из 3. Еще одно?

form_saved = Сохранили изменения, посмотрим как выглядит твоя анкета теперь

yes = Да

change_form = Изменить анкету

all_right_question = Всё верно?

go_back = Вернуться назад

its_all_save_files = Это всё, сохранить фото

video_must_be_less_15 = Видео должно длиться менее 15 секунд

voice_must_be_less_60 = Голосовое сообщение должно длится менее 1 минуты

this_is_your_form = Так выглядит твоя анкета:

profile_menu = 1. Смотреть анкеты.
    2. Заполнить анкету заново.
    3. Изменить фото/видео.
    4. Изменить текст анкеты.
    
    5. Cыграть в чат-рулетку

wait_somebody_to_see_your_form = Подождем пока кто-то увидит твою анкету

sleep_menu = 1. Смотреть анкеты.
    2. Моя анкета.
    3. Я больше не хочу никого искать.
    {"***"}
    4. Пригласи друзей - получи больше лайков 😎

    5. Cыграть в чат-рулетку

text_or_video_to_user = Напиши сообщение для этого пользователя,

    запиши короткое видео (до 15сек),
    запиши голосовое сообщение (до минуты),
    или отправь видеокружок

are_you_sure_you_want_to_disable_your_form = Так ты не узнаешь, что кому-то нравишься... Точно хочешь отключить свою анкету?

    1. Да, отключить анкету.
    2. Нет, вернуться назад.

invite_friends_message = Пригласи друзей и получи больше лайков!

    Твоя статистика
    Пришло за 14 дней: {$comeIn14Days}
    Пришло за всё время: {$comeInAll}
    Бонус к силе анкеты: {$bonus}%

    Перешли друзьям или размести в своих соцсетях.
    Вот твоя личная ссылка 👇

invite_link_message = Бот знакомств {$botname} в Telegram! Найдет друзей или даже половинку 👫

form_disabled_message = Надеюсь ты нашел кого-то благодаря мне! Рад был с тобой пообщаться, будет скучно – пиши, обязательно найдем тебе кого-нибудь

search_people = Смотреть анкеты

you_dont_have_form = У тебя ещё не создана анкета

create_form = Заполнить анкету

like_sended_wait_for_answer = Лайк отправлен, ждём ответа

operation_cancelled = Произошла ошибка отправки сообщения

back = Назад

send_telegram_friends = Отправить друзьям Telegram
send_whatsapp_friends = Отправить друзьям WhatsApp

not_message_and_not_video = Можно отправить только текст, видео, голосовое сообщение или видеокружок. Попробуйте ещё раз.

somebodys_liked_you = Ты { $userGender ->
        [female] понравилась
        *[male] понравился
    } {$count} {$gender ->
        [female] { $count ->
            [1] девушке
            *[other] девушкам
        }   
        [male] { $count ->
            [1] парню
            *[other] парням
        }
        *[all] { $count ->
            [1] человеку
           *[other] людям
        }
    }, показать {$gender ->
        [female] { $count ->
            [1] её?
            *[other] их?
        }
        [male] { $count ->
            [1] его?
            *[other] их?
        }
        *[all] { $count ->
            [1] его?
            *[other] их?
        }
    }

    1. Показать.
    2. Не хочу больше никого смотреть.

somebody_liked_you_text = Кому-то понравилась твоя анкета{ $count ->
        [0] :
        *[other] (и ещё { $count })
    }

message_for_you = Сообщение для тебя💌:

video_for_you = Видео для тебя💌

voice_for_you = Голосовое сообщение для тебя💌

video_note_for_you = Видеокружок для тебя💌

mutual_sympathy = Есть взаимная симпатия! Начинай общаться 👉

good_mutual_sympathy = Отлично! Надеюсь хорошо проведёте время ;) Начинай общаться 👉

somebody_liked_you_end_with_your = Кому-то понравилась твоя анкета! Заканчивай с вопросом выше и посмотрим кто это

its_all_go_next_question = Это всё, идем дальше?

continue_see_forms = Продолжить просмотр анкет 

kilometers = км
meters = м

complain_1 = 🔞 Материал для взрослых
complain_2 = 💰 Продажа товаров и услуг
complain_3 = 📰 Реклама
complain_4 = ⛔️ Мошенничество
complain_5 = 💩 Не нравится
complain_6 = 🦨 Другое

complain_text = Укажите причину жалобы

    1. { complain_1 }
    2. { complain_2 }
    3. { complain_3 }
    4. { complain_4 }
    5. { complain_5 }
    6. { complain_6 }
    {"***"}
    9. Вернуться назад

write_complain_comment = Напиши комментарий к жалобе

complain_will_be_examined = Жалоба будет обработана в ближайшее время

complain_can_be_sended_only_while_searching = Жалобу можно оставить только при просмотре анкеты

very_close_distance = Очень близко

this_text_breaks_the_rules = Этот текст нарушает правила, введи другой

somebody_liked_you_end_with_it = Кому-то понравилась твоя анкета! Заканчивай с вопросом выше и посмотрим кто это

continue = 🚀 Продолжить

complain_to_user = ⚠️ Пожаловаться

you_already_sent_complain_to_this_user = Вы уже отправляли жалобу на этого пользователя

send_complain_without_comment = Отправить жалобу без комментария

# Чат-рулетка
roulette_searching = 🔍 Ищем собеседника...

roulette_found = ✨ Собеседник найден! Можете начинать общение.

roulette_start = 🎲 Добро пожаловать в анонимную чат-рулетку!

    Мы подберём вам собеседника с похожими интересами на основе вашей анкеты
    { $reactions }
    { roulette_available_actions }

roulette_find = 🚀 Найти собеседника
    
roulette_next = ➡️ Следующий
roulette_stop = 🚫 Завершить
roulette_reveal = 👤 Раскрыть анкету
roulette_reveal_username = 👤 Обменяться Telegram-профилем

roulette_available_actions = Доступные действия:

    ➡️ Искать нового собеседника

    👤 Раскрыть анкету или обменяться контактами для продолжения общения
    
    🚫 Завершить чат в любой момент

roulette_stop_searching = ❌ Остановить поиск

roulette_you_have_partner = У вас уже есть собеседник 🤔
    
    { roulette_available_actions }

roulette_stop_searching_success = Поиск завершён
    
roulette_chat_ended = Вы закончили связь с вашим собеседником 🙄

roulette_partner_left = Собеседник закончил с вами связь 😞

roulette_put_reaction_on_your_partner = Если хотите, оставьте мнение о вашем собеседнике

roulette_reveal_request = Собеседник предлагает раскрыть ваши анкеты. Согласны?
roulette_reveal_request_sent = Запрос на раскрытие анкет отправлен собеседнику


roulette_reveal_username_request = Собеседник хочет обменяться Telegram-профилями. Согласны?

roulette_reveal_username_request_sent = Запрос на раскрытие telegram-профилей отправлен. Ожидайте ответа собеседника.

roulette_reveal_accept = ✅ Да, раскрыть анкеты
roulette_reveal_reject = ❌ Нет, остаться анонимным

roulette_reveal_username_accept = ✅ Да, обменяться
roulette_reveal_username_reject = ❌ Нет, остаться анонимным

roulette_revealed = Профиль собеседника:

roulette_revealed_username = Отлично! Надеюсь хорошо проведёте время ;) Начинай общаться 👉

roulette_revealed_username_by_partner = Собеседник согласился обменяться Telegram-профилями. 

    Надеюсь хорошо проведёте время ;) Начинай общаться 👉

roulette_your_profile_revealed = Собеседник согласился раскрыть профиль. Ваш профиль был отправлен собеседнику

roulette_reveal_accepted = ✅ Вы согласились раскрыть профиль. Ваш профиль был отправлен собеседнику
roulette_reveal_rejected = ❌ Вы отказались раскрыть профиль

roulette_reveal_username_accepted = ✅ Вы согласились обменяться Telegram-профилями
roulette_reveal_username_rejected = ❌ Вы отказались обмениваться Telegram-профилями

roulette_reveal_rejected_message = Собеседник отказался раскрыть свой профиль

roulette_reveal_username_rejected_message = Собеседник отказался раскрыть свой telegram-профиль

roulette_your_reactions = 📊 Ваши реакции от собеседников:

roulette_user_reactions = 📊 Ваши реакции от собеседников:

roulette_no_reactions = У вас пока нет реакций от собеседников

roulette_reaction_like = 👍 {$count}
roulette_reaction_dislike = 👎 {$count}
roulette_reaction_clown = 🤡 {$count}
roulette_reaction_funny = 😂 {$count}
roulette_reaction_boring = 😴 {$count}
roulette_reaction_rude = 😡 {$count}

reaction_added = ✅ Реакция добавлена
reaction_removed = ❌ Реакция удалена
reaction_you_added = Вы оценили собеседника:
error_occurred = ⚠️ Произошла ошибка
