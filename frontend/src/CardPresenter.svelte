<script lang="ts">
    import CardComponent from "./CardComponent.svelte";
    import {Card} from "src/model/card";
    import {onMount} from "svelte";
    import {fade, fly} from 'svelte/transition';
    import VotingComponent from "src/VotingComponent";

    export let cards: Card[];
    export let animationDuration: number = 2000;
    export let slideTime: number = 7000;

    let index = 0;

    let card = cards[index];

    let visibleFirst = false;
    let visibleSecond = false;

    let finishedSlideshow = false;

    onMount(() => {
        visibleFirst = true;

        const interval = setInterval(() => {
            let makeVisible = visibleFirst ? 2 : 1;

            // Hide all
            visibleFirst = false;
            visibleSecond = false;

            index++;
            if (index >= cards.length) {
                setTimeout(() => {
                    finishedSlideshow = true;
                }, animationDuration);
                return;
            }
            card = cards[index];
            setTimeout(() => {
                if (makeVisible === 2) {
                    visibleSecond = true;
                } else if (makeVisible === 1) {
                    visibleFirst = true
                }
            }, animationDuration);

        }, slideTime);

        return () => {
            clearInterval(interval);
        };
    });

    function handleVoting(e: any) {
        console.log(e.detail.id);
    }
</script>

{#if finishedSlideshow}
    <div>
        <VotingComponent cards="{cards}" on:votingComplete={handleVoting}></VotingComponent>
    </div>
{:else}
    <div >
        {#if index % 2 === 0 && visibleFirst}
            <div class="presented" in:fly="{{ x: +200, duration: animationDuration }}"
                 out:fly="{{ x: -200, duration: animationDuration }}">
                <CardComponent presenterTheme card="{card}"></CardComponent>
            </div>
        {:else if visibleSecond}
            <div class="presented" in:fly="{{ x: +200, duration: animationDuration }}"
                 out:fly="{{ x: -200, duration: animationDuration }}">
                <CardComponent presenterTheme card="{card}"></CardComponent>
            </div>
        {/if}
    </div>
{/if}

<style>
    CardComponent {

    }

    .presented {
        position: relative;
        top: 0;
    }
</style>