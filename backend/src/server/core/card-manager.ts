import * as npmlog from 'npmlog';
import { Card, CardType } from '../../model/card';
import { Player } from '../../model/player';
import { InternalState } from './state';

const CARD_MANAGER_LOG_PREFIX = 'log-manager';
const MAX_PLAYER_CARDS = 12;

/**
 * Assign card metadata: card id and author
 * @param card
 * @param player
 * @param state
 */
export const assignCardMetadata = (card: Card, player: Player | undefined, state: InternalState): void => {
  state.nextCardId++;

  card.id = state.nextCardId;
  card.author = player;
};

/**
 * Create a new punishment card
 * @param text
 */
export const createNewPunishmentCard = (text: string): Card => {
  return {
    id: -1,
    text,
    type: CardType.Punishment,
  };
};

/**
 * Add a new punishment to the internal state if not already existing for the given player
 * @param card
 * @param player
 * @param state
 */
export const addCard = (card: Card, player: Player, {gameState}: InternalState): void => {
  const index = gameState.playedCards.findIndex((p) => p.dealer.id === player.id);
  if (index >= 0) {
    npmlog.warn(CARD_MANAGER_LOG_PREFIX, 'Punishment for player %s already existing', player.id);
    return;
  }

  gameState.playedCards.push({
    card,
    dealer: player,
    votes: 0,
  });
};

export const voteForCard = (cardId: number, {gameState}: InternalState): void => {
  const playedCard = gameState.playedCards.find((c) => c.card.id === cardId);
  if (playedCard) {
    playedCard.votes++;
  }
};

export const getCardVotingScore = ({gameState: {playedCards}}: InternalState): number => {
  return playedCards.reduce((total, next) => total + next.votes, 0);
};

export const getTopMostCards = ({gameState: {playedCards}}: InternalState): [Card, Card] => {
  const sorted = playedCards.sort((a, b) => b.votes - a.votes);

  return [sorted[0].card, sorted[1].card];
};

export const createNewPlayerCard = (text: string, type: CardType): Card => {
  return {
    id: -1,
    text,
    type,
  };
};

export const generatePlayerCards = (state: InternalState): Card[] => {
  return state.gameState.playerState.map(({player}) => {
    const card: Card = {
      id: -1,
      text: player.name,
      type: CardType.Player,
    }

    assignCardMetadata(card, undefined, state);

    return card;
  });
}

const getNewCard = (type: CardType, playedCards: number[], cardPool: Card[]): Card => {
  const newCards = cardPool
    .filter((card) => card.type === type)
    .filter((card) => !playedCards.includes(card.id));
  const index = Math.floor(Math.random() * newCards.length);

  const newCard = newCards.splice(index, 1)[0];

  playedCards.push(newCard.id);

  return newCard;
};

/**
 * Initial card hand-out for all players
 */
export const handoutCards = ({cardPool, gameState}: InternalState): void => {
  const playedCardIds: number[] = [];

  for (const {hand} of gameState.playerState) {
    hand.push(getNewCard(CardType.Player, playedCardIds, cardPool));

    for (let i = 0; i < 2; i++) {
      hand.push(getNewCard(CardType.Person, playedCardIds, cardPool));
      hand.push(getNewCard(CardType.Object, playedCardIds, cardPool));
      hand.push(getNewCard(CardType.Place, playedCardIds, cardPool));
      hand.push(getNewCard(CardType.Activity, playedCardIds, cardPool));
    }
  }
};

/**
 * Refill the players hand with pre-defined cards
 * @param state
 */
export const refillHand = (state: InternalState): void => {
  const {predefinedCards, gameState} = state;
  const {playerState} = gameState;

  for (const {player, hand} of playerState) {
    while (hand.length < MAX_PLAYER_CARDS) {
      const index = Math.floor(Math.random() * predefinedCards.length);
      const newCard = predefinedCards.splice(index, 1)[0];

      assignCardMetadata(newCard, player, state);

      hand.push(newCard);
    }
  }
};

export const removeCardFromHand = (cardId: number, {gameState}: InternalState): Card | undefined => {
  for (const {hand} of gameState.playerState) {
    const index = hand.findIndex((card) => card.id === cardId);

    if (index > -1) {
      return hand.splice(index, 1)[0];
    }
  }

  npmlog.warn(CARD_MANAGER_LOG_PREFIX, 'Card with id %s not found', cardId);

  return undefined;
}
