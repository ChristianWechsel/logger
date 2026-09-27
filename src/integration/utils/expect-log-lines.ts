export const expectLogLines = (actual: string[], expected: RegExp[]): void => {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((pattern, index) => {
    expect(actual[index]).toMatch(pattern);
  });
};

export const expectCountLogLines = (
  actual: string[],
  expected: { count: number; toleranceInPercente: number },
): void => {
  const minimumExpected = expected.count * expected.toleranceInPercente;
  expect(actual.length).toBeGreaterThanOrEqual(minimumExpected);
};
