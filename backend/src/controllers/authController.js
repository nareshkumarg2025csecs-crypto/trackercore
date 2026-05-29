export const registerUser = async (req, res) => {
  try {
    res.json({ message: 'Auth Controller register placeholder' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    res.json({ message: 'Auth Controller login placeholder' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
