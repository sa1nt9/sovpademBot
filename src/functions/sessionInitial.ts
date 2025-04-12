import { ISessionData } from "../typescript/interfaces/ISessionData";
import { logger } from "../logger";

export function sessionInitial(): ISessionData {
    logger.info('Initializing new session');
    
    return {
        step: "choose_language_start",
        question: 'years',
        additionalFormInfo: {
            canGoBack: false,
            selectedProfileType: 'RELATIONSHIP'
        },
        privacyAccepted: false,
        activeProfile: {
            id: '',
            userId: '',
            profileType: 'RELATIONSHIP',
            name: '',
            description: '',
            city: '',
            location: {
                longitude: 0,
                latitude: 0,
            },
            gender: 'male',
            interestedIn: 'all',
            age: 0,
            files: [],
            tempFiles: [],
            ownCoordinates: false,
            isActive: false,
        },
        roulette: {
            chatPartnerId: null,
            searchingPartner: false
        },
        currentCandidateProfile: null,
        currentBlacklistedProfile: null,
        pendingMutualLike: false
    };
}