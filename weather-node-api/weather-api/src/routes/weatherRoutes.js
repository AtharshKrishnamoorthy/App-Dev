import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Get current weather
router.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (response.ok) {
      const weatherData = {
        city: data.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feels_like: data.main.feels_like,
        country: data.sys.country
      };
      res.json(weatherData);
    } else {
      res.status(response.status).json({ error: data.message });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router;