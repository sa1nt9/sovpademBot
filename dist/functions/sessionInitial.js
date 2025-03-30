"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionInitial = sessionInitial;
function sessionInitial() {
    return {
        step: "choose_language_start",
        question: 'years',
        additionalFormInfo: {
            canGoBack: false
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
            isFinished: false
        },
        roulette: {
            chatPartnerId: null,
            searchingPartner: false
        },
        availableProfiles: [],
        currentCandidateProfile: null,
        currentBlacklistedUser: null,
        pendingMutualLike: false
    };
}
