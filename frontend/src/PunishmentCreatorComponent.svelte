<script lang="ts">
    import EditableCardComponent from "./EditableCardComponent.svelte";
    import {Card, CardType} from "./model/card";
    import CardComponent from "./CardComponent.svelte";

    let currentType = CardType.Punishment;
    let userCards: Card[] = [];

    function addCard(e: any) {
        console.log(e.detail);
        const newCard: Card = e.detail
        newCard.author = {id: '', name: 'you'}
        userCards.push(newCard);
        // Trigger change detection
        userCards = userCards;
        currentType = undefined;
    }
</script>

{#if currentType}
    <h2>Finish this sentence</h2>
    <h3>The unlucky player has to ...</h3>
    <EditableCardComponent cardType="{currentType}" on:cardCreated={addCard}></EditableCardComponent>
    {:else}
    <h2>Waiting for other players to finish their punishments.</h2>
    <p>While you wait, you can think about the consequences if you lose and have to.</p>
{/if}
<div class="row row-cols-1 g-10">
    {#each userCards as card}
        <CardComponent card="{card}" showType showAuthor></CardComponent>
    {/each}
</div>

