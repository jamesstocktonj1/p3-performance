build:
	@echo "Building component"
	@wash wit fetch
	@tinygo build -target wasip2 -wit-package ./wit -wit-world component -o build/component.wasm .

run-wasmcloud:
	@wash dev

run-wasmtime:
	@wasmtime serve --addr 0.0.0.0:8000 -S cli build/component.wasm

.PHONY: build run-wasmcloud run-wasmtime