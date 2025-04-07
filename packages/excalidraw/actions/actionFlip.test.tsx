import { pointFrom } from "@excalidraw/math";

import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import { render } from "../tests/test-utils";

import { actionFlipHorizontal, actionFlipVertical } from "./actionFlip";

const { h } = window;

describe("flipping re-centers selection", () => {
  it("elbow arrow touches group selection side yet it remains in place after multiple moves", async () => {
    const elements = [
      API.createElement({
        type: "rectangle",
        id: "rec1",
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        boundElements: [{ id: "arr", type: "arrow" }],
      }),
      API.createElement({
        type: "rectangle",
        id: "rec2",
        x: 220,
        y: 250,
        width: 100,
        height: 100,
        boundElements: [{ id: "arr", type: "arrow" }],
      }),
      API.createElement({
        type: "arrow",
        id: "arr",
        x: 149.9,
        y: 95,
        width: 156,
        height: 239.9,
        startBinding: {
          elementId: "rec1",
          focus: 0,
          gap: 5,
          fixedPoint: [0.49, -0.05],
        },
        endBinding: {
          elementId: "rec2",
          focus: 0,
          gap: 5,
          fixedPoint: [-0.05, 0.49],
        },
        startArrowhead: null,
        endArrowhead: "arrow",
        fixedSegments: null,
        points: [
          pointFrom(0, 0),
          pointFrom(0, -35),
          pointFrom(-90, -35),
          pointFrom(-90, 204),
          pointFrom(66, 204),
        ],
        elbowed: true,
      }),
    ];
    await render(<Excalidraw initialData={{ elements }} />);

    API.setSelectedElements(elements);

    expect(Object.keys(h.state.selectedElementIds).length).toBe(3);

    API.executeAction(actionFlipHorizontal);
    API.executeAction(actionFlipHorizontal);
    API.executeAction(actionFlipHorizontal);
    API.executeAction(actionFlipHorizontal);

    const rec1 = h.elements.find((el) => el.id === "rec1")!;
    expect(Math.floor(rec1.x)).toBeCloseTo(100, 0);
    expect(Math.floor(rec1.y)).toBeCloseTo(100, 0);

    const rec2 = h.elements.find((el) => el.id === "rec2")!;
    expect(Math.floor(rec2.x)).toBeCloseTo(220, 0);
    expect(Math.floor(rec2.y)).toBeCloseTo(250, 0);
  });
});

describe("flipping arrowheads", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  // UX RATIONALE: If we flip bound arrows by the center axes then there could
  // be a case where the bindable objects are offset and the arrow would lay
  // outside both bindable objects binding range, yet remain bound to then,
  // resulting in a jump on movement.
  //
  // We are aware that 2+ point simple arrows behave incorrectly when flipped
  // this way but it was decided that there is no known use case for this so
  // left as it is.
  //
  // Demo: https://excalidraw.com/#json=isE-S8LqNlD1u-LsS8Ezz,iZZ09PPasp6OWbGtJwOUGQ
  it("flipping bound arrow should flip arrowheads only", () => {
    const rect = API.createElement({
      type: "rectangle",
      boundElements: [{ type: "arrow", id: "arrow1" }],
    });
    const arrow = API.createElement({
      type: "arrow",
      id: "arrow1",
      startArrowhead: "arrow",
      endArrowhead: null,
      endBinding: {
        elementId: rect.id,
        focus: 0.5,
        gap: 5,
      },
    });

    API.setElements([rect, arrow]);
    API.setSelectedElements([arrow]);

    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe(null);

    API.executeAction(actionFlipHorizontal);
    expect(API.getElement(arrow).startArrowhead).toBe(null);
    expect(API.getElement(arrow).endArrowhead).toBe("arrow");

    API.executeAction(actionFlipHorizontal);
    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe(null);

    API.executeAction(actionFlipVertical);
    expect(API.getElement(arrow).startArrowhead).toBe(null);
    expect(API.getElement(arrow).endArrowhead).toBe("arrow");
  });

  // UX RATIONALE: See above for the reasoning.
  it("flipping bound arrow should flip arrowheads only 2", () => {
    const rect = API.createElement({
      type: "rectangle",
      boundElements: [{ type: "arrow", id: "arrow1" }],
    });
    const rect2 = API.createElement({
      type: "rectangle",
      boundElements: [{ type: "arrow", id: "arrow1" }],
    });
    const arrow = API.createElement({
      type: "arrow",
      id: "arrow1",
      startArrowhead: "arrow",
      endArrowhead: "circle",
      startBinding: {
        elementId: rect.id,
        focus: 0.5,
        gap: 5,
      },
      endBinding: {
        elementId: rect2.id,
        focus: 0.5,
        gap: 5,
      },
    });

    API.setElements([rect, rect2, arrow]);
    API.setSelectedElements([arrow]);

    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe("circle");

    API.executeAction(actionFlipHorizontal);
    expect(API.getElement(arrow).startArrowhead).toBe("circle");
    expect(API.getElement(arrow).endArrowhead).toBe("arrow");

    API.executeAction(actionFlipVertical);
    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe("circle");
  });

  // UX RATIONALE: Unbound arrows are not constrained by other elements and
  // should behave like any other element when flipped for consisency.
  it("flipping unbound arrow should mirror on horizontal or vertical axis", () => {
    const arrow = API.createElement({
      type: "arrow",
      id: "arrow1",
      startArrowhead: "arrow",
      endArrowhead: "circle",
    });

    API.setElements([arrow]);
    API.setSelectedElements([arrow]);

    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe("circle");

    API.executeAction(actionFlipHorizontal);
    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe("circle");
  });

  it("flipping bound arrow shouldn't flip arrowheads if selected alongside non-arrow eleemnt", () => {
    const rect = API.createElement({
      type: "rectangle",
      boundElements: [{ type: "arrow", id: "arrow1" }],
    });
    const arrow = API.createElement({
      type: "arrow",
      id: "arrow1",
      startArrowhead: "arrow",
      endArrowhead: null,
      endBinding: {
        elementId: rect.id,
        focus: 0.5,
        gap: 5,
      },
    });

    API.setElements([rect, arrow]);
    API.setSelectedElements([rect, arrow]);

    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe(null);

    API.executeAction(actionFlipHorizontal);
    expect(API.getElement(arrow).startArrowhead).toBe("arrow");
    expect(API.getElement(arrow).endArrowhead).toBe(null);
  });
});
