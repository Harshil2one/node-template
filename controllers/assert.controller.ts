import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";

const assert = require("assert");

const compare: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // Assert truthy:
    assert(1);
    assert(true);
    assert({});
    assert("string");
    assert(true, "This is truthy");

    assert.ok(true, "This is also truthy");

    // Assert strictEqual:
    assert.strictEqual(1 + 3, 4, "1 + 3 should equal 4");
    assert.strictEqual(1, 1, "1 should equal 1");

    // Assert equal:
    assert.equal(1, 1);
    assert.equal(1, "1");
    assert.equal(1, true);

    // Assert objects:
    const obj1 = { a: 1, c: { d: 2 } };
    const obj2 = { a: 1, c: { d: 2 } };
    const obj3 = { a: "1", c: { d: "2" } };
    assert.deepEqual(obj1, obj2);
    assert.deepEqual(obj1, obj3);
    assert.deepStrictEqual(obj1, obj2);

    // Assert array:
    const arr1 = [1, 2, [3, 4]];
    const arr2 = [1, 2, [3, 4]];
    const arr3 = ["1", "2", ["3", "4"]];
    assert.deepEqual(arr1, arr2);
    assert.deepEqual(arr1, arr3);
    assert.deepStrictEqual(arr1, arr2);

    // Asser notEqual:
    assert.notEqual(1, 2);
    assert.notStrictEqual("1", 1);

    // Asset notDeepEqual:
    const obj11 = { a: 1, b: 2 };
    const obj21 = { a: 1, b: 3 };
    const obj31 = { a: "1", b: "2" };
    assert.notDeepEqual(obj11, obj21);
    assert.notDeepStrictEqual(obj11, obj21);
    assert.notDeepStrictEqual(obj11, obj31);

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Assert compared successfully..!"
    );
  } catch (error: any) {
    if (error) {
      // Assert falsy:
      assert(0);
      assert(false);
      assert("");
      assert(false, "This is falsy");

      // Assert strictEqual:
      assert.strictEqual(1 + 4, 4, "1 + 4 should equal 5");
      assert.strictEqual(1, "1", "1 should not equal '1'");

      // Assert equal:
      assert.equal(1, 12);
      assert.equal(1, "11");
      assert.equal(1, false);

      // Assert objects:
      const obj1 = { a: 1, c: { d: 2 } };
      const obj2 = { a: "1", c: { d: "2" } };
      assert.deepStrictEqual(obj1, obj2);

      // Assert array:
      const arr1 = [1, 2, [3, 4]];
      const arr2 = ["1", "2", ["3", "4"]];
      assert.deepStrictEqual(arr1, arr2);

      // Asser notEqual:
      assert.notEqual(1, 1);
      assert.notStrictEqual("1", "1");

      // Asset notDeepEqual:
      const obj11 = { a: 1, b: 2 };
      const obj21 = { a: "1", b: "2" };
      assert.notDeepEqual(obj11, obj21);

      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error.message);
    } else {
      return next(error);
    }
  }
};

export default { compare };
