/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRESDK from '@microsoft/mixed-reality-extension-sdk';

const fetch = require('node-fetch');

/**
 * The structure of a hat entry in the hat database.
 */
type HatDescriptor = {
    resourceId: string;
    attachPoint: string;
    scale: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
};

/**
 * WearAHat Application - Showcasing avatar attachments.
 */
export default class WearAHat {
    // Container for primitives
    private assets: MRESDK.AssetContainer;

    // Container for instantiated hats.
    private attachedHats: { [key: string]: MRESDK.Actor } = {};

    // Load the database of hats.
    // tslint:disable-next-line:no-var-requires variable-name
    private HatDatabase: { [key: string]: HatDescriptor } = {};

    /**
     * Constructs a new instance of this class.
     * @param context The MRE SDK context.
     * @param baseUrl The baseUrl to this project's `./public` folder.
     */
    constructor(private context: MRESDK.Context, private params: MRESDK.ParameterSet, private baseUrl: string) {
        this.assets = new MRESDK.AssetContainer(context);

        // Hook the context events we're interested in.
        this.context.onStarted(() => {

            if(this.params.content_pack){
                // Specify a url to a JSON file
                // https://account.altvr.com/content_packs/1187493048011980938
                // e.g. ws://10.0.1.89:3901?content_pack=1187493048011980938

                fetch('https://account.altvr.com/api/content_packs/' + this.params.content_pack + '/raw.json')
                    .then((res: any) => res.json())
                    .then((json: any) => {
                        this.HatDatabase = Object.assign({}, json, require('../public/defaults.json'));;
                        this.started();
                    })
           }
            else {
                // Choose the set of helmets
                // defaults include actions like Clear, Move Up/Down, and Size Up/Down
                // e.g. ws://10.0.1.89:3901?kit=city_helmets
                switch(this.params.kit) {
                    case "city_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1167643861778956427_city_helmets.json'), require('../public/defaults.json'));
                        break;
                    }
                    case "space_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1166467957212054271_space_helmets.json'), require('../public/defaults.json'));
                        break;
                    }
                    case "galaxy_flyin_3": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1166467957212054271_galaxy_flyin_3.json'), require('../public/defaults.json'));
                        break;
                    }
                    case "star_wars_scout_helmet": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1172247038427922799_star_wars_scout_helmet.json'), require('../public/defaults.json'));
                        break;
                    }
                    case "samurai_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1172272863143527350_samurai_helmets.json'), require('../public/defaults.json'));
                        break;
                    }
                    case "town_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1172957249807582137_town_helmets.json'), require('../public/defaults.json'));
                        break;
                    }
                    case "viking_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1184323616783729170_viking_helmets.json'), require('../public/defaults.json'));
                        break;
                    }
                    default: { // all - manually combined
                        this.HatDatabase = Object.assign({}, require('../public/data/all.json'), require('../public/defaults.json'));
                        break;
                    }
                }
                this.started();
            }


        });
        this.context.onUserLeft(user => this.userLeft(user));
    }

    /**
     * Called when a Hats application session starts up.
     */
    private async started() {
        // Show the hat menu.
        this.showHatMenu();
    }

    /**
     * Called when a user leaves the application (probably left the Altspace world where this app is running).
     * @param user The user that left the building.
     */
    private userLeft(user: MRESDK.User) {
        // If the user was wearing a hat, destroy it. Otherwise it would be
        // orphaned in the world.
        if (this.attachedHats[user.id]) this.attachedHats[user.id].destroy();
        delete this.attachedHats[user.id];
    }

    /**
     * Show a menu of hat selections.
     */
    private showHatMenu() {
        // Create a parent object for all the menu items.
        const menu = MRESDK.Actor.CreateEmpty(this.context);
        let x = 0;

        // Loop over the hat database, creating a menu item for each entry.
        for (const hatId of Object.keys(this.HatDatabase)) {
            const hatRecord = this.HatDatabase[hatId];

            // Create a clickable button.
            var button;

            // special scaling and rotation for commands
            let regex: RegExp = /!$/; // e.g. clear!
            const rotation = (regex.test(hatId) && hatRecord.rotation) ? hatRecord.rotation : { x: 0, y: 0, z: 0 }
            const scale = (regex.test(hatId) && hatRecord.scale) ? hatRecord.scale : { x: 3, y: 3, z: 3 }

            // Create a Artifact without a collider
            MRESDK.Actor.CreateFromLibrary(this.context, {
                resourceId: hatRecord.resourceId,
                actor: {
                    transform: {
                        local: {
                            position: { x, y: 1, z: 0 },
                            rotation: MRESDK.Quaternion.FromEulerAngles(
                                rotation.x * MRESDK.DegreesToRadians,
                                rotation.y * MRESDK.DegreesToRadians,
                                rotation.z * MRESDK.DegreesToRadians),
                            scale: scale
                        }
                    }
                }
            });

            // Create an invisible cube with a collider
            button = MRESDK.Actor.CreatePrimitive(this.assets, {
                definition: {
                    shape: MRESDK.PrimitiveShape.Box,
                    dimensions: { x: 0.4, y: 0.4, z: 0.4 } // make sure there's a gap
                },
                addCollider: true,
                actor: {
                    parentId: menu.id,
                    name: hatId,
                    transform: {
                        local: {
                            position: { x, y: 1, z: 0 },
                            scale: scale
                        }
                    },
                    appearance: {
                        enabled: false
                    }
                }
            });

            // Set a click handler on the button.
            button.setBehavior(MRESDK.ButtonBehavior).onClick(user => this.wearHat(hatId, user.id));

            x += 1.5;
        }
    }

    /**
     * Instantiate a hat and attach it to the avatar's head.
     * @param hatId The id of the hat in the hat database.
     * @param userId The id of the user we will attach the hat to.
     */
    private wearHat(hatId: string, userId: string) {
        // If the user selected 'clear', then early out.
        if (hatId == "clear!") {
            // If the user is wearing a hat, destroy it.
            if (this.attachedHats[userId]) this.attachedHats[userId].destroy();
            delete this.attachedHats[userId];
            return;
        }
        else if (hatId == "moveup!") {
            if (this.attachedHats[userId])
                this.attachedHats[userId].transform.local.position.y += 0.01;
            return;
        }
        else if (hatId == "movedown!") {
            if (this.attachedHats[userId])
                this.attachedHats[userId].transform.local.position.y -= 0.01;
            return;
        }
        else if (hatId == "moveforward!") {
            if (this.attachedHats[userId])
                this.attachedHats[userId].transform.local.position.z += 0.01;
            return;
        }
        else if (hatId == "moveback!") {
            if (this.attachedHats[userId])
                this.attachedHats[userId].transform.local.position.z -= 0.01;
            return;
        }
        else if (hatId == "sizeup!") {
            if (this.attachedHats[userId]){
                this.attachedHats[userId].transform.local.scale.x += 0.02;
                this.attachedHats[userId].transform.local.scale.y += 0.02;
                this.attachedHats[userId].transform.local.scale.z += 0.02;
            }
            return;
        }
        else if (hatId == "sizedown!") {
            if (this.attachedHats[userId]){
                this.attachedHats[userId].transform.local.scale.x -= 0.02;
                this.attachedHats[userId].transform.local.scale.y -= 0.02;
                this.attachedHats[userId].transform.local.scale.z -= 0.02;
            }
            return;
        }

        // If the user is wearing a hat, destroy it.
        if (this.attachedHats[userId]) this.attachedHats[userId].destroy();
        delete this.attachedHats[userId];

        const hatRecord = this.HatDatabase[hatId];

        // Create the hat model and attach it to the avatar's head.
        // Jimmy

        const position = hatRecord.position ? hatRecord.position : { x: 0, y: 0, z: 0 }
        const scale = hatRecord.scale ? hatRecord.scale : { x: 1.5, y: 1.5, z: 1.5 }
        const rotation = hatRecord.rotation ? hatRecord.rotation : { x: 0, y: 180, z: 0 }
        const attachPoint = <MRESDK.AttachPoint> (hatRecord.attachPoint ? hatRecord.attachPoint : 'head')

        this.attachedHats[userId] = MRESDK.Actor.CreateFromLibrary(this.context, {
            resourceId: hatRecord.resourceId,
            actor: {
                transform: {
                    local: {
                        position: position,
                        rotation: MRESDK.Quaternion.FromEulerAngles(
                            rotation.x * MRESDK.DegreesToRadians,
                            rotation.y * MRESDK.DegreesToRadians,
                            rotation.z * MRESDK.DegreesToRadians),
                        scale: scale
                    }
                },
                attachment: {
                    attachPoint: attachPoint,
                    userId
                }
            }
        });
    }
}
