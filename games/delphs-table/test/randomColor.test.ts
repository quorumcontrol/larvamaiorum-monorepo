import randomColor from '../src/utils/randomColor'

describe("RandomColor", () => {

  it("generates", () => {
    const ret = randomColor({
      format: 'rgbArray'
    })
    console.log("ret: ", ret)
    expect(ret.length).toBe(3)
  });

});
