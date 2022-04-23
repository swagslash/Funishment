<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {CardType} from "./model/card";
    import {Player} from "./model/player";

    const dispatch = createEventDispatcher();

    export let cardType: CardType;
    export let currentPlayer: Player;

    let userInput: string;

    const typeToStringMap = new Map<CardType, string>([
        [CardType.Object, "an object"],
        [CardType.Activity, "an activity"],
        [CardType.Person, "a person"],
        [CardType.Place, "a place"],
    ]);

    const typeToExampleMap = new Map<CardType, string[]>([
        [CardType.Object, ["women", "a clown car", "3 liters of coffee"]],
        [CardType.Activity, ["going to the moon"]],
        [CardType.Person, ["my neighbor"]],
        [CardType.Place, ["a dark alley"]],
    ]);

    function getRandomExample(t: CardType): string {
        const examplesForType = typeToExampleMap.get(t);
        return examplesForType[Math.floor(Math.random() * examplesForType.length)]
    }

    function onSubmit() {
        console.log("created card with text " + userInput);
        dispatch("cardCreated", { type: cardType, text: userInput, player: currentPlayer });
        userInput = '';
    }
</script>

<div class="justify-content-center">
    <div class="card text-center" style="width: 30em; margin: auto">
        <div class="card-header text-dark">
            Enter <b>{typeToStringMap.get(cardType)}</b>
        </div>
        <div class="card-body">
            <textarea type="text" className="form-control" bind:value={userInput} id="userInput"
                   placeholder="{getRandomExample(cardType)}"></textarea>
        </div>
            <div class="card-footer text-muted">
                <a on:click={onSubmit} class="card-link btn btn-outline-primary">Submit</a>
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

        /* width: 14rem; */
    }


    .card-body {
        textarea {
            width: 100%;
        }
    }
</style>
