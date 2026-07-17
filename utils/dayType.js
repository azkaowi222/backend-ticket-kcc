const isWeekday = (date) => {
  const day = date.getDay();

  const isWeekday = day >= 1 && day <= 5;
  return isWeekday;
};

export default isWeekday;
