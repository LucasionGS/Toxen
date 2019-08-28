# ![Toxen Logo](https://raw.githubusercontent.com/LucasionGS/Toxen/master/icon.ico) Toxen
So basically, music.
## What is Toxen?
Toxen is a music player to play local music from your computer. It supports individual backgrounds for each song.
It has an audio visualizer which works for every mp3 you insert.
You can drag and drop files into the interface for easy adding of music and backgrounds.

## Music panel
You can open the music panel any time, just hover your mouse over to the left side of the application and a panel will pop out. It gets out of your way when you take your mouse away from it.

You can scroll in the music list separately from the whole panel. It includes quick options like volume changing, toggling shuffle, built-in downloader for YouTube audio and more.

More info below.

## Supported Files
These files are what is currently supported

| Element | Supported Files [Planned support] |
| --- | --- |
| Music Files | mp3 only |
| Backgrounds | jpg & png |

## Drag and Drop
You can drag and drop music into the program to be added automatically to the current music folder.
If you drag and drop a jpg file onto a currently playing song,
it will set it as background for the song. (It will first update when you go off the song and back on it)

## Functions & Shortcuts

| Shortcut | Action | Description |
| --- | --- | --- |
| Ctrl + S | Open Settings | Opens the settings panel where you can customize Toxen |
| Ctrl + R | Toggle Shuffle | Toggle randomly shuffling through songs instead of linearly |
| Ctrl + Left Arrow | Previous song | Goes to the last song you played, this goes all the way back to the first song you played in this session |
| Ctrl + Right Arrow | Next song | Goes to the next song on the list. If shuffle is enabled, it plays a random song instead |

## Build-in YouTube Downloader
Thanks to [node-ytdl-core](https://github.com/fent/node-ytdl-core), I made a built-in youtube downloader. You can insert a YouTube URL and a title for the song (Formatted as [Artist - Title])
When you've filled out the URL and optionally the alternate title, press **Enter** or press **Add music** to download it.
It will download from the link into an mp3 file and put it in your music folder.
If you leave the [Artist - Title] field blank, it will use the YouTube video's original name.

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

## Todo List
- Lyrics Display (A file that you can put onto a song, and it will be parsed into lyrics, much like .srt files)
- Self-updator (Created separately in C# most likely, packaged with the software)
  - Optimally, only download files that are eithe missing or different to save time
  - If the updator needs to be updated as well, Toxen should download it upon startup.
- Change "Usage" button to direct to this page, instead of the build-in page
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
- New tag for music finished being added
- Search through music
- Allow to add more metadata info
  - Contributors
  - Source
  - Year
- Right-click Context menu
  - Rename
  - Delete
  - Edit Metadata
- Store music paths in a database for quick access
- Full Song Refresh list (For when adding or removing music manually)

## Working on

## Completed from Todo List
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

## Known bugs
- ~~Visualizer~~
  - ~~Visualizer being offset by some random amount, both small amounts and drastic amounts~~
- YouTube downloader
  - If the app deems the URL valid, but the video doesn't exist, can't be found or any error during, it will get stuck at downloading and won't proceed, restart required to download new files, if so

## Library Credits
**Audio Visualizer** based on [**JS Audio Visualizer**](https://codepen.io/nfj525/pen/rVBaab) created by [Nick Jones](https://codepen.io/nfj525).

**YouTube Downloader** is using [**node-ytdl-core**](https://github.com/fent/node-ytdl-core) created by [fent](https://github.com/fent/), to get video information and download data streams
