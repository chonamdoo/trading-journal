UPDATE trades
SET fee = -ABS(fee)
WHERE fee > 0;
