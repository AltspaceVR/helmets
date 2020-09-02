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

This allows you to customize your own set of helmets from one or more Altspace World-Building kits and add your own customizations like scaling, positioning, and attach points. 
