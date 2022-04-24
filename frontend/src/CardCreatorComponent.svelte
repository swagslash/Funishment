<script lang="ts">
    import EditableCardComponent from "./EditableCardComponent.svelte";
    import {Card, CardType} from "./model/card";
    import CardComponent from "./CardComponent.svelte";
    import PunishmentDisplayComponent from "src/PunishmentDisplayComponent.svelte";
    import {createEventDispatcher} from "svelte";

    // TODO get from server some day
    export let requestedTypes: CardType[] = [
        CardType.Person,
        CardType.Person,
        CardType.Object,
        CardType.Object,
        CardType.Activity,
        CardType.Activity,
        CardType.Place,
        CardType.Place,
    ];

    export let card: Card;

    const dispatch = createEventDispatcher();

    let index = 0;
    let currentType = requestedTypes[index];
    let userCards: Card[] = [];

    function addCard(e: any) {

        console.log(e.detail);

        if (e.detail) {
            const newCard: Card = e.detail
            newCard.author = {id: '', name: 'you'}
            userCards.push(newCard);
            // Trigger change detection
            userCards = userCards;
        }

        index++;
        if (index < requestedTypes.length) {
            currentType = requestedTypes[index];
        } else {
            dispatch('created', {userCards})
            currentType = undefined;
        }
    }
</script>

{#if currentType}
    <h2>Create answer cards</h2>
    <p>Think about funny answers for five generated questions.<br>
        We will shuffle and deal the answer cards to all players.</p>
    <EditableCardComponent skippable={currentType !== CardType.Punishment}
                           cardType={currentType}
                           on:cardCreated={addCard}>
    </EditableCardComponent>
{:else}
    <h2>Waiting for other players to finish their answers.</h2>
    <p>You can admire your answers and laugh at how funny you are.</p>
{/if}
<div style="margin-top: 10px" class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-4 g-1">
    {#each userCards as card}
        <CardComponent card="{card}" showType showAuthor></CardComponent>
    {/each}
</div>

