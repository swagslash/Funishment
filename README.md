# Funishment

Have "fun" with your friends in this online party game.
Generate your custom answers for our interesting and challenging questions, and vote for the best answers.
The unfunniest player will be punished!

## Predefined Questions
Predefined questions are located in the [questions folder](./backend/resources/content/questions).
Placeholders are automatically replaced by user-generated and predefined cards and are written in brackets, e.g., _"What is {Person}'s most valuable possession?"_.
They can be combined to allow more generation options, e.g., _"What is {Player|Person}'s most valuable possession?"_.
The underscore is used as blank, later filled by the user's answers, e.g., _"{\_} is always in my trunk."_.
The following placeholders are allowed for questions:

| Type in brackets | Example when filled             |
|------------------|---------------------------------|
| Player           | Alex                            |
| Person           | Hitler                          |
| Object           | your mom's dildo                |
| Place            | on the most suspicious toilet   |
| Activity         | furiously humping a beer bottle |
| _                | ___ (not combinable)            |