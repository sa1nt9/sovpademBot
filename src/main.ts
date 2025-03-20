import { logger } from './logger';
import { Bot, session } from "grammy";
import * as dotenv from 'dotenv';
import { acceptPrivacyKeyboard, ageKeyboard, allRightKeyboard, answerFormKeyboard, answerLikesFormKeyboard, cityKeyboard, continueSeeFormsKeyboard, disableFormKeyboard, fileKeyboard, formDisabledKeyboard, genderKeyboard, goBackKeyboard, interestedInKeyboard, inviteFriendsKeyboard, languageKeyboard, nameKeyboard, notHaveFormToDeactiveKeyboard, prepareMessageKeyboard, profileKeyboard, somebodysLikedYouKeyboard, someFilesAddedKeyboard, subscribeChannelKeyboard, textKeyboard, complainKeyboard } from "./constants/keyboards";
import { sessionInitial } from "./functions/sessionInitial";
import { sendForm } from "./functions/sendForm";
import { errorHandler } from "./handlers/error";
import { i18n } from './i18n';
import { connectPostgres, prisma } from './db/postgres';
import { MyContext } from './typescript/context';
import { getCandidate } from './functions/db/getCandidate';
import { checkSubscriptionMiddleware } from './middlewares/checkSubscriptionMiddleware';
import { PrismaAdapter } from '@grammyjs/storage-prisma';
import { saveLike } from './functions/db/saveLike';
import { toggleUserActive } from './functions/db/toggleUserActive';
import { encodeId } from './functions/encodeId';
import { sendLikesNotification } from './functions/sendLikesNotification';
import { getOneLike } from './functions/db/getOneLike';
import { setMutualLike } from './functions/db/setMutualLike';
import { myprofileCommand } from './commands/myprofile';
import { languageCommand } from './commands/language';
import { deactivateCommand } from './commands/deactivate';
import { startCommand } from './commands/start';
import { complainCommand } from './commands/complain';
import { hasLinks } from './functions/hasLinks';
import { chooseLanguageStep } from './messages/choose_language';
import { chooseLanguageStartStep } from './messages/choose_language_start';
import { acceptPrivacyStep } from './messages/accept_privacy';
import { prepareMessageStep } from './messages/prepare_message';
import { questionsStep } from './messages/questions';
import { profileStep } from './messages/profile';
import { sleepMenuStep } from './messages/sleep_menu';
import { friendsStep } from './messages/friends';
import { disableFormStep } from './messages/disable_form';
import { formDisabledStep } from './messages/form_disabled';
import { youDontHaveFormStep } from './messages/you_dont_have_form';
import { cannotSendComplainStep } from './messages/cannot_send_complain';
import { searchPeopleStep } from './messages/search_people';
import { searchPeopleWithLikesStep } from './messages/search_people_with_likes';
import { continueSeeFormsStep } from './messages/continue_see_forms';
import { continueSeeLikesFormsStep } from './messages/continue_see_likes_forms';
import { textOrVideoToUserStep } from './messages/text_or_video_to_user';
import { somebodysLikedYouStep } from './messages/somebodys_liked_you';
import { complainStep } from './messages/complain';
import { complainTextStep } from './messages/complain_text';


dotenv.config();

export const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));


async function startBot() {

    await connectPostgres()


    bot.catch(errorHandler);


    bot.use(async (ctx, next) => {
        ctx.logger = logger

        await next()
    })

    bot.use(
        session({
            initial: sessionInitial,
            storage: new PrismaAdapter(prisma.session),
        })
    );

    bot.use(i18n);

    bot.use(checkSubscriptionMiddleware)


    bot.command("start", startCommand);

    bot.command("deactivate", deactivateCommand);

    bot.command("complain", complainCommand);

    bot.command("myprofile", myprofileCommand);

    bot.command("language", languageCommand);


    bot.on("message", async (ctx) => {
        if (ctx.session.step === "choose_language_start") {
            await chooseLanguageStartStep(ctx)
        } else if (ctx.session.step === "choose_language") {
            await chooseLanguageStep(ctx)
        } else if (ctx.session.step === "prepare_message") {
            await prepareMessageStep(ctx)
        } else if (ctx.session.step === "accept_privacy") {
            await acceptPrivacyStep(ctx)
        } else if (ctx.session.step === "questions") {
            await questionsStep(ctx)
        } else if (ctx.session.step === 'profile') {
            await profileStep(ctx)
        } else if (ctx.session.step === 'sleep_menu') {
            await sleepMenuStep(ctx)
        } else if (ctx.session.step === 'friends') {
            await friendsStep(ctx)
        } else if (ctx.session.step === 'disable_form') {
            await disableFormStep(ctx)
        } else if (ctx.session.step === 'form_disabled') {
            await formDisabledStep(ctx)
        } else if (ctx.session.step === 'you_dont_have_form') {
            await youDontHaveFormStep(ctx)
        } else if (ctx.session.step === 'cannot_send_complain') {
            await cannotSendComplainStep(ctx)
        } else if (ctx.session.step === 'search_people') {
            await searchPeopleStep(ctx)
        } else if (ctx.session.step === 'search_people_with_likes') {
            await searchPeopleWithLikesStep(ctx)
        } else if (ctx.session.step === 'continue_see_forms') {
            await continueSeeFormsStep(ctx)
        } else if (ctx.session.step === 'continue_see_likes_forms') {
            await continueSeeLikesFormsStep(ctx)
        } else if (ctx.session.step === 'text_or_video_to_user') {
            await textOrVideoToUserStep(ctx)
        } else if (ctx.session.step === 'somebodys_liked_you') {
            await somebodysLikedYouStep(ctx)
        } else if (ctx.session.step === 'complain') {
            await complainStep(ctx)
        } else if (ctx.session.step === 'complain_text') {
            await complainTextStep(ctx)
        } else {
            await ctx.reply(ctx.t('no_such_answer'));
        }
    });

    // Обработчик для callback_query (inline кнопок)
    bot.on("callback_query", async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        
        if (callbackData) {
            // Проверяем, устаревшая ли кнопка (сообщение старое)
            const currentDate = new Date();
            const messageDate = new Date(ctx.callbackQuery.message?.date || 0);
            const messageAgeInSeconds = (currentDate.getTime() - messageDate.getTime()) / 1000;
            
            // Если сообщение старше 5 минут (300 секунд), считаем кнопку устаревшей
            const isObsoleteButton = messageAgeInSeconds > 300;
            
            if (callbackData.startsWith("complain:")) {
                // Если кнопка устаревшая, показываем уведомление с анимацией "палец вниз"
                if (isObsoleteButton) {
                    await ctx.answerCallbackQuery({
                        text: "👇",
                        show_alert: false,
                        cache_time: 3
                    });
                }
                
                const userId = callbackData.split(":")[1];
                
                ctx.session.additionalFormInfo.reportedUserId = userId;
                
                ctx.session.step = 'complain';
                
                await ctx.answerCallbackQuery();
                
                await ctx.reply(ctx.t('complain_text'), {
                    reply_markup: complainKeyboard()
                });
            }
        }
        
    });


    bot.start();
}


startBot()