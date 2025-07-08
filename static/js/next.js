async function getBotResponse(message) {
    try {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        const apiKey = 'AIzaSyASzuABco8dmjyiOJYHoUodlW7z8WuAzlk';
        
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            })
        });
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && 
            data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
            const botMessage = data.candidates[0].content.parts[0].text.trim();
            addMessage(botMessage, 'bot-message');
        } else {
            console.error('Unexpected response format:', data);
            addMessage("I'm sorry, I couldn't process your request at the moment.", 'bot-message');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage("I'm sorry, I couldn't process your request at the moment.", 'bot-message');
    }
}
