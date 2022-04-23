<script lang="ts">
    import {Question} from "./model/question";
    import QuestionComponent from "./QuestionComponent.svelte";
    import {Player} from "src/model/player";
    import {Card, CardType, PlayedCard} from "src/model/card";
    import CardPresenter from "src/CardPresenter.svelte";
    import CardCreatorComponent from "src/CardCreatorComponent.svelte";
    import PunishmentCreatorComponent from "src/PunishmentCreatorComponent";
    import {Punishment, PunishmentCondition} from "src/model/punishment";
    import HandCards from "src/HandCards.svelte";

    let examplePlayer: Player = {id: '1', name: 'W8D7'};
    let examplePlayer2: Player = {id: '2', name: 'me'};
    let exampleCard: Card = {
        type: CardType.Object,
        id: 1,
        text: 'A huge bage of dirty skittles boys',
        author: examplePlayer
    };

    let exampleCardPerson: Card = {
        type: CardType.Person,
        id: 2,
        text: 'Donald Trump',
        author: examplePlayer
    };

    let exampleCardPlace: Card = {
        type: CardType.Place,
        id: 3,
        text: 'Your Home',
        author: null
    };

    let exampleCardActivity: Card = {
        type: CardType.Activity,
        id: 4,
        text: 'Jerking off',
        author: examplePlayer
    };

    let exampleCardPunischment: Card = {
        type: CardType.Punishment,
        id: 5,
        text: 'Sexually eating a Banana',
        author: examplePlayer
    };

    let examplePunishment: Punishment = {
        card: exampleCardPunischment,
        targets: [examplePlayer],
        condition: PunishmentCondition.AllVotes
    };

    let cards: Card[] = [exampleCard, exampleCardActivity, exampleCardPerson, exampleCardPlace]
    let playedCards: PlayedCard[] = [
        {
            card: exampleCard,
            dealer: examplePlayer,
            votes: 0
        },
        {
            card: exampleCardActivity,
            dealer: examplePlayer2,
            votes: 2
        }]
    let exampleQuestion: Question = {text: "How fat is Andi's aunt?"}
</script>

<QuestionComponent question="{exampleQuestion}"></QuestionComponent>
<CardPresenter animationDuration={100} slideTime={200} currentPlayerId="2" playedCards="{playedCards}"></CardPresenter>
<CardCreatorComponent punishment="{examplePunishment}"></CardCreatorComponent>
<PunishmentCreatorComponent></PunishmentCreatorComponent>
<HandCards canPlay={true} cards={cards}></HandCards>
<!--<div class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-1">-->
<!--    <CardComponent text="Your momma" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" isWinner score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" showType card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" showType card="{exampleCardActivity}"></CardComponent>-->
<!--    <CardComponent text="Your momma" showType card="{exampleCardPerson}"></CardComponent>-->
<!--    <CardComponent text="Your momma" showType card="{exampleCardPlace}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votedFor score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" votable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--    <CardComponent text="Your momma" playable score="{5}" card="{exampleCard}"></CardComponent>-->
<!--</div>-->
