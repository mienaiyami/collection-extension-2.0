import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("resolves conflicting tailwind classes", () => {
        expect(cn("px-2", "px-4")).toBe("px-4");
    });

    it("ignores falsy values", () => {
        expect(cn("base", false, null, undefined, "active")).toBe("base active");
    });
});
