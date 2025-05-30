## Features

#### All features can be toggled in `/ioi settings` or manually with `/ioi features [load|unload] <name>`

[1]: https://minecraft.wiki/images/Invicon_Diamond_Pickaxe.png
[2]: https://minecraft.wiki/images/Invicon_Diamond_Hoe.png
[3]: https://minecraft.wiki/images/Invicon_Fishing_Rod.png
[4]: https://minecraft.wiki/images/Invicon_Compass.gif

|     | Name                                      | Short description                                                | default On |
| --- | ----------------------------------------- | ---------------------------------------------------------------- | ---------- |
| ✅  | [Afk](#afk)                               | Automatically afk after a minute of inactivity                   | ✓          |
| ✅  | [Auction](#auction)                       | Displays usefull Infos in the Auction Gui                        | ✓          |
| ✅  | [Clock](#clock)                           | Displays the current time in the Scoreboard                      | ✓          |
| ✅  | [Crate Cooldown](#crate-cooldown)         | Displays a 30-second cooldown on a crates when you find one.     | ✓          |
| ✅  | [Easy Claim](#easy-claim)                 | Highlights claimable items in `/rewards`                         | ✓          |
| ✅  | [Gang Member Status](#gang-member-status) | Displays the status of your gang members. `Online, AFK, Offline` | ✓          |
| ✅  | [Mcmmo](#mcmmo)                           |                                                                  | ✓          |
|     |                                           |                                                                  |            |

<sub>✅: Finished | 🚧: Work in progress | 🔜: Planned</sub>

## Detailed Features

<details id='afk'>
<summary><h2>Afk</summary>

- Automatically sets your status to AFK after a minute of inactivity.

- ### Settings:
  - `General → AFK → Enabled`: Enables or disables the AFK feature.
  - `General → AFK → AFK Time`: The time in minutes after which you are considered AFK.

</details>

<details id='auction'>
<summary><h2>Auction</summary>

- Displays price per unit for stacked items when you hover them.
- Displays the current sorting mode of the auction house.

  ![Preview](https://i.imgur.com/WEpxXWF.png) ![Preview](https://i.imgur.com/SATRlRP.png)

- ### Settings:
  - `General → Auction → Sorting Mode`: Toggle weather the sort mode of the auction house is shown.
  - `General → Auction → Price Per Unit`: Toggle weather the price per unit is shown.

</details>

<details id='clock'>
<summary><h2>Clock</summary>

- Displays your current time in the Scoreboard.

  ![Preview](https://i.imgur.com/gK68Bnw.png)

- ### Settings:
  - `General → Clock → Enabled`: Enables or disables the Clock feature.
  - `General → Clock → Display Mode`: Choose between different display modes. (Scoreboard, HUD)

</details>

<details id='crate-cooldown'>
<summary><h2>Crate Cooldown</summary>

- Displays a 30-second cooldown on a crates when you find one.

  ![Preview](https://i.imgur.com/7SOWLaO.gif)

- ### Settings:
  - `General → Crate Cooldown`: Enables or disables the Crate Cooldown feature.

</details>

<details id='easy-claim'>
<summary><h2>Easy Claim</summary>

- Highlights claimable items in `/rewards`.
- Sets the stack size of the item to the claimable amount.

  ![Preview](https://i.imgur.com/hg4DjuQ.png)

- ### Settings:
  - `General → Easy Claim → Enabled`: Enables or disables the Easy Claim feature.
  - `General → Easy Claim → Highlight Color`: The color of the highlight.
  - `General → Easy Claim → Change Stack Size`: Enables or disables the stack size change.

</details>

<details id='gang-member-status'>
<summary><h2>Gang Member Status</summary>

- Displays the status of your gang members. (Only works for your own gang)

  > [!IMPORTANT] This only works for your own gang.

  ![Preview](https://i.imgur.com/ktwEEZR.png)

- ### Settings:
  - `General → Gang Member Status`: Enables or disables the Gang Member Status feature.
  </details>

<details id='mcmmo'>
<summary><h2>Mcmmo</summary>

- Displays the cooldown of all abilities.
- Displays the remaining time of the abilities.
- Displays the remaining time for the next skill level.

  ![Preview](https://i.imgur.com/vpAgxTB.png) ![Preview](https://i.imgur.com/QSxxEsG.gif)

- ### Settings:
  - `General → Mcmmo → Enabled`: Enables or disables the Mcmmo feature.
  - `General → Mcmmo → Show Cooldown`: Enables or disables the cooldown display.
  - `General → Mcmmo → Next Level Estimate`: Enables or disables the next level estimate.

</details>
