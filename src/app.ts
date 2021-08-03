/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

const fetch = require('node-fetch');

const DEBUG = false;

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
    menuScale: {
        x: number;
        y: number;
        z: number;
    };
    menuRotation: {
        x: number;
        y: number;
        z: number;
    };
    menuPosition: {
        x: number;
        y: number;
        z: number;
    };
    previewMargin: number;
};

/**
 * WearAHat Application - Showcasing avatar attachments.
 */
export default class WearAHat {
    // Container for primitives
    private assets: MRE.AssetContainer;

    // Container for instantiated hats.
    private attachedHats = new Map<MRE.Guid, MRE.Actor>();

    // Load the database of hats.
    // tslint:disable-next-line:no-var-requires variable-name
    private HatDatabase: { [key: string]: HatDescriptor } = {};

    // Options
    private previewMargin = 1.5; // spacing between preview objects

    private controls = '../public/defaults.json';

    /**
     * Constructs a new instance of this class.
     * @param context The MRE SDK context.
     * @param baseUrl The baseUrl to this project's `./public` folder.
     */
    constructor(private context: MRE.Context, private params: MRE.ParameterSet, private baseUrl: string) {
        this.assets = new MRE.AssetContainer(context);

        // Hook the context events we're interested in.
        this.context.onStarted(() => {
            switch(this.params.controls) {
                case "min":
                    this.controls = '../public/min.json';
                    break;
                case "none":
                    this.controls = '../public/none.json';
                    break;
                default:
                    break;
            }

            if(this.params.content_pack){
                // Specify a url to a JSON file
                // https://account.altvr.com/content_packs/1187493048011980938
                // e.g. ws://10.0.1.89:3901?content_pack=1187493048011980938

                fetch('https://account.altvr.com/api/content_packs/' + this.params.content_pack + '/raw.json')
                    .then((res: any) => res.json())
                    .then((json: any) => {
                        if(DEBUG){ console.log(json); }
                        this.HatDatabase = Object.assign({}, json, require(this.controls));;
                        this.started();
                    })
           }
            else {
                // Choose the set of helmets
                // defaults include actions like Clear, Move Up/Down, and Size Up/Down
                // e.g. ws://10.0.1.89:3901?kit=city_helmets
                switch(this.params.kit) {
                    case "city_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1167643861778956427_city_helmets.json'), require(this.controls));
                        break;
                    }
                    case "space_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1166467957212054271_space_helmets.json'), require(this.controls));
                        break;
                    }
                    case "galaxy_flyin_3": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1166467957212054271_galaxy_flyin_3.json'), require(this.controls));
                        break;
                    }
                    case "star_wars_scout_helmet": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1172247038427922799_star_wars_scout_helmet.json'), require(this.controls));
                        break;
                    }
                    case "samurai_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1172272863143527350_samurai_helmets.json'), require(this.controls));
                        break;
                    }
                    case "town_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1172957249807582137_town_helmets.json'), require(this.controls));
                        break;
                    }
                    case "viking_helmets": {
                        this.HatDatabase = Object.assign({}, require('../public/data/1184323616783729170_viking_helmets.json'), require(this.controls));
                        break;
                    }
                    default: { // all - manually combined
                        this.HatDatabase = Object.assign({}, require('../public/data/all.json'), require(this.controls));
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
        if(DEBUG){ console.log(this.HatDatabase); }
        // Show the hat menu.
        this.showHatMenu();
    }

    /**
     * Called when a user leaves the application (probably left the Altspace world where this app is running).
     * @param user The user that left the building.
     */
    private userLeft(user: MRE.User) {
        // If the user was wearing a hat, destroy it. Otherwise it would be
        // orphaned in the world.
        if (this.attachedHats.has(user.id)) { this.attachedHats.get(user.id).destroy(); }
        this.attachedHats.delete(user.id);
    }

    /**
     * Show a menu of hat selections.
     */
    private showHatMenu() {
        // Create a parent object for all the menu items.
        const menu = MRE.Actor.Create(this.context);
        let x = 0;

        // check for options first since order isn't guaranteed in a dict
        for (const k of Object.keys(this.HatDatabase)) {
            if (k == "options"){
                const options = this.HatDatabase[k]
                if (options.previewMargin){
                    this.previewMargin = options.previewMargin;
                }
            }
        }

        // Loop over the hat database, creating a menu item for each entry.
        for (const hatId of Object.keys(this.HatDatabase)) {
            if (hatId == "options") continue; // skip the special 'options' key

            const hatRecord = this.HatDatabase[hatId];

            // Create a clickable button.
            var button;

            // special scaling and rotation for menu
            const rotation = hatRecord.menuRotation ? hatRecord.menuRotation : { x: 0, y: 0, z: 0 }
            const scale = hatRecord.menuScale ? hatRecord.menuScale : { x: 3, y: 3, z: 3 }
            const position = hatRecord.menuPosition ? hatRecord.menuPosition : { x: 0, y: 1, z: 0 }

            // Create a Artifact without a collider
            MRE.Actor.CreateFromLibrary(this.context, {
                resourceId: hatRecord.resourceId,
                actor: {
                    transform: {
                        local: {
                            position: { x, y: position.y, z: position.z },
                            rotation: MRE.Quaternion.FromEulerAngles(
                                rotation.x * MRE.DegreesToRadians,
                                rotation.y * MRE.DegreesToRadians,
                                rotation.z * MRE.DegreesToRadians),
                            scale: scale
                        }
                    }
                }
            });

            // Create an invisible cube with a collider
            button = MRE.Actor.CreatePrimitive(this.assets, {
                definition: {
                    shape: MRE.PrimitiveShape.Box,
                    dimensions: { x: 0.4, y: 0.4, z: 0.4 } // make sure there's a gap
                },
                addCollider: true,
                actor: {
                    parentId: menu.id,
                    name: hatId,
                    transform: {
                        local: {
                            position: { x, y: 1, z: 0 },
                            scale: { x: 3, y: 3, z: 3 } // not affected by custom scale
                        }
                    },
                    appearance: {
                        enabled: false
                    }
                }
            });

            // Set a click handler on the button.
            // NOTE: button press event fails on MAC
            button.setBehavior(MRE.ButtonBehavior).onClick(user => this.wearHat(hatId, user.id));
            //button.setBehavior(MRE.ButtonBehavior).onButton('pressed', user => this.wearHat(hatId, user.id));

            x += this.previewMargin;
        }
    }

    /**
     * Instantiate a hat and attach it to the avatar's head.
     * @param hatId The id of the hat in the hat database.
     * @param userId The id of the user we will attach the hat to.
     */
    private wearHat(hatId: string, userId: MRE.Guid) {
        // If the user selected 'clear', then early out.
        if (hatId == "clear!") {
            // If the user is wearing a hat, destroy it.
            if (this.attachedHats.has(userId)) this.attachedHats.get(userId).destroy();
            this.attachedHats.delete(userId);
            return;
        }
        else if (hatId == "moveup!") {
            if (this.attachedHats.has(userId))
                this.attachedHats.get(userId).transform.local.position.y += 0.01;
            return;
        }
        else if (hatId == "movedown!") {
            if (this.attachedHats.has(userId))
                this.attachedHats.get(userId).transform.local.position.y -= 0.01;
            return;
        }
        else if (hatId == "moveforward!") {
            if (this.attachedHats.has(userId))
                this.attachedHats.get(userId).transform.local.position.z += 0.01;
            return;
        }
        else if (hatId == "moveback!") {
            if (this.attachedHats.has(userId))
                this.attachedHats.get(userId).transform.local.position.z -= 0.01;
            return;
        }
        else if (hatId == "sizeup!") {
            if (this.attachedHats.has(userId)){
                this.attachedHats.get(userId).transform.local.scale.x += 0.02;
                this.attachedHats.get(userId).transform.local.scale.y += 0.02;
                this.attachedHats.get(userId).transform.local.scale.z += 0.02;
            }
            return;
        }
        else if (hatId == "sizedown!") {
            if (this.attachedHats.has(userId)){
                this.attachedHats.get(userId).transform.local.scale.x -= 0.02;
                this.attachedHats.get(userId).transform.local.scale.y -= 0.02;
                this.attachedHats.get(userId).transform.local.scale.z -= 0.02;
            }
            return;
        }

        // If the user is wearing a hat, destroy it.
        if (this.attachedHats.has(userId)) this.attachedHats.get(userId).destroy();
        this.attachedHats.delete(userId);

        const hatRecord = this.HatDatabase[hatId];

        // Create the hat model and attach it to the avatar's head.
        // Jimmy

        const position = hatRecord.position ? hatRecord.position : { x: 0, y: 0, z: 0 }
        const scale = hatRecord.scale ? hatRecord.scale : { x: 1.5, y: 1.5, z: 1.5 }
        const rotation = hatRecord.rotation ? hatRecord.rotation : { x: 0, y: 180, z: 0 }
        const attachPoint = <MRE.AttachPoint> (hatRecord.attachPoint ? hatRecord.attachPoint : 'head')

        const actor = MRE.Actor.CreateFromLibrary(this.context, {
            resourceId: hatRecord.resourceId,
            actor: {
                transform: {
                    local: {
                        position: position,
                        rotation: MRE.Quaternion.FromEulerAngles(
                            rotation.x * MRE.DegreesToRadians,
                            rotation.y * MRE.DegreesToRadians,
                            rotation.z * MRE.DegreesToRadians),
                        scale: scale
                    }
                },
                attachment: {
                    attachPoint: attachPoint,
                    userId
                }
            }
        });

        this.attachedHats.set(userId, actor);
    }
}
