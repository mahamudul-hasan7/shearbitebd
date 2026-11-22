import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequestId } from "../src/lib/request-id";

const uuidV4 = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

test("request IDs remain UUID v4 when native randomUUID is available", () => {
  assert.match(createRequestId(), uuidV4);
});

test("LAN HTTP generates independent UUID retry keys without randomUUID", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const source = globalThis.crypto;
  let draws = 0;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues: (bytes: Uint8Array) => {
        draws++;
        return source.getRandomValues(bytes);
      },
    },
  });
  try {
    const ids = Array.from({ length: 1000 }, () => createRequestId());
    ids.forEach((id) => assert.match(id, uuidV4));
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(draws, ids.length, "Every retry key uses fresh cryptographic random bytes");
  } finally {
    if (original) Object.defineProperty(globalThis, "crypto", original);
    else Reflect.deleteProperty(globalThis, "crypto");
  }
});
