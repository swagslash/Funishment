<script lang="ts">
    import {twemoji} from 'svelte-twemoji';
    import {createEventDispatcher} from 'svelte';

    export let lobbyId: string;
    export let username: string;
    export let roomNotFound: boolean;

    const dispatch = createEventDispatcher();

    let canCreateOrEnter: boolean = false;

    function userNameChanged() {
        canCreateOrEnter = username.length > 0;
    }

    function onCreateOrJoin() {
        dispatch('join', {username, lobbyId});
    }
</script>

<main class="px-3">
    <div id="pre-lobby">
        <h1 use:twemoji>💖 Play now!</h1>
        <p class="lead">To start playing, either create a room or join one via ID!</p>
        <div class="form-group">
            <label for="usernameField">Username</label>
            <input type="text" class="form-control" bind:value={username} id="usernameField" on:input={userNameChanged}
                   placeholder="Enter username">
            <small id="emailHelp" class="form-text text-muted">Choosing inappropriate usernames will result in no
                penalty. I'm not your dad.</small>
        </div>
        <div class="form-group">
            <label for="lobbyField">Lobby ID</label>
            <input type="text" class="form-control" bind:value={lobbyId} id="lobbyField"
                   placeholder="Lobby id (leave blank to create)">

            {#if roomNotFound}
                <br>
                <p>Room not found</p>
            {/if}
        </div>

        <br/>

        <button class="btn btn-lg btn-primary fw-bold" type="submit" disabled="{!canCreateOrEnter}"
                on:click={onCreateOrJoin} use:twemoji>
            {#if lobbyId}👉 Enter 👈{:else}👉 Create 👈{/if}
        </button>
    </div>

</main>


<style>
    /*
   * Globals
   */


    /* Custom default button */
    .btn-secondary,
    .btn-secondary:hover,
    .btn-secondary:focus {
        color: #333;
        background-color: #a62824;
        text-shadow: none; /* Prevent inheritance from `body` */
    }

    /*
     * Header
     */

    .nav-masthead .nav-link {
        padding: .25rem 0;
        font-weight: 700;
        color: rgba(255, 255, 255, .5);
        background-color: transparent;
        border-bottom: .25rem solid transparent;
    }

    .nav-masthead .nav-link:hover,
    .nav-masthead .nav-link:focus {
        border-bottom-color: rgba(255, 255, 255, .25);
    }

    .nav-masthead .nav-link + .nav-link {
        margin-left: 1rem;
    }

    .nav-masthead .active {
        color: #fff;
        border-bottom-color: #fff;
    }


    .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
    }

    @media (min-width: 768px) {
        .bd-placeholder-img-lg {
            font-size: 3.5rem;
        }
    }
</style>
