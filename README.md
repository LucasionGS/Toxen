# ![Toxen Logo](https://raw.githubusercontent.com/LucasionGS/Toxen/master/icon.ico) Toxen
## What is Toxen?
Toxen is a music player to play local music from your computer. It supports individual backgrounds for each song.
It has an audio visualizer which works for every mp3 you insert.
You can drag and drop files into the interface for easy adding of music and backgrounds.

## Music panel
You can open the music panel any time, just hover your mouse over to the left side of the application and a panel will pop out. It gets out of your way when you take your mouse away from it.

You can scroll in the music list separately from the whole panel. It includes quick options like volume changing, toggling shuffle, built-in downloader for YouTube audio and more.

More info below.
![Toxen Music](http://lucasion.tk/f/17.08.54-28.08.19.png)

## Supported Files
These files are what is currently supported

| Element | Supported Files [Planned support] |
| --- | --- |
| Music Files | mp3 |
| Backgrounds | jpg, png |
| Subtitles | srt |

## Drag and Drop
You can drag and drop music into the program to be added automatically to the current music folder and to your list.
If you drag and drop a supported image file onto a currently playing song,
it will set it as background for the song.

You can also drop a supported subtitle file to add it to a song.

## Enchanted .srt Subtitles
Subtitle files can include special properties which will work in Toxen.

| Syntax | Description |
| --- | --- |
| (**TEXT**) | Greyed text, like background lyrics |
| [color=#HEXCODE]**TEXT**[/color] | Change color to anything supported by CSS |
| [font=FONTNAME]**TEXT**[/font] | Also any font supported by CSS |
| [size=FONTSIZE]**TEXT**[size] | Font height in pixels |
| \*\***TEXT**\*\* | Bold Text |
| \***TEXT**\* | Italic Text |
| \~\~**TEXT**\~\~ | Strike Through Text |


## Options & Shortcuts

| Shortcut | Action | Description |
| --- | --- | --- |
| F1 | Restarts the software | Refreshes the software, reloading all new files added or edited |
| Ctrl + S | Open Settings | Opens the settings panel where you can customize Toxen |
| Ctrl + R | Toggle Shuffle | Toggle randomly shuffling through songs instead of linearly |
| Ctrl + Left Arrow | Previous song | Goes to the last song you played, this goes all the way back to the first song you played in this session |
| Ctrl + Right Arrow | Next song | Goes to the next song on the list. If shuffle is enabled, it plays a random song instead |

![Options](http://lucasion.tk/f/17.11.12-28.08.19.png)

## Build-in YouTube Downloader
Thanks to [node-ytdl-core](https://github.com/fent/node-ytdl-core), I made a built-in youtube downloader. You can insert a YouTube URL and a title for the song (Formatted as [Artist - Title])
When you've filled out the URL and optionally the alternate title, press **Enter** or press **Add music** to download it.
It will download from the link into an mp3 file and put it in your music folder.
If you leave the [Artist - Title] field blank, it will use the YouTube video's original name.

![YouTube Downloader](http://lucasion.tk/f/17.12.22-28.08.19.png)

## Settings
### Curent music folder
This is where you put the directory path to a music folder. By default it'll be /ToxenMusic/ on your drive.
So if you opened it on a C:/ drive, it'll be in C:/ToxenMusic, if on a D:/ drive, it'll be on D:/ToxenMusic, and so on...

### Toggle Visualizer
This is a checkbox which either enables or disables the audio visualizer.

### Background Dim
This setting dims the background by a procentage from 0-100 (0 being none, 100 being completely blacked out)

### Visualizer Intensity
A scale of how intense the visualizer should be. The higher it is, the taller the bars will go up more easily.

![Settings](http://lucasion.tk/f/17.13.16-28.08.19.png)

## Todo List
- Self-updator (Created separately in C# most likely, packaged with the software)
  - Optimally, only download files that are eithe missing or different to save time
  - If the updator needs to be updated as well, Toxen should download it upon startup.
- Allow remote music files
  - Will require a list of file metadata, including the URL to the music file and background if any
- Store settings and some other files in a separate directory from the downloaded files
  - This will prevent settings from being overwritten on update
- Default background for music without a custom one
- Drag and drop Youtube link(?)
- Beautify and improve the YouTube downloader section
  - Perhaps a separate panel?
  - Allow multiple link downloads
  - Separate Artist and Title into 2 input fields
- Allow more music formats
- Allow to add more metadata info
  - Contributors
  - Source
  - Year
- Right-click Context menu
  - Rename
  - Delete
  - Edit Metadata
- Store music paths in a database for quick access

## Working on
- Song settings

## Completed from Todo List
- Updator (For now an external software you download on the side, but will make Toxen download it by itself later)
- New tag for music finished being added (Shows a green highlight on new files)
- Lyrics Display (A file that you can put onto a song, and it will be parsed into lyrics, much like .srt files)
- Session listen history (For "previous" button to remember what to go back to)
- Highlight current song in menu
- Allow more than just jpg files (Added support for png, autoconverts to jpg in folder if dropped in app)
- Volume changer
- Setting music folder from within settings
- Refresh files when changing directory in settings
- Add Buttons
  - Shuffle
  - Previous
  - Skip
  - Repeat
- Search through music
- Full Song Refresh list (For when adding or removing music manually)

## Known bugs
- ~~Visualizer~~
  - ~~Visualizer being offset by some random amount, both small amounts and drastic amounts~~
- YouTube downloader.
  - If the app deems the URL valid, but the video doesn't exist, can't be found or any error during, it will get stuck at downloading and won't proceed, restart required to download new files, if so.

## Library Credits
**Audio Visualizer** based on [**JS Audio Visualizer**](https://codepen.io/nfj525/pen/rVBaab) created by [Nick Jones](https://codepen.io/nfj525).

**YouTube Downloader** is using [**node-ytdl-core**](https://github.com/fent/node-ytdl-core) created by [fent](https://github.com/fent/), to get video information and download data streams
