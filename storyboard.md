# Toxen Storyboard Documentation

## Getting started
To add a storyboard to a song, create a new file called `storyboard.txn` in the `Song Folder` you want to script.

## Syntax
Toxen understands a special `Scripting Syntax`
Let's start with changing the color of the `Audio Visualizer`.  
We'll change it to `red` while the time of the song is between `0:00` and `1:00`
```
[0:00 - 1:00] VisualizerColor => "255" "0" "0"
# "255" "0" "0" makes it red, as this uses the RGB format.
```
Arguments are separated by their own quote capturing.  
The arguments passed through here would be "255", "0", and "0".  

If you are more used to other coding languages, you can write it as a JavaScript array as well like so: ["255", "0", "0"] or any other way you prefer.  
Toxen only sees arguments surrounded by `""`, which means you would technically write:
```
[0:00 - 1:00] VisualizerColor =>>>>7676 "255" lædksalædælasd "0" jiklwa yuwk "0"
# or
[0:00 - 1:00] VisualizerColor => "255"|"0"|"0"
# or
[0:00-1:00]VisualizerColor=>["255" "0" "0"]
# or
[0:00 - 1:00]VisualizerColor => ("255" "0" "0") This text will be ignored since it's not in quotes
```
And Toxen would understand it just as well as the code shown before, since only "255", "0" and "0" is surrounded by quotes. Feel free to get your own style of scripting.

The syntax for Toxen is really simple. Timing points can be either in seconds since the song started or a `Timestamp` in the format of dd:hh:mm:ss
```
[StartTime - EndTime] Event => "argument"
```

### Event Types
| Event | Action | Argument(s) |
| --- | --- | --- |
| Background | Sets the background image's source. | `Image URI`: Needs to be a local image within the `Song Folder`. It's recommended to add folders and call them something like `sb` to store images in. |
| VisualizerColor | Sets the color of the Audio Visualizer in RGB format | `R`: Red color hue `0`-`255`, `G`: Green color hue `0`-`255`, `B`: Blue color hue `0`-`255` |
| VisualizerIntensity | Sets the intensity of the Audio Visualizer | `intensity`: An intensity level between `1`-`50` |