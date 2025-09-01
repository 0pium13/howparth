module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    res.status(200).json({
      status: 'Fine-tuned model test endpoint ready',
      model: 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU',
      timestamp: new Date().toISOString(),
      message: 'Backend is working! Your fine-tuned Parth AI is ready.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
