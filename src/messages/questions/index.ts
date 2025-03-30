import { MyContext } from '../../typescript/context';
import { yearsQuestion } from './years';
import { genderQuestion } from './gender';
import { interestedInQuestion } from './interestedIn';
import { cityQuestion } from './city';
import { nameQuestion } from './name';
import { textQuestion } from './text';
import { fileQuestion } from './file';
import { addAnotherFileQuestion } from './addAnotherFile';
import { allRightQuestion } from './allRight';

export async function questionsStep(ctx: MyContext) {
    const message = ctx.message!.text;

    ctx.logger.info({ message, question: ctx.session.question })


    switch (ctx.session.question) {
        case "years":
            await yearsQuestion(ctx);
            break;
        case "gender":
            await genderQuestion(ctx);
            break;
        case "interested_in":
            await interestedInQuestion(ctx);
            break;
        case "city":
            await cityQuestion(ctx);
            break;
        case "name":
            await nameQuestion(ctx);
            break;
        case "text":
            await textQuestion(ctx);
            break;
        case "file":
            await fileQuestion(ctx);
            break;
        case "add_another_file":
            await addAnotherFileQuestion(ctx);
            break;
        case "all_right":
            await allRightQuestion(ctx);
            break;
    }
} 