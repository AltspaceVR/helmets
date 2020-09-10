# Usage
## Built-in Content
You can configure the app to load different sets of data to load by specifying the "kit" parameter. For example:

> ws://helmets.mres.altvr.com?kit=city_helmets

Here are the built-in sets of helmets:

  * "city_helmets"
  * "space_helmets"
  * "galaxy_flyin_3"
  * "star_wars_scout_helmet"
  * "samurai_helmets"
  * "town_helmets"
  * "viking_helmets"

If you don't pass a "kit" parameter, it will load all of the built-in ones together.

## Content Packs
Alternatively, you can use the Content Pack feature by creating one on altvr.com and passing a "content_pack" parameter:

> ws://helmets.mres.altvr.com??content_pack=1187493048011980938

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
You can optionally set options like "scale" and "position".

```json
{
    "spacehelmetship": {
        "resourceId": "artifact:1166530075533771277",
        "scale": {
            "x": 7.5,
            "y": 7.5,
            "z": 7.5
        },
        "position": {
            "x": 0,
            "y": -0.48,
            "z": 0
        },
        "attachPoint": "spine-middle"
    }
}
```

Sometimes you need to adjust the scale or position of a helmet if it's a weird shape. You can find a full list of attach points here: https://microsoft.github.io/mixed-reality-extension-sdk/index.html#attachpoint

# Development
* Fork this repo
* Create a Heroku app and link it to your github repo
* Enable auto deploys from github
* In Altspace:
  * Open World Editor > Altspace > Basics > SDK App
  * `ws://<your subdomain>.herokuapp.com` (port 80)
  * Click Confirm
