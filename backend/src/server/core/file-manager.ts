import * as fs from "fs";
import * as path from "path";
import {Card, CardType} from "../../model/card";
import {Question} from "../../model/question";

const nsfw: boolean = true;

let nextCardId = () => 1;

/**
 * Loads all the string lines from the file path.
 * @param txtPath
 */
export const loadLinesFromDisk = (txtPath: string) => {
    let data = fs.readFileSync(txtPath).toString('utf-8');
    let textByLine = data.split("\r\n");
    return textByLine;
};

/**
 * Loads all cards for the cardType from disk. Also considers the nsfw flag.
 * @param cardTypeString cardType as called by the files
 * @param cardType
 */
export const loadCardsForType = (cardTypeString: string, cardType: CardType) => {
    let cardTexts: string[] = [];

    if (nsfw)
        cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/NSFW' + cardTypeString + '.txt'));
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

export const parseQuestion = (questionText: string, cards: Map<CardType, Card[]>) => {
    return ""; // todo
};

export const loadQuestions = (cards: Map<CardType, Card[]>) => {
    let questionTexts: string[] = [];

    if (nsfw)
        questionTexts = questionTexts.concat(loadLinesFromDisk('./resources/content/questions/NSFWQuestions.txt'));
    questionTexts = questionTexts.concat(loadLinesFromDisk('./resources/content/questions/SFWQuestions.txt'));

    let questions = questionTexts.filter(text => text !== '').map(text => {
        let question: Question = {
            text: null,
            rawText: text,
            values: null
        }
        return question;
    });

    return questions;

    // questions.forEach(question => {
    //     question.text = parseQuestion(question.rawText, cards);
    // });
};

let cards = new Map<CardType, Card[]>();
cards.set(CardType.Activity, loadCardsForType('Activities', CardType.Activity));
cards.set(CardType.Object, loadCardsForType('Objects', CardType.Object));
cards.set(CardType.Person, loadCardsForType('Persons', CardType.Person));
cards.set(CardType.Place, loadCardsForType('Places', CardType.Place));

console.log(loadQuestions(cards));