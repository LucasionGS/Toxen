# ![Toxen Logo](https://raw.githubusercontent.com/LucasionGS/Toxen/master/icon.ico) Toxen
## What is Toxen?
Toxen is a `Local Music Player`. Toxen comes with a nice set of features for enjoying your favorite songs in the background, or on a display with some nice effects.
- `Subtitle` support for lyrics displayed on-screen
- `Custom Backgrounds` for each song in your library
- `Scriptable Storyboard` for each song
- `Dynamic Audio Visualizer` showing the intensity and frequency of any song
- Changeable `Lowered Background Lights` so the backgrounds are easier on the eyes
- Toggleable `Dynamic Background Flashing` that goes along with music intensity.

## Music Panel
Hover your cursor over to the left side of the interface and a `Music Panel` will appear, allowing you to select from your library, change settings, `Convert and Download YouTube Links to mp3 Files`, modify your song selection by Right-clicking on them, add songs to a playlist and more customization features.

You can scroll in the music list separately from the whole panel. It includes quick options like volume changing, toggling shuffle, built-in downloader for YouTube audio and more.

![Toxen Music](https://lucasion.xyz/f/17.08.54-28.08.19.png)

## Adding Music to Toxen
You can add music by:
- `Dragging and Dropping mp3 Files` directly into Toxen
- Put any mp3 file into your `Music Folder` and it will automatically convert into the correct `Song Folder` structure
- Put a folder into your `Music Folder` with an mp3 in it

Avoid putting multiple mp3 files into a single `Song Folder`, as Toxen will just pick the first mp3 it finds.

### Adding Backgrounds to Song
Adding backgrounds is extremely similar to adding mp3 files.
- `Drag and Drop a PNG or JPG File` into Toxen and it will be added to the song that is currently playing
- Put a PNG or JPG file into a `Song Folder` in your `Music Folder` to apply it to a song.

Avoid putting multiple image files into a single `Song Folder`, as Toxen will just pick the first image it finds.


## Lyric Subtitles
You can drop a subtitle file into Toxen to add it to the currently playing song.
`Subtitle Files` (`.srt`) can include special Markdown which will work in Toxen.

<!-- | (**TEXT**) | Greyed text, like background lyrics | -->
| Syntax | Description |
| --- | --- |
| [color=#HEXCODE]**TEXT**[/color] | Change color to anything supported by CSS |
| [font=FONTNAME]**TEXT**[/font] | Also any font supported by CSS |
| [size=FONTSIZE]**TEXT**[size] | Font height in pixels |
| \*\***TEXT**\*\* | **Bold Text** |
| \***TEXT**\* | *Italic Text* |
| \~\~**TEXT**\~\~ | ~~Strike Through Text~~ |


## Options & Shortcuts

| Shortcut | Action | Description |
| --- | --- | --- |
| F1 | Restarts the software | Refreshes the software, reloading all new files added or edited |
| Ctrl + S | Open Settings | Opens the settings panel where you can customize Toxen |
| Ctrl + R | Toggle Shuffle | Toggle randomly shuffling through songs instead of linearly |
| Ctrl + Left Arrow | Previous song | Goes to the last song you played, this goes all the way back to the first song you played in this session |
| Ctrl + Right Arrow | Next song | Goes to the next song on the list. If shuffle is enabled, it plays a random song instead |

## Library Credits
**Audio Visualizer** based on [**JS Audio Visualizer**](https://codepen.io/nfj525/pen/rVBaab) created by [Nick Jones](https://codepen.io/nfj525).

**YouTube Downloader** is using [**node-ytdl-core**](https://github.com/fent/node-ytdl-core) created by [fent](https://github.com/fent/), to get video information and download data streams

## Documentation

[**Toxen Storyboard Syntax**](./storyboard.md)