export const send = async ({ to, message }) => {
  return {
    provider: "test",
    messageId: `test_sms_${Date.now()}`,
    to,
    message,
    delivered: true,
  };
};
