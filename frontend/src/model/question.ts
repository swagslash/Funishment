import { CardType } from './card';

export interface Question {
  expectedAnswerCardTypes: CardType[];
  text: string;
  rawText: string;
  values: object[];
}