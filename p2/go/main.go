package main

import (
	"io"
	"net/http"

	"github.com/jamesstocktonj1/componentize-sdk/net/wasihttp"
)

func init() {
	wasihttp.HandleFunc(handler)
}

func handler(w http.ResponseWriter, r *http.Request) {
	io.Copy(w, r.Body)
	defer r.Body.Close()
}

func main() {}
