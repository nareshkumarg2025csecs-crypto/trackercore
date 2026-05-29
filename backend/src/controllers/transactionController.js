export const getTransactions = async (req, res) => {
  try {
    res.json({ message: 'Transaction Controller get transactions placeholder' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    res.json({ message: 'Transaction Controller create transaction placeholder' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
