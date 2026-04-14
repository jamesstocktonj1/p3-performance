TARGET_URL ?= http://localhost:8000
BODY_SIZE  ?= 1024
VUS        ?= 10
DURATION   ?= 30s

.PHONY: performance
performance:
	k6 run \
		-e TARGET_URL=$(TARGET_URL) \
		-e BODY_SIZE=$(BODY_SIZE) \
		-e VUS=$(VUS) \
		-e DURATION=$(DURATION) \
		scripts/k6-echo.js
