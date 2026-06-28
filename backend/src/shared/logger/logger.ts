export const logger = {
  info: (message: string, meta?: unknown) => {
    if (meta) {
      console.info(message, meta);
      return;
    }

    console.info(message);
  },
  error: (message: string, error?: unknown) => {
    if (error) {
      console.error(message, error);
      return;
    }

    console.error(message);
  },
};
