build:
	@echo "Building component"
	@componentize-go build --output build/component.wasm

run-wasmcloud:
	@wash dev

run-wasmtime:
	@wasmtime serve --addr 0.0.0.0:8000 -S cli,p3 -W component-model-async build/component.wasm

.PHONY: build run-wasmcloud run-wasmtime