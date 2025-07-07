const chatbotIcon = document.getElementById('chatbot-icon');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let isOpen = false;
let apiKey = null;

// --- Chatbot Feature State Management ---
let chatState = null;
let chatData = {};

const faqs = [
    { q: /insurance|accept.*insurance/i, a: "Yes, we accept all major insurance providers." },
    { q: /timing|open|close|hours/i, a: "Our laboratory is open from 7 AM to 9 PM every day. Emergency services are 24/7." },
    { q: /location|where.*located|address/i, a: "We are located at 123, ABC Street, INDIA." },
    { q: /ambulance/i, a: "We provide free ambulance service. Call (+91) 99999 99999 for assistance." },
    { q: /covid|corona/i, a: "We follow all COVID-19 safety protocols. Masks and sanitization are mandatory." },
    { q: /contact/i, a: "Contact us at support@care.com or (+91) 99999 99999." },
    { q: /emergency/i, a: "For emergencies, call (+91) 99999 99999 immediately." },
];

const healthTips = [
    "Drink plenty of water every day.",
    "Exercise regularly for at least 30 minutes.",
    "Eat a balanced diet rich in fruits and vegetables.",
    "Get enough sleep (7-8 hours per night).",
    "Wash your hands frequently to prevent illness.",
    "Manage stress with relaxation techniques.",
    "Schedule regular health check-ups.",
    "Avoid smoking and limit alcohol consumption."
];

// Fetch API key from backend
async function getApiKey() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        apiKey = config.googleApiKey;
    } catch (error) {
        console.error('Error fetching API key:', error);
    }
}

// Initialize API key when page loads
getApiKey();

function toggleChatbot() {
    isOpen = !isOpen;
    chatbotContainer.classList.toggle('active', isOpen);
    chatbotIcon.classList.toggle('open', isOpen);
    
    if (isOpen) {
        chatbotIcon.style.animation = 'none';
        // Add welcome message when opening
        setTimeout(() => {
            addMessage("Hello! How can I assist you today?", 'bot-message');
        }, 500);
    } else {
        chatbotIcon.style.animation = 'pulse 2s infinite';
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, 'user-message');
        userInput.value = '';

        // --- Chatbot Feature State Machine ---
        if (chatState === 'booking_name') {
            chatData.name = message;
            chatState = 'booking_phone';
            addMessage('Please enter your phone number:', 'bot-message');
            return;
        } else if (chatState === 'booking_phone') {
            chatData.phone = message;
            chatState = 'booking_date';
            addMessage('Please enter your preferred appointment date (YYYY-MM-DD):', 'bot-message');
            return;
        } else if (chatState === 'booking_date') {
            chatData.date = message;
            chatState = null;
            // Send booking data to backend (simulate for now)
            addMessage('Thank you! Your appointment request has been received. We will contact you soon.', 'bot-message');
            // TODO: Send chatData to backend if needed
            chatData = {};
            return;
        } else if (chatState === 'feedback_wait') {
            // Save feedback (simulate for now)
            addMessage('Thank you for your feedback! We appreciate your input.', 'bot-message');
            chatState = null;
            return;
        }

        // --- Command Recognition ---
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('book appointment') || lowerMsg.includes('appointment')) {
            chatState = 'booking_name';
            chatData = {};
            addMessage('Sure! Please enter your full name:', 'bot-message');
            return;
        }
        if (lowerMsg.includes('feedback')) {
            chatState = 'feedback_wait';
            addMessage('We value your feedback! Please type your feedback below:', 'bot-message');
            return;
        }
        if (lowerMsg.includes('emergency')) {
            addMessage('🚨 For emergencies, call (+91) 99999 99999 immediately or visit the nearest hospital.', 'bot-message');
            return;
        }
        if (lowerMsg.includes('health tip')) {
            const tip = healthTips[Math.floor(Math.random() * healthTips.length)];
            addMessage('💡 Health Tip: ' + tip, 'bot-message');
            return;
        }
        // FAQ matching
        for (const faq of faqs) {
            if (faq.q.test(message)) {
                addMessage(faq.a, 'bot-message');
                return;
            }
        }
        
        // Show typing indicator
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'bot-message');
        typingElement.textContent = 'Typing...';
        typingElement.id = 'typing-indicator';
        chatbotMessages.appendChild(typingElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        try {
            const botResponse = await getBotResponse(message);
            // Remove typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            addMessage(botResponse, 'bot-message');
        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            addMessage("I'm sorry, I couldn't process your request at the moment. Please try again later.", 'bot-message');
        }
    }
}

function addMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', className);
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function getBotResponse(message) {
    // Check if API key is available
    if (!apiKey) {
        return "⚠️ API configuration error. Please try again later.";
    }
    
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
    // Expanded website-specific information
    const websiteInfo = {
        "services": ["Laboratory Test", "Health Check", "General Dentistry"],
        "doctors": [
            {name: "Dr. Sakshi Malik", specialty: "Cardiologist", contact: "sakshi.malik@care.com"},
            {name: "Dr. Akash More", specialty: "Neurosurgeon", contact: "akash.more@care.com"},
            {name: "Dr. Abhay Varma", specialty: "Dermatologist", contact: "abhay.varma@care.com"}
        ],
        "contact": "123,ABC Street, INDIA | support@care.com | (+91) 99999 99999",
        "about": "We are committed to promoting wellness and providing valuable resources to empower you on your health journey.",
        "appointment": "To book an appointment, you can:\n1. Use our online booking form on the website\n2. Call us at (+91) 99999 99999\n3. Email us at appointments@care.com",
        "useful_info": [
            "We offer 24/7 emergency services",
            "Free health check-ups are available on the first Sunday of every month",
            "We accept all major insurance providers",
            "Our laboratory is open from 7 AM to 9 PM every day"
        ]
    };

    // Check if the message is related to website information first
    const lowercaseMessage = message.toLowerCase();
    if (lowercaseMessage.includes("services") || lowercaseMessage.includes("doctors") || 
        lowercaseMessage.includes("contact") || lowercaseMessage.includes("about") ||
        lowercaseMessage.includes("appointment") || lowercaseMessage.includes("information") ||
        lowercaseMessage.includes("specialty") || lowercaseMessage.includes("book") ||
        lowercaseMessage.includes("schedule") || lowercaseMessage.includes("clinic hours")) {
        
        if (lowercaseMessage.includes("services")) {
            return "🏥 Our services: " + websiteInfo.services.join(", ") + ".";
        } else if (lowercaseMessage.includes("doctors")) {
            return "👨‍⚕️ Our doctors:\n" + websiteInfo.doctors.map(doc => `• ${doc.name} - ${doc.specialty}`).join("\n");
        } else if (lowercaseMessage.includes("contact")) {
            return "📞 " + websiteInfo.contact;
        } else if (lowercaseMessage.includes("about")) {
            return "🏥 " + websiteInfo.about;
        } else if (lowercaseMessage.includes("appointment") || lowercaseMessage.includes("book") || lowercaseMessage.includes("schedule")) {
            return "📅 Book appointment: Call (+91) 99999 99999, email appointments@care.com, or use our online form.";
        } else if (lowercaseMessage.includes("information") || lowercaseMessage.includes("clinic hours")) {
            return "ℹ️ Key info: 24/7 emergency, free check-ups first Sunday monthly, lab open 7AM-9PM daily.";
        } else if (lowercaseMessage.includes("specialty")) {
            const specialty = lowercaseMessage.split("specialty")[1].trim();
            const doctor = websiteInfo.doctors.find(doc => doc.specialty.toLowerCase().includes(specialty));
            if (doctor) {
                return `👨‍⚕️ ${doctor.specialty}: ${doctor.name} - ${doctor.contact}`;
            } else {
                return "🔍 Available specialists:\n" + websiteInfo.doctors.map(doc => `• ${doc.name} - ${doc.specialty}`).join("\n");
            }
        }
    }
    
    // If not website-specific, use the AI API
    try {
        console.log('Sending request to API with message:', message);
        
        // Create a healthcare-focused prompt
        const healthcarePrompt = `You are a helpful healthcare assistant chatbot for a medical clinic. Provide concise, accurate healthcare information in 2-3 sentences maximum.

GUIDELINES:
- Keep responses short and to the point
- Include brief medical disclaimer when needed
- Suggest consulting healthcare professionals for serious concerns
- Don't provide specific medical diagnoses
- Focus on general health guidance

User's question: ${message}

Please provide a brief, helpful healthcare response:`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: healthcarePrompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 256,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            
            // Handle specific error cases
            if (response.status === 400) {
                throw new Error(`Bad Request: ${errorText}`);
            } else if (response.status === 401) {
                throw new Error(`Unauthorized: Check your API key`);
            } else if (response.status === 403) {
                throw new Error(`Forbidden: API key may not have proper permissions`);
            } else if (response.status === 404) {
                throw new Error(`Not Found: Check the API endpoint`);
            } else if (response.status === 429) {
                throw new Error(`Too Many Requests: Rate limit exceeded`);
            } else if (response.status >= 500) {
                throw new Error(`Server Error: ${response.status} - ${errorText}`);
            } else {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.candidates && data.candidates[0] && data.candidates[0].content && 
            data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
            
            let response = data.candidates[0].content.parts[0].text;
            
            // Add a brief medical disclaimer if not already present
            if (!response.toLowerCase().includes('disclaimer') && !response.toLowerCase().includes('consult')) {
                response += "\n\n⚠️ Consult a healthcare professional for personalized advice.";
            }
            
            return response;
        } else {
            console.error('Unexpected response format:', data);
            throw new Error('Unexpected response format from API');
        }
    } catch (error) {
        console.error('Error in getBotResponse:', error);
        
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return "I'm having trouble connecting to the server. Please check your internet connection and try again.";
        }
        
        // Check if it's an API key error
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
            return "⚠️ API Authentication Error: Please check if your API key is valid and has proper permissions.";
        }
        
        // Check if it's a rate limit error
        if (error.message.includes('429') || error.message.includes('Rate limit')) {
            return "⚠️ Too many requests. Please wait a moment and try again.";
        }
        
        // Check if it's a bad request
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
            return "⚠️ Invalid request format. Please try rephrasing your message.";
        }
        
        return `⚠️ Error: ${error.message}. Please try again later.`;
    }
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', function() {
    chatbotIcon.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Find the form element
const appointmentForm = document.querySelector('#appointmentForm');

// Add event listener for form submission
if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const formData = new FormData(this);

        // Create an object with the form data
        const appointmentData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            address: formData.get('address'),
            phone: formData.get('phone')
        };

        // Check if all fields are filled
        for (let key in appointmentData) {
            if (!appointmentData[key]) {
                alert(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                return;
            }
        }

        console.log('Sending appointment data:', JSON.stringify(appointmentData, null, 2));

        // Send POST request to the backend
        fetch('http://localhost:5000/book_appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Appointment booked successfully!');
            this.reset(); // Reset the form
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while booking the appointment: ' + error.message);
        });
    });
}