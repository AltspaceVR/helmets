# Customizing this App
* Fork this repo
* Create a Heroku app and link it to your github repo
* Enable auto deploys from github
* In Altspace:
  * Open World Editor > Altspace > Basics > SDK App
  * `ws://<your subdomain>.herokuapp.com` (port 80)
  * Click Confirm

# Usage
## Built-in
You can configure the app to load different sets of data to load by specifying the "kit" parameter. For example:

> wss://mres.altvr.com/helmets?kit=city_helmets

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

> wss://mres.altvr.com/helmets?content_pack=1187493048011980938

This allows you to customize your own set of helmets from one or more Altspace World-Building kits and add your own customizations like scaling, positioning, and attach points. 

Customizing scale, position, and attachPoint:

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
