<script lang="ts">
    import { createEventDispatcher } from 'svelte';

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

<main class="px-3" style="max-width: 37em; margin: auto">
    <div id="pre-lobby">
        <h1>Play now!</h1>
        <p class="lead">To start playing, either create a room or join one via ID!</p>
        <div class="form-group">
            <label for="usernameField">Username</label>
            <input type="text" class="form-control" bind:value={username} id="usernameField" on:input={userNameChanged}
                   placeholder="Enter username">
            <small id="usernameHelp" class="form-text text-muted">Make sure to chose a unique user name that people know you by.</small>
        </div>
        <div class="form-group">
            <label for="lobbyField">Lobby ID</label>
            <input type="text" class="form-control" bind:value={lobbyId} id="lobbyField"
                   placeholder="Lobby id (leave blank to create)">
        </div>
        <div class="form-group" hidden={lobbyId}>
            <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked>
            <label class="form-check-label" for="flexCheckChecked">
                Enable NSFW content 🥵🍆
            </label>
        </div>
        {#if roomNotFound}
            <br>
            <p class="bg-danger badge" style="padding: 10px">Room not found</p>
        {/if}

        <br/>

        <button class="btn btn-lg btn-primary fw-bold" type="submit" disabled="{!canCreateOrEnter}"
                on:click={onCreateOrJoin} >
            {#if lobbyId}👉 Enter 👈{:else}👉 Create 👈{/if}
        </button>
    </div>

</main>


<style>
    .form-group {
        margin-bottom: 10px;
    }


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
