import { CardType } from './card';

export interface Question {
  expectedAnswerCardTypes: CardType[];
  text: string;
}