<script lang="ts">
    import {Question} from "./model/question";

    export let question: Question;
</script>

<div class="col">
    <div class="text-center question">
        <h1>{question.text}</h1>
    </div>
</div>

<style lang="scss">
  .question {
    h1 {
      font-size: 36pt;
      font-family: Neucha, -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    padding: 2em 0;
  }

</style>
