export const expectLogLines = (actual: string[], expected: RegExp[]): void => {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((pattern, index) => {
    expect(actual[index]).toMatch(pattern);
  });
};
