<script lang="ts">
  import { PlayerState } from './model/player';

  export let playerStates: PlayerState[];
  export let myUserId: string = '';

  let scores: [number, string, string, number][];

  $: {
    // scores = playerStates
    //     ?.map((ps) => [ps.player.id, ps.player.name, ps.score])
    //     .sort(([, , score1], [, , score2]) => score2 - score1)
    //   || [];

    let scoreList: [number, PlayerState][] = [];

    let position = 0;
    playerStates
      .sort((a, b) => b.score - a.score)
      .forEach((state, index) => {
        if (scoreList.length === 0) {
          scoreList.push([position, state]);
        } else {
          if (scoreList[scoreList.length - 1][1].score === state.score) {
            scoreList.push([position, state]);
          } else {
            position = index;
            scoreList.push([position, state]);
          }
        }

        console.log(position, state.score);
      });

    scores = scoreList.map(([position, state]) => [position, state.player.id, state.player.name, state.score]);

  }
</script>

<style>
	.player-first {
		background-color: gold;
        color: black;
	}

    .player-first-shadow {
		box-shadow: 0 0 25px 10px rgba(255, 215, 0, 0.8);
    }

	.player-second {
		background-color: silver;
		color: black;
	}

    .player-second-shadow {
		box-shadow: 0 0 25px 10px rgba(192, 192, 192, 0.8);}

	.player-third {
		background-color: chocolate;
		color: black;
	}

    .player-third-shadow {
		box-shadow: 0 0 25px 10px rgba(210, 105, 30, 0.8);
    }

    .player-other {
		background-color: #333333;
        color: white;
    }
</style>

<div class="justify-content-center">
    <div class="row row-cols-1 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
        {#each scores as [index, playerId, playerName, score]}
            <div class="col">
                <div class="card text-center"
                     class:player-first-shadow={index === 0}
                     class:player-second-shadow={index === 1}
                     class:player-third-shadow={index === 2}>
                    <div class="card-header"
                         class:player-first={index === 0}
                         class:player-second={index === 1}
                         class:player-third={index === 2}
                         class:player-other={index > 2}>
                        <b>{index + 1}{#if index === 0}st{/if}{#if index === 1}nd{/if}{#if index === 2}rd{/if}{#if index > 2}th{/if}</b>
                        with
                        <b>{score}
                            {#if score === 1}
                                Point
                            {:else}
                                Points
                            {/if}
                        </b>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title"
                            class:text-primary={myUserId === playerId}
                            class:text-dark={myUserId !== playerId}>
                            {playerName}
                            {#if myUserId === playerId}
                                (You)
                            {/if}
                        </h5>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
