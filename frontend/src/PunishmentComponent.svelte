<script lang="ts">
    import {Punishment, PunishmentCondition} from "src/model/punishment";

    export let punishment: Punishment;

    function parsePunishment(punishment) {
        switch (punishment) {
            case PunishmentCondition.AllVotes:
                return "Don't be that funny.";
            case PunishmentCondition.SameScore:
                return "Shared sorrow is double sorrow.";
            case PunishmentCondition.LastToVote:
                return "Pick faster next time.";
        }
    }
</script>

<div class="col">
    <div class="card text-center">
        <div class="card-header punishment">
            {#if punishment.condition !== 0}Hidden{/if}Punishment
        </div>
        <div class="card-body">
            {#if punishment.targets.length}
                <h5 class="card-title text-dark">
                    {punishment.targets.map((player) => player.name).join(', ')}
                    {#if punishment.targets.length === 1} <br> has to
                    {:else} <br> have to
                    {/if}
                </h5>
                <h5 class="card-title text-dark">{punishment.card.text}</h5>
                {#if punishment.condition !== 0}
                    <h5 class="card-title text-dark">{parsePunishment(punishment.condition)}</h5>
                {/if}

            {:else}
                <h5 class="card-title text-dark">{punishment.card.text}</h5>
            {/if}

        </div>

    </div>
</div>

<style lang="scss">
  .card {
    position: relative;
    top: 0;
    transition: top ease 0.5s;
    margin: 5px;

    /* width: 14rem; */
  }

  .votedFor {
    box-shadow: 0px 0px 25px rgba(84, 245, 51, 0.795);
  }

  .isWinner {
    box-shadow: 0px 0px 25px rgba(240, 218, 24, 0.795);
    color: black;
  }

  .presenterTheme {
    font-size: 24pt;
  }

  .card-title {
    font-family: Neucha, -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .playable {
    cursor: pointer;
  }

  .playable:hover {
    color: rgba(255, 255, 255, 1);
    box-shadow: 0 5px 5px rgba(238, 206, 24, 0.4);
    top: -10px;
  }

  .object {
    background-color: #6610f2;
    color: white;
  }

  .person {
    background-color: #fd7e14;
    color: black;
  }

  .place {
    background-color: #198754;
    color: white;
  }

  .punishment {
    background-color: #dc3545;
    color: white;
  }

  .activity {
    background-color: #0dcaf0;
    color: white;
  }
</style>
