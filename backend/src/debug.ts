import * as fs from "fs";
import * as path from "path";
import {Card, CardType} from "./model/card";

const nsfw: boolean = true;

let nextCardId = () => 1;


export const loadLinesFromDisk = (csvPath: string) => {
    // const csvFilePath = path.resolve(__dirname, csvPath);
    let data = fs.readFileSync(csvPath).toString('utf-8');
    let textByLine = data.split("\r\n");
    return textByLine;
}

export const loadCardsForType = (cardTypeString: string, cardType: CardType) => {
    let cardTexts: string[] = [];

    if (nsfw)
        cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/NSFW' + cardTypeString + '.txt'))
    cardTexts = cardTexts.concat(loadLinesFromDisk('./resources/content/cards/SFW' + cardTypeString + '.txt'))

    return cardTexts.filter(text => text !== '').map((text) => {
        let card: Card = {
            id: nextCardId(),
            type: cardType,
            author: null,
            text: text
        };
        return card;
    })

    // cards.forEach(card => {
    //     card.id = nextCardId();
    //     card.type = cardType;
    //     card.author = null;
    // })

    // console.log("Result", cards);
};


console.log(loadCardsForType('Activities', CardType.Activity));
console.log(loadCardsForType('Objects', CardType.Object));
console.log(loadCardsForType('Persons', CardType.Person));
console.log(loadCardsForType('Places', CardType.Place));
