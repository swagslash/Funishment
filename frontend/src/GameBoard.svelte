<script lang="ts">
    import {twemoji} from 'svelte-twemoji';
    import {Phase} from 'src/model/game';

    import {Box, Game} from './model/game';
    import Countdown from './Countdown.svelte';
    import BoxContentSelector from './BoxContentSelector.svelte';
    import AfterGuessOverview from './AfterGuessOverview.svelte';
    import {Player} from './model/player';
    import ScoreList from './ScoreList.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let game: Game;
    export let userId: string;
    export let players: Player[];
    let guesses;

    let incompleteContentSelection: boolean = true;
    let isSelectingContent: boolean = true;
    let hasGuessed: boolean = false;

    let contentPool = [];
    let contentSelection = [];
    let labelPool = [];
    let labelSelection = [];
    let guessSelection = [];
    let guessPool = [];
    let guessGroup = [];

    $: {
      isSelectingContent = true;
      incompleteContentSelection = true;

        contentPool = [...game.round.contentPool].map((x) => ({id: x, name: x}));
        contentSelection = [...Array(3)
            .map(() => undefined)];

        labelPool = [...game.round.labelPool].map((x) => ({id: x, name: x}));
        labelSelection = [...Array(9)
            .map(() => undefined)];

        guessSelection = [...Array(3)];
        guessPool = [...game.round.contentPool].map((x) => ({id: x, name: x}));
        guessGroup = game.round.boxes.map((b) => b.labels.join(''));

      hasGuessed = false;
    }

    function updateContentSelection() {
        incompleteContentSelection = contentSelection.some((s) => s === undefined);
    }

    function saveContents() {
        isSelectingContent = false;
    }

    function sendSelection() {
        const labels = labelSelection.map((x) => x?.name ?? '');
        const content = contentSelection.map((x) => x?.name ?? '');
        const payload: Box[] = [
            {
                content: content[0],
                labels: [labels[0], labels[1], labels[2]],
            },
            {
                content: content[1],
                labels: [labels[3], labels[4], labels[5]],
            },
            {
                content: content[2],
                labels: [labels[6], labels[7], labels[8]],
            },
        ];
        dispatch('boxesSelected', payload);
    }

    function guessContents() {
        guesses = guessSelection.map((x) => x?.name ?? '');
        dispatch('boxesGuessed', guesses);
        hasGuessed = true;
    }

</script>

<main class="px-3">
    <div id="game">
        <!--        <p>Decorator for this round: {game.current.name}</p>-->

        {#if game.phase === Phase.Selection}
            {#if game.current.id === userId}
                <Countdown countdown={90}/>
                <br>
                {#if isSelectingContent}
                    <h1 class="text-primary" use:twemoji>👉 Pack your boxes!</h1>
                    <br>
                    <BoxContentSelector on:selectionChange="{updateContentSelection}"
                                        selection={contentSelection}
                                        pool={contentPool}/>

                    <br>
                    <button class="btn btn-lg btn-primary fw-bold" disabled="{incompleteContentSelection}"
                            on:click="{saveContents}" use:twemoji>
                        👉 Choose Labels 👈
                    </button>
                {:else }
                    <h1 class="text-primary" use:twemoji>🏷️ Label your boxes!</h1>
                    <BoxContentSelector selection="{labelSelection}"
                                        pool="{labelPool}"
                                        groups="{contentSelection.map((c) => c?.name)}"
                                        groupSize="{3}"/>

                    <br>
                    <button class="btn btn-lg btn-primary fw-bold" on:click="{sendSelection}" use:twemoji>
                        👉 Ship it! 👈
                    </button>
                {/if}
            {:else}
                <h2 use:twemoji>⏳ Waiting for <span class="text-primary">{game.current.name}</span> to finish decorating their boxes! ⏳</h2>
            {/if}
        {:else if game.phase === Phase.Guessing}
            <h1 class="text-primary" use:twemoji>🤔 Guessing phase</h1>
            {#if game.current.id !== userId}
                <Countdown countdown={60}/>
                <h2>Guess what's in <span class="text-primary">{game.current.name}</span>'s box:</h2>
                <br>

                <BoxContentSelector groups="{guessGroup}"
                                    selection="{guessSelection}"
                                    pool="{guessPool}"
                                    groupSize="{1}"/>

                <br>
                {#if hasGuessed}
                    <h2>⏳ Waiting for other players! ⏳</h2>
                {:else}
                    <button class="btn btn-lg btn-primary fw-bold"
                            on:click="{guessContents}" use:twemoji>
                        👉 Guess 👈
                    </button>
                {/if}

            {:else}
                <h2 use:twemoji>⏳ Waiting for others to guess your boxes! ⏳</h2>
                <Countdown countdown={60}/>
            {/if}
        {:else if game.phase === Phase.Scoring}
            <AfterGuessOverview currentId={game.current.id} players={players} boxes={game.round.boxes} guesses={game.round.guesses} />

            <h1 use:twemoji>🏆 Current Scores</h1>
            <ScoreList players={players} scores={game.scores} myUserId={userId} currentUserId={game.current.id}/>

            <br>

            {#if game.current.id === userId}
                <h4>It's your turn next!</h4>
                <h4 use:twemoji>Time for some payback 💰↩️</h4>
                <br>
                <button class="btn btn-lg btn-primary fw-bold" type="submit"
                        on:click="{() => dispatch('continueNextRound')}" use:twemoji>
                    👉 Next Round 👈
                </button>
            {:else}
                <h4>It's <span class="username">{game.current.name}</span> turn next!</h4>
            {/if}
        {/if}
    </div>
</main>
