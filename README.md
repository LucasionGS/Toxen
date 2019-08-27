# ![Toxen Logo](https://raw.githubusercontent.com/LucasionGS/Toxen/master/icon.ico) Toxen
So basically, music.
## What is Toxen?
Toxen is a music player to play local music from your computer. It supports individual backgrounds for each song.
It has an audio visualizer which works for every mp3 you insert.
You can drag and drop files into the interface for easy adding of music and backgrounds.

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
| Alt + S | Open Settings | Opens the settings panel where you can customize Toxen |
| Alt + R | Toggle Shuffle | Toggle randomly shuffling through songs instead of linearly |

It still doesn't have a **Volume Changer** BUT i will get it done, just not done it yet. The default volume is 30% so it isn't ear killing from the get-go.

## Build-in YouTube Downloader
Thanks to [node-ytdl-core](https://github.com/fent/node-ytdl-core/issues), I made a built-in youtube downloader. You can insert a YouTube URL and a title for the song (Formatted as [Artist - Title])
It will download from the link into an mp3 file and put it in your music folder.
If you leave the [Artist - Title] field blank, it will use the YouTube video's original name.

## Settings
There's currently 3 settings only: **Toggle Visualizer**, **Background Dim** and **Visualizer Intensity**.

## Todo List
- Self-updator (Created separately in C# most likely, packaged with the software)
  - Optimally, only download files that are eithe missing or different to save time
  - If the updator needs to be updated as well, Toxen should download it upon startup.
- Allow remote music files
  - Will require a list of file metadata, including the URL to the music file and background if any
- Store settings and some other files in a separate directory from the downloaded files
  - This will prevent settings from being overwritten on update
- Volume changer
- Default background for music without a custom one
- Drag and drop Youtube link(?)
- Beautify and improve the YouTube downloader section
  - Perhaps a separate panel?
  - Allow multiple link downloads
  - Separate Artist and Title into 2 input fields
- Allow more music formats
- Session listen history (For "previous" button to remember what to go back to)
- Add buttons
  - Previous
  - Skip
  - Repeat
  - Shuffle (Currently works with **Alt+R** but no dedicated button yet)
- Highlight current song in menu
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
- Setting music folder from within settings, forcing the user to set it in settings before trying to use the software

## Completed from Todo List
- Allow more than just jpg files (Added support for png, autoconverts to jpg in folder if dropped in app)

## Known bugs
- Visualizer
  - Visualizer being offset by some random amount, both small amounts and drastic amounts
- YouTube downloader
  - If the app deems the URL valid, but the video doesn't exist, can't be found or any error during, it will get stuck at downloading and won't proceed, restart required to download new files, if so
