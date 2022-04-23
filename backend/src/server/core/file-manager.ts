import * as fs from "fs";
import {Card, CardType} from "../../model/card";
import {Question} from "../../model/question";

let nextId = 0;
let nextCardId = () => nextId ++;
const PROB_USER_CARD_FILLS_QUESTION = .8;

/**
 * Loads all the string lines from the file path.
 * @param txtPath
 */
export const loadLinesFromDisk = (txtPath: string) => {
    let data = fs.readFileSync(txtPath).toString('utf-8');
    return data.split("\r\n");
};

/**
 * Loads all cards for the cardType from disk. Also considers the nsfw flag.
 * @param cardTypeString cardType as called by the files
 * @param cardType
 */
export const loadCardsForType = (cardTypeString: string, cardType: CardType, nsfw: boolean): Card[] => {
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
            text: text
        };
        return card;
    });
};

/**
 * Returns a replacement card for the matching placeholder type.
 * @param typePlaceholder e.g., "{Person}"
 * @param cards
 * @param usedCards cards already used, won't be used again.
 */
export const getCardForTypePlaceholder = (typePlaceholder: string, cards: Card[], usedCards: Card[]): Card => {
    let filteredCards;

    if (typePlaceholder === "{Player}") {
        filteredCards = cards.filter(c => c.type === CardType.Player)
    } else if (typePlaceholder === "{Person}") {
        filteredCards = cards.filter(c => c.type === CardType.Person)
    } else if (typePlaceholder === "{Object}") {
        filteredCards = cards.filter(c => c.type === CardType.Object)
    } else if (typePlaceholder === "{Place}") {
        filteredCards = cards.filter(c => c.type === CardType.Place)
    } else if (typePlaceholder === "{Activity}") {
        filteredCards = cards.filter(c => c.type === CardType.Activity)
    } else {
        console.error("Encountered unknown placeholder: ", typePlaceholder);
    }

    // randomly select a new card
    return filteredCards
        .filter(c => usedCards.length == 0 || !usedCards.map(uc => uc.id).includes(c.id))
        .sort(() => 0.5 - Math.random())
        [0];
}

/**
 * Fills the question placeholders with user and predefined cards.
 * @param questionText
 * @param userCards
 * @param predefinedCards
 */
export const parseQuestionText = (questionText: string, userCards: Card[], predefinedCards: Card[]): string => {
    questionText = "Why is {Person} afraid of {Person}?";

    // detect placeholders
    const placeholderRegex = /\{(?<type>\w+)}/g;
    let placeholders: RegExpExecArray[] = [];
    let matches;
    while (matches = placeholderRegex.exec(questionText)) {
        placeholders.push(matches);
    }

    // load replacement cards for placeholders
    let replacementCards: Card[] = [];
    placeholders.forEach(placeholder => {
        const rawPlaceholder: string = placeholder[0];

        if (Math.random() < PROB_USER_CARD_FILLS_QUESTION) {
            replacementCards.push(getCardForTypePlaceholder(rawPlaceholder, userCards, replacementCards))
        } else {
            replacementCards.push(getCardForTypePlaceholder(rawPlaceholder, predefinedCards, replacementCards))
        }
    });

    // replace placeholders by cards
    let i;
    for (i in placeholders) {
        const placeholder = placeholders[i][0];
        const replacement = replacementCards[i].text;

        questionText = questionText.replace(placeholder, replacement)
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

    // todo map -> array
    let questionTexts: string[] = [];

    if (nsfw) {
        questionTexts = questionTexts.concat(loadLinesFromDisk('./resources/content/questions/NSFWQuestions.txt'));
    }
    questionTexts = questionTexts.concat(loadLinesFromDisk('./resources/content/questions/SFWQuestions.txt'));

    let questions = questionTexts.filter(text => text !== '').map(text => {
        let question: Question = {
            text: null,
            rawText: text,
            values: null
        }
        return question;
    });

    // select 5 questions
    let selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 5);

    selectedQuestions.forEach(question => {
        question.text = parseQuestionText(question.rawText, userCards, predefinedCards);
    });

    return selectedQuestions;
};

export const loadCardsForAllTypes = (nsfw: boolean): Card[] => {
  const cards = new Map<CardType, Card[]>();
  cards.set(CardType.Activity, loadCardsForType('Activities', CardType.Activity, nsfw));
  cards.set(CardType.Object, loadCardsForType('Objects', CardType.Object, nsfw));
  cards.set(CardType.Person, loadCardsForType('Persons', CardType.Person, nsfw));
  cards.set(CardType.Place, loadCardsForType('Places', CardType.Place, nsfw));

  // return cards;

  return [];
};


// console.log(loadQuestions(true, null, null));
console.log(
    parseQuestionText(null, loadCardsForType('Persons', CardType.Person, true), loadCardsForType('Persons', CardType.Person, true))
);