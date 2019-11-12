// Exports
exports.Download = class Download {
  constructor(url, dest = undefined)
  {
    if (!url) {
      return console.error("URL is not defined");
    }
    this.url = url;
    this.dest = dest;
    this.DownloadedBytes = 0;
    this.TotalByteSize = 0;
  }

  OnData(data){}

  OnClose(){}

  OnError(error)
  {
    console.error(error);
  }

  OnEnd(){}

  DownloadedInBits()
  {
    var bytes = this.DownloadedBytes;
    return bytes * 8;
  }

  DownloadedInKiloBytes()
  {
    var bytes = this.DownloadedBytes;
    return bytes / 1024;
  }

  DownloadedInMegaBytes()
  {
    var bytes = this.DownloadedBytes;
    return bytes / 1024 / 1024;
  }

  DownloadedInGigaBytes()
  {
    var bytes = this.DownloadedBytes;
    return bytes / 1024 / 1024 / 1024;
  }

  DownloadedInAuto()
  {
    var bytes = this.DownloadedBytes;
    if (bytes > 1073741824) {
      return this.DownloadedInGigaBytes();
    }
    else if (bytes > 1048576) {
      return this.DownloadedInMegaBytes();
    }
    else if (bytes > 1024) {
      return this.DownloadedInKiloBytes();
    }
    else if (bytes < 8) {
      return this.DownloadedInBits();
    }
    else{
      return bytes;
    }
  }

  DownloadPercent()
  {
    var bytes = this.DownloadedBytes;
    return 100 * (bytes / this.TotalByteSize);
  }

  SetDownloadedBits(value)
  {
    this.DownloadedBytes = value;
    return this;
  }

  AddDownloadedBits(value)
  {
    this.DownloadedBytes += value;
    return this;
  }

  Start(url = this.url, dest = this.dest)
  {
    // File system for writing files
    const fs = require("fs");

    // HTTP/HTTPS protocol
    var http;
    // HTTPS support
    if (url.startsWith("https")) {
      http = require("https");
    }
    // Else use regular HTTP
    else {
      http = require("http");
    }
    // this.functions local vars for http.get
    var object = this;
    var OnData = this.OnData;
    var OnClose = this.OnClose;
    var OnError = this.OnError;
    var OnEnd = this.OnEnd;
    http.get(url, function(res){
      object.TotalByteSize = +res.headers["content-length"];
      console.log("Downloading...");
      res.on("data", function(data){
        object.AddDownloadedBits(data.length)
        OnData(data);
      });
      res.on("close", OnClose);
      res.on("error", OnError);
      res.on("end", OnEnd);
      if (dest) {
        try {
          res.pipe(fs.createWriteStream(dest));
        } catch (error) {
          console.error(error);
        }
      }
      else {
        console.log("No destination specified.");
      }
    });
    return this;
  }
}