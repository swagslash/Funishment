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
export const assignCardMetadata = (card: Card, player: Player, state: InternalState): void => {
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