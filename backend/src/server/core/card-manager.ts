import npmlog from 'npmlog';
import { Card, CardType } from '../../model/card';
import { Player } from '../../model/player';
import { InternalState } from './state';

const CARD_MANAGER_LOG_PREFIX = 'log-manager';

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
  const sorted = playedCards.sort((a, b) => a.votes - b.votes);

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

/**
 * Initial card hand-out for all players
 */
export const handoutCards = ({cardPool, playedCardIds, gameState}: InternalState): void => {


  for (const {hand} of gameState.playerState) {
    for (let i = 0; i < 2; i++) {
      const personCard = cardPool.get(CardType.Person).filter((card) => !playedCardIds.includes(card.id));
      hand.push(personCard);
      playedCardIds.push(personCard.id);

      const playerCard = newCards.find((card) => card.type === CardType.Player);
      hand.push(playerCard);
      playedCardIds.push(playerCard.id);

      const objectCard = newCards.find((card) => card.type === CardType.Object);
      hand.push(objectCard);
      playedCardIds.push(objectCard.id);

      const placeCard = newCards.find((card) => card.type === CardType.Place);
      hand.push(placeCard);
      playedCardIds.push(placeCard.id);

      const activityCard = newCards.find((card) => card.type === CardType.Activity);
      hand.push(activityCard);
      playedCardIds.push(activityCard.id);
    }
  }
};

/**
 * Refill the players hand with pre-defined cards
 * @param state
 */
export const refillHand = (state: InternalState): void => {

};
