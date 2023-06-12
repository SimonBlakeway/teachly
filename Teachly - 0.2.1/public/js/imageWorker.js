importScripts("https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js")


self.onmessage = function (e) {
    if (e.data !== undefined) {
        // Do work 
        try {
            compressed = LZString.compressToUTF16(e.data)
            self.postMessage(compressed)
        }
        catch (err) {
            self.postMessage(err)

        }
    }
}