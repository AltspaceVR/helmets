/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Actor,
    AnimationKeyframe,
    AnimationWrapMode,
    ButtonBehavior,
    Context,
    Quaternion,
    TextAnchorLocation,
    Vector3
} from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class ScoreBoard {
    private text: Actor = null;
    private buttons: Actor[] = [null, null, null, null];
    private scores: number[] = [0, 0, 0];
    private defaultMessage = "Shootout! First to 10 baskets Wins";
    private scoreThreshold = 10;
    private gameOver = true;
    private scoreKeeper: string = null;
    private lastActiveAt: Date = null;

    constructor(private context: Context, private baseUrl: string) {
        this.context.onStarted(() => this.started());
    }

    /**
     * Once the context is "started", initialize the app.
     */
    private started() {

        // Create a new actor with no mesh, but some text. This operation is asynchronous, so
        // it returns a "forward" promise (a special promise, as we'll see later).
        const textPromise = Actor.CreateEmpty(this.context, {
            actor: {
                name: 'Text',
                transform: {
                    position: { x: 0, y: 1.0, z: 0 }
                },
                text: {
                    contents: this.defaultMessage,
                    anchor: TextAnchorLocation.MiddleCenter,
                    color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
                    height: 0.3
                }
            }
        });

        // Even though the actor is not yet created in Altspace (because we didn't wait for the promise),
        // we can still get a reference to it by grabbing the `value` field from the forward promise.
        this.text = textPromise.value;

        this.buttons[0] = Actor.CreateFromGLTF(this.context, {
            // at the given URL
            resourceUrl: `${this.baseUrl}/altspace-cube.glb`,
            // and spawn box colliders around the meshes.
            colliderType: 'box',
            // Also apply the following generic actor properties.
            actor: {
                name: 'Altspace Cube',
                transform: {
                    position: { x: 0, y: 0, z: 0.0 },
                    scale: { x: 0.1, y: 0.1, z: 0.1 }
                }
            }
        }).value;

        // The first person to click Reset will become the scorekeeper. Only the scorekeeper may click the
        // buttons until the game is over
        const resetButton = this.buttons[0].setBehavior(ButtonBehavior);
        resetButton.onClick('pressed', (userId: string) => {
            const lockPeriod = new Date();
            lockPeriod.setMinutes(lockPeriod.getMinutes() - 2);
            if (userId === this.scoreKeeper || this.gameOver === true || this.lastActiveAt < lockPeriod) {
                this.scores = this.scores.map(x => 0);
                this.gameOver = false;
                this.text.text.contents = this.defaultMessage;
                this.scoreKeeper = userId;
                this.updateLastActive();
            }
        });

        this.createPlayerButton(1);
        this.createPlayerButton(2);

        const playerOneButton = this.buttons[1].setBehavior(ButtonBehavior);
        playerOneButton.onClick('pressed', (userId: string) => {
            if (!this.gameOver && userId === this.scoreKeeper) {
                this.scores[1] = this.scores[1] + 1;
                this.updateGame();
                this.updateLastActive();
            }
        });

        const playerTwoButton = this.buttons[2].setBehavior(ButtonBehavior);
        playerTwoButton.onClick('pressed', (userId: string) => {
            if (!this.gameOver && userId === this.scoreKeeper) {
                this.scores[2] = this.scores[2] + 1;
                this.updateGame();
                this.updateLastActive();
            }
        });

    }

    private createPlayerButton(i: number) {
        this.buttons[i] = Actor.CreateFromGLTF(this.context, {
            // at the given URL
            resourceUrl: `${this.baseUrl}/altspace-cube.glb`,
            // and spawn box colliders around the meshes.
            colliderType: 'box',
            // Also apply the following generic actor properties.
            actor: {
                name: 'Altspace Cube',
                transform: {
                    position: { x: i * 2 - 3.0, y: 0.2, z: 0.0 },
                    scale: { x: 0.4, y: 0.4, z: 0.4 }
                }
            }
        }).value;
    }

    private updateScoreboard() {
        this.text.text.contents = this.scores.slice(1, 10).join(' : ');
    }

    private updateLastActive() {
        this.lastActiveAt = new Date();
    }

    private updateGame() {
        this.updateScoreboard();
        if (this.scores[1] >= this.scoreThreshold || this.scores[2] >= this.scoreThreshold) {
            this.gameOver = true;
            // TODO: handle ties
            if (this.scores[1] >= this.scoreThreshold) {
                this.text.text.contents = `Player 1 Wins!!`;
            } else {
                this.text.text.contents = `Player 2 Wins!!`;
            }
        }
    }
}
