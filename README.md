# Overview

![Image of Helmets Demo World](https://cdn-content-ingress.altvr.com/uploads/space/image/1183034043432698356/background_banner_Screenshot__52_.jpg)

Helmets is an MRE app that allows Altspace users to "wear" objects. It began as a way to play dress-up by wearing space helmets but it's been used for wings, hula hoops, and even legs with roller skates. Having a birthday party? Put together a quick set of party hats for your guests.

There's a demo Altspace world here: https://account.altvr.com/worlds/1046572460192825569/spaces/1183034043432698356

# Usage
## Built-in Content
You can configure the app to load different sets of data to load by specifying the "kit" parameter. For example:

```
wss://mres.altvr.com/helmets?kit=city_helmets
```

Here are the built-in sets of helmets:

  * "city_helmets"
  * "space_helmets"
  * "galaxy_flyin_3"
  * "star_wars_scout_helmet"
  * "samurai_helmets"
  * "town_helmets"
  * "viking_helmets"

If you don't pass a "kit" parameter, it will load all of the built-in ones together.

## Controls

These are the controls that appear at the end of the list. Users attach an object to themselves by clicking on the preview object. The preview object has an invisible cube.

* (click on an item) - attach
* X Button - unattach
* +/- Buttons - scale up/down
* Up/Down Arrows - move up/down
* Forward/Back Arrows - move forward/back

By default, you will see all controls. Pass "controls=min" to hide all except the "unattach" button.

```
wss://mres.altvr.com/helmets?controls=min
```

Pass "controls=none" to hide all buttons (WARNING: users will not be able to unattach items).

```
wss://mres.altvr.com/helmets?controls=none
```

## Content Packs
Alternatively, you can use the Content Pack feature by creating one on altvr.com and passing a "content_pack" parameter:

> wss://mres.altvr.com/helmets?content_pack=1187493048011980938

This allows you to customize your own set of helmets from one or more Altspace World-Building Kits. The JSON field should contain a top-level key for each helmet with a "resourceId", usually an Artifact ID. That is the only required field. You can find these by browsing through your Kit's artifacts. Example:mµ

```json
{
    "businessman": {
        "resourceId": "artifact:1167890491962818802"
    },
    "businesswoman": {
        "resourceId": "artifact:1167890476561334511"
    },
    "femalecoat": {
        "resourceId": "artifact:1167890502222086388"
    }
}
```

See more examples in the public/data folder.

### Options
You can optionally set "position" / "rotation" / "scale" to adjust the helmet when it attaches. You can also set "menuPosition" / "menuRotation" / "menuScale" to adjust the helmet in the menu. Both rotations default to (0,180,0). Set "attachPoint" to change where the object attaches to your avatar skeleton (default is "head"). You can find a full list of attach points here: https://microsoft.github.io/mixed-reality-extension-sdk/index.html#attachpoint

```json
{
    "spacehelmetship": {
        "resourceId": "artifact:1166530075533771277",
        "position": {
            "x": 0,
            "y": -0.48,
            "z": 0
        },
        "rotation": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "scale": {
            "x": 7.5,
            "y": 7.5,
            "z": 7.5
        },
        "menuPosition": {
            "x": 0,
            "y": -0.1,
            "z": 0
        },
        "menuRotation": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "menuScale": {
            "x": 1.5,
            "y": 1.5,
            "z": 1.5
        },
        "attachPoint": "spine-middle"
    }
}
```

You can also adjust the spacing between each preview object. The default is 1.5 meters:

```json
{
    "spacehelmetship": {
        "resourceId": "artifact:1166530075533771277"
    },
    "options": {
        "previewMargin": 10
    }
}
```

The order doesn't matter for where you put the "options" entry.

# FAQ
* **Why doesn't my attachPoint work?** Some attachpoints may not be supported by Altspace or just bugged. For example, finger ones like "right-pinky" and "right-middle" do not seem to be working right now. The workaround is to attach somewhere close like "right-hand" and move + rotate from there. 

# Development
* Fork this repo
* Create a Heroku app and link it to your github repo
* Enable auto deploys from github
* In Altspace:
  * Open World Editor > Altspace > Basics > SDK App
  * `ws://<your subdomain>.herokuapp.com` (port 80)
  * Click Confirm
