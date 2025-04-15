"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionInitial = sessionInitial;
const logger_1 = require("../logger");
function sessionInitial() {
    logger_1.logger.info('Initializing new session');
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
