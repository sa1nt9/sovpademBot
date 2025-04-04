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
import { ProfileType } from '@prisma/client';
import { sportLevelQuestion } from './sportLevel';
import { itExperienceQuestion } from './itExperience';
import { itTechnologiesQuestion } from './itTechnologies';
import { itGithubQuestion } from './itGithub';
import { gameAccountQuestion } from './gameAccount';

// export const questionsWays = {
//     [ProfileType.RELATIONSHIP]: [
//         'years',
//         'gender',
//         'interested_in',
//         'city',
//         'name',
//         ''
//     ],
//     [ProfileType.SPORT]: [
//         'sport_type',
//         'years',
//         'gender',
//         'interested_in',
//         'city',
//         'name'
// }

export async function questionsStep(ctx: MyContext) {
    const message = ctx.message!.text;

    ctx.logger.info({ message, question: ctx.session.question })

    switch (ctx.session.question) {
        case "sport_level":
            await sportLevelQuestion(ctx);
            break;
        case "it_experience":
            await itExperienceQuestion(ctx);
            break;
        case "it_technologies":
            await itTechnologiesQuestion(ctx);
            break;
        case "it_github":
            await itGithubQuestion(ctx);
            break;
        case "game_account":
            await gameAccountQuestion(ctx);
            break;
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