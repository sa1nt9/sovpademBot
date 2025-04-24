choose_language = Choose language 👇

need_subscription = To continue, please subscribe to [our channel {$botname}](https://t.me/sovpadem)

    After subscribing, click the *Ready* button to continue.

ready = Ready

subsribe = 🔗 Subscribe

not_subscribed = You have not subscribed to the channel

thanks_for_subscription = Thank you for subscribing!


lets_start = 🌟 Welcome to Sovpadem - the first smart bot for finding:
    
    💝 Love
    🎮 Gaming partners
    💪 Sports partners
    💻 IT contacts
    🎨 Friends with similar interests
    
    Find people who truly share your interests! 💫


no_such_answer = No such answer option

ok_lets_start = 👌 let's start

privacy_message = 🔐 We care about your safety!

    • Communicate wisely and don't share personal information with strangers
    • Don't transfer money or follow suspicious links
    • When meeting in real life, choose public places
    
    The bot doesn't collect your personal data or documents. We do everything possible to make your communication safe and pleasant! 💫

    By continuing, you accept our [User Agreement](https://sovpadem.site/agreement) and [Privacy Policy](https://sovpadem.site/policy).

    Let's create your first profile! 🚀

ok = 👌 Ok
 
years_question = How old are you?

type_years = Enter a whole number

type_smaller_year = Age cannot exceed 100 years

type_bigger_year = Age cannot be less than 8 years

gender_question = Now, let's determine your gender

i_woman = I'm a woman

i_man = I'm a man

interested_in_question = Who are you interested in?

women = Women

men = Men

not_matter = Doesn't matter

city_question = What city are you from?

send_location = 📍 Send my location

name_question = What should I call you?

no_such_city = Please write the correct name of your city

type_name = Write your name

long_name = Name should not be longer than 100 characters

skip = Skip

leave_current = Keep current

leave_current_m = Keep current

text_question = { $profileType ->
    [RELATIONSHIP] Tell about yourself and who you want to find. What are your interests, how do you like to spend time? 💝
    [SPORT] Tell about yourself and who you want to find. You can mention your sports goals and achievements 💪
    [GAME] Tell about yourself and who you want to find. You can add your gaming experience and preferred modes 🎮
    [HOBBY] Tell about yourself and who you want to find. Share your hobby experience and goals 🎨
    [IT] Tell about yourself and who you want to find. You can mention your projects and interesting tasks 💻
    *[other] Tell about yourself and who you want to find. This will help find better company for you ✨
}

long_text = The description should not be longer than 1000 characters

long_message = Text should not be longer than 400 characters

file_question = Now send a photo or record a video 📸 (up to 15 sec), other users will see it

short_file_question = Send a photo or record a video 📸 (up to 15 sec)

second_file_question = Attach a photo or video up to 15 seconds to the message

photo_added = Photo added – {$uploaded} out of 3. One more?

video_added = Video added – {$uploaded} out of 3. One more?

form_saved = Changes saved, let's see how your current profile looks now

yes = Yes

change_form = Change current profile

all_right_question = All correct?

go_back = Go back

its_all_save_files = That's all, save photos

video_must_be_less_15 = Video should be less than 15 seconds

voice_must_be_less_60 = Voice message should be less than 1 minute

this_is_your_form = This is how your current profile looks:

profile_menu = 1. View profiles
    2. Fill out current profile again
    3. Change photos/videos
    4. Change profile text

    5. Switch current profile
    
    6. Play chat roulette

wait_somebody_to_see_your_form = Let's wait for someone to see your profile

sleep_menu = 1. View profiles
    2. My current profile
    3. I don't want to search for anyone anymore
    4. Switch current profile

    5. Share the bot - get more likes 😎

    6. Play chat roulette

text_or_video_to_user = Write a message for this user,

    record a short video (up to 15sec),
    record a voice message (up to a minute),
    send a video circle

    or leave a note about the user

add_private_note = 📝 Add note

private_note_max_length = Note cannot be longer than 400 characters

add_private_note_message = Write a note about the user, it will be visible only to you

after_note_you_want_to_add_text_to_user = Write a message or send a video to the user

    or press *Skip*

write_text_note = Write a text note about the user

are_you_sure_you_want_to_disable_your_form = This way you won't know if someone is interested in you...

    Choose which profile you want to disable

disable_all_profiles = ❌ Disable all profiles

invite_friends_message = Invite friends and get more likes!

    Your statistics
    Arrived in 15 days: {$comeIn15Days}
    Arrived in total: {$comeInAll}
    Bonus to your profiles strength: {$bonus}%

    Forward to friends or post on your social media.
    Here's your personal link 👇

invite_link_message = Smart {$botname} Telegram bot for finding friends and like-minded people! 💫 👫

form_disabled_message = I hope you found someone interesting thanks to me! If you get bored - come back, we always have someone new ✨

    To enable your profile again, you can switch your current profile and edit it or start viewing matching profiles

search_people = 🚀 View profiles

you_dont_have_form = You haven't created a profile yet

create_form = Fill out a profile

like_sended_wait_for_answer = Like sent, waiting for response

operation_cancelled = Error sending message

back = Back

send_telegram_friends = Send to Telegram friends
send_whatsapp_friends = Send to WhatsApp friends

not_message_and_not_video = You can only send text, video, voice message, or video circle. Please try again.

somebodys_liked_you = You were liked by {$count} {$gender ->
        [female] { $count ->
            [1] woman
            *[other] women
        }   
        [male] { $count ->
            [1] man
            *[other] men
        }
        *[all] { $count ->
            [1] person
           *[other] people
        }
    }, show {$gender ->
        [female] { $count ->
            [1] her?
            *[other] them?
        }
        [male] { $count ->
            [1] him?
            *[other] them?
        }
        *[all] { $count ->
            [1] them?
            *[other] them?
        }
    }

    1. Show.
    2. I don't want to see anyone else.

    <i>If you lose your likes, send /new_likes to see them again</i>

somebody_liked_you_text = Someone liked your profile{ $count ->
        [0] :
        *[other] (and {$count} more)
    }

message_for_you = 💌 Message for you:

video_for_you = 💌 Video for you

voice_for_you = 💌 Voice message for you

video_note_for_you = 💌 Video circle for you

your_text_note = 📝 Your note:

mutual_sympathy = There's mutual sympathy! Start chatting 👉

good_mutual_sympathy = Great! I hope you have a good time 😉 Start chatting 👉

somebody_liked_you_end_with_your = Someone liked your profile! Finish with the question above and we'll see who it is

its_all_go_next_question = That's all, move on?

continue_see_forms = View more profiles

kilometers = km
meters = m

complain_1 = 🔞 Adult content
complain_2 = 💰 Selling goods and services
complain_3 = 🎭 Fake profile
complain_4 = 📰 Advertisement
complain_5 = ⛔️ Fraud
complain_6 = 💩 Don't like
complain_7 = 🦨 Other

complain_text = Specify the reason for the complaint

    1. { complain_1 }
    2. { complain_2 }
    3. { complain_3 }
    4. { complain_4 }
    5. { complain_5 }
    6. { complain_6 }
    7. { complain_7 }
    
    9. Go back

complain_type_select = Select the reason for the complaint:

write_complain_comment = Write a comment for the complaint

complain_will_be_examined = The complaint will be processed soon

complain_can_be_sended_only_while_searching = Complaint can only be submitted while viewing a profile

can_add_to_blacklist_only_while_searching = You can add a profile to the blacklist only while viewing it

very_close_distance = Very close

this_text_breaks_the_rules = This text breaks the rules, try another one

continue = 🚀 Continue

complain_to_user = ⚠️ Report

you_already_sent_complain_to_this_user = You have already reported this user

send_complain_without_comment = Send complaint without comment

# Chat roulette
roulette_searching = 🔍 Looking for a partner...

roulette_found = ✨ Partner found! Start chatting.

roulette_start = 🎲 Welcome to anonymous chat roulette!

    We'll match you with a partner with similar interests based on your profiles
    { $reactions }
    { roulette_available_actions }

roulette_find = 🚀 Find a partner
    
roulette_next = ➡️ Next
roulette_stop = 🚫 End
roulette_reveal = 👤 Reveal profile
roulette_reveal_username = 👤 Exchange Telegram profiles

roulette_available_actions = Available actions:

    ➡️ Find new partner

    👤 Reveal profile or exchange contacts
    
    🚫 End chat anytime

roulette_stop_searching = ❌ Stop searching

roulette_you_have_partner = You already have a partner 🤔
    
    { roulette_available_actions }

roulette_stop_searching_success = 🔍 Search stopped
    
roulette_chat_ended = You've ended the connection with your partner 🙄

roulette_partner_left = Your partner has ended the connection with you 😞

roulette_put_reaction_on_your_partner = If you want, rate your partner

roulette_reveal_request = Your partner suggests revealing your profiles. Do you agree?
roulette_reveal_request_sent = Request sent. Waiting for partner's response.


roulette_reveal_username_request = Your partner wants to exchange Telegram profiles. Do you agree?

roulette_reveal_username_request_sent = Request sent. Waiting for partner's response.

roulette_reveal_accept = ✅ Yes, reveal profiles
roulette_reveal_reject = ❌ No, stay anonymous

roulette_reveal_username_accept = ✅ Yes, exchange
roulette_reveal_username_reject = ❌ No, stay anonymous

roulette_revealed = Partner's profile:

roulette_revealed_username = Great! I hope you have a good time 😉 Start chatting 👉

roulette_revealed_username_by_partner = Your partner agreed to exchange Telegram profiles. 

    I hope you have a good time 😉 Start chatting 👉

roulette_profile_already_revealed = You have already revealed profiles in this chat

roulette_username_already_revealed = You have already revealed Telegram profiles in this chat

roulette_your_profile_revealed = Your partner agreed to reveal their profile. Your profile was sent to your partner

roulette_reveal_accepted = ✅ You agreed to reveal your profile. Your profile was sent to your partner
roulette_reveal_rejected = ❌ You refused to reveal your profile

roulette_reveal_username_accepted = ✅ You agreed to exchange Telegram profiles
roulette_reveal_username_rejected = ❌ You refused to exchange Telegram profiles

roulette_reveal_rejected_message = Your partner refused to reveal their profile

roulette_reveal_username_rejected_message = Your partner refused to reveal their Telegram profile

roulette_your_reactions = 📊 Your reactions:

roulette_user_reactions = 📊 Partner's reactions:

roulette_no_reactions = You don't have any reactions from partners yet

roulette_reaction_like = 👍 {$count}
roulette_reaction_dislike = 👎 {$count}
roulette_reaction_clown = 🤡 {$count}
roulette_reaction_funny = 😂 {$count}
roulette_reaction_boring = 😴 {$count}
roulette_reaction_rude = 😡 {$count}

reaction_added = ✅ Reaction added
reaction_removed = ❌ Reaction removed
reaction_you_added = You rated your partner:

roulette_searching_stop_notice = ⚠️ You're currently searching. To use other functions, first stop the search /stop_roulette

roulette_chatting_stop_notice = ⚠️ You're currently in a chat. To use other functions, first end the conversation /stop_roulette

error_occurred = ⚠️ An error occurred

error_occurred_description = Error occurred. Try again later.

user_banned_until = ⛔️ Your account is blocked until {$date}

user_banned_permanent = ⛔️ Your account is permanently blocked

user_banned_reason = Reason: {$reason}

reaction_time_expired = ⏰ The time to rate the user has expired. 
    You can rate or report a user within 1 hour

roulette_not_in_chat = 🤷‍♂️ You're not in a chat or searching

main_menu = 🏠 Main menu 

# Statistics
stats_title = 📊 *Your statistics:*

stats_days_in_bot = 📅 In the bot: {$days} { $days ->
    [one] day
    *[other] days
}

stats_likes_received = ❤️ Likes received: {$count}
stats_likes_given = 👍 Likes sent: {$count}
stats_mutual_likes = 💕 Mutual likes: {$count}  /matches
stats_mutual_percentage = ✨ Match percentage: {$percentage}%

stats_forms_viewed = 👀 Profiles viewed: {$count}
stats_like_dislike_ratio = 📈 Like/dislike ratio: {$percentage}%
stats_users_in_blacklist = 🚫 Profiles in blacklist: {$count}  /blacklist

stats_roulette_title = 🎲 *Roulette statistics:*
stats_roulette_chats = 💬 Total chats: {$count}
stats_roulette_avg_time = ⏱ Average chat time: {$time}

stats_profile_created = 📝 Profile created: {$date}
stats_profile_updated = 🔄 Last updated: {$date}

stats_no_data = 🤷‍♂️ Not enough data to display statistics 

stats_roulette_chats_count = 💬 Total chats: {$count}
stats_roulette_avg_duration = ⏱ Average chat duration: {$duration}
stats_roulette_revealed_profiles = 👤 Profiles revealed: {$count}
stats_roulette_revealed_usernames = 📱 Telegram profile exchanges: {$count} 

# Time units
time_hour = h
time_minute = min
time_second = sec 

candidates_ended = Matching profiles have run out! Check back later 👋

    Use /switch to change your profile or create a new one - you might find new profiles there!

more_options_title = Choose what you want to do:
# Additional options
more_options_blacklist = 1. Add to blacklist
more_options_complain = 2. Report
more_options_sleep = 3. I don't want to search for anyone anymore

more_options_message = { more_options_title }
    
    { more_options_blacklist }
    { more_options_complain }
    { more_options_sleep }

more_options_blacklist_confirm = Are you sure you want to add this profile to the blacklist?
more_options_blacklist_success = Profile added to blacklist. Type /blacklist to see it
more_options_blacklist_already = This profile is already in the blacklist

# Blacklist
blacklist_empty = 🚫 Your blacklist is empty

blacklist_user_info = 👤 Profile from blacklist{ $count ->
        [0] :
        *[other] (and {$count} more)
    }

blacklist_no_more_users = No more profiles in the blacklist

blacklist_remove = ❌ Remove from blacklist

see_next = See more

blacklist_remove_success = Profile removed from blacklist

blacklist_remove_error = An error occurred while removing the profile from the blacklist


matches_message_all = All mutual likes and when they became mutual:

matches_message_last = Last 100 mutual likes and when they became mutual:

matches_message_choose = Choose whose profile to show:

no_matches = 🙁 No mutual likes yet. View and like users to get some!

match_selected = User profile { $user }:
match_you_select = You selected user { $user }
mutual_sympathies_navigation = Use arrows to navigate profiles
back_to_profile = Back to profile

user_form_disabled = User profile is disabled

user_not_found = User profile is disabled or not created

no_profile = You don't have a profile or it's disabled

no_profile_description = Create a profile in the bot

no_profile_message = Create your profile in { $botname }

share_profile = Share current profile

open_full_profile = Open full profile

inline_message_text = This is my profile in { $botname } :

this_is_user_profile = This is the user's profile:

start_using_bot  = 🚀 Create a profile

# Profile types
profile_type_title = Choose profile type:

profile_type_relationship = 💑 Relationships
profile_type_sport = 🏃‍♂️ Sports
profile_type_game = 🎮 Games
profile_type_hobby = 🎨 Hobbies
profile_type_it = 💻 IT

# Sport types
sport_type_title = Choose a sport:
sport_type_gym = 🏋️‍♀️ Gym
sport_type_running = 🏃‍♂️ Running
sport_type_swimming = 🏊‍♀️ Swimming
sport_type_football = ⚽ Football
sport_type_basketball = 🏀 Basketball
sport_type_tennis = 🎾 Tennis
sport_type_martial_arts = 🥋 Martial arts
sport_type_yoga = 🧘‍♀️ Yoga
sport_type_cycling = 🚴‍♂️ Cycling
sport_type_climbing = 🧗‍♀️ Climbing
sport_type_ski_snowboard = 🏂 Skiing/Snowboarding

# Game types
game_type_title = Choose a game:
game_type_cs_go = 🔫 CS2
game_type_dota2 = 🛡️ Dota 2
game_type_valorant = 💥 Valorant
game_type_rust = 🏕️ Rust
game_type_minecraft = 🧱 Minecraft
game_type_league_of_legends = ⚔️ League of Legends
game_type_fortnite = 🏙️ Fortnite
game_type_pubg = 🔥 PUBG
game_type_gta = 🚗 GTA V/Online
game_type_apex_legends = 👑 Apex Legends
game_type_fifa = ⚽ FIFA/EA FC
game_type_call_of_duty = 💣 Call of Duty
game_type_wow = 🧙‍♂️ World of Warcraft
game_type_genshin_impact = ⚡ Genshin Impact

# Hobby types
hobby_type_title = Choose a hobby:
hobby_type_music = 🎵 Music
hobby_type_drawing = 🎨 Drawing/Painting
hobby_type_photography = 📷 Photography
hobby_type_cooking = 🍳 Cooking
hobby_type_crafts = 🧶 Crafts
hobby_type_dancing = 💃 Dancing
hobby_type_reading = 📚 Reading

# IT types
it_type_title = Choose an IT field:
it_type_frontend = 🌐 Frontend
it_type_backend = 🖥️ Backend
it_type_fullstack = 💻 Full Stack
it_type_mobile = 📱 Mobile
it_type_devops = 🛠️ DevOps
it_type_qa = 🔍 QA/Testing
it_type_data_science = 📊 Data Science/AI
it_type_game_dev = 🎮 Game Development
it_type_cybersecurity = 🔒 Cybersecurity
it_type_ui_ux = 🎨 UI/UX

# Fields for sport profile
sport_level_question = Your skill level:
sport_level_beginner = 🔰 Beginner
sport_level_intermediate = 🥈 Intermediate
sport_level_advanced = 🥇 Advanced
sport_level_professional = 🏆 Professional

# Fields for game profile
game_account_question_validate = You can only send a real game profile link
# CS2
game_account_cs_go = Send your Steam or Faceit profile link:

# Dota 2
game_account_dota2 = Send a link to your Steam profile:

# Valorant
game_account_valorant = Send a link to your Riot Games profile:

# Rust
game_account_rust = Send a link to your Steam profile:

# Minecraft
game_account_minecraft = Send a link to your Minecraft profile:

# League of Legends
game_account_league_of_legends = Send a link to your op.gg profile:

# Fortnite
game_account_fortnite = Send a link to your Epic Games profile:

# PUBG
game_account_pubg = Send a link to your PUBG profile:

# GTA V/Online
game_account_gta = Send a link to your Rockstar Social Club profile:

# Apex Legends
game_account_apex_legends = Send a link to your EA profile:

# FIFA/EA FC
game_account_fifa = Send a link to your EA profile:

# Call of Duty
game_account_call_of_duty = Send a link to your Activision profile:

# World of Warcraft
game_account_wow = Send a link to your Battle.net profile:

# Genshin Impact
game_account_genshin_impact = Send a link to your HoYoverse profile:

# Fields for IT profile
it_experience_question = Specify your work experience:
it_experience_student = 🎓 Student/Learning
it_experience_junior = 🌱 Junior (up to 1 year)
it_experience_middle = 💪 Middle (1-3 years)
it_experience_senior = 🧠 Senior (3+ years)
it_experience_lead = 🧑‍💼 Lead
it_technologies_question = Enter your main technologies/languages:
it_technologies_long_one = One technology cannot exceed 20 characters
it_technologies_duplicates = Technologies are repeated, remove duplicates
it_technologies_long_all = Maximum number of technologies is 20
it_github_question = Send a link to your [GitHub](https://github.com/)
it_github_question_validate = You can only send a real link to a [GitHub](https://github.com/) account
it_github_question_not_exists = This [GitHub](https://github.com/) user does not exist

profile_link = Game profile { $platform }
level = Level
github = GitHub
technologies = Technologies
experience = Experience


switch_profile_message = Select a profile or create new
create_new_profile = Create new profile

you_already_have_this_profile = You already have this profile 
switch_to_this_profile = 🔄 Switch to this profile


# Profile switching
switch_profile_title = Select a profile:
current_profile = Current profile: { $profileType }
switch_profile = Switch profile


no_new_likes = No new likes yet


continue_searching_likes = Continue?

# Report moderation strings
no_reports_to_moderate = There are currently no active reports for moderation.
report_info = Report Information
report_id = Report ID
report_type = Report Type
report_date = Creation Date
additional_text = Additional Text
reporter_id = Reporter ID
target_info = Information about the reported user
deleted_user = User deleted
user_id = User ID
report_not_found = Report not found or already processed

# Moderation buttons
ban_1_day = 🚫 Ban for 1 day
ban_1_week = 🚫 Ban for 1 week
ban_1_month = 🚫 Ban for 1 month
ban_1_year = 🚫 Ban for 1 year
ban_permanent = 🚫 Permanent ban
disable_report = ✅ Disable report
delete_report = ❌ Delete report

# Action results
user_banned_successfully = User successfully banned
report_disabled = Report disabled (status set to inactive)
report_deleted = Report deleted from database
no_more_reports = No more reports for moderation
error_occurred = An error occurred. Please try again later.
user_has_active_ban_until = User is already banned until
write_ban_reason = Write the reason for the ban

# Profile moderation
profile_info = Profile Information
profile_id = Profile ID
profile_type = Profile Type
created_date = Creation Date
profile_status = Profile Status
profile_type_not_found = Profile type not found
profile_skipped = Profile skipped
skip_profile = Skip profile
no_new_profiles_to_review = No new profiles to review
active = Active
inactive = Inactive

some_data_are_general = Some of your data: age, name, gender and city - are common for all profiles. 

    Fill them out again or keep the current ones?

some_data_are_general_1 = Fill out again
some_data_are_general_2 = Keep current

# Rate Limiting
rate_limit_exceeded = Too many messages! Please wait {$seconds} seconds before sending a new message.
rate_limit_exceeded_long = You are sending messages too frequently. The bot will be temporarily unavailable for {$minutes} minutes.
