export const waitMinutes = (minutes: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, minutes * 60000); // 60000 ms = 1 minute
  });
};
