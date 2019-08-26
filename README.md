# Toxen
So basically, music.
## What is Toxen?
Toxen is a music player to play local music from your computer. It supports individual backgrounds for each song (Currently only supports jpg as backgrounds, if you want to use .png then rename it to .jpg. This will be automatic later).
It has an audio visualizer which works for every mp3 you insert.
You can drag and drop files into the interface for easy adding of music and backgrounds.

More info below.

## Supported Files
These files are what is currently supported

| Purpose | Supported Files [Planned support] |
| --- | --- |
| Music Files | mp3 only |
| Backgrounds | jpg only [png] |

## Drag and Drop
   You can drag and drop music into the program to be added automatically to the current music folder.
   If you drag and drop a jpg file onto a currently playing song,
   it will set it as background for the song. (It will first update when you go off the song and back on it)

## Functions & Shortcuts
Pressing on **Alt+R** will toggle shuffling through songs instead of linearly.
Pressing **Alt+S** will open the settings menu. There's currently 3 settings only: **Toggle Visualizer**, **Background Dim** and **Visualizer Intensity**.
It still doesn't have a **Volume Changer** BUT i will get it done, just not done it yet. The default volume is 30% so it isn't ear killing from the get-go.

## Build-in YouTube Downloader
Thanks to [node-ytdl-core](https://github.com/fent/node-ytdl-core/issues), I made a built-in youtube downloader. You can insert a YouTube URL and a title for the song (Formatted as [Artist - Title])
It will download from the link into an mp3 file and put it in your music folder.
Make sure the link is valid, and don't forget to give it a name, I have no clue what happens if you don't... so don't test it.

## Todo List
- Volume changer
- Allow more than just jpg files
- Drag and drop Youtube link(?)
- Add buttons
  - Previous
  - Skip
  - Repeat
  - Shuffle
