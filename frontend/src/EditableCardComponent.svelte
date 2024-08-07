<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {CardType} from "./model/card";
    import {Player} from "./model/player";

    const dispatch = createEventDispatcher();

    export let cardType: CardType;
    export let currentPlayer: Player;
    export let skippable: boolean = false;

    let textarea;
    let userInput: string;

    const typeToStringMap = new Map<CardType, string>([
        [CardType.Object, "any object"],
        [CardType.Activity, "any activity"],
        [CardType.Person, "any person"],
        [CardType.Place, "any place (including its preposition)"],
        [CardType.Punishment, "the punishment."],
    ]);

    const typeToExampleMap = new Map<CardType, string[]>([
        [CardType.Object, ["women", "a clown car", "3 liters of coffee"]],
        [CardType.Activity, ["going shopping with your mom", "eating pancakes together", "petting ducks"]],
        [CardType.Person, ["my weird neighbor", "a hyperactive kid", "your step-sister"]],
        [CardType.Place, ["in a dark alley", "on the toilet", "behind the moon"]],
        [CardType.Punishment, ["sexually eat a banana", "run around the building", "do 10 one-handed push-ups, maggot!"]],
    ]);

    function getRandomExample(t: CardType): string {
        const examplesForType = typeToExampleMap.get(t);
        if (examplesForType == undefined) {
            return '';
        }
        return examplesForType[Math.floor(Math.random() * examplesForType.length)]
    }

    function onSubmit() {
        console.log("created card with text " + userInput);
        dispatch("cardCreated", {type: cardType, text: userInput, player: currentPlayer});
        userInput = '';
        textarea.focus()
    }

    function onSkip() {
        console.log("skipped card");
        dispatch("cardCreated", undefined);
        userInput = '';
        textarea.focus()
    }
</script>

<div class="justify-content-center">
    <div class="card text-center" style="margin: auto;">
        <div class="card-header text-dark">
            Enter <b>{typeToStringMap.get(cardType)}</b>
        </div>
        <div class="card-body">
            <textarea bind:this={textarea} type="text" className="form-control" bind:value={userInput} id="userInput"
                      placeholder="{getRandomExample(cardType)}" style="min-height: 75px"></textarea>
        </div>
        <div class="card-footer">
            <button on:click={onSubmit} disabled={!userInput} class="btn btn-outline-primary">Submit</button>
            {#if skippable}
                <button on:click={onSkip} class="btn btn-outline-warning">Skip</button>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">

  a {
    cursor: pointer;
  }

  .card {
    position: relative;
    top: 0;
    transition: top ease 0.5s;
    margin: 5px;
  }


  .card-body {
    textarea {
      width: 100%;
    }
  }
</style>
