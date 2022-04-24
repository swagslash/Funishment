import * as fs from "fs";
import * as npmlog from 'npmlog';
import {Card, CardType} from "../../model/card";
import {Question} from "../../model/question";

const CATEGORY_COUNT = 4;
const CARDS_PER_CATEGORY = 2;
const MAX_EXPECTED_PLAYERS = 10;

let nextId = CATEGORY_COUNT*CARDS_PER_CATEGORY*MAX_EXPECTED_PLAYERS;
let nextCardId = () => nextId++;

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
 */
export const loadCardsForType = (cardTypeString: string, cardType: CardType, nsfw: boolean, playerNames: string[]): Card[] => {
    let cardTexts: string[] = [];

    if (nsfw) {
        cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/NSFW' + cardTypeString + '.txt'));
    }
    cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/SFW' + cardTypeString + '.txt'));

    return cardTexts.filter(text => text !== '').map((text) => {
        let card: Card = {
            id: nextCardId(),
            type: cardType,
            author: null,
            text: parseCardText(text, playerNames)
        };
        return card;
    });
};

/**
 * Loads all cards for all types in one large array.
 * @param nsfw
 * @param playerNames
 */
export const loadCardsForAllTypes = (nsfw: boolean, playerNames: string[]): Card[] => {
    const cards: Card[] = [];

    cards.push(...loadCardsForType('Activities', CardType.Activity, nsfw, playerNames));
    cards.push(...loadCardsForType('Objects', CardType.Object, nsfw, playerNames));
    cards.push(...loadCardsForType('Persons', CardType.Person, nsfw, playerNames));
    cards.push(...loadCardsForType('Places', CardType.Place, nsfw, playerNames));

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

    let questions = questionTexts
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

    return questions;
};


// console.log(
//     loadQuestions(false,
//         loadCardsForAllTypes(true, ["Alex", "Andi", "Pete"]),
//         loadCardsForAllTypes(true, ["Alex", "Andi", "Pete"]))
// );
