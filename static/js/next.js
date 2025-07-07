async function getBotResponse(message) {
    try {
        const response = await fetch('https://api.gemini.com/v1/endpoint', { // Replace with the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer AIzaSyASzuABco8dmjyiOJYHoUodlW7z8WuAzlk'
            },
            body: JSON.stringify({
                prompt: message,
                max_tokens: 100,
                temperature: 0.7
            })
        });
        const data = await response.json();
        const botMessage = data.choices[0].text.trim(); // Adjust based on Gemini's response format
        addMessage(botMessage, 'bot-message');
    } catch (error) {
        console.error('Error:', error);
        addMessage("I'm sorry, I couldn't process your request at the moment.", 'bot-message');
    }
}
