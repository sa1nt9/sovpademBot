import { MyContext } from '../typescript/context';
import { confirmRevealKeyboard, notHaveFormToDeactiveKeyboard, rouletteKeyboard, rouletteReactionKeyboard, rouletteStartKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { sendForm } from '../functions/sendForm';
import { findRouletteUser } from '../functions/findRouletteUser';
import { getReactionCounts } from '../functions/getReactionCounts';


export async function rouletteSearchingStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.message?.from.id);

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
        if (message === ctx.t('roulette_next') || message === ctx.t('roulette_find')) {

            // Если был предыдущий собеседник, разрываем связь
            if (existingUser.rouletteUser?.chatPartnerId) {
                const prevPartnerId = existingUser.rouletteUser.chatPartnerId;
                
                await prisma.rouletteUser.update({
                    where: { id: prevPartnerId },
                    data: {
                        chatPartnerId: null,
                        searchingPartner: false,
                        usernameRevealed: false,
                        profileRevealed: false
                    }
                });

                // Уведомляем предыдущего собеседника
                await ctx.api.sendMessage(prevPartnerId, ctx.t('roulette_partner_left'), {
                    reply_markup: rouletteStartKeyboard(ctx.t)
                });
                
                // Получаем количество реакций для пользователя
                const userReactionCounts = await getReactionCounts(userId);
                
                // Предлагаем собеседнику оценить пользователя
                await ctx.api.sendMessage(prevPartnerId, ctx.t('roulette_put_reaction_on_your_partner'), {
                    reply_markup: rouletteReactionKeyboard(ctx.t, userId, userReactionCounts)
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

            await findRouletteUser(ctx)

        } else if (message === ctx.t('roulette_stop')) {
            ctx.logger.info({
                action: 'Roulette stop',
                userId: userId
            });
            // Завершаем чат
            const partnerUserId = existingUser.rouletteUser?.chatPartnerId;
            if (partnerUserId) {
                
                await prisma.rouletteUser.update({
                    where: { id: partnerUserId },
                    data: {
                        chatPartnerId: null,
                        searchingPartner: false,
                        usernameRevealed: false,
                        profileRevealed: false
                    }
                });

                // Уведомляем собеседника
                await ctx.api.sendMessage(partnerUserId, ctx.t('roulette_partner_left'), {
                    reply_markup: rouletteStartKeyboard(ctx.t)
                });
                
                // Получаем количество реакций для пользователя
                const userReactionCounts = await getReactionCounts(userId);
                
                // Предлагаем собеседнику оценить пользователя
                await ctx.api.sendMessage(partnerUserId, ctx.t('roulette_put_reaction_on_your_partner'), {
                    reply_markup: rouletteReactionKeyboard(ctx.t, userId, userReactionCounts)
                });
            }

            // Удаляем запись из RouletteUser
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
            // Запрос на раскрытие профиля
            if (existingUser.rouletteUser?.chatPartnerId) {
                // Проверяем, не был ли профиль уже раскрыт
                if (existingUser.rouletteUser.profileRevealed) {
                    await ctx.reply(ctx.t('roulette_profile_already_revealed'));
                    return;
                }

                // Создаем клавиатуру для ответа на запрос о раскрытии
                await ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.t('roulette_reveal_request'), {
                    reply_markup: confirmRevealKeyboard(ctx.t, userId)
                });

                // Уведомляем пользователя о том, что запрос был отправлен
                await ctx.reply(ctx.t('roulette_reveal_request_sent'));
            }

        } else if (message === ctx.t('roulette_reveal_username')) {
            // Запрос на раскрытие профиля
            if (existingUser.rouletteUser?.chatPartnerId) {
                // Проверяем, не был ли username уже раскрыт
                if (existingUser.rouletteUser.usernameRevealed) {
                    await ctx.reply(ctx.t('roulette_username_already_revealed'));
                    return;
                }

                // Создаем клавиатуру для ответа на запрос о раскрытии
                await ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.t('roulette_reveal_username_request'), {
                    reply_markup: confirmRevealKeyboard(ctx.t, userId, true)
                });

                await ctx.reply(ctx.t('roulette_reveal_username_request_sent'));
            }

        } else if (message === ctx.t('roulette_stop_searching')) {
            // Запрос на раскрытие профиля
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
        ctx.session.step = "you_dont_have_form";

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
} 