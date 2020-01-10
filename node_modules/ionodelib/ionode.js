/**
 * Download a file from the internet.
 */
class Download{
  /**
   * 
   * @param {string} url File to download.
   * @param {string} dest Where to store the file.
   */
  constructor(url, dest = undefined)
  {
    if (!url) {
      return console.error("URL is not defined");
    }
    this.url = url;
    this.dest = dest;
    this.downloadedBytes = 0;
    this.totalByteSize = 0;
  }

  onData(data){}

  onClose(){}

  onError(error)
  {
    console.error(error);
  }

  onEnd(){}

  downloadedInBits()
  {
    var bytes = this.downloadedBytes;
    return bytes * 8;
  }

  downloadedInKiloBytes()
  {
    var bytes = this.downloadedBytes;
    return bytes / 1024;
  }

  downloadedInMegaBytes()
  {
    var bytes = this.downloadedBytes;
    return bytes / 1024 / 1024;
  }

  downloadedInGigaBytes()
  {
    var bytes = this.downloadedBytes;
    return bytes / 1024 / 1024 / 1024;
  }

  downloadedInAuto()
  {
    var bytes = this.downloadedBytes;
    if (bytes > 1073741824) {
      return this.downloadedInGigaBytes();
    }
    else if (bytes > 1048576) {
      return this.downloadedInMegaBytes();
    }
    else if (bytes > 1024) {
      return this.downloadedInKiloBytes();
    }
    else if (bytes < 8) {
      return this.downloadedInBits();
    }
    else{
      return bytes;
    }
  }

  downloadPercent()
  {
    var bytes = this.downloadedBytes;
    return 100 * (bytes / this.totalByteSize);
  }

  setDownloadedBits(value)
  {
    this.downloadedBytes = value;
    return this;
  }

  addDownloadedBits(value)
  {
    this.downloadedBytes += value;
    return this;
  }

  /**
   * Start the download of the file.
   * @param {string} url
   * @param {string} dest
   */
  async start(url = this.url, dest = this.dest)
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
    var onData = this.onData;
    var onClose = this.onClose;
    var onError = this.onError;
    var onEnd = this.onEnd;
    return http.get(url, function(res){
      object.totalByteSize = +res.headers["content-length"];
      console.log("Downloading...");
      res.on("data", function(data){
        object.addDownloadedBits(data.length)
        onData(data);
      });
      res.on("close", onClose);
      res.on("error", onError);
      res.on("end", onEnd);
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
    // return this;
  }
}

// Exports
exports.Download = Download;