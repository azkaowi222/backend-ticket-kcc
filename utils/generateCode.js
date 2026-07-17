const getDateCode = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const genOrderCode = () => {
  const dateCode = getDateCode();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `ORD-${dateCode}-${random}`;
};

export const genPaymentCode = () => {
  const dateCode = getDateCode();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `PAY-${dateCode}-${random}`;
};

export const genTicketCode = () => {
  const dateCode = getDateCode();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `TCK-${dateCode}-${random}`;
};
