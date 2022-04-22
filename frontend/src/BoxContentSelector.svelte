<script>
    import {twemoji} from 'svelte-twemoji';
    import {draggable} from './dragdrop.js'
    import {crossfade} from 'svelte/transition'
    import {elasticOut, quintOut} from 'svelte/easing'
    import {flip} from 'svelte/animate';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let selection;
    export let pool;
    export let groups;
    export let groupSize;

    function putInSelection(item, index) {
      const oldItem = selection[index];
      const oldShelfIndex = selection.indexOf(item);
      if (pool.indexOf(item) !== -1) {
        pool.splice(pool.indexOf(item), 1);
      }
      if (oldShelfIndex !== -1) {
        selection[oldShelfIndex] = oldItem;
      } else if (oldItem) {
        pool.push(oldItem);
      }
      selection[index] = item;
      pool = pool;

      dispatch('selectionChange');
    }

    function putInPool(item) {
      if (pool.indexOf(item) !== -1) {
        pool.splice(pool.indexOf(item), 1);
      }
      if (selection.indexOf(item) !== -1) {
        selection[selection.indexOf(item)] = undefined;
      }
      pool.push(item);
      pool = pool;

      dispatch('selectionChange');
    }

    const [send, receive] = crossfade({
        duration: d => 600,
        easing: elasticOut,
        fallback(node, params) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;

            return {
                duration: 600,
                easing: quintOut,
                css: t => `
                        transform: ${transform} scale(${t});
                        opacity: ${t}
                      `
            };
        }
    });

</script>

<style>

    .outerslot_open {
        position: relative;
        display: inline-block;
        background-image:  url("box_open_100.png");
        background-size: 130px;
        width: 130px;
        height: 130px;
        margin: 3px;
        vertical-align: top;
    }

    .outerslot_closed {
        position: relative;
        display: inline-block;
        background-image:  url("box_closed_100.png");
        background-size: 130px;
        width: 130px;
        height: 130px;
        margin: -20px;
        vertical-align: top;
    }

    .slot {
        position: relative;
        display: inline-block;
        box-shadow: 5px 5px 10px -10px black inset;
        width: 64px;
        height: 64px;
		margin-top: 45px;
        vertical-align: bottom;
    }

    .pool {
        position: relative;
        box-shadow: 5px 5px 10px -10px black inset;
        min-height: 64px;
    }

    .item {
        height: 56px;
        width: 56px;
        position: relative;
        display: inline-block;
        background: rgba(255, 255, 255, 0.5);
        margin: 4px;
        box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
        font-size: 27pt;
    }

    .slot .item {
        position: absolute;
    }

    :global(.dragged) {
        pointer-events: none;
        z-index: 100;
    }

    :global(.slot.droptarget, .pool.droptarget) {
        background: #ddd;
    }
</style>

<div class="selection">
    {#each selection as item, index}
        {#if groupSize > 0 && index % groupSize === 0}
            <h2 class="selection-group-label" use:twemoji>Box {groups[Math.floor(index / groupSize)]}</h2>
        {/if}

        {#if groupSize > 1}
            <div class="outerslot_closed">
                <div class="slot" on:dropped={(e) => putInSelection(e.detail, index)}>
                    {#if item}
                        {#each [item] as item (item.id)}
                            <div class="item" use:draggable={{data: item, targets: ['.pool', '.slot', '.slot .item']}}
                                 in:receive={item.id} out:send={item.id} on:dropped={(e) => putInSelection(e.detail, index)} use:twemoji>
                                {item.name}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        {:else}
            <div class="outerslot_open">
                <div class="slot" on:dropped={(e) => putInSelection(e.detail, index)}>
                    {#if item}
                        {#each [item] as item (item.id)}
                            <div class="item" use:draggable={{data: item, targets: ['.pool', '.slot', '.slot .item']}}
                                 in:receive={item.id} out:send={item.id} on:dropped={(e) => putInSelection(e.detail, index)} use:twemoji>
                                {item.name}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        {/if}

        {#if groupSize > 0 && (index + 1) % groupSize === 0}
            <br>
            <br>
        {/if}
    {/each}
</div>

<div class="pool" on:dropped={(e) => putInPool(e.detail)}>
    {#each pool as item, index (item.id)}
        <div class="item" animate:flip use:draggable={{data: item, targets: ['.slot', '.slot .item']}}
             in:receive={item.id} out:send={item.id} use:twemoji>
            {item.name}
        </div>
    {/each}
</div>
