import { MyContext } from '../typescript/context';
import { confirmRevealKeyboard, notHaveFormToDeactiveKeyboard, profileKeyboard, rouletteKeyboard, rouletteReactionKeyboard, rouletteStartKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { sendForm } from '../functions/sendForm';
import { findRouletteUser } from '../functions/findRouletteUser';
import { getReactionCounts } from '../functions/getReactionCounts';
import { ISessionData } from '../typescript/interfaces/ISessionData';
import { i18n } from '../i18n';
import { logger } from "../logger";

export async function rouletteSearchingStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({ userId, action: message }, 'Roulette action');
    
    // Проверяем наличие активной анкеты
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            rouletteUser: true
        }
    });

    if (existingUser) {
        // Обработка команд рулетки
        if (message === ctx.t('roulette_next') || message === ctx.t('roulette_find') || message === ctx.t('main_menu')) {
            // Если был предыдущий собеседник, разрываем связь
            if (existingUser.rouletteUser?.chatPartnerId) {
                const prevPartnerId = existingUser.rouletteUser.chatPartnerId;
                ctx.logger.info({ userId, prevPartnerId }, 'Disconnecting from previous partner');

                // Обновляем статус чата
                await prisma.rouletteChat.updateMany({
                    where: {
                        OR: [
                            { user1Id: userId, user2Id: prevPartnerId, endedAt: null },
                            { user1Id: prevPartnerId, user2Id: userId, endedAt: null }
                        ]
                    },
                    data: {
                        endedAt: new Date(),
                        isProfileRevealed: existingUser.rouletteUser.profileRevealed,
                        isUsernameRevealed: existingUser.rouletteUser.usernameRevealed
                    }
                });

                await prisma.rouletteUser.update({
                    where: { id: prevPartnerId },
                    data: {
                        chatPartnerId: null,
                        searchingPartner: false,
                        usernameRevealed: false,
                        profileRevealed: false
                    }
                });

                const currentSession = await prisma.session.findUnique({
                    where: {
                        key: prevPartnerId
                    }
                });

                const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

                const translate = (key: string, ...args: any[]) => i18n(false).t(__language_code || "ru", key, ...args);

                // Уведомляем предыдущего собеседника
                await ctx.api.sendMessage(prevPartnerId, translate('roulette_partner_left'), {
                    reply_markup: rouletteStartKeyboard(translate)
                });

                const userReactionCounts = await getReactionCounts(userId);

                await ctx.api.sendMessage(prevPartnerId, translate('roulette_put_reaction_on_your_partner'), {
                    reply_markup: rouletteReactionKeyboard(translate, userId, userReactionCounts)
                });

                await ctx.reply(ctx.t('roulette_chat_ended'), {
                    reply_markup: rouletteStartKeyboard(ctx.t)
                });

                // Получаем количество реакций для предыдущего собеседника
                const partnerReactionCounts = await getReactionCounts(prevPartnerId);

                // Предлагаем пользователю оценить собеседника
                await ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                    reply_markup: rouletteReactionKeyboard(ctx.t, prevPartnerId, partnerReactionCounts)
                });
            }

            if (message === ctx.t('main_menu')) {
                ctx.logger.info({ userId }, 'Exiting roulette to main menu');
                ctx.session.step = 'profile';

                await sendForm(ctx)
                await ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: profileKeyboard()
                });
            } else {
                ctx.logger.info({ userId }, 'Finding new roulette partner');
                await findRouletteUser(ctx)
            }

        } else if (message === ctx.t('roulette_stop')) {
            // Завершаем чат
            const partnerUserId = existingUser.rouletteUser?.chatPartnerId;
            if (partnerUserId) {
                ctx.logger.info({ userId, partnerId: partnerUserId }, 'User stopped roulette chat');
                
                // Обновляем статус чата
                await prisma.rouletteChat.updateMany({
                    where: {
                        OR: [
                            { user1Id: userId, user2Id: partnerUserId, endedAt: null },
                            { user1Id: partnerUserId, user2Id: userId, endedAt: null }
                        ]
                    },
                    data: {
                        endedAt: new Date(),
                        isProfileRevealed: existingUser.rouletteUser?.profileRevealed,
                        isUsernameRevealed: existingUser.rouletteUser?.usernameRevealed
                    }
                });

                await prisma.rouletteUser.update({
                    where: { id: partnerUserId },
                    data: {
                        chatPartnerId: null,
                        searchingPartner: false,
                        usernameRevealed: false,
                        profileRevealed: false
                    }
                });

                const currentSession = await prisma.session.findUnique({
                    where: {
                        key: partnerUserId
                    }
                });

                const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

                const translate = (key: string, ...args: any[]) => i18n(false).t(__language_code || "ru", key, ...args);

                // Уведомляем собеседника
                await ctx.api.sendMessage(partnerUserId, translate('roulette_partner_left'), {
                    reply_markup: rouletteStartKeyboard(translate)
                });

                // Получаем количество реакций для пользователя
                const userReactionCounts = await getReactionCounts(userId);

                // Предлагаем собеседнику оценить пользователя
                await ctx.api.sendMessage(partnerUserId, translate('roulette_put_reaction_on_your_partner'), {
                    reply_markup: rouletteReactionKeyboard(translate, userId, userReactionCounts)
                });
            }

            if (existingUser.rouletteUser) {
                await prisma.rouletteUser.update({
                    where: { id: userId },
                    data: {
                        chatPartnerId: null,
                        searchingPartner: false,
                        usernameRevealed: false,
                        profileRevealed: false
                    }
                });
            }

            await ctx.reply(ctx.t('roulette_chat_ended'), {
                reply_markup: rouletteStartKeyboard(ctx.t)
            });

            // Предлагаем пользователю оценить собеседника
            if (existingUser.rouletteUser?.chatPartnerId) {
                // Получаем количество реакций для собеседника
                const partnerReactionCounts = await getReactionCounts(existingUser.rouletteUser.chatPartnerId);

                await ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                    reply_markup: rouletteReactionKeyboard(ctx.t, existingUser.rouletteUser.chatPartnerId, partnerReactionCounts)
                });
            }

        } else if (message === ctx.t('roulette_reveal')) {
            const partnerId = existingUser.rouletteUser?.chatPartnerId;
            ctx.logger.info({ userId, partnerId }, 'User requesting profile reveal');
            
            // Запрос на раскрытие профиля
            if (partnerId) {
                // Проверяем, не был ли профиль уже раскрыт
                if (existingUser.rouletteUser?.profileRevealed) {
                    await ctx.reply(ctx.t('roulette_profile_already_revealed'));
                    return;
                }

                const currentSession = await prisma.session.findUnique({
                    where: {
                        key: partnerId
                    }
                });

                const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

                const translate = (key: string, ...args: any[]) => i18n(false).t(__language_code || "ru", key, ...args);
                // Создаем клавиатуру для ответа на запрос о раскрытии
                await ctx.api.sendMessage(partnerId, translate('roulette_reveal_request'), {
                    reply_markup: confirmRevealKeyboard(translate, userId)
                });

                // Уведомляем пользователя о том, что запрос был отправлен
                await ctx.reply(ctx.t('roulette_reveal_request_sent'));
            }

        } else if (message === ctx.t('roulette_reveal_username')) {
            const partnerId = existingUser.rouletteUser?.chatPartnerId;
            ctx.logger.info({ userId, partnerId }, 'User requesting username reveal');
            
            // Запрос на раскрытие профиля
            if (partnerId) {
                // Проверяем, не был ли username уже раскрыт
                if (existingUser.rouletteUser?.usernameRevealed) {
                    await ctx.reply(ctx.t('roulette_username_already_revealed'));
                    return;
                }

                const currentSession = await prisma.session.findUnique({
                    where: {
                        key: partnerId
                    }
                });

                const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

                const translate = (key: string, ...args: any[]) => i18n(false).t(__language_code || "ru", key, ...args);

                // Создаем клавиатуру для ответа на запрос о раскрытии
                await ctx.api.sendMessage(partnerId, translate('roulette_reveal_username_request'), {
                    reply_markup: confirmRevealKeyboard(translate, userId, true)
                });

                await ctx.reply(ctx.t('roulette_reveal_username_request_sent'));
            }

        } else if (message === ctx.t('roulette_stop_searching')) {
            ctx.logger.info({ userId }, 'User stopped roulette search');
            // Проверяем наличие активного собеседника
            if (existingUser.rouletteUser?.chatPartnerId) {
                // Получаем информацию о статусе раскрытия для формирования клавиатуры
                const profileRevealed = existingUser.rouletteUser.profileRevealed;
                const usernameRevealed = existingUser.rouletteUser.usernameRevealed;

                await ctx.reply(ctx.t('roulette_you_have_partner'), {
                    reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
                });
            } else {
                await prisma.rouletteUser.update({
                    where: { id: existingUser.rouletteUser?.id },
                    data: {
                        chatPartnerId: null,
                        searchingPartner: false,
                        usernameRevealed: false,
                        profileRevealed: false
                    }
                });

                ctx.session.step = "roulette_start";

                await ctx.reply(ctx.t('roulette_stop_searching_success'), {
                    reply_markup: rouletteStartKeyboard(ctx.t)
                });
            }

        } else {
            // Пересылаем сообщение собеседнику
            if (existingUser.rouletteUser?.chatPartnerId) {
                try {
                    ctx.logger.info({ userId, partnerId: existingUser.rouletteUser.chatPartnerId }, 'Forwarding message to partner');
                    
                    if (ctx.message?.text) {
                        await ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.message.text);
                    } else if (ctx.message?.photo) {
                        await ctx.api.sendPhoto(existingUser.rouletteUser.chatPartnerId, ctx.message.photo[0].file_id);
                    } else if (ctx.message?.video) {
                        await ctx.api.sendVideo(existingUser.rouletteUser.chatPartnerId, ctx.message.video.file_id);
                    } else if (ctx.message?.voice) {
                        await ctx.api.sendVoice(existingUser.rouletteUser.chatPartnerId, ctx.message.voice.file_id);
                    } else if (ctx.message?.video_note) {
                        await ctx.api.sendVideoNote(existingUser.rouletteUser.chatPartnerId, ctx.message.video_note.file_id);
                    } else if (ctx.message?.sticker) {
                        await ctx.api.sendSticker(existingUser.rouletteUser.chatPartnerId, ctx.message.sticker.file_id);
                    } else if (ctx.message?.animation) {
                        await ctx.api.sendAnimation(existingUser.rouletteUser.chatPartnerId, ctx.message.animation.file_id);
                    } else if (ctx.message?.document) {
                        await ctx.api.sendDocument(existingUser.rouletteUser.chatPartnerId, ctx.message.document.file_id);
                    } else if (ctx.message?.audio) {
                        await ctx.api.sendAudio(existingUser.rouletteUser.chatPartnerId, ctx.message.audio.file_id);
                    } else if (ctx.message?.location) {
                        await ctx.api.sendLocation(existingUser.rouletteUser.chatPartnerId, ctx.message.location.latitude, ctx.message.location.longitude);
                    } else if (ctx.message?.contact) {
                        await ctx.api.sendContact(existingUser.rouletteUser.chatPartnerId, ctx.message.contact.phone_number, ctx.message.contact.first_name);
                    }
                } catch (error) {
                    ctx.logger.error({
                        error,
                        action: 'Error forwarding message in roulette',
                        userId: ctx.message?.from.id,
                        partnerId: existingUser.rouletteUser?.chatPartnerId,
                        message: ctx.message
                    });
                }
            }
        }
    } else {
        ctx.logger.info({ userId }, 'User not found, redirecting to form creation');
        ctx.session.step = "you_dont_have_form";

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
} 