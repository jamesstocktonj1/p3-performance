# p3-performance

Benchmarking WebAssembly component runtimes — comparing **wasmtime** (direct) against **wasmcloud** (hosted) across WIT P2 and P3 components, with Go and TinyGo implementations.

## Setup

- **Runtime**: wasmtime `serve` for direct execution; `wash dev` for wasmcloud hosted execution
- **Load tool**: k6
- **Body size**: 4096 bytes
- **Duration**: 1 minute
- **Virtual users**: 10
- **Workload**: HTTP echo — POST a fixed body, assert the response matches

## Results

### P2 components

| Implementation | Runtime | Req/s | p50 latency | p90 latency | p95 latency | Error rate |
|----------------|---------|------:|------------:|------------:|------------:|-----------:|
| go | wasmtime | 3,293 | 2.83 ms | 3.92 ms | 4.21 ms | 0% |
| go | wasmcloud | 245 | 43.9 ms | 47.9 ms | 47.9 ms | 6.7% |
| tinygo | wasmtime | 7,050 | 0.95 ms | 2.51 ms | 2.70 ms | 0% |
| tinygo | wasmcloud | 306 | 43.8 ms | 46.9 ms | 47.9 ms | 3.5% |

### P3 components

| Implementation | Runtime | Req/s | p50 latency | p90 latency | p95 latency | Error rate |
|----------------|---------|------:|------------:|------------:|------------:|-----------:|
| go | wasmtime | 18,500 | 0.39 ms | 0.63 ms | 0.81 ms | 0% |
| go | wasmcloud | 3,447 | 2.74 ms | 3.37 ms | 3.84 ms | 1.1% |

## wasmcloud vs wasmtime overhead

The central question is how much overhead wasmcloud adds on top of raw wasmtime execution.

| Component | wasmtime req/s | wasmcloud req/s | Slowdown |
|-----------|---------------:|----------------:|---------:|
| p2/go | 3,293 | 245 | **13.4x slower** |
| p2/tinygo | 7,050 | 306 | **23.0x slower** |
| p3/go | 18,500 | 3,447 | **5.4x slower** |

For P2 components, wasmcloud is **13–23x slower** than wasmtime, with median latency jumping from ~1–3 ms to ~44 ms. The throughput drop is severe enough that wasmcloud saturates at around 250–310 req/s regardless of how fast the underlying component is (p2/tinygo is 2x faster than p2/go on wasmtime, but only marginally faster on wasmcloud). This strongly suggests the bottleneck is in the wasmcloud host itself rather than the component.

For P3 components, the picture is considerably better. The wasmcloud overhead drops to **5.4x**, with median latency on par with where P2/wasmtime sits (~2.7 ms vs ~2.8 ms). The async execution model in P3 appears to reduce the per-request cost imposed by the wasmcloud runtime significantly.

### wasmtime: P2 vs P3

On wasmtime alone, P3/go is **5.6x faster** than P2/go and **2.6x faster** than P2/tinygo. Sub-millisecond median latency (0.39 ms) vs 0.95–2.83 ms for the P2 variants.

### wasmcloud errors

All wasmcloud runs produced a small percentage of failed requests (1–7%), manifesting as connection resets (`broken pipe` / `use of closed network connection`). wasmtime runs had 0% errors across the board. This suggests wasmcloud's HTTP host has some connection management instability under sustained concurrent load.

## Reproducing

```sh
# Build components first (from each component directory)
make build

# Run the full test matrix
BODY_SIZE=4096 DURATION=1m VUS=10 bash scripts/run-matrix.sh
```

Individual runtimes can be started manually:

```sh
# From a component directory (e.g. p2/go, p2/tinygo, p3/go)
make run-wasmtime   # starts wasmtime serve on :8000
make run-wasmcloud  # starts wash dev on :8000

# Then run k6 from the repo root
make performance BODY_SIZE=4096 DURATION=1m
```

Raw k6 JSON output and per-test summaries are saved in `results/`.
