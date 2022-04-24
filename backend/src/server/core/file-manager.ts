import * as fs from "fs";
import {Card, CardType} from "../../model/card";
import {Question} from "../../model/question";
import { assignCardMetadata } from './card-manager';
import { InternalState } from './state';

/**
 * Loads all the string lines from the file path.
 * @param txtPath
 */
export const loadLinesFromDisk = (txtPath: string) => {
    let data = fs.readFileSync(txtPath).toString('utf-8');
    return data.split("\n").map((line) => line.replace('\r', ''));
};

/**
 * Annoyingly, the cards contain {Player} placeholders which are uniquely replaced by player names here.
 * @param cardText
 * @param playerNames
 */
export const parseCardText = (cardText: string, playerNames: string[]): string => {
    let placeholders: RegExpExecArray[] = [];

    const placeholderRegex = /\{\w+}/g;
    let matches;
    while (matches = placeholderRegex.exec(cardText)) {
        placeholders.push(matches);
    }

    let shuffledPlayerNames = [...playerNames].sort(() => 0.5 - Math.random())
    placeholders.forEach(placeholder => {
        cardText = cardText.replace(placeholder[0], shuffledPlayerNames.pop())
    })

    return cardText;
};

/**
 * Loads all cards for the cardType from disk. Also considers the nsfw flag.
 * @param cardTypeString cardType as called by the files
 * @param cardType
 * @param nsfw
 * @param playerNames
 * @param internalState
 */
export const loadCardsForType = (cardTypeString: string, cardType: CardType, nsfw: boolean, playerNames: string[], internalState: InternalState): Card[] => {
    let cardTexts: string[] = [];

    if (nsfw) {
        cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/NSFW' + cardTypeString + '.txt'));
    }
    cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/SFW' + cardTypeString + '.txt'));

    return cardTexts.filter(text => text !== '').map((text) => {
        let card: Card = {
            id:-1,
            type: cardType,
            text: parseCardText(text, playerNames)
        };
        assignCardMetadata(card, undefined, internalState);

        return card;
    });
};

/**
 * Loads all cards for all types in one large array.
 */
export const loadCardsForAllTypes = (nsfw: boolean, playerNames: string[], internalState: InternalState): Card[] => {
    const cards: Card[] = [];

    cards.push(...loadCardsForType('Activities', CardType.Activity, nsfw, playerNames, internalState));
    cards.push(...loadCardsForType('Objects', CardType.Object, nsfw, playerNames, internalState));
    cards.push(...loadCardsForType('Persons', CardType.Person, nsfw, playerNames, internalState));
    cards.push(...loadCardsForType('Places', CardType.Place, nsfw, playerNames, internalState));

    // todo added for debug
    // cards.push(...(loadCardsForType('Persons', CardType.Player, nsfw, playerNames).slice(0, 3)));

    return cards;
};


/**
 * Returns a replacement card for the matching placeholder type(s).
 * @param typePlaceholderOptions e.g., "{Player|Person}" -> ["Player", "Person"]
 * @param cards
 * @param usedCards cards already used, won't be used again.
 */
export const getCardForTypePlaceholder = (typePlaceholderOptions: string[], cards: Card[], usedCards: Card[]): Card => {
    let typeOptions: CardType[] = [];

    if (typePlaceholderOptions.includes("Player")) {
        typeOptions.push(CardType.Player);
    }
    if (typePlaceholderOptions.includes("Person")) {
        typeOptions.push(CardType.Person);
    }
    if (typePlaceholderOptions.includes("Object")) {
        typeOptions.push(CardType.Object);
    }
    if (typePlaceholderOptions.includes("Place")) {
        typeOptions.push(CardType.Place);
    }
    if (typePlaceholderOptions.includes("Activity")) {
        typeOptions.push(CardType.Activity);
    }
    if (typePlaceholderOptions.length == 1 && typePlaceholderOptions[0] === "_") {
        console.error("Encountered not allowed placeholder '_'");
        typeOptions = [];
    }

    return cards
        // cards with the correct type(s)
        .filter(c => typeOptions.includes(c.type))
        // unique cards per question
        .filter(fc => usedCards.length == 0 || !usedCards.map(uc => uc.id).includes(fc.id))
        // shuffle
        .sort(() => 0.5 - Math.random())
        // first or undefined
        [0];
}

/**
 * Fills the question placeholders with user and predefined cards.
 * @param questionText
 * @param userCards
 * @param predefinedCards
 */
export const parseQuestionText = (questionText: string, userCards: Card[], predefinedCards: Card[]): string => {
    // first replace underscores {_}
    questionText = questionText.replace("{_}", "___");

    // detect custom placeholders
    const placeholderRegex = /\{(\w|\|)+}/g;
    let placeholders: RegExpExecArray[] = [];
    let matches;
    while (matches = placeholderRegex.exec(questionText)) {
        placeholders.push(matches);
    }

    // load replacement cards for placeholders
    let replacementCards: Card[] = [];
    placeholders.forEach(placeholder => {
        const rawPlaceholder: string = placeholder[0];
        let placeholderOptions: string[] = rawPlaceholder.slice(1, -1).split('|');

        replacementCards.push(getCardForTypePlaceholder(placeholderOptions, userCards.concat(predefinedCards), replacementCards))
    });

    // replace placeholders by cards
    let i;
    for (i in placeholders) {
        const placeholder = placeholders[i][0];
        let replacement = replacementCards[i].text;

        questionText = questionText.replace(placeholder, replacement);
    }

    return questionText;
};

/**
 * Load 5 questions
 * @param nsfw
 * @param userCards
 * @param predefinedCards
 */
export const loadQuestions = (nsfw: boolean, userCards: Card[], predefinedCards: Card[]): Question[] => {
    const nrQuestions = 5;
    let questionTexts: string[] = [];

    if (nsfw) {
        questionTexts = questionTexts.concat(loadLinesFromDisk('./resources/content/questions/NSFWQuestions.txt'));
    }
    questionTexts = questionTexts.concat(loadLinesFromDisk('./resources/content/questions/SFWQuestions.txt'));

    return questionTexts
        .filter(text => text !== '')
        .sort(() => 0.5 - Math.random()) // shuffle
        .slice(0, nrQuestions)
        .map(text => {
            let question: Question = {
                text: parseQuestionText(text, userCards, predefinedCards),
                rawText: text,
                values: null
            }
            return question;
        });
};


// console.log(
//     loadQuestions(false,
//         loadCardsForAllTypes(true, ["Alex", "Andi", "Pete"]),
//         loadCardsForAllTypes(true, ["Alex", "Andi", "Pete"]))
// );
