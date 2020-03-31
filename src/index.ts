import axios from 'axios'

export module SteamAPIController {
  let apiKey: string = ''

  export function setApiKey(key: string) {
    apiKey = key
  }

  export enum CommunityVisibility {
    VISIBLE = 3,
    NOT_VISIBLE = 1
  }

  // if CommunityVisibility = NOT_VISIBLE, this will always be 0
  export enum PersonaState {
    OFFLINE = 0,
    ONLINE = 1,
    BUSY = 2,
    AWAY = 3,
    SNOOZE = 4,
    LOOKING_TO_TRADE = 5,
    LOOKING_TO_PLAY = 6
  }

  /**
   * @public
   * @steamid 64bit SteamID of the user
   * @communityvisibilitystate This represents whether the profile is visible or not, and if it is visible, why you are allowed to see it. Note that because this WebAPI does not use authentication, there are only two possible values returned: 1 - the profile is not visible to you (Private, Friends Only, etc), 3 - the profile is "Public", and the data is visible. Mike Blaszczak's post on Steam forums says, "The community visibility state this API returns is different than the privacy state. It's the effective visibility state from the account making the request to the account being viewed given the requesting account's relationship to the viewed account."
   * @profilestate If set, indicates the user has a community profile configured (will be set to '1')
   * @personaname The player's persona name (display name)
   * @lastlogoff The last time the user was online, in unix time.
   * @commentpermission If set, indicates the profile allows public comments.
   * @profileurl The full URL of the player's Steam Community profile.
   * @avatar The full URL of the player's 32x32px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
   * @avatarmedium The full URL of the player's 64x64px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
   * @avatarfull The full URL of the player's 184x184px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
   * @personastate The user's current status. 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - looking to trade, 6 - looking to play. If the player's profile is private, this will always be "0", except if the user has set their status to looking to trade or looking to play, because a bug makes those status appear even if the profile is private.
   *
   * @private
   * @realname The player's "Real Name", if they have set it.
   * @primaryclanid The player's primary group, as configured in their Steam Community profile.
   * @timecreated The time the player's account was created.
   * @loccountrycode If set on the user's Steam Community profile, The user's country of residence, 2-character ISO country code
   * @locstatecode If set on the user's Steam Community profile, The user's state of residence
   *
   * @game
   * @gameid If the user is currently in-game, this value will be returned and set to the gameid of that game.
   * @gameserverip The ip and port of the game server the user is currently playing on, if they are playing on-line in a game using Steam matchmaking. Otherwise will be set to "0.0.0.0:0".
   * @gameserversteamid The steamid of the server.
   * @gameextrainfo If the user is currently in-game, this will be the name of the game they are playing. This may be the name of a non-Steam game shortcut.
   */
  export type PlayerSummary = {
    steamid: string //
    communityvisibilitystate: CommunityVisibility
    profilestate: boolean
    personaname: string
    lastlogoff: number
    commentpermission: boolean
    profileurl: string
    avatar: string
    avatarmedium: string
    avatarfull: string
    personastate: PersonaState
    realname?: string
    primaryclanid?: string
    timecreated?: number
    loccountrycode?: string
    locstatecode?: string
    gameid?: string
    gameserverip?: string
    gameserversteamid?: string
    gameextrainfo?: string
  }

  type PlayerSummaryResponse = {
    data: {
      response: {
        players?: PlayerSummary[]
      }
    }
  }

  type VanityURLResponse = {
    data: {
      response: {
        success: number
        steamid?: string
        message?: string
      }
    }
  }

  export async function getPlayerSummaries(...targets: string[]) {
    if (targets.length > 100) {
      throw 'Only 100 steamIDs can be requested at a time!'
    }

    try {
      let requestURL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${targets}`
      let response = <PlayerSummaryResponse>await axios.get(requestURL)

      let returnArray: PlayerSummary[] = []

      if (response) {
        let dataArray = response.data.response.players
        if (dataArray && dataArray.length) {
          for (let index = 0; index < dataArray.length; index++) {
            const data = dataArray[index]
            returnArray.push(data)
          }
        }
      }

      return returnArray
    } catch (error) {
      throw error
    }
  }

  export async function resolveVanityUrl(vanity: string) {
    const requestURL = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${vanity}`
    const response = <VanityURLResponse>await axios.get(requestURL)

    if (response) {
      const steamID = response.data.response.steamid
      if (steamID) {
        return steamID
      } else {
        throw 'Not a valid SteamID'
      }
    } else {
      throw 'Could not reach the VanityURL API'
    }
  }
}
